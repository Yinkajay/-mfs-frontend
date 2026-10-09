import { test, expect, type Page } from "@playwright/test";

const customer = {
  id: "test-customer",
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

async function mockApi(page: Page) {
  const state = {
    signedIn: false,
    failure: 0,
    loginFailure: 0,
    loginDelay: 0,
    requests: [] as string[],
  };
  await page.route("http://localhost:3003/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    state.requests.push(`${request.method()} ${path}`);
    if (request.method() === "POST") {
      expect(request.headers()["x-mfs-csrf"]).toBe("1");
      expect(request.headers()["content-type"]).toBe("application/json");
      expect(request.headers()["authorization"]).toBeUndefined();
    }
    const status =
      state.failure ||
      (path === "/v1/auth/login" ? state.loginFailure : 0) ||
      (path === "/v1/me"
        ? state.signedIn
          ? 200
          : 401
        : path === "/v1/auth/register"
          ? 202
          : path === "/v1/auth/logout"
            ? 204
            : 200);
    if (path === "/v1/auth/login" && status === 200) {
      if (state.loginDelay)
        await new Promise((resolve) => setTimeout(resolve, state.loginDelay));
      state.signedIn = true;
    }
    if (path === "/v1/auth/logout" && status === 204) state.signedIn = false;
    await route.fulfill({
      status,
      contentType: "application/json",
      body:
        status === 204
          ? ""
          : JSON.stringify(
              status >= 400
                ? {
                    message: "private backend failure",
                    errors: [
                      { field: "phone", message: "private phone details" },
                    ],
                  }
                : path === "/v1/auth/register"
                  ? { message: "Registration request received" }
                  : customer,
            ),
    });
  });
  return state;
}

async function fillLogin(page: Page) {
  await page.getByLabel("Email address").fill("CUSTOMER@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-only password phrase");
}

test("signup validates, logs in through the separate endpoint, and returns home automatically", async ({
  page,
}) => {
  const api = await mockApi(page);
  await page.goto("/auth/signup/");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Enter a valid first name, up to 80 characters."),
  ).toBeVisible();
  expect(
    api.requests.filter((request) => request.startsWith("POST")),
  ).toHaveLength(0);
  await page.getByLabel("First name", { exact: true }).fill("Amaka");
  await page.getByLabel("Last name", { exact: true }).fill("Okafor");
  await page.getByLabel("Email address").fill("customer@example.test");
  await page.getByLabel("Phone number").fill("09060004617");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-only password phrase");
  await page.getByLabel("Agree to the terms and privacy policy").check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL("http://localhost:3002/");
  await expect(
    page.getByRole("button", { name: "Account", exact: true }),
  ).toBeVisible();
  expect(api.requests.filter((request) => request.startsWith("POST"))).toEqual([
    "POST /v1/auth/register",
    "POST /v1/auth/login",
  ]);
});

test("login loads, restores on reload, keeps tokens out of storage, and logs out from the nav", async ({
  page,
}) => {
  const api = await mockApi(page);
  api.loginDelay = 400;
  await page.goto("/auth/login/");
  await fillLogin(page);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Logging in…" }),
  ).toBeDisabled();
  await expect(page).toHaveURL("http://localhost:3002/");
  await page.reload();
  await page.getByRole("button", { name: "Account", exact: true }).hover();
  await expect(page.getByText("Amaka", { exact: true }).first()).toBeVisible();
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
  await page
    .getByRole("button", { name: "Log out", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(api.requests).toContain("POST /v1/auth/logout");
});

test("login, rate-limit and network failures are visible and retryable, without raw API messages", async ({
  page,
}) => {
  const api = await mockApi(page);
  await page.goto("/auth/login/");
  await fillLogin(page);
  api.failure = 401;
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Invalid email or password.",
  );
  api.failure = 429;
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Too many attempts.",
  );
  api.failure = 0;
  await page.route("http://localhost:3003/v1/auth/login", (route) =>
    route.abort(),
  );
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Could not connect.",
  );
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeEnabled();
});

test("background restore failures stay quiet but signup field errors remain visible", async ({
  page,
}) => {
  const api = await mockApi(page);
  api.failure = 503;
  await page.goto("/auth/signup/");
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeEnabled();
  await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
  await page.getByLabel("First name", { exact: true }).fill("Amaka");
  await page.getByLabel("Last name", { exact: true }).fill("Okafor");
  await page.getByLabel("Email address").fill("customer@example.test");
  await page.getByLabel("Phone number").fill("12345");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-only password phrase");
  await page.getByLabel("Agree to the terms and privacy policy").check();
  api.failure = 400;
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Enter a phone number with the correct number of digits."),
  ).toBeVisible();
  await expect(page.getByLabel("Phone number")).toBeFocused();
  expect(api.requests.filter((request) => request.startsWith("POST"))).toEqual([
    "POST /v1/auth/register",
  ]);
});

test("accepted signup with failed auto-login keeps credentials and retries only login", async ({
  page,
}) => {
  const api = await mockApi(page);
  api.loginFailure = 401;
  await page.goto("/auth/signup/");
  await page.getByLabel("First name", { exact: true }).fill("Amaka");
  await page.getByLabel("Last name", { exact: true }).fill("Okafor");
  await page.getByLabel("Email address").fill("customer@example.test");
  await page.getByLabel("Phone number").fill("09060004617");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-only password phrase");
  await page.getByLabel("Agree to the terms and privacy policy").check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Invalid email or password.",
  );
  await expect(page.getByLabel("Email address")).toHaveValue(
    "customer@example.test",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "test-only password phrase",
  );
  await expect(page.getByLabel("First name", { exact: true })).toHaveCount(0);
  await expect(page).toHaveURL("http://localhost:3002/auth/signup/");
  api.loginFailure = 0;
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3002/");
  expect(api.requests.filter((request) => request.startsWith("POST"))).toEqual([
    "POST /v1/auth/register",
    "POST /v1/auth/login",
    "POST /v1/auth/login",
  ]);
});

test("an offline API stays quiet on load, but a submitted login still shows a retryable error", async ({
  page,
}) => {
  await page.route("http://localhost:3003/v1/**", (route) => route.abort());
  await page.goto("/auth/login/");
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeEnabled();
  await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
  await fillLogin(page);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Could not connect. Please try again.",
  );
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeEnabled();
});

test("mobile logout is available, failures retain the signed-in state, and auth keeps the white layout", async ({
  page,
}) => {
  const api = await mockApi(page);
  api.signedIn = true;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const menu = page.locator("#mobile-navigation");
  await expect(
    menu.getByRole("button", { name: "Log out", exact: true }),
  ).toBeVisible();
  api.failure = 503;
  await menu.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(menu.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(
    menu.getByRole("button", { name: "Log out", exact: true }),
  ).toBeEnabled();
  api.failure = 0;
  await menu.getByRole("button", { name: "Log out", exact: true }).click();
  await menu.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Log in to your account." }),
  ).toBeVisible();
  await expect(page.locator("aside")).toBeHidden();
});
