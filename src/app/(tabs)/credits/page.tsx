import { Card } from "@/components/ui";

const SOURCES = [
  {
    name: "Kanjium (example sentences, conjugation tables, kanji details, pitch accents, idioms)",
    url: "https://github.com/mifunetoshiro/kanjium",
    license: "CC BY-SA 4.0",
    use: "Study packs: example sentences with furigana, verb forms, look-alike and component data, pitch accent, proverbs and idioms. The pitch accent notation, verb particle data, phonetics, homonyms and other additions or modifications to EDICT, KANJIDIC or KRADFILE were provided by Uros O. through his free database.",
  },
  {
    name: "Tatoeba sentence pairs",
    url: "https://tatoeba.org",
    license: "CC BY 2.0 FR",
    use: "Example sentences and their English translations.",
  },
  {
    name: "KanjiVG",
    url: "https://kanjivg.tagaini.net",
    license: "CC BY-SA 3.0",
    use: "Stroke order for the JLPT kanji.",
  },
  {
    name: "kuromoji with IPADIC",
    url: "https://github.com/takuyaa/kuromoji.js",
    license: "Apache-2.0 and the IPADIC licence",
    use: "Furigana for example sentences that have none (built into the packs, not shipped as code).",
  },
  {
    name: "Open Anki JLPT Decks",
    url: "https://github.com/jamsinclair/open-anki-jlpt-decks",
    license: "MIT",
    use: "JLPT N5–N1 vocabulary lists (based on Jonathan Waller’s tanos.co.uk lists and JMdict meanings).",
  },
  {
    name: "JMdict / EDRDG",
    url: "https://www.edrdg.org/jmdict/j_jmdict.html",
    license: "CC BY-SA 4.0",
    use: "English meanings for vocabulary.",
  },
  {
    name: "KANJIDIC2 / EDRDG",
    url: "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
    license: "CC BY-SA 4.0",
    use: "Kanji meanings, readings and stroke counts.",
  },
  {
    name: "kanji-data by David Gouveia",
    url: "https://github.com/davidluzgouveia/kanji-data",
    license: "MIT",
    use: "KANJIDIC converted to JSON with updated JLPT levels.",
  },
  {
    name: "Jonathan Waller’s JLPT Resources",
    url: "http://www.tanos.co.uk/jlpt/",
    license: "CC BY",
    use: "JLPT level assignments for words and kanji.",
  },
  { name: "ts-fsrs", url: "https://github.com/open-spaced-repetition/ts-fsrs", license: "MIT", use: "Spaced-repetition scheduling." },
  { name: "WanaKana", url: "https://github.com/WaniKani/WanaKana", license: "MIT", use: "Romaji ↔ kana conversion." },
];

const INSPIRATION = [
  { name: "kana-dojo", url: "https://github.com/lingdojo/kana-dojo" },
  { name: "read-frog", url: "https://github.com/mengxi-ream/read-frog" },
  { name: "mural", url: "https://github.com/Chuloo/mural" },
  { name: "anki-jlpt-decks", url: "https://github.com/5mdld/anki-jlpt-decks" },
  { name: "LLPlayer", url: "https://github.com/umlx5h/LLPlayer" },
];

export default function CreditsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">Credits & licenses</h1>
      <p className="text-muted">
        Dictionary data is provided by the Electronic Dictionary Research and Development Group under Creative Commons
        Attribution-ShareAlike 4.0. Derived vocabulary and kanji files in this app are shared under the same license.
      </p>
      {SOURCES.map((s) => (
        <Card key={s.name}>
          <div className="flex items-baseline justify-between gap-3">
            <a href={s.url} target="_blank" rel="noreferrer" className="font-extrabold text-blue hover:underline">
              {s.name}
            </a>
            <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">{s.license}</span>
          </div>
          <p className="text-sm text-muted">{s.use}</p>
        </Card>
      ))}
      <Card>
        <div className="mb-1 font-extrabold">Design inspiration</div>
        <p className="mb-2 text-sm text-muted">Ideas (not code) were drawn from these projects:</p>
        <ul className="flex flex-wrap gap-2">
          {INSPIRATION.map((i) => (
            <li key={i.name}>
              <a href={i.url} target="_blank" rel="noreferrer" className="rounded-lg bg-surface-2 px-2 py-1 text-sm font-bold text-blue hover:underline">
                {i.name}
              </a>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-sm text-muted">Audio uses your device’s built-in Japanese text-to-speech voice.</p>
    </div>
  );
}
