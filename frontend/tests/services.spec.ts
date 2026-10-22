import { test, expect, type Page } from "@playwright/test";

const names = [
  "Vehicle Licence",
  "Hackney Permit",
  "Insurance - Third Party",
  "Insurance - Comprehensive",
  "Road Worthiness & Proof of Ownership",
  "New Registration",
  "C of O Change of Ownership",
  "New Driver’s Licence",
  "Renewal of Driver’s Licence",
  "International Driver’s Licence",
  "AutoVIN",
  "Plate Reprint",
  "L.G. Papers",
  "Stage Carriage",
  "ECMR",
  "Doctor’s Report",
  "Existing C of O",
  "Tinted Permit",
  "Police Report and Affidavit",
];
const categories = [
  { code: "BIKE", name: "Bike" },
  { code: "SALOON", name: "Saloon" },
  { code: "SUV_PICKUP", name: "SUV / Pickup" },
  { code: "TRUCK", name: "Truck" },
  { code: "BUS_MINI_TRUCK", name: "Bus / Mini Truck" },
];
function slug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
function catalogue() {
  return names.map((name, index) => ({
    code: `SERVICE_${index + 1}`,
    name,
    slug: slug(name),
    description: null,
    vehicleCategories: categories,
    variants:
      name === "New Driver’s Licence" || name === "Renewal of Driver’s Licence"
        ? [
            { code: "THREE_YEARS", name: "3 years", description: null },
            { code: "FIVE_YEARS", name: "5 years", description: null },
          ]
        : name === "International Driver’s Licence"
          ? [{ code: "ONE_YEAR", name: "1 year", description: null }]
          : [],
  }));
}

async function mockPublicApi(page: Page) {
  const state = {
    status: 200,
    items: catalogue(),
    delay: 0,
    failuresRemaining: 0,
    calls: [] as string[],
  };
  await page.route("http://localhost:3003/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    state.calls.push(`${request.method()} ${path}`);
    expect(request.method()).toBe("GET");
    expect(request.headers().authorization).toBeUndefined();
    if (path === "/v1/me") {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "private diagnostic" }),
      });
      return;
    }
    expect(path).toBe("/v1/services");
    if (state.delay)
      await new Promise((resolve) => setTimeout(resolve, state.delay));
    const status = state.failuresRemaining > 0 ? 503 : state.status;
    if (state.failuresRemaining > 0) state.failuresRemaining -= 1;
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(
        status === 200
          ? { items: state.items }
          : { message: "database host and private credentials" },
      ),
    });
  });
  return state;
}

test("the public page loads all active source-named services and their variants without prices", async ({
  page,
}) => {
  const api = await mockPublicApi(page);
  api.delay = 500;
  api.failuresRemaining = 1;
  await page.goto("/services/");
  await expect(page).toHaveURL("http://localhost:3002/services/");
  await expect(
    page.getByRole("status", { name: "Loading service catalogue" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Browse our vehicle services." }),
  ).toBeVisible();
  await expect(page.getByText("19 services", { exact: true })).toBeVisible();
  for (const name of names)
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "New Driver’s Licence options" }),
  ).toContainText("3 years");
  await expect(
    page.getByRole("list", { name: "New Driver’s Licence options" }),
  ).toContainText("5 years");
  await expect(
    page.getByRole("list", { name: "International Driver’s Licence options" }),
  ).toContainText("1 year");
  await expect(page.locator("body")).not.toContainText(/₦|price|turnaround|requirements/i);
  await expect(page).toHaveTitle(/^Vehicle services/);
  expect(api.calls.filter((call) => call === "GET /v1/services")).toHaveLength(2);
});

test("search filters service names and variants while public navigation points to the catalogue", async ({
  page,
}) => {
  await mockPublicApi(page);
  await page.goto("/services/");
  const search = page.getByRole("searchbox", { name: "Search services" });
  await search.fill("police");
  await expect(page.getByText("1 of 19 services", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Police Report and Affidavit" }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(1);
  await search.fill("5 years");
  await expect(page.locator("article")).toHaveCount(2);
  await search.fill("not listed");
  await expect(
    page.getByRole("heading", { name: "No matching services." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator("article")).toHaveCount(19);
  await expect(page.getByRole("link", { name: "Services", exact: true }).first()).toHaveAttribute(
    "href",
    "/services/",
  );
});

test("empty and unavailable catalogues have distinct, retryable states", async ({
  page,
}) => {
  const api = await mockPublicApi(page);
  api.items = [];
  await page.goto("/services/");
  await expect(
    page.getByRole("heading", { name: "No services are listed right now." }),
  ).toBeVisible();
  api.status = 503;
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Catalogue unavailable." }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/database|credentials/i);
  api.status = 200;
  api.items = catalogue();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("19 services", { exact: true })).toBeVisible();
});

test("the catalogue stays within a narrow viewport", async ({ page }) => {
  await mockPublicApi(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/");
  await expect(page.getByText("19 services", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
