import type { RubySegment } from "@/lib/types";

/**
 * Japanese with its readings written above the kanji (ruby). With readings off, only the text shows. Segments are plain
 * text, or [kanji, reading] pairs.
 */
export function Furigana({ segments, showReadings }: { segments: RubySegment[]; showReadings: boolean }) {
  return (
    <>
      {segments.map((seg, i) =>
        typeof seg === "string" ? (
          <span key={i}>{seg}</span>
        ) : showReadings ? (
          <ruby key={i}>
            {seg[0]}
            <rt className="text-[0.55em]">{seg[1]}</rt>
          </ruby>
        ) : (
          <span key={i}>{seg[0]}</span>
        ),
      )}
    </>
  );
}
