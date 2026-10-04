import { test, expect, type Page } from "@playwright/test";

// Test fixtures are never bundled into the exported customer workspace.
const customer = {
  id: "dashboard-test-customer",
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

const routes = [
  { path: "/dashboard/", label: "Overview" },
  { path: "/dashboard/vehicles/", label: "Vehicles" },
  { path: "/dashboard/services/", label: "Services" },
  { path: "/dashboard/requests/", label: "Requests" },
  { path: "/dashboard/account/", label: "Account" },
];

async function mockCustomerApi(page: Page) {
  const state = {
    user: { ...customer },
    signedIn: true,
    meStatus: 0,
    meDelay: 0,
    logoutStatus: 0,
    calls: [] as string[],
  };
  await page.route("http://localhost:3003/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    state.calls.push(`${request.method()} ${path}`);
    // No non-authentication endpoint exists in this slice.
    expect(["/v1/me", "/v1/auth/logout"]).toContain(path);
    if (path === "/v1/me") {
      expect(request.method()).toBe("GET");
      if (state.meDelay)
        await new Promise((resolve) => setTimeout(resolve, state.meDelay));
      const status = state.meStatus || (state.signedIn ? 200 : 401);
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(
          status === 200 ? state.user : { message: "private API details" },
        ),
      });
      return;
    }
    expect(request.method()).toBe("POST");
    expect(request.headers()["x-mfs-csrf"]).toBe("1");
    expect(request.headers()["content-type"]).toBe("application/json");
    expect(request.headers()["authorization"]).toBeUndefined();
    expect(request.postDataJSON()).toEqual({});
    const status = state.logoutStatus || 204;
    if (status === 204) state.signedIn = false;
    await route.fulfill({
      status,
      contentType: "application/json",
      body:
        status === 204
          ? ""
          : JSON.stringify({ message: "private API details" }),
    });
  });
  return state;
}

test("customer navigation reaches all five pages without inventing domain API data", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  await page.goto("/dashboard/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Let’s sort your vehicle paperwork.",
  );
  const navigation = page.getByRole("navigation", {
    name: "Main navigation",
  });
  for (const route of routes) {
    await navigation
      .getByRole("link", { name: route.label, exact: true })
      .click();
    await expect(page).toHaveURL(`http://localhost:3002${route.path}`);
    await expect(
      page.locator("header").getByText(route.label, { exact: true }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /workspace|More tools are on the way/i,
    );
    await expect(page).toHaveTitle(new RegExp(`^${route.label}(?:$| )`));
    await expect(
      navigation.getByRole("link", { name: route.label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    if (!["Overview", "Account"].includes(route.label)) {
      await expect(
        page.locator("main").getByText("Coming soon", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .locator("main")
          .getByRole("link", { name: /Chat with MFS|Ask MFS for an update/ }),
      ).toHaveAttribute("href", /^https:\/\/wa\.me\/2349060004617\?/);
    }
    await expect(
      page.locator("main input, main form, main table, main canvas"),
    ).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
  }
  expect(api.calls.every((call) => call === "GET /v1/me")).toBe(true);
});

test("all dashboard routes send confirmed signed-out customers to the existing login page", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  api.signedIn = false;
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveURL("http://localhost:3002/auth/login/");
    await expect(
      page.getByRole("heading", { name: "Log in to your account." }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(customer.email);
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toHaveCount(0);
  }
});

test("initial restore shows a skeleton rather than private details or false empty records", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  api.meDelay = 900;
  await page.goto("/dashboard/account/");
  await expect(
    page.getByRole("status", { name: "Checking your session" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Personal details" }),
  ).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(customer.email);
  await expect(
    page.getByRole("heading", { name: "Personal details" }),
  ).toBeVisible();
  await expect(
    page.getByRole("status", { name: "Checking your session" }),
  ).toHaveCount(0);
});

test("account is read only, uses me data, allows unverified customers, and restores updated details on reload", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  await page.goto("/dashboard/account/");
  const details = page.getByRole("region", { name: "Personal details" });
  for (const value of [
    customer.firstName,
    customer.lastName,
    customer.email,
    customer.phone,
  ])
    await expect(details).toContainText(value);
  await expect(page.locator("input, form")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /edit|save|verify/i }),
  ).toHaveCount(0);
  api.user.firstName = "Chidinma";
  await page.reload();
  await expect(details).toContainText("Chidinma");
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
  expect(api.calls.every((call) => call === "GET /v1/me")).toBe(true);
});

test("an unavailable API offers retry without pretending the customer is signed out", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  api.meStatus = 503;
  await page.goto("/dashboard/account/");
  await expect(
    page.getByRole("heading", { name: "Let’s reconnect." }),
  ).toBeVisible();
  await expect(page).toHaveURL("http://localhost:3002/dashboard/account/");
  await expect(page.locator("body")).not.toContainText("private API details");
  await expect(page.locator("body")).not.toContainText(/workspace/i);
  await expect(page.locator("body")).not.toContainText(customer.email);
  api.meStatus = 0;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Personal details" }),
  ).toContainText(customer.email);
});

test("a background failure marks cached account data and a later 401 removes it", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  await page.goto("/dashboard/account/");
  await expect(
    page.getByRole("heading", { name: "Personal details" }),
  ).toBeVisible();
  api.meStatus = 503;
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "last details we loaded",
  );
  await expect(
    page.getByRole("region", { name: "Personal details" }),
  ).toContainText(customer.email);
  api.meStatus = 401;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3002/auth/login/");
  await expect(page.locator("body")).not.toContainText(customer.email);
});

test("logout errors preserve the account, retry uses the existing CSRF flow, and success gates future visits", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  await page.goto("/dashboard/account/");
  api.logoutStatus = 503;
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(
    page.getByRole("region", { name: "Personal details" }),
  ).toContainText(customer.email);
  api.logoutStatus = 0;
  await page.getByRole("button", { name: "Try logging out again" }).click();
  await expect(page).toHaveURL("http://localhost:3002/auth/login/");
  await page.goto("/dashboard/account/");
  await expect(page).toHaveURL("http://localhost:3002/auth/login/");
  expect(
    api.calls.filter((call) => call === "POST /v1/auth/logout"),
  ).toHaveLength(2);
});

test("mobile menu traps focus, supports Escape and route selection, and keeps all pages within the viewport", async ({
  page,
}) => {
  await mockCustomerApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(menu).toBeVisible();
  await expect(menu).not.toContainText(/customer|workspace/i);
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press(key);
      expect(
        await menu.evaluate((element) =>
          element.contains(document.activeElement),
        ),
      ).toBe(true);
    }
  }
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  for (const route of routes) {
    await toggle.click();
    await menu.getByRole("link", { name: route.label, exact: true }).click();
    await expect(page).toHaveURL(`http://localhost:3002${route.path}`);
    await expect(
      page.locator("header").getByText(route.label, { exact: true }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/workspace/i);
    await expect(menu).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden",
    );
  }
  await toggle.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(menu).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("narrow mobile pages handle long API values without horizontal overflow", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  api.user.firstName = "A".repeat(80);
  api.user.lastName = "B".repeat(80);
  api.user.email = "c".repeat(64) + "@example.test";
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/dashboard/account/");
  await expect(
    page.getByRole("heading", { name: "Personal details" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("mobile logout keeps failures in the menu and releases the scroll lock after success", async ({
  page,
}) => {
  const api = await mockCustomerApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard/account/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation menu" });
  api.logoutStatus = 503;
  await menu.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(menu.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(menu).toBeVisible();
  api.logoutStatus = 0;
  await menu.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3002/auth/login/");
  await expect(
    page.getByRole("heading", { name: "Log in to your account." }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
  await expect(page.locator("body")).not.toContainText(customer.email);
});

test("keyboard skip link reaches main and the existing signed-in Account menu links to the dashboard", async ({
  page,
}) => {
  await mockCustomerApi(page);
  await page.goto("/dashboard/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#customer-main")).toBeFocused();
  await page.getByRole("link", { name: "Back to website" }).click();
  await expect(page).toHaveURL("http://localhost:3002/");
  await page.getByRole("button", { name: "Account", exact: true }).hover();
  await page
    .getByRole("link", { name: "Dashboard", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL("http://localhost:3002/dashboard/");
});
