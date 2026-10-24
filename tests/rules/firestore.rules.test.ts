// Runs against the Firestore emulator: npm run test:rules
import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
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

// Shapes exactly as src/lib/sync.ts writes them.
const settings = { dailyGoal: 20, theme: "system", sound: true, autoplayAudio: true, ttsRate: 0.9, showReadings: true };
const card = (over: Record<string, unknown> = {}) => ({
  due: 1_800_000_000_000, s: 1, d: 5, sd: 1, ls: 0, reps: 1, lapses: 0, st: 2, lr: 1_800_000_000_000, up: 1_800_000_000_000,
  srv: serverTimestamp(), ...over,
});
const day = (over: Record<string, unknown> = {}) => ({ xp: increment(10), lessons: increment(1), reviews: increment(0), srv: serverTimestamp(), ...over });
const lesson = (over: Record<string, unknown> = {}) => ({ done: 1_800_000_000_000, best: 0.9, times: increment(1), up: 1_800_000_000_000, srv: serverTimestamp(), ...over });
const note = (over: Record<string, unknown> = {}) => ({ text: "remember the 'ta' in taberu", up: 1_800_000_000_000, srv: serverTimestamp(), ...over });
const alice = () => env.authenticatedContext("alice").firestore();

describe("own progress is accepted", () => {
  it("settings, days, lessons, cards and notes written the way the app writes them", async () => {
    const db = alice();
    await assertSucceeds(setDoc(doc(db, "users/alice"), { settings, settingsUp: 1_800_000_000_000, srv: serverTimestamp() }, { merge: true }));
    await assertSucceeds(setDoc(doc(db, "users/alice/days/2026-10-22"), day(), { merge: true }));
    await assertSucceeds(setDoc(doc(db, "users/alice/lessons/n5-v-1"), lesson(), { merge: true }));
    // Topic Learn runs record their lesson as t-<topic id>, which the same id rule accepts.
    await assertSucceeds(setDoc(doc(db, "users/alice/lessons/t-meeting-people"), lesson(), { merge: true }));
    await assertSucceeds(setDoc(doc(db, "users/alice/lessons/t-type-i-adjective"), lesson(), { merge: true }));
    await assertSucceeds(setDoc(doc(db, "users/alice/cards/v:水:みず"), card({ lr: null, cf: ["v:肉:にく"] })));
    await assertSucceeds(setDoc(doc(db, "users/alice/notes/k:水"), note()));
    await assertSucceeds(getDoc(doc(db, "users/alice/cards/v:水:みず")));
  });

  it("owners can update and delete their own documents", async () => {
    const db = alice();
    await assertSucceeds(setDoc(doc(db, "users/alice/cards/k:あ"), card()));
    await assertSucceeds(updateDoc(doc(db, "users/alice/cards/k:あ"), { reps: 2 }));
    await assertSucceeds(deleteDoc(doc(db, "users/alice/cards/k:あ")));
  });
});

describe("access is limited to the owner", () => {
  it("other accounts and signed-out visitors cannot read or write", async () => {
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), "users/alice/days/2026-10-22"), day({ xp: 5 })));
    const bob = env.authenticatedContext("bob").firestore();
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(bob, "users/alice/days/2026-10-22")));
    await assertFails(setDoc(doc(bob, "users/alice/days/2026-10-23"), day()));
    await assertFails(deleteDoc(doc(bob, "users/alice/days/2026-10-22")));
    await assertFails(getDoc(doc(anon, "users/alice")));
  });

  it("nothing outside the user tree is writable", async () => {
    await assertFails(setDoc(doc(alice(), "other/thing"), { a: 1 }));
  });
});

describe("values are checked", () => {
  it("rejects malformed day ids and out-of-range counters", async () => {
    const db = alice();
    await assertFails(setDoc(doc(db, "users/alice/days/today"), day()));
    await assertFails(setDoc(doc(db, "users/alice/days/2026-10-22"), day({ xp: -1 })));
    await assertFails(setDoc(doc(db, "users/alice/days/2026-10-22"), day({ xp: 100001 })));
  });

  it("rejects unexpected fields", async () => {
    const db = alice();
    await assertFails(setDoc(doc(db, "users/alice/days/2026-10-22"), day({ admin: true })));
    await assertFails(setDoc(doc(db, "users/alice/lessons/n5-v-1"), lesson({ extra: "x" })));
    await assertFails(setDoc(doc(db, "users/alice"), { settings, isAdmin: true }));
  });

  it("rejects bad lesson ids and out-of-range results", async () => {
    const db = alice();
    await assertFails(setDoc(doc(db, "users/alice/lessons/Bad Id"), lesson()));
    await assertFails(setDoc(doc(db, "users/alice/lessons/T-Shopping"), lesson()));
    await assertFails(setDoc(doc(db, "users/alice/lessons/n5-v-1"), lesson({ best: 2 })));
  });

  it("rejects bad card ids and card values", async () => {
    const db = alice();
    await assertFails(setDoc(doc(db, "users/alice/cards/hello"), card()));
    await assertFails(setDoc(doc(db, "users/alice/cards/k:あ"), card({ d: 50 })));
    await assertFails(setDoc(doc(db, "users/alice/cards/k:あ"), card({ st: 7 })));
    await assertFails(setDoc(doc(db, "users/alice/cards/k:あ"), card({ due: "soon" })));
    await assertFails(setDoc(doc(db, "users/alice/cards/k:あ"), card({ cf: ["a", "b", "c", "d", "e", "f"] })));
  });

  it("rejects bad settings", async () => {
    const db = alice();
    await assertFails(setDoc(doc(db, "users/alice"), { settings: { ...settings, theme: "neon" } }));
    await assertFails(setDoc(doc(db, "users/alice"), { settings: { ...settings, dailyGoal: 0 } }));
    await assertFails(setDoc(doc(db, "users/alice"), { settings: { ...settings, sneaky: 1 } }));
  });

  it("caps note length", async () => {
    const db = alice();
    await assertSucceeds(setDoc(doc(db, "users/alice/notes/k:水"), note({ text: "x".repeat(2000) })));
    await assertFails(setDoc(doc(db, "users/alice/notes/k:水"), note({ text: "x".repeat(2001) })));
  });
});
