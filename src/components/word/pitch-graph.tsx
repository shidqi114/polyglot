import { morae, pitchPattern } from "@/lib/mora";

const COL = 40;
const TOP = 10;
const BOTTOM = 42;

/** Pitch accent drawn over the morae of a reading. Accent 0 is flat; n is the mora after which the pitch falls. */
export function PitchGraph({ reading, accents }: { reading: string; accents: number[] }) {
  const parts = morae(reading);
  const width = Math.max(1, parts.length) * COL + 16;
  const pattern = pitchPattern(parts.length, accents[0] ?? 0);
  const y = (level: "H" | "L") => (level === "H" ? TOP : BOTTOM);
  const points = pattern.map((level, i) => `${i * COL + COL / 2 + 8},${y(level)}`).join(" ");
  const accentText = accents[0] === 0 ? "Flat: no drop" : `Drop after mora ${accents[0]}`;
  const others = accents.slice(1);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${BOTTOM + 30}`} className="h-auto w-full max-w-xs" role="img" aria-label={`Pitch accent of ${reading}: ${accentText}`}>
        <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {pattern.map((level, i) => (
          <g key={i}>
            <circle cx={i * COL + COL / 2 + 8} cy={y(level)} r={5} fill="var(--primary)" />
            <text x={i * COL + COL / 2 + 8} y={BOTTOM + 24} textAnchor="middle" className="jp" fill="currentColor" fontSize={16}>
              {parts[i]}
            </text>
          </g>
        ))}
      </svg>
      <div className="text-sm text-muted">
        {accentText}
        {others.length > 0 && ` · other accents: ${others.map((a) => (a === 0 ? "flat" : a)).join(", ")}`}
      </div>
    </div>
  );
}
