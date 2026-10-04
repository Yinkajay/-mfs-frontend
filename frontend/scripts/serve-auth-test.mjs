// Serve the actual cPanel-ready export for browser checks, not a second dev app.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost:3002").pathname,
    );
    let filename = path.resolve(root, `.${pathname}`);
    if (filename !== root && !filename.startsWith(`${root}${path.sep}`))
      throw new Error();
    if ((await fs.promises.stat(filename)).isDirectory())
      filename = path.join(filename, "index.html");
    const stat = await fs.promises.stat(filename);
    if (!stat.isFile()) throw new Error();
    response.writeHead(200, {
      "Content-Type":
        contentTypes[path.extname(filename)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
server.listen(3002, "localhost", () =>
  console.log("Auth test export: http://localhost:3002"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
