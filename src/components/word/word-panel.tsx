"use client";

import { Languages, Pencil, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PitchGraph } from "./pitch-graph";
import { StrokeOrder } from "./stroke-order";
import { Button, Card, cn } from "../ui";
import { AudioButton } from "../lesson/exercises";
import { Furigana } from "@/components/furigana";
import { usePack } from "@/content/use-pack";
import type { PackExample, VerbForm } from "@/content/packs";
import { speak } from "@/lib/tts";
import type { StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";

const FORM_LABELS: Record<VerbForm, string> = {
  dict: "Dictionary",
  polite: "Polite",
  neg: "Negative",
  past: "Past",
  te: "て-form",
  potential: "Potential",
  passive: "Passive",
  causative: "Causative",
  volitional: "Volitional",
  conditional: "Conditional",
  imperative: "Imperative",
};


function ExampleRow({ example, showReadings }: { example: PackExample; showReadings: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const text = example.ja.map((s) => (typeof s === "string" ? s : s[0])).join("");
  return (
    <div className="flex items-start gap-3 rounded-xl border-2 border-border p-3">
      <button type="button" aria-label="Play sentence" onClick={() => speak(text)} className="mt-1 shrink-0 text-blue">
        <Volume2 className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="jp text-lg leading-loose">
          <Furigana segments={example.ja} showReadings={showReadings} />
        </div>
        <button type="button" onClick={() => setRevealed((r) => !r)} className="mt-1 text-sm text-muted underline-offset-2 hover:underline">
          {revealed ? example.en : "Show translation"}
        </button>
      </div>
    </div>
  );
}

function NoteEditor({ itemId }: { itemId: string }) {
  const saved = useProgress((s) => s.notes[itemId]?.text ?? "");
  const setNote = useProgress((s) => s.setNote);
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  useEffect(() => setDraft(saved), [saved]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-extrabold">
          <Pencil className="h-4 w-4 text-purple" /> My note
        </div>
        {!editing && (
          <button type="button" className="text-sm font-bold text-blue" onClick={() => setEditing(true)}>
            {saved ? "Edit" : "Add note"}
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-xl border-2 border-border bg-surface-2 p-3 outline-none focus:border-blue"
            placeholder="A mnemonic, a memory, a sentence you made up…"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                setNote(itemId, draft);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={() => { setDraft(saved); setEditing(false); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className={cn("text-sm", saved ? "" : "text-muted")}>{saved || "Notes you add are saved to your account when you are signed in."}</p>
      )}
    </div>
  );
}

/** Study details for one word or kanji: pitch, verb forms, example sentences, kanji parts and stroke order. */
export function WordPanel({ item }: { item: StudyItem }) {
  const pack = usePack(item.level);
  const showReadings = useProgress((s) => s.settings.showReadings);
  const word = pack.words?.get(item.id);
  const kanji = pack.kanji?.get(item.id);
  const strokes = pack.strokes?.[item.id];

  return (
    <Card className="flex flex-col gap-5">
      {pack.error && <p className="text-sm text-muted">{pack.error} Study details appear once the content is available.</p>}
      {!pack.words && !pack.error && item.level && <p className="text-sm text-muted">Loading study details…</p>}

      {item.kind === "vocab" && word?.pitch && (
        <section>
          <div className="mb-2 font-extrabold">Pitch accent</div>
          <PitchGraph reading={item.reading} accents={word.pitch} />
        </section>
      )}

      {item.kind === "vocab" && word?.forms && (
        <section>
          <div className="mb-2 flex items-center gap-2 font-extrabold">
            <Languages className="h-4 w-4 text-blue" /> Verb forms {word.verb && <span className="text-xs font-bold text-muted">({word.verb})</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(FORM_LABELS) as VerbForm[])
              .filter((form) => word.forms?.[form])
              .map((form) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => speak(word.forms![form]!)}
                  className="flex flex-col items-start rounded-xl bg-surface-2 p-2 text-left"
                >
                  <span className="text-xs font-bold uppercase text-muted">{FORM_LABELS[form]}</span>
                  <span className="jp text-lg">{word.forms![form]}</span>
                </button>
              ))}
          </div>
        </section>
      )}

      {item.kind === "vocab" && word?.ex && word.ex.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="font-extrabold">Examples</div>
          {word.ex.map((example, i) => (
            <ExampleRow key={i} example={example} showReadings={showReadings} />
          ))}
        </section>
      )}

      {item.kind === "kanji" && kanji && (
        <section className="flex flex-col gap-4">
          {strokes && strokes.length > 0 && (
            <div>
              <div className="mb-2 font-extrabold">Stroke order</div>
              <StrokeOrder paths={strokes} label={item.front} />
            </div>
          )}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {kanji.radical && (
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs font-bold uppercase text-muted">Radical</dt>
                <dd className="jp text-xl">
                  {kanji.radical} {kanji.radicalReading && <span className="text-sm">{kanji.radicalReading}</span>}
                </dd>
                {kanji.radicalMeaning && <dd className="text-muted">{kanji.radicalMeaning}</dd>}
              </div>
            )}
            {kanji.parts && kanji.parts.length > 0 && (
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs font-bold uppercase text-muted">Parts</dt>
                <dd className="jp text-xl">{kanji.parts.join(" ")}</dd>
              </div>
            )}
            {kanji.phonetic && (
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-xs font-bold uppercase text-muted">Sound part</dt>
                <dd className="jp text-xl">{kanji.phonetic}</dd>
              </div>
            )}
          </dl>
          {kanji.lookalikes && kanji.lookalikes.length > 0 && (
            <p className="text-sm">
              <span className="font-bold">Look-alikes:</span> <span className="jp">{kanji.lookalikes.join("、")}</span>
            </p>
          )}
          {(kanji.syn?.length || kanji.ant?.length) ? (
            <p className="text-sm">
              {kanji.syn?.length ? <><span className="font-bold">Similar in meaning:</span> <span className="jp">{kanji.syn.join("、")}</span>. </> : null}
              {kanji.ant?.length ? <><span className="font-bold">Opposite:</span> <span className="jp">{kanji.ant.join("、")}</span></> : null}
            </p>
          ) : null}
        </section>
      )}

      <NoteEditor itemId={item.id} />
      {item.kind === "vocab" && <AudioButton text={item.reading} size="sm" />}
    </Card>
  );
}
