// Runs against the Firestore emulator: npm run test:rules
import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "polyglot-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const card = { due: 1, s: 1, d: 5, sd: 1, ls: 0, reps: 1, lapses: 0, st: 2, lr: 1, up: 1 };

describe("firestore.rules", () => {
  it("lets a user read and write their own progress", async () => {
    const db = env.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(db, "users/alice"), { settings: { dailyGoal: 20 } }));
    await assertSucceeds(setDoc(doc(db, "users/alice/days/2026-10-22"), { xp: 10 }));
    await assertSucceeds(setDoc(doc(db, "users/alice/lessons/n5-v-1"), { times: 1 }));
    await assertSucceeds(setDoc(doc(db, "users/alice/cards/v:水:みず"), card));
    await assertSucceeds(getDoc(doc(db, "users/alice/cards/v:水:みず")));
  });

  it("blocks other users and signed-out visitors", async () => {
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), "users/alice/days/2026-10-22"), { xp: 10 }));
    const bob = env.authenticatedContext("bob").firestore();
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(bob, "users/alice/days/2026-10-22")));
    await assertFails(setDoc(doc(bob, "users/alice/days/2026-10-23"), { xp: 1 }));
    await assertFails(getDoc(doc(anon, "users/alice")));
  });

  it("validates document shapes", async () => {
    const db = env.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "users/alice/days/today"), { xp: 1 }));
    await assertFails(setDoc(doc(db, "users/alice/cards/k:あ"), { due: "soon" }));
    await assertFails(setDoc(doc(db, "other/thing"), { a: 1 }));
  });
});
