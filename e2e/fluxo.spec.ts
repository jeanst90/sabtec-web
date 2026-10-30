import { test, expect } from "@playwright/test";

test("criar cliente e orçamento", async ({ page }) => {
  await page.goto("/customers");
  await page.click("text=Novo cliente");
  await page.fill('input[required]', "Cliente E2E");
  // phone field second required
  const inputs = page.locator('input[required]');
  await inputs.nth(1).fill("(11) 90000-0000");
  await page.click('button:has-text("Salvar")');
  await expect(page.locator("text=Cliente E2E")).toBeVisible();

  await page.goto("/quotes/new");
  // select first customer
  await page.selectOption("select", { index: 1 });
});