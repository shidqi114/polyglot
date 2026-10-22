# Polyglot — learn Japanese, Duolingo-style

A personal Japanese learning web app that works on desktop and installs to the iPhone home screen.

- **Learning path**: Hiragana → Katakana → JLPT N5 → N4 → N3 → N2 → N1, in bite-sized lessons
  (≈210 kana, ≈8,000 words, ≈2,200 kanji, plus N5 grammar lessons with sentence building).
- **Exercise types**: new-word cards, multiple choice (both directions), listening, typing
  (romaji converts to kana as you type), match pairs, sentence builder, particle fill-in, kanji readings.
- **Spaced repetition** (FSRS) review queue with memory-strength tracking.
- **Practice dojo**: free drills for kana, vocabulary and kanji by level (pick / reverse / input modes).
- **Dictionary** search by English, romaji, kana or kanji, with kanji breakdowns.
- **XP, daily goal, streaks, activity calendar**, light/dark themes, sound effects, Japanese text-to-speech.
- **Offline-capable PWA**; optional **Google sign-in + Firestore sync** across devices.

Setup for Firebase, Vercel and the iPhone: see **[docs/SETUP.md](docs/SETUP.md)**.

## Tech

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zustand · ts-fsrs · WanaKana ·
Firebase Auth + Firestore · Serwist (service worker) · Vitest · Playwright.

```
src/app/              routes: / (path), /lesson, /review, /practice, /dictionary, /profile, /credits
src/components/       app shell, learning path, lesson player and exercise components
src/content/          kana + grammar (hand-written), course structure, generated JLPT data, loaders
src/lib/              lesson engine, answer checking, SRS, TTS, Firebase + sync
src/store/progress.ts local-first progress store (persisted to localStorage)
scripts/              content and icon generators
tests/                unit, Firestore rules, and Playwright end-to-end tests
```

## Development

```bash
npm install
npm run dev
```

## Content & licenses

Vocabulary comes from [open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks) (MIT; JLPT lists by
Jonathan Waller, meanings from JMdict), kanji from [kanji-data](https://github.com/davidluzgouveia/kanji-data) (MIT;
KANJIDIC). JMdict and KANJIDIC are © the Electronic Dictionary Research and Development Group, used under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); the derived files in `src/content/generated` are shared
under the same license. See the in-app **Credits** page.

UI and feature ideas were inspired by kana-dojo, read-frog, mural, anki-jlpt-decks and LLPlayer; no code from them is used.
