import { test as base, expect } from "@playwright/test";

// React hydration mismatches (#418, #423, #425) are a known, intermittent issue with the service worker
// (see CLAUDE.md, "Known issues"). React recovers from them, so they are reported as annotations here
// instead of failing the test. Everything else fails the test.
const HYDRATION = /Minified React error #(418|423|425)|Hydration failed/i;

// Fails a test when the page reports a Content-Security-Policy violation or an uncaught error.
// Every browser test imports `test` from here so a policy regression cannot pass silently.
export const test = base.extend<{ noPageProblems: void }>({
  noPageProblems: [
    async ({ page }, use, testInfo) => {
      const problems: string[] = [];
      page.on("console", (msg) => {
        if (/Content Security Policy|Refused to (load|connect|execute|frame|apply)/i.test(msg.text())) problems.push(msg.text());
      });
      page.on("pageerror", (err) => {
        const text = String(err);
        // With the worker blocked, Serwist's registration code reads a property of undefined. Expected there only.
        if (process.env.BLOCK_SW === "1" && /reading 'waiting'/.test(text)) return;
        if (HYDRATION.test(text)) {
          testInfo.annotations.push({ type: "known-issue", description: `hydration mismatch: ${text.slice(0, 120)}` });
          return;
        }
        problems.push(text);
      });
      await use();
      expect(problems, "page reported CSP violations or errors").toEqual([]);
    },
    { auto: true },
  ],
});

// BLOCK_SW=1 runs the browser tests without the service worker, to isolate caching effects.
test.use({ serviceWorkers: process.env.BLOCK_SW === "1" ? "block" : "allow" });

export { expect };
