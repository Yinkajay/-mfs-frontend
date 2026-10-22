import { test, expect, type Page } from "@playwright/test";

const entries: ReadonlyArray<readonly [string, string]> = [
  ["VEHICLE_LICENCE", "Vehicle Licence"],
  ["HACKNEY_PERMIT", "Hackney Permit"],
  ["INSURANCE_THIRD_PARTY", "Insurance - Third Party"],
  ["INSURANCE_COMPREHENSIVE", "Insurance - Comprehensive"],
  ["ROAD_WORTHINESS_PROOF_OF_OWNERSHIP", "Road Worthiness & Proof of Ownership"],
  ["NEW_REGISTRATION", "New Registration"],
  ["C_OF_O_CHANGE_OF_OWNERSHIP", "C of O Change of Ownership"],
  ["NEW_DRIVERS_LICENSE", "New Driver’s Licence"],
  ["DRIVERS_LICENSE_RENEWAL", "Renewal of Driver’s Licence"],
  ["INTERNATIONAL_DVL", "International Driver’s Licence"],
  ["AUTOVIN", "AutoVIN"],
  ["PLATE_REPRINT", "Plate Reprint"],
  ["L_G_PAPERS", "L.G. Papers"],
  ["STAGE_CARRIAGE", "Stage Carriage"],
  ["ECMR", "ECMR"],
  ["DOCTORS_REPORT", "Doctor’s Report"],
  ["EXISTING_C_OF_O", "Existing C of O"],
  ["TINTED_PERMIT", "Tinted Permit"],
  ["POLICE_REPORT_AND_AFFIDAVIT", "Police Report and Affidavit"],
];
const names = entries.map(([, name]) => name);
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
  return entries.map(([code, name]) => ({
    code,
    name,
    slug: slug(name),
    description: null as string | null,
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
  // Static exports bake in whichever public API base URL was set at build time.
  await page.route("**/v1/**", async (route) => {
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
  await expect(page.getByRole("heading", { name: "What do you need sorted?" })).toBeVisible();
  await expect(page.getByText("19 services", { exact: true })).toBeVisible();
  for (const name of names)
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  const main = page.getByRole("main");
  for (const [id, count] of [
    ["vehicle-documents", 8],
    ["drivers-licences", 3],
    ["insurance", 2],
    ["permits-paperwork", 6],
  ] as const) {
    await expect(page.locator(`#${id} article`)).toHaveCount(count);
  }
  await expect(main.getByRole("link", { name: "Start on WhatsApp" })).toHaveCount(2);
  for (const link of await main.getByRole("link", { name: "Start on WhatsApp" }).all()) {
    await expect(link).toHaveAttribute("href", /wa\.me\/2349060004617\?text=/);
  }
  await expect(main.locator("article a, article button")).toHaveCount(0);
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
  await expect(page).toHaveTitle(/^Vehicle services \| MFS Services/);
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
  await expect(page.getByRole("navigation", { name: "Service categories" })).toHaveCount(0);
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
  await expect(page.getByRole("navigation", { name: "Service categories" })).toBeVisible();
  await page.getByRole("link", { name: "Insurance", exact: true }).click();
  await expect(page).toHaveURL(/#insurance$/);
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
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/services/");
    await expect(page.getByText("19 services", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const heroImages = page.getByRole("img", { name: "Two people exchange a plain envelope beside a parked car" });
    const visibleHero = width < 1280 ? heroImages.last() : heroImages.first();
    await expect(visibleHero).toBeVisible();
    expect(await visibleHero.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    for (const id of ["vehicle-documents", "drivers-licences", "insurance", "permits-paperwork"]) {
      const image = page.locator(`#${id} img`);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    }
  }
});

test("new catalogue entries remain visible and API descriptions replace draft blurbs", async ({ page }) => {
  const api = await mockPublicApi(page);
  api.items[0].description = "Approved vehicle licence description.";
  api.items.push({
    code: "FUTURE_SERVICE",
    name: "Future Service",
    slug: "future-service",
    description: null,
    vehicleCategories: categories,
    variants: [],
  });
  await page.goto("/services/");
  await expect(page.locator("#other-services")).toContainText("Future Service");
  await expect(page.locator("#vehicle-documents")).toContainText("Approved vehicle licence description.");
  await expect(page.locator("#vehicle-documents")).not.toContainText("For your vehicle licence paperwork.");
});

test("category links remain keyboard accessible with reduced motion", async ({ page }) => {
  await mockPublicApi(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/services/");
  await expect(page.getByText("19 services", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Driver’s licences", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#drivers-licences$/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});
