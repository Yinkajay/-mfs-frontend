import { test, expect, type Page } from "@playwright/test";

const customer = {
  id: "garage-test-customer",
  firstName: "Amaka",
  lastName: "Okafor",
  email: "customer@example.test",
  phone: "+2349060004617",
  status: "ACTIVE",
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  createdAt: "2026-10-04T00:00:00.000Z",
  updatedAt: "2026-10-04T00:00:00.000Z",
};
function fixture(index = 1) {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    name: null as string | null,
    category: "SUV_PICKUP",
    registrationNumber: "  abC 123  ",
    registrationNumberNormalized: "ABC123",
    make: "Lexus",
    model: `RX ${index}`,
    year: 2020,
    colour: "Blue",
    chassisNumber: "CHASSIS123",
    engineNumber: "ENGINE123",
    engineCapacity: "2.5 L",
    usageType: "Private",
    stateOfRegistration: "Lagos",
    createdAt: "2026-10-04T00:00:00.000Z",
    updatedAt: "2026-10-04T00:00:00.000Z",
  };
}
async function mockGarage(
  page: Page,
  records = [] as ReturnType<typeof fixture>[],
) {
  const state = {
    records,
    signedIn: true,
    listStatus: 200,
    readStatus: 200,
    saveStatus: 200,
    listDelay: 0,
    saveDelay: 0,
    failNetwork: false,
    calls: [] as {
      method: string;
      path: string;
      body?: Record<string, unknown>;
    }[],
  };
  await page.route("http://localhost:3003/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const body = request.postData() ? request.postDataJSON() : undefined;
    state.calls.push({ method, path: url.pathname, body });
    const send = (status: number, value: unknown) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(value),
      });
    if (url.pathname === "/v1/me")
      return send(
        state.signedIn ? 200 : 401,
        state.signedIn ? customer : { message: "private diagnostic" },
      );
    expect(url.pathname).toMatch(/^\/v1\/vehicles(?:\/[\da-f-]+)?$/);
    expect(method).not.toBe("DELETE");
    expect(request.headers().authorization).toBeUndefined();
    if (!state.signedIn) return send(401, { message: "private diagnostic" });
    if (method === "GET" && url.pathname === "/v1/vehicles") {
      if (state.listDelay)
        await new Promise((resolve) => setTimeout(resolve, state.listDelay));
      if (state.listStatus !== 200)
        return send(state.listStatus, { message: "private diagnostic" });
      const offset = Number(url.searchParams.get("offset"));
      expect(url.searchParams.get("limit")).toBe("20");
      return send(200, {
        items: state.records.slice(offset, offset + 20),
        total: state.records.length,
        limit: 20,
        offset,
      });
    }
    const id = url.pathname.split("/").at(-1);
    const existing = state.records.find((vehicle) => vehicle.id === id);
    if (method === "GET")
      return send(
        state.readStatus,
        state.readStatus === 200 ? existing : { message: "private diagnostic" },
      );
    expect(["POST", "PATCH"]).toContain(method);
    expect(request.headers()["x-mfs-csrf"]).toBe("1");
    expect(request.headers()["content-type"]).toBe("application/json");
    expect(body).not.toHaveProperty("userId");
    expect(body).not.toHaveProperty("registrationNumberNormalized");
    if (state.saveDelay)
      await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
    if (state.failNetwork) return route.abort("failed");
    if (state.saveStatus !== 200)
      return send(state.saveStatus, {
        message: "private diagnostic",
        errors: [{ field: "year", message: "private diagnostic" }],
      });
    if (method === "POST") {
      const added = {
        ...fixture(99),
        ...body,
        registrationNumberNormalized:
          body?.registrationNumber == null
            ? null
            : String(body.registrationNumber)
                .normalize("NFC")
                .toUpperCase()
                .replace(/\s+/gu, ""),
      };
      state.records.unshift(added as ReturnType<typeof fixture>);
      return send(201, added);
    }
    Object.assign(existing!, body);
    return send(200, existing);
  });
  return state;
}

test("loading is distinct from empty; add saves all supported details and preserves raw registration", async ({
  page,
}) => {
  const api = await mockGarage(page);
  api.listDelay = 600;
  await page.goto("/dashboard/vehicles/");
  await expect(
    page.getByRole("status", { name: "Loading your vehicles" }),
  ).toBeVisible();
  await expect(page.getByText("No vehicles yet.")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "No vehicles yet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add vehicle", exact: true }).click();
  await expect(page.getByLabel("Category")).toBeFocused();
  await page.getByLabel("Category").selectOption("SUV_PICKUP");
  for (const [label, value] of [
    ["Registration number", "  abC 123  "],
    ["Make", "Lexus"],
    ["Model", "RX"],
    ["Year", "2020"],
    ["Colour", "Blue"],
    ["State of registration", "Lagos"],
    ["Chassis number", "CHASSIS123"],
    ["Engine number", "ENGINE123"],
    ["Engine capacity", "2.5 L"],
    ["Usage type", "Private"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  api.saveDelay = 500;
  await page.getByRole("button", { name: "Add vehicle", exact: true }).click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(page.getByText("Vehicle added.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Lexus RX", exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toContainText("abC 123");
  const writes = api.calls.filter((call) => call.method === "POST");
  expect(writes).toHaveLength(1);
  expect(writes[0].body).toMatchObject({
    category: "SUV_PICKUP",
    registrationNumber: "  abC 123  ",
    year: 2020,
    engineCapacity: "2.5 L",
    usageType: "Private",
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Lexus RX", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
});

test("client validation focuses fields and never submits an invalid draft", async ({
  page,
}) => {
  const api = await mockGarage(page);
  await page.goto("/dashboard/vehicles/");
  await expect(page.getByText("No vehicles yet.")).toBeVisible();
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await expect(
    page.getByText("Choose a vehicle category.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Category")).toBeFocused();
  await page.getByLabel("Category").selectOption("BIKE");
  await page.getByLabel("Year", { exact: true }).fill("abcd");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await expect(page.getByLabel("Year", { exact: true })).toBeFocused();
  expect(api.calls.filter((call) => call.method === "POST")).toHaveLength(0);
  await page.getByLabel("Year", { exact: true }).fill("");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await expect(
    page.getByRole("heading", { name: "Bike", exact: true }),
  ).toBeVisible();
  expect(api.calls.find((call) => call.method === "POST")?.body).toMatchObject({
    category: "BIKE",
    year: null,
    make: null,
    registrationNumber: null,
  });
});

test("vehicle names save, survive reload, rename independently, and clear back to make/model", async ({
  page,
}) => {
  const api = await mockGarage(page);
  await page.goto("/dashboard/vehicles/");
  await page.getByRole("button", { name: "Add vehicle", exact: true }).click();
  await page.getByLabel("Category").selectOption("SUV_PICKUP");
  await page.getByLabel("Vehicle name", { exact: true }).fill("  Family car  ");
  await page.getByLabel("Make", { exact: true }).fill("Lexus");
  await page.getByLabel("Model", { exact: true }).fill("RX 350");
  await page.getByRole("button", { name: "Add vehicle", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Family car", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("article").getByText("Lexus RX 350", { exact: true }),
  ).toBeVisible();
  expect(api.calls.find((call) => call.method === "POST")?.body?.name).toBe(
    "Family car",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Family car", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Family car" }).click();
  await expect(page.getByLabel("Vehicle name", { exact: true })).toHaveValue(
    "Family car",
  );
  await page.getByLabel("Vehicle name", { exact: true }).fill("Work car");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Work car", exact: true }),
  ).toBeVisible();
  expect(
    api.calls.filter((call) => call.method === "PATCH").at(-1)?.body,
  ).toEqual({ name: "Work car" });
  await page.getByRole("button", { name: "Edit Work car" }).click();
  await page.getByLabel("Vehicle name", { exact: true }).fill("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Lexus RX 350", exact: true }),
  ).toBeVisible();
  expect(
    api.calls.filter((call) => call.method === "PATCH").at(-1)?.body,
  ).toEqual({ name: null });
});

test("edit reads fresh details and PATCH sends only changed fields including null to clear", async ({
  page,
}) => {
  const api = await mockGarage(page, [fixture()]);
  await page.goto("/dashboard/vehicles/");
  await expect(page.getByRole("heading", { name: "Lexus RX 1" })).toBeVisible();
  api.records[0].engineNumber = "NEWENGINE";
  await page.getByRole("button", { name: "Edit Lexus RX 1" }).click();
  await expect(page.getByLabel("Engine number", { exact: true })).toHaveValue(
    "NEWENGINE",
  );
  await expect(
    page.getByLabel("Registration number", { exact: true }),
  ).toHaveValue("  abC 123  ");
  await page.getByLabel("Colour", { exact: true }).fill("");
  await page.getByLabel("Model", { exact: true }).fill("RX 350");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Vehicle details saved.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Lexus RX 350" }),
  ).toBeVisible();
  expect(api.calls.find((call) => call.method === "PATCH")?.body).toEqual({
    model: "RX 350",
    colour: null,
  });
  expect(
    api.calls.some(
      (call) => call.method === "GET" && call.path.endsWith(fixture().id),
    ),
  ).toBe(true);
});

test("unchanged edits do not send PATCH and cancel restores keyboard focus", async ({
  page,
}) => {
  const api = await mockGarage(page, [fixture()]);
  await page.goto("/dashboard/vehicles/");
  await page.getByRole("button", { name: "Edit Lexus RX 1" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "haven’t changed",
  );
  expect(api.calls.some((call) => call.method === "PATCH")).toBe(false);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("button", { name: "Edit Lexus RX 1" }),
  ).toBeFocused();
});

test("server validation stays safe, focuses a field, and keeps entered details", async ({
  page,
}) => {
  const api = await mockGarage(page);
  api.saveStatus = 400;
  await page.goto("/dashboard/vehicles/");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await page.getByLabel("Category").selectOption("TRUCK");
  await page.getByLabel("Make", { exact: true }).fill("Volvo");
  await page.getByLabel("Year", { exact: true }).fill("2020");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Check your vehicle details",
  );
  await expect(page.getByLabel("Year", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Make", { exact: true })).toHaveValue("Volvo");
  await expect(page.locator("body")).not.toContainText("private diagnostic");
  api.saveStatus = 200;
  await page.getByLabel("Year", { exact: true }).fill("2021");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await expect(page.getByText("Vehicle added.")).toBeVisible();
});

test("failed loads have retry, not false empty states; failed refresh preserves the last records", async ({
  page,
}) => {
  const api = await mockGarage(page, [fixture()]);
  api.listStatus = 503;
  await page.goto("/dashboard/vehicles/");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByText("No vehicles yet.")).toHaveCount(0);
  await expect(page.locator("article")).toHaveCount(0);
  api.listStatus = 200;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "Lexus RX 1" })).toBeVisible();
  api.listStatus = 503;
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "last successful load",
  );
  await expect(page.getByRole("heading", { name: "Lexus RX 1" })).toBeVisible();
});

test("a confirmed save remains visible when the following refresh fails", async ({
  page,
}) => {
  const api = await mockGarage(page, [fixture()]);
  await page.goto("/dashboard/vehicles/");
  await page.getByRole("button", { name: "Edit Lexus RX 1" }).click();
  await page.getByLabel("Model", { exact: true }).fill("Updated RX");
  api.listStatus = 503;
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Vehicle details saved.")).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(
    page.getByRole("heading", { name: "Lexus Updated RX" }),
  ).toBeVisible();
});

test("an uncertain network save is not automatically retried and retains the draft", async ({
  page,
}) => {
  const api = await mockGarage(page);
  api.failNetwork = true;
  await page.goto("/dashboard/vehicles/");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await page.getByLabel("Category").selectOption("BUS_MINI_TRUCK");
  await page.getByLabel("Make", { exact: true }).fill("Toyota");
  await page.getByRole("button", { name: "Add vehicle" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "couldn’t confirm your changes",
  );
  await expect(page.getByLabel("Make", { exact: true })).toHaveValue("Toyota");
  expect(api.calls.filter((call) => call.method === "POST")).toHaveLength(1);
});

test("missing vehicles and throttling are recoverable without showing backend diagnostics", async ({
  page,
}) => {
  const api = await mockGarage(page, [fixture()]);
  await page.goto("/dashboard/vehicles/");
  api.readStatus = 404;
  await page.getByRole("button", { name: "Edit Lexus RX 1" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "no longer available",
  );
  await expect(page.getByRole("heading", { name: "Edit vehicle" })).toHaveCount(
    0,
  );
  api.readStatus = 200;
  await page.getByRole("button", { name: "Edit Lexus RX 1" }).click();
  api.saveStatus = 429;
  await page.getByLabel("Model", { exact: true }).fill("RX updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "wait a moment",
  );
  await expect(page.locator("body")).not.toContainText("private diagnostic");
});

test("garage 401 clears private records and lets the existing provider confirm logout", async ({
  page,
}) => {
  const api = await mockGarage(page, [fixture()]);
  await page.goto("/dashboard/vehicles/");
  await expect(page.getByRole("heading", { name: "Lexus RX 1" })).toBeVisible();
  api.signedIn = false;
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page).toHaveURL("http://localhost:3002/auth/login/");
  await expect(page.locator("body")).not.toContainText("Lexus RX 1");
  expect(
    api.calls.filter((call) => call.path === "/v1/me").length,
  ).toBeGreaterThanOrEqual(2);
});

test("pagination shows actual records across bounded API pages", async ({
  page,
}) => {
  const api = await mockGarage(
    page,
    Array.from({ length: 21 }, (_, index) => fixture(index + 1)),
  );
  await page.goto("/dashboard/vehicles/");
  await expect(page.locator("article")).toHaveCount(20);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Lexus RX 21", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(page.locator("article")).toHaveCount(20);
  expect(
    api.calls.every((call) => ["GET", "POST", "PATCH"].includes(call.method)),
  ).toBe(true);
});

test("cards and forms stay usable on narrow mobile viewports with long details", async ({
  page,
}) => {
  const vehicle = {
    ...fixture(),
    name: "Family car ".repeat(7).trim(),
    make: "M".repeat(80),
    model: "X".repeat(80),
    registrationNumber: "P".repeat(80),
    stateOfRegistration: "S".repeat(80),
  };
  await mockGarage(page, [vehicle]);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/dashboard/vehicles/");
  await expect(page.locator("article")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("article button").click();
  await expect(
    page.getByRole("heading", { name: "Edit vehicle" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("article button")).toBeFocused();
  await page.getByRole("button", { name: "Add vehicle", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Category")).toBeFocused();
  await expect(page.getByRole("button", { name: /delete/i })).toHaveCount(0);
});
