// @ts-check
import { test, expect } from "@playwright/test";

test.describe("New tests @new", () => {
  test("has title", { tag: ["@smoke", "@sanity"] }, async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test(
    "$get started link",
    { tag: ["@smoke", "@sanity"] },
    async ({ page }) => {
      await page.goto("https://playwright.dev/");

      // Click the get started link.
      await page.getByRole("link", { name: "Get started" }).click();

      // Expects page to have a heading with the name of Installation.
      await expect(
        page.getByRole("heading", { name: "Installation" }),
      ).toBeVisible();
    },
  );
  test.describe("Nested suite", () => {
    test("nested test", { tag: ["@nested"] }, async ({ page }) => {
      await page.goto("https://playwright.dev/");

      // Click the get started link.
      await page.getByRole("link", { name: "Get started" }).click();

      // Expects page to have a heading with the name of Installation.
      await expect(
        page.getByRole("heading", { name: "Installation" }),
      ).toBeVisible();
    });
    test.describe("Deeply nested suite", () => {
      test(
        "deeply nested test",
        { tag: ["@deeply-nested"] },
        async ({ page }) => {
          await page.goto("https://playwright.dev/");

          // Click the get started link.
          await page.getByRole("link", { name: "Get started" }).click();

          // Expects page to have a heading with the name of Installation.
          await expect(
            page.getByRole("heading", { name: "Installation" }),
          ).toBeVisible();
        },
      );
    });
  });
});
