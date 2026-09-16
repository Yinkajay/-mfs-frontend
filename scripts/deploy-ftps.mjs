import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Readable, Writable } from "node:stream";
import { fileURLToPath } from "node:url";
import { Client } from "basic-ftp";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const outputDir = path.join(projectRoot, "out");
const configPath = path.join(projectRoot, "deploy.config.local.json");
const manifestName = ".mfs-deploy-manifest.json";
const manifestSite = "mfsservices";

export function isSafeRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !/[\\\r\n\0]/.test(value) &&
    value.split("/").every((part) => part !== "" && !part.startsWith(".")) &&
    value !== manifestName
  );
}

export function validateRemoteDir(value) {
  if (typeof value !== "string" || !value.startsWith("/") || /[\\\r\n\0]/.test(value)) {
    throw new Error('remoteDir must be an absolute FTP path such as "/public_html" or "/".');
  }

  if (value === "/") return value;

  const parts = value.split("/").slice(1);
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error("remoteDir cannot contain empty, . or .. path segments.");
  }

  return value;
}

export function validateManifest(value) {
  if (
    !value ||
    typeof value !== "object" ||
    value.site !== manifestSite ||
    value.version !== 1 ||
    !value.files ||
    typeof value.files !== "object" ||
    Array.isArray(value.files) ||
    !Array.isArray(value.retainedAssets)
  ) {
    throw new Error("The remote deployment manifest is invalid or belongs to another site. No files were changed.");
  }

  for (const [file, info] of Object.entries(value.files)) {
    if (
      !isSafeRelativePath(file) ||
      !info ||
      typeof info !== "object" ||
      !/^[a-f0-9]{64}$/.test(info.sha256) ||
      !Number.isSafeInteger(info.size) ||
      info.size < 0
    ) {
      throw new Error("The remote deployment manifest contains an unsafe file entry. No files were changed.");
    }
  }

  if (
    value.retainedAssets.some(
      (file) => !isSafeRelativePath(file) || !file.startsWith("_next/static/"),
    )
  ) {
    throw new Error("The remote deployment manifest contains an unsafe retained asset. No files were changed.");
  }

  return value;
}

export function planDeployment(currentFiles, previous) {
  const current = new Set(Object.keys(currentFiles));
  const retainedAssets = previous
    ? Object.keys(previous.files).filter(
        (file) => file.startsWith("_next/static/") && !current.has(file),
      )
    : [];
  const retained = new Set(retainedAssets);
  const oldFiles = previous
    ? new Set([...Object.keys(previous.files), ...previous.retainedAssets])
    : new Set();
  const stale = [...oldFiles].filter((file) => !current.has(file) && !retained.has(file));

  const uploadOrder = Object.keys(currentFiles).sort((left, right) => {
    const priority = (file) => (file === "index.html" ? 2 : file.endsWith(".html") ? 1 : 0);
    return priority(left) - priority(right) || left.localeCompare(right);
  });

  return { uploadOrder, retainedAssets, stale };
}

async function promptForPassword() {
  const input = process.stdin;
  const output = process.stdout;

  if (!input.isTTY || typeof input.setRawMode !== "function") {
    throw new Error(
      "No FTPS password was provided. Run this in an interactive terminal, set MFS_FTPS_PASSWORD, or add password to the ignored local config.",
    );
  }

  return new Promise((resolve, reject) => {
    let password = "";
    let inEscapeSequence = false;
    const previousRawMode = input.isRaw;

    const finish = (error) => {
      input.off("data", onData);
      input.setRawMode(Boolean(previousRawMode));
      input.pause();
      output.write("\n");
      if (error) reject(error);
      else resolve(password);
    };

    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\u001b") {
          inEscapeSequence = true;
          continue;
        }
        if (inEscapeSequence) {
          if (/[A-Za-z~]/.test(character)) inEscapeSequence = false;
          continue;
        }
        if (character === "\u0003") {
          finish(new Error("Deployment cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\b" || character === "\u007f") {
          if (password) {
            password = password.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }
        if (character >= " " && character !== "\u007f") {
          password += character;
          output.write("*");
        }
      }
    };

    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();
    output.write("FTPS password: ");
    input.on("data", onData);
  });
}

async function loadConfig() {
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        "Missing deploy.config.local.json. Copy deploy.config.example.json and fill in your cPanel FTPS details.",
      );
    }
    throw new Error(`Could not read deployment config: ${error.message}`);
  }

  const host = config.host?.trim();
  const user = config.user?.trim();
  let password = process.env.MFS_FTPS_PASSWORD || config.password;
  const port = config.port ?? 21;
  const remoteDir = validateRemoteDir(config.remoteDir);

  if (
    !host ||
    host.includes("://") ||
    /[/\\\r\n\0]/.test(host) ||
    host === "your-cpanel-ftp-hostname" ||
    !user ||
    /[\r\n\0]/.test(user) ||
    user === "your-ftp-username" ||
    !Number.isSafeInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error("Complete the host, port, user and remoteDir in deploy.config.local.json.");
  }

  if (!password || password === "your-ftp-password") {
    password = await promptForPassword();
  }
  if (typeof password !== "string" || !password || /[\r\n\0]/.test(password)) {
    throw new Error("An FTPS password is required.");
  }

  return { host, port, user, password, remoteDir };
}

async function collectOutput() {
  const files = {};

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(outputDir, fullPath).split(path.sep).join("/");
        if (!isSafeRelativePath(relativePath)) {
          throw new Error(`Unsafe file path in out/: ${relativePath}`);
        }
        const contents = await readFile(fullPath);
        files[relativePath] = {
          sha256: createHash("sha256").update(contents).digest("hex"),
          size: contents.length,
        };
      } else {
        throw new Error(`Unsupported file type in out/: ${fullPath}`);
      }
    }
  }

  await walk(outputDir);
  if (!files["index.html"] || Object.keys(files).length < 2) {
    throw new Error("out/ does not look like a complete static export. Run npm run build first.");
  }
  return files;
}

function remotePath(remoteDir, relativePath) {
  return path.posix.join(remoteDir, relativePath);
}

async function readRemoteManifest(client, remoteDir, entries) {
  if (!entries.some((entry) => entry.name === manifestName)) return null;

  const chunks = [];
  let bytes = 0;
  const sink = new Writable({
    write(chunk, _encoding, callback) {
      bytes += chunk.length;
      if (bytes > 1_000_000) {
        callback(new Error("The remote deployment manifest is unexpectedly large."));
        return;
      }
      chunks.push(Buffer.from(chunk));
      callback();
    },
  });

  await client.downloadTo(sink, remotePath(remoteDir, manifestName));
  let parsed;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("The remote deployment manifest is damaged. No files were changed.");
  }
  return validateManifest(parsed);
}

async function remoteFileExists(client, fullPath) {
  try {
    const entries = await client.list(path.posix.dirname(fullPath));
    return entries.some((entry) => entry.name === path.posix.basename(fullPath));
  } catch (error) {
    if (error.code === 550) return false;
    throw error;
  }
}

async function deploy() {
  const config = await loadConfig();
  const files = await collectOutput();
  const client = new Client(60_000);

  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: true,
    });
    await client.cd(config.remoteDir);
    console.log(`Connected over FTPS. Remote directory: ${await client.pwd()}`);

    const remoteEntries = await client.list(config.remoteDir);
    const previous = await readRemoteManifest(client, config.remoteDir, remoteEntries);
    if (!previous && !remoteEntries.some((entry) => entry.name === "index.html")) {
      throw new Error(
        "This remote directory has no index.html or MFS manifest. Check that it is the live public_html directory; no files were changed.",
      );
    }
    const plan = planDeployment(files, previous);
    const knownFiles = previous?.files ?? {};
    const ensuredDirs = new Set([config.remoteDir]);
    let uploaded = 0;
    let skipped = 0;

    if (!previous) {
      console.log("First scripted deployment: existing untracked server files will be left alone.");
    }

    for (const file of plan.uploadOrder) {
      const destination = remotePath(config.remoteDir, file);
      const parent = path.posix.dirname(destination);
      const old = knownFiles[file];

      if (old?.sha256 === files[file].sha256 && old.size === files[file].size) {
        try {
          if ((await client.size(destination)) === files[file].size) {
            skipped += 1;
            continue;
          }
        } catch (error) {
          if (client.closed) throw error;
        }
      }

      if (!ensuredDirs.has(parent)) {
        await client.ensureDir(parent);
        ensuredDirs.add(parent);
      }
      await client.uploadFrom(path.join(outputDir, ...file.split("/")), destination);
      uploaded += 1;
      console.log(`Uploaded ${uploaded}: ${file}`);
    }

    for (const file of plan.stale) {
      const destination = remotePath(config.remoteDir, file);
      if (await remoteFileExists(client, destination)) {
        await client.remove(destination);
        console.log(`Removed old file: ${file}`);
      }
    }

    const manifestPath = remotePath(config.remoteDir, manifestName);
    const tempManifestPath = `${manifestPath}.uploading`;
    const manifest = {
      site: manifestSite,
      version: 1,
      files,
      retainedAssets: plan.retainedAssets,
    };
    await client.uploadFrom(
      Readable.from([JSON.stringify(manifest, null, 2) + "\n"]),
      tempManifestPath,
    );
    if (previous) await client.remove(manifestPath);
    await client.rename(tempManifestPath, manifestPath);

    console.log(
      `Deployment complete: ${uploaded} uploaded, ${skipped} unchanged, ${plan.stale.length} old files cleaned.`,
    );
    if (plan.retainedAssets.length) {
      console.log(`${plan.retainedAssets.length} previous build assets kept until the next deployment.`);
    }
  } finally {
    client.close();
  }
}

async function main() {
  if (process.argv.includes("--check")) {
    const files = await collectOutput();
    console.log(`Static export looks ready: ${Object.keys(files).length} files in out/.`);
    return;
  }
  await deploy();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Deployment failed: ${error.message}`);
    process.exitCode = 1;
  });
}
