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
const { createVehiclesApi, VehiclesApiError } = loadSource("vehicles-api");
const { vehicleDraft, validateVehicle, vehicleChanges, VEHICLE_CATEGORIES } =
  loadSource("vehicles-validation");
const input = validateVehicle({ ...vehicleDraft(), category: "SALOON" }).input;
const vehicle = {
  ...input,
  id: "00000000-0000-4000-8000-000000000001",
  registrationNumberNormalized: null,
  createdAt: "2026-10-04T00:00:00.000Z",
  updatedAt: "2026-10-04T00:00:00.000Z",
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const base = () => "http://localhost:3003/v1";

test("all confirmed categories work, with category the only required detail", () => {
  assert.deepEqual(validateVehicle(vehicleDraft()).errors, {
    category: "Choose a vehicle category.",
  });
  for (const category of Object.keys(VEHICLE_CATEGORIES)) {
    const result = validateVehicle({ ...vehicleDraft(), category });
    assert.deepEqual(result.errors, {});
    assert.equal(result.input.year, null);
    assert.equal(result.input.registrationNumber, null);
  }
});
test("registration spacing/case is unchanged while other text is trimmed and composed", () => {
  const result = validateVehicle({
    ...vehicleDraft(input),
    registrationNumber: "  ab c-123  ",
    make: "  cafe\u0301  ",
    engineCapacity: "  2.5 L  ",
    usageType: "Company vehicle",
  });
  assert.deepEqual(result.errors, {});
  assert.equal(result.input.registrationNumber, "  ab c-123  ");
  assert.equal(result.input.make, "café");
  assert.equal(result.input.engineCapacity, "2.5 L");
  assert.equal(result.input.usageType, "Company vehicle");
});
test("validation matches year, bounded text and unsupported character rules without inventing business constraints", () => {
  for (const year of ["999", "10000", "20.5", "abcd", "2026e0"])
    assert.ok(validateVehicle({ ...vehicleDraft(input), year }).errors.year);
  for (const year of ["1000", "9999", " 2030 "])
    assert.equal(
      validateVehicle({ ...vehicleDraft(input), year }).errors.year,
      undefined,
    );
  assert.ok(
    validateVehicle({ ...vehicleDraft(input), model: "x".repeat(81) }).errors
      .model,
  );
  assert.ok(
    validateVehicle({ ...vehicleDraft(input), usageType: "x".repeat(41) })
      .errors.usageType,
  );
  assert.ok(
    validateVehicle({
      ...vehicleDraft(input),
      registrationNumber: "ab\ncd",
      chassisNumber: "ab\u200bcd",
    }).errors.chassisNumber,
  );
});
test("patches include only changed fields and explicit null for clearing optional details", () => {
  const previous = { ...input, colour: "Blue", year: 2020 };
  const changed = validateVehicle({
    ...vehicleDraft(previous),
    colour: "",
    model: "  RX  ",
  }).input;
  assert.deepEqual(vehicleChanges(changed, previous), {
    model: "RX",
    colour: null,
  });
  assert.deepEqual(vehicleChanges(previous, previous), {});
});

test("vehicle names are optional, normalized, bounded and sent as name-only patches", () => {
  const previous = { ...input, name: "Family car" };
  const renamed = validateVehicle({
    ...vehicleDraft(previous),
    name: "  Work cafe\u0301 car  ",
  });
  assert.deepEqual(renamed.errors, {});
  assert.equal(renamed.input.name, "Work café car");
  assert.deepEqual(vehicleChanges(renamed.input, previous), {
    name: "Work café car",
  });
  const cleared = validateVehicle({ ...vehicleDraft(previous), name: "   " });
  assert.equal(cleared.input.name, null);
  assert.deepEqual(vehicleChanges(cleared.input, previous), { name: null });
  for (const name of [
    "x".repeat(81),
    "\u0344".repeat(80),
    "bad\u200bname",
    "bad\u0000name",
  ])
    assert.ok(validateVehicle({ ...vehicleDraft(input), name }).errors.name);
  assert.equal(
    validateVehicle({ ...vehicleDraft(input), name: "x".repeat(80) }).errors
      .name,
    undefined,
  );
});
test("list/read use credentialed uncached configured requests; only public response fields enter state", async () => {
  const calls = [];
  const api = createVehiclesApi(base, async (url, options) => {
    calls.push([url, options]);
    const record = {
      ...vehicle,
      ownerId: "not-public",
      passwordHash: "not-public",
    };
    return json(
      url.includes("?")
        ? { items: [record], total: 21, limit: 20, offset: 20 }
        : record,
    );
  });
  assert.deepEqual((await api.list(20)).items, [vehicle]);
  assert.deepEqual(await api.read(vehicle.id), vehicle);
  assert.equal(
    calls[0][0],
    "http://localhost:3003/v1/vehicles?limit=20&offset=20",
  );
  for (const [, options] of calls) {
    assert.equal(options.credentials, "include");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.equal(options.method, "GET");
    assert.deepEqual(options.headers, { Accept: "application/json" });
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.equal(api.delete, undefined);
});
test("create and update send JSON and CSRF with no owner/normalized/server fields", async () => {
  const calls = [];
  const api = createVehiclesApi(base, async (url, options) => {
    calls.push([url, options]);
    return json(vehicle, options.method === "POST" ? 201 : 200);
  });
  await api.create({
    ...input,
    registrationNumber: " aB 12 ",
    userId: "forbidden",
    registrationNumberNormalized: "forbidden",
  });
  await api.update(vehicle.id, { colour: null, ownerId: "forbidden" });
  assert.equal(calls[0][1].method, "POST");
  assert.equal(calls[1][1].method, "PATCH");
  for (const [, options] of calls) {
    assert.equal(options.credentials, "include");
    assert.equal(options.headers["X-MFS-CSRF"], "1");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers.Authorization, undefined);
  }
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    ...input,
    registrationNumber: " aB 12 ",
  });
  assert.deepEqual(JSON.parse(calls[1][1].body), { colour: null });
});
test("malformed pagination and records fail instead of becoming false empty states", async () => {
  for (const body of [
    null,
    {},
    { items: [], total: -1, limit: 20, offset: 0 },
    { items: [], total: 0, limit: 100, offset: 0 },
    { items: [vehicle], total: 0, limit: 20, offset: 0 },
    {
      items: [{ ...vehicle, category: "FLEET" }],
      total: 1,
      limit: 20,
      offset: 0,
    },
  ]) {
    const api = createVehiclesApi(base, async () => json(body));
    await assert.rejects(api.list(), VehiclesApiError);
  }
  for (const record of [
    { ...vehicle, year: 999 },
    { ...vehicle, engineNumber: undefined },
    { ...vehicle, id: "../../auth/logout" },
    { ...vehicle, createdAt: "invalid" },
  ]) {
    await assert.rejects(
      createVehiclesApi(base, async () => json(record)).read(vehicle.id),
      VehiclesApiError,
    );
  }
});
test("unsafe identifiers and offsets never reach the transport", async () => {
  let count = 0;
  const api = createVehiclesApi(base, async () => {
    count++;
    return json(vehicle);
  });
  for (const id of [
    "../auth/logout",
    "id?userId=other",
    "",
    "https://other.test",
  ])
    await assert.rejects(api.read(id), VehiclesApiError);
  for (const offset of [-1, 100001, 1.5])
    await assert.rejects(api.list(offset), VehiclesApiError);
  assert.equal(count, 0);
});

test("mismatched records and malformed write responses are not presented as confirmed saves", async () => {
  let writes = 0;
  const mismatched = { ...vehicle, id: "00000000-0000-4000-8000-000000000002" };
  const api = createVehiclesApi(base, async (_, options) => {
    if (options.method !== "GET") writes++;
    return json(mismatched);
  });
  await assert.rejects(api.read(vehicle.id), VehiclesApiError);
  await assert.rejects(
    api.update(vehicle.id, { colour: "Red" }),
    /couldn’t confirm your changes/,
  );
  await assert.rejects(
    createVehiclesApi(base, async () => json({ accepted: true })).create(input),
    /couldn’t confirm your changes/,
  );
  assert.equal(writes, 1);
});
test("API validation maps only known fields to safe messages, never raw backend details", async () => {
  const api = createVehiclesApi(base, async () =>
    json(
      {
        message: "private details",
        errors: [
          { field: "year", message: "private details" },
          { field: "ownerId", message: "private details" },
        ],
      },
      400,
    ),
  );
  await assert.rejects(api.create(input), (error) => {
    assert.equal(error.status, 400);
    assert.deepEqual(error.fields, {
      year: "Enter a four digit year, or leave it blank.",
    });
    assert.ok(!error.message.includes("private"));
    return true;
  });
});
test("session expiry, missing vehicles, throttling and service failures stay distinct", async () => {
  for (const [status, match] of [
    [401, /log in again/],
    [404, /no longer available/],
    [429, /wait a moment/],
    [503, /temporarily unavailable/],
    [403, /couldn’t complete/],
  ]) {
    const api = createVehiclesApi(base, async () =>
      json({ message: "private details" }, status),
    );
    await assert.rejects(
      api.list(),
      (error) =>
        error instanceof VehiclesApiError &&
        error.status === status &&
        match.test(error.message),
    );
  }
});
test("network failures do not automatically retry writes and explain an uncertain outcome", async () => {
  let calls = 0;
  const api = createVehiclesApi(base, async () => {
    calls++;
    throw new Error("secret transport diagnostic");
  });
  await assert.rejects(api.create(input), /couldn’t confirm your changes/);
  assert.equal(calls, 1);
  await assert.rejects(api.list(), /couldn’t load your vehicles/);
});
test("an aborted operation cannot update a later customer view", async () => {
  const controller = new AbortController();
  const api = createVehiclesApi(base, async () => {
    controller.abort();
    throw new DOMException("Cancelled", "AbortError");
  });
  await assert.rejects(
    api.list(0, controller.signal),
    (error) => error.name === "AbortError",
  );
});
