import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const sourceRequire = createRequire(import.meta.url);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

// Exercise the actual TS modules without introducing another test runtime.
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
  const localRequire = (id) =>
    id.startsWith("./") ? loadSource(id.slice(2)) : sourceRequire(id);
  new Function("require", "module", "exports", outputText)(
    localRequire,
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}
const { createAuthApi, AuthApiError, resolveApiBaseUrl } =
  loadSource("auth-api");
const { validateAuthInput } = loadSource("auth-validation");
const { createAuthSession } = loadSource("auth-session");
const customer = {
  id: "customer-test",
  firstName: "Amaka",
  lastName: "Okafor",
  email: "customer@example.test",
  phone: "+2349060004617",
  status: "ACTIVE",
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  createdAt: "2026-10-03T00:00:00.000Z",
  updatedAt: "2026-10-03T00:00:00.000Z",
};
const registration = {
  firstName: "Amaka",
  lastName: "Okafor",
  email: "customer@example.test",
  phone: "09060004617",
  password: "  a long password phrase  ",
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const fake = (overrides = {}) => ({
  me: async () => customer,
  login: async () => customer,
  logout: async () => {},
  register: async () => {},
  ...overrides,
});
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("API URL comes from config and rejects insecure, credential-bearing, or mis-versioned destinations", () => {
  assert.equal(
    resolveApiBaseUrl("http://localhost:3001/v1/"),
    "http://localhost:3001/v1",
  );
  assert.equal(
    resolveApiBaseUrl("https://api.mfsservicesng.com/v1"),
    "https://api.mfsservicesng.com/v1",
  );
  for (const url of [
    undefined,
    "",
    "http://api.example.test/v1",
    "https://u:p@api.example.test/v1",
    "https://api.example.test",
    "https://api.example.test/v1?q=x",
    "https://api.example.test/v1#x",
    "//api.example.test/v1",
  ]) {
    assert.throws(() => resolveApiBaseUrl(url), AuthApiError);
  }
});

test("all mutations send exactly the contract, credentials, JSON and CSRF; registration never logs in", async () => {
  const calls = [];
  const api = createAuthApi(
    () => "http://localhost:3001/v1",
    async (url, options) => {
      calls.push({ url, options });
      return url.endsWith("register")
        ? json({ message: "Registration request received" }, 202)
        : url.endsWith("logout")
          ? new Response(null, { status: 204 })
          : json(customer);
    },
  );
  await api.register({ ...registration, agree: true });
  assert.equal(calls.length, 1);
  await api.login(registration);
  await api.me();
  await api.logout();
  for (const call of calls) {
    assert.equal(call.options.credentials, "include");
    assert.equal(call.options.cache, "no-store");
    assert.equal(call.options.redirect, "error");
    assert.ok(call.options.signal);
    assert.equal(call.options.headers.Authorization, undefined);
    if (call.options.method === "POST") {
      assert.equal(call.options.headers["X-MFS-CSRF"], "1");
      assert.equal(call.options.headers["Content-Type"], "application/json");
    }
  }
  assert.deepEqual(JSON.parse(calls[0].options.body), registration);
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    email: registration.email,
    password: registration.password,
  });
  assert.equal(calls[2].options.method, "GET");
  assert.equal(calls[2].options.body, undefined);
  assert.deepEqual(JSON.parse(calls[3].options.body), {});
});

test("public profile projection drops secrets and allows unverified customers", async () => {
  const api = createAuthApi(
    () => "http://localhost:3001/v1",
    async () =>
      json({
        ...customer,
        passwordHash: "not-for-client",
        token: "not-for-client",
      }),
  );
  assert.deepEqual(await api.me(), customer);
});

test("only me 401 means signed out; login 401 stays generic", async () => {
  const api = createAuthApi(
    () => "http://localhost:3001/v1",
    async () => json({ message: "private details" }, 401),
  );
  assert.equal(await api.me(), null);
  await assert.rejects(api.login(registration), {
    message: "Invalid email or password.",
    status: 401,
  });
});

test("validation errors map known fields without echoing submitted values", async () => {
  const api = createAuthApi(
    () => "http://localhost:3001/v1",
    async () =>
      json(
        {
          errors: [
            { field: "phone", message: "a secret" },
            { field: "passwordHash", message: "secret" },
          ],
        },
        400,
      ),
  );
  await assert.rejects(api.register(registration), (error) => {
    assert.deepEqual(error.fields, {
      phone: "Enter a valid phone number without an extension.",
    });
    assert.ok(!error.message.includes("secret"));
    return true;
  });
});

test("rate limits, CSRF rejection, unavailable API, and network failures are actionable and sanitized", async () => {
  for (const status of [403, 429, 503]) {
    const api = createAuthApi(
      () => "http://localhost:3001/v1",
      async () => json({ message: "private failure" }, status),
    );
    await assert.rejects(
      api.me(),
      (error) =>
        error instanceof AuthApiError &&
        error.status === status &&
        !error.message.includes("private"),
    );
  }
  const api = createAuthApi(
    () => "http://localhost:3001/v1",
    async () => {
      throw new Error("password");
    },
  );
  await assert.rejects(api.me(), {
    message: "Could not connect. Please try again.",
  });
});

test("missing config and malformed successful responses never produce a fake session", async () => {
  const missing = createAuthApi(
    () => undefined,
    async () => {
      throw new Error("should not fetch");
    },
  );
  await assert.rejects(missing.me(), AuthApiError);
  const malformed = createAuthApi(
    () => "http://localhost:3001/v1",
    async () => json({ token: "secret" }),
  );
  await assert.rejects(malformed.me(), AuthApiError);
});

test("signup validation covers required fields, consent, names, phone and Unicode password lengths", () => {
  assert.deepEqual(validateAuthInput("signup", registration, true), {});
  assert.deepEqual(
    validateAuthInput(
      "signup",
      { ...registration, password: "🔐".repeat(15) },
      true,
    ),
    {},
  );
  assert.ok(
    validateAuthInput("signup", { ...registration, password: "short" }, true)
      .password,
  );
  assert.ok(
    validateAuthInput(
      "signup",
      { ...registration, password: "🔐".repeat(129) },
      true,
    ).password,
  );
  assert.ok(
    validateAuthInput(
      "signup",
      { ...registration, firstName: "\u200Bname" },
      true,
    ).firstName,
  );
  assert.ok(
    validateAuthInput("signup", { ...registration, lastName: " " }, true)
      .lastName,
  );
  assert.ok(
    validateAuthInput("signup", { ...registration, phone: "invalid" }, true)
      .phone,
  );
  assert.ok(validateAuthInput("signup", registration, false).agree);
  assert.ok(validateAuthInput("login", { email: "bad", password: "" }).email);
  assert.deepEqual(
    validateAuthInput("login", {
      email: "  customer@example.test  ",
      password: "short",
    }),
    {},
  );
});

test("restore, login cookie confirmation and logout share an in-memory session", async () => {
  let current = null;
  const store = createAuthSession(
    fake({
      me: async () => current,
      login: async () => {
        current = customer;
        return customer;
      },
      logout: async () => {
        current = null;
      },
    }),
  );
  await store.restore();
  assert.equal(store.getSnapshot().phase, "signed-out");
  await store.login(registration);
  assert.equal(store.getSnapshot().phase, "signed-in");
  await store.restore();
  assert.deepEqual(store.getSnapshot().user, customer);
  await store.logout();
  assert.equal(store.getSnapshot().phase, "signed-out");
});

test("a blocked cookie fails login instead of showing a false signed-in state", async () => {
  const store = createAuthSession(fake({ me: async () => null }));
  await assert.rejects(store.login(registration), /allow cookies/);
  assert.equal(store.getSnapshot().user, null);
  assert.equal(store.getSnapshot().busy, null);
});

test("restore failures and failed logout do not pretend the session was revoked", async () => {
  const store = createAuthSession(
    fake({
      logout: async () => {
        throw new AuthApiError("Please try again.", 503);
      },
    }),
  );
  await store.restore();
  await store.logout();
  assert.equal(store.getSnapshot().phase, "error");
  assert.deepEqual(store.getSnapshot().user, customer);
  const unknown = createAuthSession(
    fake({
      me: async () => {
        throw new AuthApiError("Please try again.", 503);
      },
    }),
  );
  await unknown.restore();
  assert.equal(unknown.getSnapshot().phase, "error");
  assert.equal(unknown.getSnapshot().error, null);
  assert.equal(unknown.getSnapshot().user, null);
});

test("passive failures preserve the last known profile and explicit logout errors; recovery clears them", async () => {
  let offline = false;
  const store = createAuthSession(
    fake({
      me: async () => {
        if (offline) throw new AuthApiError("Could not connect.");
        return customer;
      },
      logout: async () => {
        throw new AuthApiError("Logout failed. Please try again.");
      },
    }),
  );
  await store.restore();
  offline = true;
  await store.restore();
  assert.deepEqual(store.getSnapshot().user, customer);
  assert.equal(store.getSnapshot().phase, "error");
  assert.equal(store.getSnapshot().error, null);
  await store.logout();
  await store.restore();
  assert.equal(store.getSnapshot().error, "Logout failed. Please try again.");
  offline = false;
  await store.restore();
  assert.equal(store.getSnapshot().phase, "signed-in");
  assert.equal(store.getSnapshot().error, null);
});

test("stale restores cannot overwrite successful login or logout; mutations cannot overlap", async () => {
  const old = deferred();
  let reads = 0;
  const store = createAuthSession(
    fake({ me: async () => (++reads === 1 ? old.promise : customer) }),
  );
  const restore = store.restore();
  await store.login(registration);
  old.resolve(null);
  await restore;
  assert.equal(store.getSnapshot().phase, "signed-in");
  const stale = deferred();
  const another = createAuthSession(fake({ me: async () => stale.promise }));
  const refresh = another.restore();
  await another.logout();
  stale.resolve(customer);
  await refresh;
  assert.equal(another.getSnapshot().phase, "signed-out");
  const slow = deferred();
  let logouts = 0;
  const locked = createAuthSession(
    fake({
      login: async () => slow.promise,
      logout: async () => {
        logouts += 1;
      },
    }),
  );
  const signingIn = locked.login(registration);
  await locked.logout();
  await assert.rejects(locked.login(registration), /Please wait/);
  assert.equal(logouts, 0);
  slow.resolve(customer);
  await signingIn;
});
