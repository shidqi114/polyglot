// End-to-end sync test against the Firebase emulators: npm run test:sync
import { expect, test, type Page } from "@playwright/test";
import { playKanaLesson } from "./helpers";

test.skip(!process.env.SYNC_E2E, "needs the Firebase emulators (npm run test:sync)");

async function signIn(page: Page, uid: string) {
  await page.waitForFunction(() => "__polyglotTestSignIn" in window);
  await page.evaluate((u) => (window as unknown as { __polyglotTestSignIn: (a: string, b: string) => Promise<unknown> }).__polyglotTestSignIn(u, `${u}@example.com`), uid);
}

test("guest progress merges into the account and syncs to a second device", async ({ browser }) => {
  const uid = `user-${Date.now()}`;

  // Device A: learn as a guest, then sign in.
  const a = await (await browser.newContext()).newPage();
  await a.goto("/");
  await a.getByRole("button", { name: /Vowels \(current\)/ }).click();
  await a.getByRole("button", { name: /Start \+10 XP/ }).click();
  await playKanaLesson(a);
  await a.getByRole("button", { name: "Continue" }).click();
  await a.goto("/profile");
  await signIn(a, uid);
  await expect(a.getByText(`${uid}@example.com`)).toBeVisible();
  await expect(a.getByText(/^Synced/)).toBeVisible({ timeout: 15_000 });

  // Device B: a fresh browser signs in and receives the progress.
  const b = await (await browser.newContext()).newPage();
  await b.goto("/profile");
  await signIn(b, uid);
  await expect(b.getByText(/^Synced/)).toBeVisible({ timeout: 15_000 });
  await b.goto("/");
  await expect(b.getByRole("button", { name: /Vowels \(done\)/ })).toBeVisible();
  await expect(b.getByTitle("Total XP").first()).toContainText(/1[05]/);

  // Settings changed on B show up on A.
  await b.goto("/profile");
  await b.getByRole("button", { name: "50", exact: true }).click();
  await expect(b.getByText(/^Synced/)).toBeVisible({ timeout: 15_000 });
  await b.waitForTimeout(2500); // debounced flush
  await a.reload();
  await expect(a.getByTitle("XP today / goal").first()).toContainText("/50", { timeout: 15_000 });

  // More XP on B adds to the same day on A (counters merge instead of overwriting).
  await b.goto("/lesson?id=kana-h-1-0");
  await playKanaLesson(b);
  await b.getByRole("button", { name: "Continue" }).click();
  await b.waitForTimeout(2500);
  await a.reload();
  await expect(a.getByTitle("Total XP").first()).toContainText(/2[05]|30/, { timeout: 15_000 });

  // Signing out leaves the device as an empty guest.
  await b.goto("/profile");
  await b.getByRole("button", { name: /Sign out/ }).click();
  await expect(b.getByText("Guest")).toBeVisible();
  await b.goto("/");
  await expect(b.getByRole("button", { name: /Vowels \(current\)/ })).toBeVisible();
});
