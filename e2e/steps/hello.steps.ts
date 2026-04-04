import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();

Given("トップページを開く", async ({ page }) => {
	await page.goto("/");
});

Given("パズルページを開く", async ({ page }) => {
	await page.goto("/puzzle/2026-04-04");
});

Then("パズルページにリダイレクトされる", async ({ page }) => {
	await expect(page).toHaveURL(/\/puzzle\/\d{4}-\d{2}-\d{2}/);
});

Then("クロスワードグリッドが表示されている", async ({ page }) => {
	const grid = page.getByTestId("crossword-grid");
	await expect(grid).toBeVisible();
});

Then("{string} のヒントが表示されている", async ({ page }, title: string) => {
	const sheet = page.locator("[data-slot='sheet-content']");
	if (!(await sheet.isVisible())) {
		await page.getByRole("button", { name: "Clues" }).click();
	}
	await expect(page.getByText(title, { exact: true })).toBeVisible();
});

When("グリッドの白いセルをクリックする", async ({ page }) => {
	const cell = page
		.locator("[data-testid='crossword-grid'] .cursor-pointer")
		.first();
	await cell.click();
});

When("{string} を入力する", async ({ page }, key: string) => {
	await page.keyboard.press(key);
});

When("{string} ボタンをクリックする", async ({ page }, label: string) => {
	await page.getByRole("button", { name: label }).click();
});

Then("セルに {string} が表示されている", async ({ page }, letter: string) => {
	const cells = page.locator("[data-testid='cell-letter']");
	const texts = await cells.allTextContents();
	expect(texts.some((t) => t.includes(letter))).toBe(true);
});

Then("すべてのセルが空になっている", async ({ page }) => {
	const cells = page.locator("[data-testid='cell-letter']");
	const texts = await cells.allTextContents();
	expect(texts.every((t) => t.trim() === "")).toBe(true);
});
