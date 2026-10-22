import { expect, test, type Page } from "@playwright/test";
import { playKanaLesson } from "./helpers";

const SHOTS = process.env.SCREENSHOT_DIR;

test.skip(!!process.env.SYNC_E2E, "sync run only");

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${test.info().project.name}-${name}.png` });
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("learning path renders and a kana lesson can be completed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Vowels \(current\)/ })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "path");

  await page.getByRole("button", { name: /Vowels \(current\)/ }).click();
  await page.getByRole("button", { name: /Start \+10 XP/ }).click();
  await expect(page.getByText("New character")).toBeVisible();
  await shot(page, "lesson-intro");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("option").first()).toBeVisible();
  await shot(page, "lesson-choice");

  await playKanaLesson(page);
  await expect(page.getByText("Lesson complete!")).toBeVisible();
  await shot(page, "lesson-complete");
  await page.getByRole("button", { name: "Continue" }).click();

  // Progress persisted: first lesson done, next one is current, XP counted.
  await expect(page.getByRole("button", { name: /Vowels \(done\)/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /K row \(current\)/ })).toBeVisible();
  await expect(page.getByTitle("Total XP").first()).toContainText(/1[05]/);

  await page.goto("/review");
  await expect(page.getByRole("main").getByText("All caught up!")).toBeVisible();
  await expect(page.getByText("Memory strength")).toBeVisible();
});

test("dictionary search finds words by English, romaji and kanji", async ({ page }) => {
  await page.goto("/dictionary");
  const box = page.getByPlaceholder("Search English, romaji, kana or kanji");
  await box.fill("water");
  await expect(page.getByRole("button", { name: /^水/ }).first()).toBeVisible();
  await box.fill("taberu");
  await expect(page.getByRole("button", { name: /食べる/ }).first()).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "dictionary");
  await page.getByRole("button", { name: /食べる/ }).first().click();
  await expect(page.getByText("Kanji in this word")).toBeVisible();
});

test("practice, profile and settings work on every screen size", async ({ page }) => {
  await page.goto("/practice");
  await expect(page.getByText("Practice dojo")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "practice");
  await page.getByRole("link", { name: /Reverse pick/ }).click();
  await expect(page.getByTestId("option").first()).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto("/profile");
  await expect(page.getByRole("main").getByText("Daily goal")).toBeVisible();
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expectNoHorizontalScroll(page);
  await shot(page, "profile-dark");
  await page.goto("/");
  await shot(page, "path-dark");
});

test("grammar lesson sentence builder", async ({ page }) => {
  await page.goto("/lesson?id=n5-g-desu");
  await expect(page.getByText("Grammar", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Write this in Japanese")).toBeVisible();
  for (const tile of ["わたし", "は", "学生", "です"]) await page.getByRole("button", { name: tile, exact: true }).last().click();
  await shot(page, "grammar-build");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(/Nice!|Great job!|Correct!|Awesome!|すごい！|Excellent!|いいね！/)).toBeVisible();
});
