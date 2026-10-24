// Sentences the learner hid with "Hide this sentence". They are kept on this device only and never synced, so a
// sentence hidden on a phone can still come up on a laptop. Storage can be blocked (private windows), and then the
// sentence comes back next time, so every access is guarded.
const KEY = "polyglot.hiddenSentences";
const MAX = 2000;

export function hiddenSentences(): Set<string> {
  try {
    const list: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export function hideSentence(text: string): void {
  try {
    const hidden = [...hiddenSentences()].filter((t) => t !== text);
    window.localStorage.setItem(KEY, JSON.stringify([...hidden, text].slice(-MAX)));
  } catch {
    // Not saved; the sentence comes back next time.
  }
}
