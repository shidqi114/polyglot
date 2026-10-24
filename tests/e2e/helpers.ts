import type { Page } from "@playwright/test";
import { ALL_KANA } from "../../src/content/kana";

const romajiOf = new Map(ALL_KANA.map((k) => [k.front, k.meanings[0]]));
const kanaOf = new Map(ALL_KANA.filter((k) => k.script === "hiragana").map((k) => [k.meanings[0], k.front]));

/** Plays a kana lesson, answering from the kana table where possible. */
export async function playKanaLesson(page: Page) {
  const done = page.getByText("Lesson complete!");
  for (let step = 0; step < 80; step++) {
    if (await done.isVisible()) return;
    const cont = page.getByRole("button", { name: "Continue" });
    if (await cont.isVisible()) {
      await cont.click();
      continue;
    }
    if (await page.getByText("Tap the matching pairs").isVisible()) {
      for (const left of await page.getByTestId("match-l").all()) {
        if (await left.isDisabled()) continue;
        const kana = (await left.textContent())!.trim();
        await left.click();
        await page.locator(`[data-testid="match-r"]:not([disabled])`, { hasText: new RegExp(`^${romajiOf.get(kana)}$`) }).first().click();
      }
      continue;
    }
    const input = page.getByTestId("answer-input");
    if (await input.isVisible()) {
      const prompt = (await page.getByTestId("prompt").textContent())!.trim();
      await input.fill(romajiOf.get(prompt) ?? "a");
      await page.getByRole("button", { name: "Check" }).click();
      continue;
    }
    const options = page.getByTestId("option");
    if (await options.first().isVisible()) {
      const prompt = page.getByTestId("prompt");
      const question = (await page.locator("h2").first().textContent()) ?? "";
      let target: string | undefined;
      if (await prompt.isVisible()) target = romajiOf.get((await prompt.textContent())!.trim());
      else {
        const m = question.match(/“(.+)”/);
        if (m) target = kanaOf.get(m[1]);
      }
      const option = target ? page.locator(`[data-testid="option"][data-label="${target}"]`) : options.first();
      await ((await option.count()) ? option.first() : options.first()).click();
      await page.getByRole("button", { name: "Check" }).click();
      continue;
    }
    await page.waitForTimeout(100);
  }
  throw new Error("lesson did not finish");
}


import vocabN5 from "../../src/content/generated/vocab-n5.json";

const meaningOfWord = new Map((vocabN5 as { w: string; m: string[] }[]).map((v) => [v.w, v.m[0]]));

/**
 * Plays a Learn run from a topic: intro cards, choices and matching. The answers do not matter here; the run only has
 * to reach "Lesson complete!". Matching pairs use the N5 meanings.
 */
export async function playLearnSession(page: Page) {
  const done = page.getByText("Lesson complete!");
  for (let step = 0; step < 120; step++) {
    if (await done.isVisible()) return;
    const cont = page.getByRole("button", { name: "Continue", exact: true });
    if (await cont.isVisible()) {
      await cont.click();
      continue;
    }
    if (await page.getByText("Tap the matching pairs").isVisible()) {
      for (const left of await page.getByTestId("match-l").all()) {
        if (await left.isDisabled()) continue;
        const word = (await left.textContent())!.trim();
        await left.click();
        const meaning = meaningOfWord.get(word) ?? "";
        await page.locator(`[data-testid="match-r"]:not([disabled])`, { hasText: meaning }).first().click();
      }
      continue;
    }
    const options = page.getByTestId("option");
    if (await options.first().isVisible()) {
      await options.first().click();
      await page.getByRole("button", { name: "Check", exact: true }).click();
      continue;
    }
    const input = page.getByTestId("answer-input");
    if (await input.isVisible()) {
      await input.fill("a");
      await page.getByRole("button", { name: "Check", exact: true }).click();
      continue;
    }
    await page.waitForTimeout(100);
  }
  const text = (await page.locator("main").innerText().catch(() => "")).slice(0, 300);
  throw new Error(`learn session did not finish; the screen shows: ${text}`);
}
