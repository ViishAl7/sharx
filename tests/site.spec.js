import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Home page", () => {
  test("loads and shows the nav, search, and games grid", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator(".nav-logo img")).toBeVisible();
    const search = page.locator(".nav-si");
    await expect(search).toBeVisible();
    await expect(page.locator(".grid")).toBeVisible({ timeout: 10000 });
    const cards = page.locator(".gc");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("search filters the games grid", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator(".grid")).toBeVisible({ timeout: 10000 });
    const search = page.locator(".nav-si");
    await search.fill("zzzznonexistentgamezzzz");
    await expect(page.locator(".empty-t")).toHaveText(/No games found/i);
    await page.locator(".empty-b").click();
    await expect(page.locator(".grid")).toBeVisible();
  });

  test("category filter switches active category", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator(".cats-row")).toBeVisible({ timeout: 10000 });
    const secondCat = page.locator(".cat").nth(1);
    await secondCat.click();
    await expect(secondCat).toHaveClass(/on/);
  });

  test("clicking a game card opens the game modal", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator(".grid")).toBeVisible({ timeout: 10000 });
    await page.locator(".gc").first().click();
    await expect(page.locator(".modal-bg")).toBeVisible({ timeout: 5000 });
    await page.locator(".modal-x").click();
    await expect(page.locator(".modal-bg")).not.toBeVisible();
  });
});

test.describe("Navigation between pages", () => {
  test("About Us link in footer navigates correctly", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator(".footer-link", { hasText: "About Us" }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test("Contact link in footer navigates correctly", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator(".footer-link", { hasText: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test("Privacy Policy link in footer navigates correctly", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator(".footer-link", { hasText: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/privacy/);
  });
});

test.describe("About page", () => {
  test("loads without runtime errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
});

test.describe("Contact page", () => {
  test("loads and shows email", async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    const emailText = page.locator(".email-text");
    await expect(emailText).toBeVisible();
    await expect(emailText).toHaveText(/sharx\.help@gmail\.com/);
  });
});

test.describe("Privacy page", () => {
  test("accordion items expand/collapse", async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);
    await expect(page.locator(".hero-title")).toBeVisible();
    const firstAcc = page.locator(".acc").first();
    await firstAcc.scrollIntoViewIfNeeded();
    await firstAcc.click();
    await expect(firstAcc).toHaveClass(/acc-open/);
  });
});

test.describe("No console errors across key pages", () => {
  const routes = ["/", "/about", "/contact", "/privacy"];
  for (const route of routes) {
    test(`no console errors on ${route}`, async ({ page }) => {
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      await page.goto(BASE_URL + route);
      await page.waitForLoadState("networkidle");
      expect(consoleErrors).toEqual([]);
    });
  }
});
