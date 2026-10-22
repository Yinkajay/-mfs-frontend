import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const sourceRequire = createRequire(import.meta.url);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cache = new Map();

function loadSource(name) {
  const filename = path.resolve(scriptDirectory, "../app/lib", `${name}.ts`);
  if (cache.has(filename)) return cache.get(filename);
  const compiled = { exports: {} };
  cache.set(filename, compiled.exports);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  });
  new Function("require", "module", "exports", outputText)(
    (id) => (id.startsWith("./") ? loadSource(id.slice(2)) : sourceRequire(id)),
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}

const { createServicesApi, ServicesApiError } = loadSource("services-api");
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const base = () => "http://localhost:3003/v1";
const categories = [
  { code: "BIKE", name: "Bike" },
  { code: "SALOON", name: "Saloon" },
  { code: "SUV_PICKUP", name: "SUV / Pickup" },
  { code: "TRUCK", name: "Truck" },
  { code: "BUS_MINI_TRUCK", name: "Bus / Mini Truck" },
];
const service = {
  code: "NEW_DRIVERS_LICENSE",
  name: "New Driver’s Licence",
  slug: "new-drivers-licence",
  description: null,
  vehicleCategories: categories,
  variants: [
    { code: "THREE_YEARS", name: "3 years", description: null },
    { code: "FIVE_YEARS", name: "5 years", description: null },
  ],
};

test("list uses the shared public GET transport and projects documented catalogue fields", async () => {
  const calls = [];
  const api = createServicesApi(base, async (url, options) => {
    calls.push([url, options]);
    return json({
      items: [
        {
          ...service,
          price: 50000,
          pricingStrategy: "FIXED_BY_VARIANT",
          privateNote: "not public",
        },
      ],
    });
  });
  assert.deepEqual(await api.list(), [service]);
  assert.equal(calls[0][0], "http://localhost:3003/v1/services");
  assert.equal(calls[0][1].method, "GET");
  assert.equal(calls[0][1].credentials, "include");
  assert.equal(calls[0][1].cache, "no-store");
  assert.equal(calls[0][1].redirect, "error");
  assert.deepEqual(calls[0][1].headers, { Accept: "application/json" });
});

test("empty active catalogue is a valid response", async () => {
  const api = createServicesApi(base, async () => json({ items: [] }));
  assert.deepEqual(await api.list(), []);
});

test("malformed catalogue data never becomes public UI content", async () => {
  for (const body of [
    null,
    {},
    { items: "not-an-array" },
    { items: [{ ...service, slug: "../pricing" }] },
    { items: [{ ...service, description: 6500 }] },
    { items: [{ ...service, vehicleCategories: [{ code: "CAR", name: "Car" }] }] },
    { items: [{ ...service, variants: [{ code: "ONE_YEAR", name: "1 year" }] }] },
    { items: [service, service] },
  ]) {
    const api = createServicesApi(base, async () => json(body));
    await assert.rejects(api.list(), ServicesApiError);
  }
});

test("API failures are sanitized and distinguish temporary service failures", async () => {
  const unavailable = createServicesApi(base, async () =>
    json({ message: "database host and credentials" }, 503),
  );
  await assert.rejects(
    unavailable.list(),
    (error) =>
      error instanceof ServicesApiError &&
      error.status === 503 &&
      /temporarily unavailable/.test(error.message) &&
      !error.message.includes("credentials"),
  );
  const invalid = createServicesApi(base, async () =>
    new Response("not json", { status: 200 }),
  );
  await assert.rejects(invalid.list(), ServicesApiError);
});
