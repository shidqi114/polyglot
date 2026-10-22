let ctx: AudioContext | null = null;

function tone(freqs: number[], duration = 0.12, type: OscillatorType = "sine", gain = 0.08) {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  const start = ctx.currentTime;
  freqs.forEach((f, i) => {
    const osc = ctx!.createOscillator();
    const g = ctx!.createGain();
    osc.type = type;
    osc.frequency.value = f;
    const t = start + i * duration;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration * 1.6);
    osc.connect(g).connect(ctx!.destination);
    osc.start(t);
    osc.stop(t + duration * 1.7);
  });
}

export const sounds = {
  correct: () => tone([660, 880], 0.09, "triangle"),
  wrong: () => tone([220, 180], 0.14, "sawtooth", 0.04),
  complete: () => tone([523, 659, 784, 1047], 0.11, "triangle"),
};

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(pattern);
}
