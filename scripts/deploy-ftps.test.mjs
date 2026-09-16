import assert from "node:assert/strict";
import test from "node:test";
import {
  isSafeRelativePath,
  planDeployment,
  validateManifest,
  validateRemoteDir,
} from "./deploy-ftps.mjs";

const file = { sha256: "a".repeat(64), size: 12 };

test("remote paths cannot escape the selected site directory", () => {
  assert.equal(validateRemoteDir("/public_html"), "/public_html");
  assert.equal(validateRemoteDir("/"), "/");
  assert.throws(() => validateRemoteDir("public_html"));
  assert.throws(() => validateRemoteDir("/public_html/../other"));
  assert.throws(() => validateRemoteDir("/public_html/"));
  assert.equal(isSafeRelativePath("about/index.html"), true);
  assert.equal(isSafeRelativePath("../other/index.html"), false);
  assert.equal(isSafeRelativePath("/index.html"), false);
  assert.equal(isSafeRelativePath("about\\index.html"), false);
  assert.equal(isSafeRelativePath(".htaccess"), false);
});

test("a foreign or unsafe remote manifest is refused before upload", () => {
  assert.throws(() => validateManifest({ site: "another-site", version: 1, files: {}, retainedAssets: [] }));
  assert.throws(() =>
    validateManifest({
      site: "mfsservices",
      version: 1,
      files: { "../outside.html": file },
      retainedAssets: [],
    }),
  );
  assert.deepEqual(
    validateManifest({ site: "mfsservices", version: 1, files: { "index.html": file }, retainedAssets: [] }).files,
    { "index.html": file },
  );
});

test("new pages upload before the homepage and only tracked files are cleaned", () => {
  const previous = {
    files: {
      "index.html": file,
      "old/index.html": file,
      "_next/static/old.js": file,
    },
    retainedAssets: ["_next/static/older.js"],
  };
  const current = {
    "index.html": file,
    "about/index.html": file,
    "_next/static/new.js": file,
  };
  const plan = planDeployment(current, previous);

  assert.deepEqual(plan.uploadOrder, ["_next/static/new.js", "about/index.html", "index.html"]);
  assert.deepEqual(plan.retainedAssets, ["_next/static/old.js"]);
  assert.deepEqual(plan.stale.sort(), ["_next/static/older.js", "old/index.html"]);
});
