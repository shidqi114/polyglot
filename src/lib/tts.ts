let voice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-").startsWith("ja"));
  // Prefer higher quality voices when present (Kyoko/O-ren on Apple, Google 日本語 on Chrome).
  const preferred = ["Kyoko", "O-ren", "Google 日本語", "Otoya", "Microsoft Nanami"];
  for (const name of preferred) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices[0] ?? null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    voice = pickVoice();
  });
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, rate = 0.9): void {
  if (!ttsSupported() || !text) return;
  const synth = window.speechSynthesis;
  if (voice === undefined) voice = pickVoice();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  if (voice) u.voice = voice;
  u.rate = rate;
  synth.speak(u);
}
