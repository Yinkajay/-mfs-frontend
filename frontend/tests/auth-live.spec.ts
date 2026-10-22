import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import net from "node:net";

// Explicitly opt in: this suite creates one synthetic customer ONLY on the
// verified Neon development branch, then removes that fixture and its counters.
const enabled = process.env.MFS_AUTH_LIVE === "1";
test.skip(
  !enabled,
  "Set MFS_AUTH_LIVE=1 to verify the existing Neon development backend.",
);

test("real signup automatically logs in, restores its HttpOnly session and revokes on logout", async ({
  page,
  context,
}) => {
  test.setTimeout(150000);
  const backendRoot = path.resolve(process.cwd(), "../backend");
  const backendRequire = createRequire(path.join(backendRoot, "package.json"));
  const { verifyNeonDevelopmentTarget } = backendRequire(
    "./scripts/neon-development.cjs",
  );
  const { configuration, branch } = verifyNeonDevelopmentTarget();
  expect(branch.name).toBe("development");
  const { PrismaClient } = backendRequire("./dist/generated/prisma/client");
  const { PrismaPg } = backendRequire("@prisma/adapter-pg");
  const { databaseConnectionUrl } = backendRequire(
    "./dist/prisma/connection-url",
  );
  const { rateLimitKey } = backendRequire(
    "./dist/auth/auth-rate-limit.service",
  );
  const run = randomUUID();
  const email = `mfs-frontend-${run}@example.test`;
  const namespace = `frontend-test:${run}`;
  const counterKeys: string[] = [];
  for (const scope of ["login:ip", "register:ip", "session:ip"]) {
    for (const address of ["127.0.0.1", "::ffff:127.0.0.1", "::1"]) {
      counterKeys.push(rateLimitKey(namespace, scope, address));
    }
  }
  for (const scope of ["login:account", "register:account"])
    counterKeys.push(rateLimitKey(namespace, scope, email));
  const database = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseConnectionUrl(configuration.DATABASE_URL),
      connectionTimeoutMillis: 10000,
      query_timeout: 10000,
    }),
  });
  let api: ChildProcess | undefined;
  let cleanupFailed = false;
  try {
    // Refuse an occupied API port rather than accidentally testing another API.
    const reservation = net.createServer();
    await new Promise<void>((resolve, reject) => {
      reservation.once("error", () =>
        reject(new Error("Test API port 3003 must be free.")),
      );
      reservation.listen(3003, "127.0.0.1", resolve);
    });
    await new Promise<void>((resolve, reject) =>
      reservation.close((error) => (error ? reject(error) : resolve())),
    );
    api = spawn(process.execPath, ["dist/main.js"], {
      cwd: backendRoot,
      env: {
        ...process.env,
        ...configuration,
        NODE_ENV: "test",
        HOST: "127.0.0.1",
        PORT: "3003",
        AUTH_ALLOWED_ORIGINS: "http://localhost:3002",
        SESSION_COOKIE_SECURE: "false",
        AUTH_RATE_LIMIT_NAMESPACE: namespace,
      },
      // Database/driver output may contain secrets. Never forward it.
      stdio: "ignore",
    });
    let ready = false;
    for (let attempt = 0; attempt < 45; attempt += 1) {
      if (api.exitCode !== null)
        throw new Error(
          "Test API could not start; check that port 3003 is free.",
        );
      try {
        ready = (
          await fetch("http://localhost:3003/v1/health/ready", {
            signal: AbortSignal.timeout(1500),
          })
        ).ok;
      } catch {
        /* Retry a cold development compute without logging errors. */
      }
      if (ready && api.exitCode === null) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    expect(ready).toBe(true);
    const posts: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().startsWith("http://localhost:3003/v1/")
      ) {
        posts.push(new URL(request.url()).pathname);
      }
    });
    const password = `frontend test only ${run}`;
    await page.goto("/auth/signup/");
    await page.getByLabel("First name", { exact: true }).fill("Frontend");
    await page.getByLabel("Last name", { exact: true }).fill("Test");
    await page.getByLabel("Email address").fill(email.toUpperCase());
    await page.getByLabel("Phone number").fill("09060004617");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Agree to the terms and privacy policy").check();
    const acceptedResponse = page.waitForResponse(
      (response) =>
        response.url() === "http://localhost:3003/v1/auth/register" &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    const accepted = await acceptedResponse;
    expect(accepted.status()).toBe(202);
    expect(Boolean(await accepted.headerValue("set-cookie"))).toBe(false);
    await expect(page).toHaveURL("http://localhost:3002/dashboard/", {
      timeout: 45000,
    });
    expect(posts).toEqual(["/v1/auth/register", "/v1/auth/login"]);
    const cookies = await context.cookies("http://localhost:3003");
    expect(
      cookies.some(
        (cookie) =>
          cookie.name === "mfs_session" &&
          cookie.httpOnly &&
          cookie.sameSite === "Lax",
      ),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.cookie.includes("mfs_session")),
    ).toBe(false);
    expect(
      await page.evaluate(
        () =>
          Object.keys(localStorage).length + Object.keys(sessionStorage).length,
      ),
    ).toBe(0);
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Let’s sort your vehicle paperwork." }),
    ).toBeVisible();
    const profile = await context.request.get("http://localhost:3003/v1/me");
    expect(profile.status()).toBe(200);
    const user = await profile.json();
    expect(user.emailVerifiedAt === null && user.phoneVerifiedAt === null).toBe(
      true,
    );
    expect(user.phone).toBe("+2349060004617");
    expect(!("passwordHash" in user) && !("token" in user)).toBe(true);
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    await expect(page).toHaveURL("http://localhost:3002/auth/login/");
    expect(
      (await context.request.get("http://localhost:3003/v1/me")).status(),
    ).toBe(401);
    const revoked = await database.session
      .count({ where: { userId: user.id, revokedAt: { not: null } } })
      .catch(() => {
        throw new Error("Development session revocation check failed.");
      });
    expect(revoked).toBe(1);
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Log in to your account." }),
    ).toBeVisible();
  } finally {
    if (api && api.exitCode === null) {
      await new Promise<void>((resolve) => {
        api!.once("exit", () => resolve());
        api!.kill();
      });
    }
    try {
      await database.user.deleteMany({ where: { email } });
      await database.authRateLimit.deleteMany({
        where: { keyHash: { in: counterKeys } },
      });
    } catch {
      cleanupFailed = true;
    } finally {
      await database.$disconnect();
    }
    if (cleanupFailed)
      throw new Error(
        "Synthetic development fixture cleanup failed; do not rerun until it is removed.",
      );
  }
});
