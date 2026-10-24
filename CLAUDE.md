# CLAUDE.md — Polyglot

This file is the project's memory for Claude Code. It explains how the app is built, how changes reach GitHub `main`,
and keeps a **changelog of every change**. Read it before working on the repo, and update it as part of every change.

## Project overview

Polyglot is a personal, Duolingo-style **Japanese learning web app** (PWA). It runs on desktop and is installed on iPhone
from Safari (Add to Home Screen). It is deployed on **Vercel**; progress can sync through **Firebase Auth (Google) +
Firestore**.

- Path: Hiragana → Katakana → JLPT N5 → N4 → N3 → N2 → N1 (≈210 kana, ≈8,000 words, ≈2,200 kanji, 26 N5 and 16 N4 grammar lessons, 12 stories)
- Exercises: intro cards, multiple choice (both directions), listening (TTS), typing (romaji → kana), match pairs,
  sentence builder, particle fill-in, kanji readings
- Spaced repetition (FSRS) review, practice dojo, dictionary, XP / daily goal / streaks, light & dark themes
- Works offline and signed-out; Google sign-in syncs progress across devices

User decisions (keep unless the user changes them): English meanings; Google sign-in; no AI features in v1;
lesson content is bundled with the app, Firestore stores only user progress.

## Tech stack

Next.js 15 (App Router, all routes static) · React 19 · TypeScript · Tailwind CSS 4 · Zustand (persisted to
localStorage) · ts-fsrs · WanaKana · Firebase JS SDK 13 · Serwist (service worker) · Vitest · Playwright · firebase-tools.

## Repository map

| Path | What it is |
| --- | --- |
| `src/app/(tabs)/` | Tab pages with the app shell: `/` path, `/review`, `/practice`, `/dictionary`, `/profile`, `/credits` |
| `src/app/lesson/page.tsx` | Lesson player route, `/lesson?id=<lessonId>` |
| `src/app/practice/run/page.tsx` | Practice session, `/practice/run?set=<id>&mode=<mode>[&learned=1]` |
| `src/app/sw.ts`, `src/app/manifest.ts` | Service worker (offline) and PWA manifest |
| `src/components/` | App shell, learning path, stats panel, UI primitives, `lesson/` player + exercise components |
| `src/content/kana.ts` | Hand-written kana table |
| `src/content/grammar.ts`, `grammar-n4.ts` | Hand-written grammar points: N5 (26) and N4 (16). Each has notes, examples and sentences for the sentence builder |
| `src/content/stories.ts`, `src/app/story/page.tsx`, `src/components/story-player.tsx` | Twelve short dialogues (6 N5, 6 N4) at `/story` and `/story?id=<storyId>`: replies with feedback, then questions |
| `src/components/grammar-reference.tsx` | Grammar tab of the Dictionary: every grammar point with its notes and sample sentences |
| `src/lib/course-progress.ts` | Path pointer: the next lesson is the first unfinished one after the furthest completed lesson |
| `src/lib/coaching.ts`, `src/content/tips.ts` | Coaching: the situations (due backlog, leeches, broken streak, low accuracy, mix-ups, idle, kana, steady, new) and the tips tied to each |
| `src/lib/weekly.ts`, `src/app/weekly/page.tsx` | Weekly review at `/weekly`: last seven days, accuracy by level, leeches, mix-ups, weakest kana rows, next steps |
| `src/lib/achievements.ts`, `src/components/achievements.tsx` | 38 achievements derived from progress; Profile shows them and a toast announces new ones |
| `src/components/today-card.tsx`, `src/content/culture.ts` | Today card at the top of the path, and the culture notes it shows (one per day) |
| `src/content/course.ts` | Builds sections → units → lessons (6 words / 4 kanji per lesson) |
| `scripts/content/word-types.ts`, `scripts/content/word-type-overrides.ts`, `scripts/content/build-topics.ts` | Word types (noun, verb, い/な-adjective, adverb, pronoun, number, counter, set phrase, pattern) for the N5/N4 vocabulary, from kuromoji's tags. Reviewed overrides, each with a reason. `npm run topics` writes `src/content/generated/word-types.json` |
| `src/content/topics.ts`, `src/content/topic-words.ts` | Topics for Practice → Study by topic: 22 topics in four groups, each with its key phrases (kana, tiles, English), linked grammar points and stories. `topic-words.ts` places every N5/N4 noun, verb, adjective and adverb in one topic or in everyday basics (≤15%). Tests: `tests/unit/topics.test.ts` |
| `src/content/particles.ts`, `scripts/content/sentences.ts`, `scripts/content/sentence-exclusions.ts` | Particle drills: the particle list and families, and the "also correct" rules (hand table plus particles the corpus uses with the same verb). The pack build keeps short sentences of N5/N4 words with one particle blanked, and `sentence-exclusions.ts` lists reviewed sentences to leave out |
| `src/lib/topic-exercises.ts` | Topic questions: particle questions (English as the hint, furigana around the blank) and phrase quizzes (hear it and pick the meaning, build it from tiles). Pure: the random source is passed in |
| `src/content/generated/*.json` | Generated JLPT vocab/kanji (do not edit by hand; run `npm run content`) |
| `src/content/loader.ts` | Lazy loading of level data, lesson items and distractor pools |
| `src/lib/lesson-engine.ts` | Exercise generation for lessons, reviews and practice |
| `src/lib/answer-check.ts` | Romaji/kana/English answer normalisation |
| `src/lib/srs.ts` | FSRS wrapper (compact card format) |
| `src/lib/firebase.ts`, `sync.ts` | Firebase init/sign-in and local-first Firestore sync |
| `src/store/progress.ts` | Progress store: lessons, cards, day counters, settings, pending sync changes |
| `firestore.rules`, `firebase.json` | Security rules (validated field by field) and emulator config |
| `scripts/deploy-rules.mjs` | Deploys `firestore.rules` to the project in `FIREBASE_PROJECT_ID` once the rules tests pass and the rules are committed (`npm run deploy:rules`) |
| `scripts/content/build-packs.ts`, `scripts/content/lib.ts` | Builds `public/packs/v2` (example sentences, pitch accent, verb forms, kanji strokes, idioms) from Kanjium, Tatoeba and KanjiVG. `lib.ts` holds the pure helpers, including the ruby (furigana) parser |
| `src/content/packs.ts`, `src/components/offline-content.tsx` | Typed loader for the packs, and the Profile section that downloads levels for offline use |
| `src/lib/mora.ts` | Morae and pitch patterns (used by the word pages) |
| `src/components/word/` | Word page 2.0: pitch graph, verb forms, examples, kanji parts, stroke order, personal note |
| `src/content/use-pack.ts` | Hook that loads one level's study packs when a word page opens |
| `src/lib/explain.ts` | "Why?" explanations for wrong answers (rules only, no model) |
| `src/lib/pack-exercises.ts` | Sentence cloze and verb-form drills built from the packs |
| `src/lib/backup.ts` | Zod validation of imported backup files (size cap, key allow-list, value ranges) |
| `scripts/check-secrets.mjs`, `scripts/lib/secret-patterns.mjs` | Credential scanner used by the pre-commit hook and `npm run check:secrets` |
| `scripts/git-hooks/pre-commit`, `scripts/install-hooks.mjs` | Versioned git hooks, enabled by `npm install` |
| `next.config.ts` | Security headers and Content-Security-Policy, production guard for the emulator switch, PWA config |
| `.github/workflows/ci.yml`, `.github/dependabot.yml` | CI (checks, browser tests, emulator tests) and dependency updates |
| `docs/SETUP.md` | Firebase + Vercel + iPhone setup guide for the user |
| `tests/unit`, `tests/rules`, `tests/e2e` | Unit tests, Firestore rules tests, Playwright tests (`sync.spec.ts` needs emulators). `tests/unit/support/kuromoji.ts` is the shared reader for the sentence-reading checks |

## Key conventions

- **Local-first**: all progress changes go through `useProgress` actions; they mark `pending` changes that `sync.ts`
  flushes to Firestore. Day stats are counters written with `increment()`; cards merge by `up` timestamp.
  Total XP and streaks are *derived* from `days` — never store them separately.
- Firestore layout: `users/{uid}` (settings), `users/{uid}/days/{YYYY-MM-DD}`, `users/{uid}/lessons/{id}`,
  `users/{uid}/cards/{itemId}`. Update `firestore.rules` and `tests/rules` together, and deploy the rules with the change (see Workflow).
- Item ids: `k:<kana>`, `v:<word>:<reading>`, `j:<kanji>`. Lesson ids: `kana-h-<row>-<n>`, `n5-v-<n>`, `n5-k-<n>`,
  `n5-g-<grammarId>` (N4: `n4-g4-<grammarId>`). **Changing ids or lesson sizes breaks saved progress** — avoid, or add a migration.
- UI: colours are CSS variables in `globals.css` (light + `.dark`); chunky buttons use `.btn-3d` with `--shadow`.
  Japanese text uses the `.jp` class. Layout must work at 390px wide (iPhone) and on desktop with no horizontal scroll.
- Content licensing: vocabulary/kanji data is CC BY-SA 4.0 (EDRDG) via MIT-licensed converters. The knowledge packs add
  Kanjium (CC BY-SA 4.0, with its required attribution sentence on the Credits page), Tatoeba sentences (CC BY 2.0 FR) and
  KanjiVG (CC BY-SA 3.0); see `public/packs/v2/manifest.json`. Do **not** copy code
  from the AGPL/GPL reference repos (kana-dojo, read-frog, LLPlayer).
- Inspiration only: `5mdld/anki-jlpt-decks` (CC BY-NC, Chinese glosses) informed the vocabulary note structure
  (word, reading, pitch accent, part of speech, example sentence). Its data and audio are **not** used. The vocabulary
  data comes from `jamsinclair/open-anki-jlpt-decks` (MIT), a different repository.
- Secrets: the Firebase web config (`NEXT_PUBLIC_FIREBASE_*`) is treated as a secret. It must never be committed or
  pushed to the repo. Keep it in Vercel environment variables and in `.env.local`, which git ignores. See `.env.example`
  and `docs/SETUP.md`.

## Security model

- **Network**: `next.config.ts` sends a Content-Security-Policy, frame denial, `same-origin-allow-popups` (needed for
  popup sign-in), HSTS and `nosniff`. CSP changes must keep Firebase auth working; `tests/e2e/fixtures.ts` fails any
  browser test that reports a CSP violation.
- **Offline cache**: `src/app/sw.ts` never caches Google/Firebase hosts (`PRIVATE_HOSTS`) and drops the old
  `cross-origin` cache on activate. HTML pages are not precached (see Known issues); visited pages are cached on demand.
- **Firestore**: every write is checked field by field (`firestore.rules`). Adding a field means updating the rules,
  `tests/rules/firestore.rules.test.ts` and the sync code together. The rules go live with `npm run deploy:rules` (see Workflow).
- **Imports**: backups go through `parseBackup` (`src/lib/backup.ts`). The schema must follow the export format; keys
  such as `__proto__` are refused anywhere in the file.
- **Deletion**: `deleteCloudData` and `deleteAccount` (`src/lib/sync.ts`) remove every collection listed in
  `CLOUD_COLLECTIONS`. Update that list when a new collection is added.
- **Emulators**: `NEXT_PUBLIC_FIREBASE_EMULATOR=1` is refused in production builds; only `test:sync` sets
  `ALLOW_EMULATOR_BUILD`.
- **Dependencies**: `package.json` `overrides` pin `@grpc/grpc-js` and `postcss` to patched versions. Remove an override
  once the upstream package ships the fix. CI runs `npm audit --omit=dev --audit-level=high`.
- **App Check**: optional. Active when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set; enforce it in the Firebase console.

## Knowledge packs

- `npm run packs` writes `public/packs/v2/<level>/{words,kanji,strokes}.json` and `extras.json`. Word records use the
  ids of the bundled course data (`v:<word>:<reading>`), so progress and packs stay in step. Changing the course ids
  means rebuilding the packs too.
- Examples: a sentence must contain the word as a whole word (not inside a longer word). The word itself always gets its
  dictionary reading. Furigana comes from Kanjium's `furigana` column where it exists (the `japanese` column has no ruby), otherwise from kuromoji. kuromoji can misread other
  words in context (for example 書い read as かい), which is a known limitation.
- The packs are cached on demand by the service worker (`PACK_CACHE` in `src/content/packs.ts`, currently `knowledge-packs-v2`; the service worker deletes older pack caches). Profile → Offline study content downloads
  them ahead of time and asks the browser to keep them.
- `npm run packs` also writes `n5/sentences.json` and `n4/sentences.json`, the particle sentences for the drills. A sentence is 30
  characters or fewer, every content word is N5 or N4 vocabulary, and one particle is blanked (the first one). Its English
  must contain a meaning of each word it links (`w`). `also` lists the particles that also fit, and the drills never offer
  them. Sentences in `sentence-exclusions.ts` are left out. At most 300 per particle per level.
- `tests/unit/packs.test.ts` checks ids, pitch ranges, markup-free text and stroke paths.

## Study features (phase 3)

- The "Why?" notes come from `src/lib/explain.ts`: kana rules (small っ, small ゃゅょ, long vowel ー, voiced marks,
  ん, は read as wa, same sound in another script) and particle or kana-pair hints. Add a rule with a unit test.
- Confusions: a wrong choice is stored on the card (`cf`, last five). Notes are stored per item and synced to
  `users/{uid}/notes/{itemId}`; an empty note is written as a tombstone so other devices learn it was cleared.
- Vocabulary lessons add up to two cloze questions, and the dojo has Sentences and Verb forms modes. Both need the
  study packs (Profile → Offline study content, or an online load).

## Study features (phase 4)

- Grammar: N5 (`grammar.ts`) and N4 (`grammar-n4.ts`) points each become one lesson, `<level>-<grammarId>`. The lessons
  are spread evenly over the level's units in `course.ts`, so every point is on the path and keeps its order.
- Path pointer (`src/lib/course-progress.ts`): "current" is the first unfinished lesson after the furthest completed
  one. A lesson added to a unit you already passed shows as open, not as the next lesson. Only when nothing after that
  point is unfinished does it fall back to the earliest gap.
- Stories (`src/content/stories.ts`): a wrong reply gets its feedback and can be retried, but it does not count as right
  first time. Comprehension questions show the answer straight away. Progress is not stored, so a replay starts again.
- Sentence readings: `grammar.test.ts` and `stories.test.ts` run each Japanese line through kuromoji and compare the
  reading with the written kana, ignoring long-vowel spelling. Each known variant is listed in its test file with a
  reason. A listed entry that now matches fails the test, so the list stays current. Fix a wrong kana in the file that
  holds it; the audio reads that field.

## Study features (phase 5)

- Everything here is derived from progress (`lessons`, `cards`, `days`, `notes`, `settings`); nothing new is stored.
  Achievements are a list in `src/lib/achievements.ts`, each with a value and a target. To add one, add an entry; the
  unit test checks ids and targets.
- Weekly accuracy is reviews that were not lapses, out of all reviews. A group with fewer than five reviews is not
  shown. A leech has four or more lapses (`LEECH_LAPSES`).
- "Fix leeches" and "Practise" open focus sets, `/practice/run?set=leeches` and `?set=confusions`, built from the cards
  at the moment they open. They are in `FOCUS_SETS`, not in the dojo grid.
- Tips: the first active situation in `TRIGGER_ORDER` decides the tip, and the tip changes daily within that situation.
- Today card: the daily picks depend only on the date (`dailyIndex`). Word and kanji come from the N5 level data; the
  proverb comes from the study packs and is left out when they are not available.
- The achievement toast reads a last-seen list kept in `localStorage` on this device. The first visit records the
  current achievements without a toast, so existing progress is not announced.

## Known issues

- **Hydration mismatch (React #418), intermittent**: with the service worker active, roughly one browser-test run in
  thirty reports a hydration mismatch. With the worker blocked (`BLOCK_SW=1`) the same tests pass 8 out of 8. Removing
  the precached HTML shells cut the rate, but did not remove it, and the cause is not yet isolated. React recovers by
  re-rendering. The browser tests report it as a `known-issue` annotation instead of failing.

## Commands

```bash
npm run dev            # local dev server (service worker disabled in dev)
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm test               # unit tests (vitest)
npm run build          # production build
npm run test:e2e       # Playwright at iPhone + desktop sizes (run after build)
npm run test:rules     # Firestore rules on the emulator (needs Java)
npm run test:sync      # sign-in + cross-device sync against Firebase emulators (needs Java)
npm run content        # regenerate src/content/generated from upstream datasets
npm run icons          # regenerate PNG icons from public/icons/icon.svg
npm run packs          # rebuild the offline knowledge packs in public/packs/v2 (sources cached in .cache/; fetches them when missing)
npm run check:secrets  # fail if any tracked file holds a credential (the pre-commit hook checks staged changes)
npm run topics        # regenerate src/content/generated/word-types.json (N5/N4, no network)
npm run deploy:rules   # deploy firestore.rules to FIREBASE_PROJECT_ID after the rules tests pass (add -- --check to run the gates only)
```

In the Claude Code cloud sandbox Playwright's own browser isn't downloadable; prefix e2e commands with
`PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`.

## Workflow: getting changes onto GitHub `main`

`main` is the production branch: Vercel deploys it automatically to the live site (feature branches get preview URLs).

1. **Branch** — never commit directly to `main`. Start from the latest `main`:
   `git fetch origin main && git checkout -B <branch> origin/main`
   (Claude Code sessions use the `claude/...` branch they are given.)
2. **Change** — keep commits focused, with clear messages.
3. **Verify before every push** — all must pass:
   `npm run lint && npm run typecheck && npm test && npm run build`
   plus `npm run test:e2e` for UI changes, `npm run test:rules` for `firestore.rules` changes, and
   `npm run test:sync` for changes to `sync.ts`, `firebase.ts` or `store/progress.ts`.
4. **Record the change** — add an entry to the [Changelog](#changelog) below in the same commit (see format).
5. **Push** — `git push -u origin <branch>` (retry with backoff only on network errors).
6. **Pull request** — open a PR into `main` (only when the user asks Claude to), describing what changed and how it
   was tested. Check the Vercel preview deployment on iPhone and desktop.
7. **Merge** — after review and green checks, merge the PR into `main`. Vercel then deploys production.
8. **Rules deploy (automatic)** — when the change touches `firestore.rules`, deploy it as part of the change. See
   [Firestore rules deploy](#firestore-rules-deploy-automatic). If new env vars were added, set them in Vercel and redeploy.
9. **Follow-up work** — a merged branch is finished; start the next change from the updated `main` (step 1).

### Firestore rules deploy (automatic)

Claude deploys the rules as part of the change that modifies them. Nobody has to run the command by hand.

1. **Trigger** — a change that touches `firestore.rules`, `firebase.json` or `tests/rules/`.
2. **Commit first** — the deploy uses committed rules only. `npm run deploy:rules` refuses to run while
   `firestore.rules` has uncommitted changes, so the live rules always match a commit.
3. **Deploy** — run `FIREBASE_PROJECT_ID=<firebase-project-id> npm run deploy:rules`. The project id comes from the
   environment, not from the repository. The script runs `npm run test:rules` first and stops if they fail, then runs
   `firebase deploy --only firestore:rules`.
4. **Credential** — the Firebase CLI reads `FIREBASE_TOKEN` from the session environment. Create the token on a trusted
   machine with `npx firebase login:ci`, and add it in the environment settings. Never paste it into the chat or commit
   it. If the deploy stops with "Failed to authenticate", the token is missing or expired: ask the person to add a new
   one. Do not work around it.
5. **Report** — the changelog entry records the commit that was deployed, or the reason it could not be. A change that
   changes the rules is not finished until they are live, or until the blocker is reported.

- Until `main` exists on GitHub, the rules deploy from the feature branch once committed. After a merge to `main`, the
  same rules are already live, so nothing else is needed unless the rules change again.
- `npm run deploy:rules -- --check` runs every gate without deploying.

## Changelog

Every change to the repository must add an entry here, newest first, in the same commit as the change.

Format:

```
### YYYY-MM-DD — Short title
- Branch: `<branch>` · PR: <link or "not opened"> · Status: <in progress | pushed | merged to main>
- Changes: what was added/changed/removed (user-visible behaviour first)
- Files: main files touched
- Verification: checks run and results
- Notes: follow-ups, migrations, or manual steps (e.g. deploy rules, new env vars)
```

### 2026-10-24 — Topics: word lists and key phrases (topic mode, phase 3)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - 22 topics in four groups (Me and my day, Out and about, Free time, School, work and health). Everyday basics holds
    the general words. The other 21 are situations such as Eating out, Travel and transport, and School.
  - Every N5 and N4 noun, verb, adjective and adverb (1,210 words) is in a topic or in everyday basics. 1,003 are in a
    topic (11 of them in two), and 207 (14.9%) are in everyday basics.
  - Each topic has 7 or 8 key phrases, with kana for audio, tiles for the build quiz and English. Each topic also links
    its grammar points and stories. The topic pages come in phase 5.
- Files: `src/content/topics.ts` (new), `src/content/topic-words.ts` (new), `tests/unit/topics.test.ts` (new), `CLAUDE.md`
- Verification: lint and typecheck pass; unit tests 155 of 155 pass. The topic tests check that every word is placed, no
  word is in more than two topics, everyday basics is at most 15%, every topic has at least ten words, the phrase tiles
  join back to the Japanese, and the phrase kana matches kuromoji. Six reviewed readings are excepted, each with its
  reason, and a stale exception fails the test.
- Notes: the word lists are hand-placed. Each topic lists its words in course order (N5 first). Stories and grammar
  points are linked from the topics, not tagged on the stories themselves.

### 2026-10-24 — Particle drills and phrase quizzes (topic mode, phase 4)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Particle sentences in the packs: `n5/sentences.json` (2,003 sentences) and `n4/sentences.json` (2,242). Each sentence
    is 30 characters or fewer, uses only N5 or N4 vocabulary, and has one particle blanked. The English under the blank
    says what the particle means. They come from Kanjium (annotated sentences first) and Tatoeba.
  - "Also correct": a blank never offers a particle that also fits the sentence. The rules are a hand table (は, が and も;
    に and へ; the が/は pair for 好き, 分かる, できる and similar verbs), plus the case particles that the corpus uses
    with the same verb.
  - Question builders for the topics: particle questions (with the English as the hint and furigana around the blank),
    and phrase quizzes (hear it and pick the meaning, or build it from tiles). Offline, particle questions fall back to
    the 168 hand-written grammar sentences.
  - `scripts/content/sentence-exclusions.ts` lists reviewed sentences to leave out. It is empty for now.
- Files: `src/content/particles.ts`, `scripts/content/sentences.ts`, `scripts/content/sentence-exclusions.ts`,
  `src/lib/topic-exercises.ts` (all new), `public/packs/v2/n5/sentences.json` and `n4/sentences.json` (new),
  `public/packs/v2/manifest.json`, `scripts/content/build-packs.ts`, `src/content/packs.ts`, `src/lib/types.ts`,
  `tests/unit/sentences.test.ts`, `tests/unit/topic-exercises.test.ts` (new), `tests/unit/packs.test.ts`, `CLAUDE.md`
- Verification: lint and typecheck pass; unit tests 189 of 189 pass. The pack tests check that each record's blank is the
  particle it names, that no also-correct particle is the answer, that every linked word exists, and that the common
  particles have enough sentences. The question tests check that each question has exactly one correct option, that no
  wrong option is a particle that also fits, and that N5 items come before N4 items. `npm run packs` was run twice; the
  second run came after fixing the also-correct rule (only case particles swap by verb) and the rule that rejects これまで
  and 今から.
- Notes: The plan wanted at least 60 sentences per particle and level. N5 has fewer for へ (22), まで (28), から (43) and も
  (57). N4 has fewer for へ (52) and まで (40). The drills mix both levels, so the combined counts are 68 to 121 for those
  particles. About 90 sampled sentences were checked by eye, and none needed excluding. The exclusion list stays empty
  until the "Hide this sentence" feature (phase 5) shows real bad ones. Blanks that are part of a longer word are
  rejected for これまで and 今から; other compounds are not checked.

### 2026-10-24 — Pronoun tags for これ, 私 and どこ (topic mode, phase 2 fix)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - これ, 私, どこ and similar words are typed as pronouns. kuromoji tags them as nouns with the sub-type 代名詞, which
    left them counted as nouns. Pronouns now number 43 (N5 and N4), up from 19.
- Files: `scripts/content/word-types.ts`, `src/content/generated/word-types.json`, `CLAUDE.md`
- Verification: word-type tests 4 of 4 pass, including the check that the committed file matches a fresh `npm run topics`.
- Notes: none.

### 2026-10-23 — Word types for N5 and N4 (topic mode, phase 2)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Every N5 and N4 word gets a type: noun, verb, い-adjective, な-adjective, adverb, pronoun (including question and
    pointing words), number, counter, set phrase, or pattern (grammar patterns and suffixes such as ～続ける, which get
    no practice card). The types come from kuromoji's tags, with ten reviewed overrides, each with its reason.
  - `npm run topics` writes `src/content/generated/word-types.json` (1,386 words). It needs no network and is the same
    on every run.
  - N3 to N1 word types come with the topic work later, so the file stays small.
- Files: `scripts/content/word-types.ts`, `scripts/content/word-type-overrides.ts`, `scripts/content/build-topics.ts`
  (all new), `src/content/generated/word-types.json` (new), `tests/unit/word-types.test.ts` (new), `package.json`,
  `scripts/content/build-packs.ts` (unused import removed), `CLAUDE.md`
- Verification: lint and typecheck pass; unit tests 142 of 142 pass, including golden words, every word typed, the
  committed file matching a fresh run, and every override still changing the automatic answer.
- Notes: the tagging fixed several misses along the way, such as compound nouns that ended in a suffix (郵便局, 誕生日)
  and counters that must follow a numeral. Gloss-based hints are only a review aid, so the remaining "to …" glosses on
  adjectives (欲しい, 嬉しい) stay adjectives.

### 2026-10-23 — Knowledge packs v2 with Kanjium furigana (topic mode, phase 1)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Example sentences now use Kanjium's furigana. The pack build read the plain `japanese` column, which has no ruby,
    and its ruby pattern lacked a `</rp>`, so every sentence fell back to kuromoji (which misreads words such as 書い).
  - The packs are written to `public/packs/v2`, and `PACK_VERSION` is `v2`. The service worker caches them under
    `PACK_CACHE` and deletes older pack caches on activate. `public/packs/v1` is removed.
  - Pure pack helpers moved into `scripts/content/lib.ts`. The parser tolerates Kanjium's malformed closing tags.
- Files: `scripts/content/lib.ts` (new), `scripts/content/build-packs.ts`, `src/content/packs.ts`, `src/app/sw.ts`,
  `tests/unit/pack-lib.test.ts` (new), `tests/unit/packs.test.ts`, `tests/e2e/app.spec.ts`, `public/packs/v2/**`, `CLAUDE.md`
- Verification: `npm run packs` rebuilt from the cached sources (119,578 sentences, 13,253 annotated; 7 annotated
  ruby texts differ from the plain sentence and are kept as plain text); lint, typecheck and build pass; unit tests
  138 of 138; browser tests 20 of 20.
- Notes: the packs rebuild on the next `npm run packs`. Existing installs fetch v2 on next use and drop the v1 cache.

### 2026-10-22 — Automatic Firestore rules deploy
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - `npm run deploy:rules` deploys `firestore.rules` to the project named in `FIREBASE_PROJECT_ID`. It runs the rules tests
    first, refuses to deploy uncommitted rules, and stops with the Firebase error when the login is missing. Adding
    `-- --check` runs the same gates without deploying.
  - The workflow deploys rules as part of each change that touches them, instead of after the merge (see "Firestore rules
    deploy (automatic)" in the Workflow section).
- Files: `scripts/deploy-rules.mjs` (new), `package.json`, `CLAUDE.md`
- Verification: lint, typecheck and build pass; unit tests 133 of 133 pass; `npm run deploy:rules -- --check` passes
  (rules tests 10 of 10, rules committed at `af93150`). A real deploy was attempted: the rules tests passed, then the
  deploy stopped at "Failed to authenticate" before changing anything in the Firebase project.
- Notes: **not deployed**. The rules changed in phases 1 and 3 are not live. The Firebase login stored in this sandbox
  is no longer accepted, and no deploy credential is set in the environment. Google's auth and Firebase endpoints are
  reachable from the sandbox, so the blocker is the credential. To finish: in the environment settings, add
  `FIREBASE_TOKEN` (created with `npx firebase login:ci` on a trusted machine) and `FIREBASE_PROJECT_ID`, start a new
  session, then run `npm run deploy:rules` and record the commit and result here. `main` does not exist on GitHub yet,
  so the rules deploy from this branch.

### 2026-10-22 — Weekly review, achievements, tips and the Today card (phase 5)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Today card at the top of the path: daily goal progress, the next lesson, reviews due, and a word, kanji, proverb and
    culture note of the day. The picks change at midnight and stay the same through the day.
  - Weekly review (Profile → Weekly review): the last seven days, accuracy by level, leeches with a "Fix leeches"
    drill, items you mix up with a "Practise" drill, the weakest kana rows, up to three next steps and a tip.
  - Achievements: 38 derived from progress, shown on Profile. A toast announces an achievement the first time it
    unlocks, and the last-seen list is kept on this device.
  - Tips: 75, each tied to a situation such as a due backlog, leeches, a broken streak or low accuracy. The most urgent
    situation decides the tip.
  - Culture notes: 45, one per day on the home screen.
- Files: `src/lib/coaching.ts`, `src/lib/weekly.ts`, `src/lib/achievements.ts` (new), `src/content/tips.ts` (new),
  `src/content/culture.ts` (new), `src/components/today-card.tsx` (new), `src/components/achievements.tsx` (new),
  `src/app/weekly/page.tsx` (new), `src/content/practice-sets.ts` (focus sets), `src/components/learning-path.tsx`,
  `src/app/(tabs)/profile/page.tsx`, `tests/unit/achievements.test.ts`, `tests/unit/weekly.test.ts`,
  `tests/unit/coaching.test.ts` (all new), `tests/e2e/app.spec.ts`, `CLAUDE.md`
- Verification: `check:secrets`, `lint` and `typecheck` clean; `npm test` 133 tests in 16 files pass; `npm run build`
  passes; `test:e2e` 20 of 20 pass on iPhone and desktop; `test:sync` 3 of 3 pass on desktop.
- Notes: no storage or rules change and no migration. Smaller than the plan: 75 tips (plan ≈150), 45 culture notes
  (plan ≈60), 38 achievements (plan ≈40). Adding more is a content-only change in `tips.ts` and `culture.ts`.

### 2026-10-22 — Grammar reference, stories and path pointer (phase 4)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - N5 grammar grows from 12 to 26 points and N4 adds 16. Every point is a lesson on the path. The grammar lessons
    are spread evenly over each level's units, so the two N5 points that were not on the path now are.
  - Dictionary → Grammar tab: browse every grammar point with its notes, sample sentences and audio.
  - Practice → Stories: 12 short dialogues (6 N5, 6 N4). Pick what to say (a wrong pick gets feedback and can be
    retried), then answer comprehension questions. The summary counts replies right first time and questions right.
  - Path: "current" is the first unfinished lesson after the furthest completed one, so a lesson added to a unit you
    already passed shows as open instead of pulling you back.
  - Fix: one N4 sentence (母は…言っていました) was missing its は in the kana, so its audio was also wrong.
- Files: `src/content/grammar.ts`, `src/content/grammar-n4.ts` (new), `src/content/stories.ts` (new),
  `src/content/course.ts`, `src/lib/course-progress.ts`, `src/components/learning-path.tsx`,
  `src/components/grammar-reference.tsx` (new), `src/components/story-player.tsx` (new), `src/app/story/page.tsx` (new),
  `src/app/(tabs)/dictionary/page.tsx`, `src/app/(tabs)/practice/page.tsx`, `tests/unit/course-progress.test.ts` (new),
  `tests/unit/grammar.test.ts` (new), `tests/unit/stories.test.ts` (new), `tests/unit/support/kuromoji.ts` (new),
  `tests/unit/content.test.ts`, `tests/e2e/app.spec.ts`, `CLAUDE.md`
- Verification: `check:secrets`, `lint` and `typecheck` clean; `npm test` 107 tests in 13 files pass, including the
  kuromoji reading check of every grammar and story sentence; `npm run build` passes; `test:e2e` 16 of 16 pass on iPhone
  and desktop; `test:sync` 3 of 3 pass on desktop. `firestore.rules`, `sync.ts`, `firebase.ts` and `progress.ts` are
  unchanged, so `test:rules` was not run.
- Notes: no migration. Lesson ids are unchanged and progress is keyed by id, so saved progress carries over; only the
  positions of grammar lessons on the path changed. Smaller than the plan: 26 N5 points (plan ≈45), 16 N4 (plan ≈55)
  and 12 stories (plan ≈24). Stories are reached from Practice rather than placed on the path, and they do not store
  progress or sync. Reviewed kuromoji readings are listed with reasons in `grammar.test.ts` and `stories.test.ts`.

### 2026-10-22 — Stage graph label files with the graph refresh
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes: the pre-commit hook also stages the graph label files, so relabelled communities land in the same commit.
  The current labels are committed.
- Files: `scripts/git-hooks/pre-commit`, `graphify-out/.graphify_labels.json`, `graphify-out/.graphify_labels.json.sig`
- Verification: hook syntax checked by running it on the staged change; secrets scan clean.
- Notes: none.

### 2026-10-22 — Word page 2.0, "Why?" explanations, pack drills and synced notes (phase 3)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Word page: pitch-accent graph, verb forms (tap to hear), example sentences with furigana (toggle), English on demand,
    kanji radical, parts, sound part, look-alikes, synonyms and antonyms, animated stroke order, and a personal note.
  - "Why?" after a wrong answer: rule-based notes for kana mistakes and for particle and kana-pair confusions.
  - Wrong choices are remembered on the card (up to five) for the review drills.
  - Vocabulary lessons add up to two sentence cloze questions. Practice dojo gains Sentences and Verb forms.
  - Notes are saved on this device and synced to the account; backups include them.
- Files: `src/lib/explain.ts`, `src/lib/pack-exercises.ts`, `src/lib/mora.ts`, `src/components/word/*`,
  `src/content/use-pack.ts`, `src/components/lesson/player.tsx`, `src/store/progress.ts`, `src/lib/sync.ts`,
  `src/lib/srs.ts`, `src/lib/backup.ts`, `src/lib/lesson-engine.ts`, `src/app/lesson/page.tsx`,
  `src/app/practice/run/page.tsx`, `src/content/practice-sets.ts`, `src/app/(tabs)/dictionary/page.tsx`,
  `src/app/(tabs)/profile/page.tsx`, `src/app/globals.css`, tests in `tests/unit` and `tests/e2e`
- Verification: unit tests (explainer, pack exercises, store, mora, packs); rules 10/10; browser 12/12 (word page
  checks included); emulator sync 3/3 (delete, guest merge, note sync); lint, typecheck and build pass.
- Notes: the "Why?" panel is covered by unit tests, not by a browser test. The grammar sentence-builder and the
  listening exercises planned earlier are not included in this phase.

### 2026-10-22 — Offline knowledge packs (phase 2)
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - `npm run packs` builds offline packs for each JLPT level from open data: example sentences (furigana and English),
    pitch accent, verb conjugation forms, kanji components, radical names, look-alikes, synonyms and antonyms, KanjiVG
    stroke order for all 2,211 JLPT kanji, and 4,905 proverbs and idioms written with JLPT kanji.
  - Example coverage per level: N5 633/718 words, N4 604/668, N3 1966/2140, N2 1190/1809, N1 1915/2699. Pitch accent
    covers 1,335–2,277 words per level; conjugation forms 158–400 words for N5–N3.
  - Profile → Offline study content downloads a level (or everything) and keeps it for offline use.
  - Credits page lists Kanjium (with its attribution sentence), Tatoeba, KanjiVG and kuromoji/IPADIC.
  - The service worker caches `/packs/` on demand and precaches only icons, which keeps the install small.
- Files: `scripts/content/build-packs.ts`, `src/content/packs.ts`, `src/components/offline-content.tsx`, `src/lib/mora.ts`,
  `src/app/sw.ts`, `next.config.ts`, `src/app/(tabs)/profile/page.tsx`, `src/app/(tabs)/credits/page.tsx`,
  `public/packs/v2/**`, `tests/unit/packs.test.ts`, `tests/unit/mora.test.ts`, `tests/e2e/app.spec.ts`, `package.json`
- Verification: pipeline run from the sources; pack tests (ids, pitch ranges, no markup, stroke paths) pass; 68 unit tests;
  build; browser tests 10/10 including the packs served with security headers and the offline section on Profile.
- Notes: the sentence matching now needs whole words, so coverage is lower than the first estimate. Kanji stroke data
  comes from the official KanjiVG files. kuromoji is a build-time dependency only. The packs total 6.4 MB raw. Vercel
  compresses them in transit.

### 2026-10-22 — Refresh curated graph labels
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes: community names in the graph re-curated for the current 24 communities; the label and signature files are
  tracked. graphify's dated snapshots of the previous graph are no longer committed.
- Files: `graphify-out/.graphify_labels.json`, `graphify-out/.graphify_labels.json.sig`, `graphify-out/graph.json`, `.gitignore`
- Verification: the label signatures were generated with graphify's own function; the graph reports 24 named communities.
- Notes: none.

### 2026-10-22 — Security hardening: rules, deletion, backups, network policy, CI
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Firestore rules validate every field (allow-listed keys, types, ranges, id formats, note length). The rules tests
    use the same write shapes as the sync code and cover rejections for each rule.
  - Delete-my-data: "Delete cloud data" removes all progress from Firestore, signs the device out and clears its local
    copy. "Delete account" also deletes the Firebase account (asks for a fresh sign-in when Firebase requires one).
  - Backup import validates the file with zod (5 MB cap, known keys and ranges only, `__proto__`-style keys refused).
  - Optional App Check (reCAPTCHA v3) when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set.
  - Security headers and a Content-Security-Policy; the emulator switch is refused in production builds.
  - Sign-in and sync traffic is never cached by the service worker; the old cross-origin cache is removed on update.
  - HTML pages are no longer precached. They were the source of the hydration mismatch described in CLAUDE.md
    (Known issues). Visited pages still work offline; a page never visited online falls back to the home page.
  - Dependency overrides: production audit now reports 0 vulnerabilities (was 6).
  - CI workflow (checks, browser tests, emulator tests) and Dependabot for npm and GitHub Actions.
  - Graph community names are curated and tracked (`graphify-out/.graphify_labels.json`).
- Files: `firestore.rules`, `tests/rules/firestore.rules.test.ts`, `src/lib/firebase.ts`, `src/lib/sync.ts`,
  `src/lib/backup.ts`, `src/app/(tabs)/profile/page.tsx`, `src/app/sw.ts`, `next.config.ts`, `package.json`,
  `tests/unit/backup.test.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/sync.spec.ts`,
  `.github/`, `docs/SETUP.md`, `.env.example`, `CLAUDE.md`, `graphify-out/`
- Verification: secrets scan clean; lint; typecheck; unit tests 36/36; Firestore rules 10/10; browser tests 10/10 (with
  the CSP fixture on, iPhone and desktop); emulator tests 2/2 (guest merge and delete-my-data); `npm audit --omit=dev`
  reports 0 vulnerabilities. Known issue: intermittent hydration mismatch, reported as an annotation.
- Notes: after this change, deploy `firestore.rules` (`npx firebase deploy --only firestore:rules --project <id>`).
  Open-sign-in data validation is now enforced by the rules, so older clients that write unexpected fields will be refused.
  The GitHub workflow file requires a token with workflow permission to push.

### 2026-10-22 — Block committed credentials and version the git hooks
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - The pre-commit hook blocks commits that add Google/Firebase API keys, private keys, service-account JSON, GitHub,
    Slack or AWS tokens, or `.env*` files (`.env.example` is allowed). `npm run check:secrets` runs the same scan on all
    tracked files.
  - `npm install` now points git at the versioned hooks in `scripts/git-hooks` (replaces the manual copy step).
  - Lint ignores the installed third-party skill folders (`.claude/`) and `graphify-out/`.
  - Removed the local copy of the service-account key from the sandbox.
- Files: `scripts/check-secrets.mjs`, `scripts/lib/secret-patterns.mjs`, `scripts/install-hooks.mjs`,
  `scripts/git-hooks/pre-commit`, `tests/unit/secrets.test.ts`, `package.json`, `eslint.config.mjs`, `CLAUDE.md`
- Verification: a staged fake key was blocked by the hook (exit 1) and then unstaged; `check:secrets` is clean on all
  tracked files; lint, typecheck and unit tests (31/31) pass.
- Notes: the service-account key was pasted into chat, so it must be revoked in Google Cloud (Service accounts →
  rules-deployer → Keys). The original upload of that key is still on the sandbox at its upload path until you revoke it.

### 2026-10-22 — Clarify anki-jlpt-decks as inspiration and treat Firebase config as a secret
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - `5mdld/anki-jlpt-decks` is listed as inspiration for the vocabulary note structure. Its data and audio are not used,
    and the data source remains `jamsinclair/open-anki-jlpt-decks` (MIT).
  - The Firebase web config is treated as a secret: never committed or pushed. It lives only in Vercel env vars and
    `.env.local`.
- Files: `CLAUDE.md`, `docs/SETUP.md`, `.env.example`
- Verification: documentation only; no code changed.
- Notes: the graph's AMBIGUOUS edges for these two points are now resolved by this wording. The graph reflects code
  only, so it was not regenerated for these doc edits.

### 2026-10-22 — Add graphify knowledge graph and commit hook
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - Built a knowledge graph of the app code and docs in `graphify-out/` (466 nodes, 1,105 edges, 21 communities
    labelled). Open `graphify-out/graph.html` in a browser, or read `graphify-out/GRAPH_REPORT.md`.
  - `.graphifyignore` leaves out `.claude/` (third-party skills), `graphify-out/` and icon images.
  - `scripts/git-hooks/pre-commit` refreshes the graph with `graphify update .` and stages it in the same commit.
    Install it once per clone with `cp scripts/git-hooks/pre-commit .git/hooks/pre-commit`.
- Files: `.graphifyignore`, `scripts/git-hooks/pre-commit`, `graphify-out/` (graph.json, GRAPH_REPORT.md, graph.html, manifest.json)
- Verification: detection and extraction ran on 72 files; the three docs were extracted by a subagent and read to their
  last line; the graph health check showed no integrity failures beyond normal parallel edges (2 dangling and 2
  self-loop edges remain).
- Notes: the graph's AMBIGUOUS edges are listed in GRAPH_REPORT.md for review. The pre-commit hook is not versioned
  by git, so each clone must install it. Re-run `graphify update .` after changing code without committing.

### 2026-10-22 — Fix lesson popover layering and iOS full-screen Home Screen mode
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes:
  - The lesson popover on the learning path was drawn underneath the locked lessons after it; the selected lesson now
    gets its own higher layer (`z-20`).
  - Added the `apple-mobile-web-app-capable` meta tag (Next.js's `appleWebApp.capable` did not emit it). Without it,
    iOS opens Home Screen apps with Safari's address bar and toolbar.
  - Added `id: "/"` to the manifest so URLs with query strings (e.g. `/lesson?id=…`) belong to the same installed app.
- Files: `src/components/learning-path.tsx`, `src/app/layout.tsx`, `src/app/manifest.ts`
- Verification: lint, typecheck, unit tests 27/27, build, Playwright 8/8; overlap audit across all screens at phone and
  desktop sizes (only expected scroll-under-tab-bar cases remain); served HTML checked for the meta tag.
- Notes: a Home Screen icon added before this change keeps the old behaviour — delete it and add it again from Safari
  while on `https://<domain>/`. Home Screen apps have their own storage separate from Safari, so progress made in Safari
  appears in the Home Screen app only after signing in.

### 2026-10-22 — Add CLAUDE.md
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed
- Changes: added this file with project overview, conventions, commands, the GitHub `main` workflow and the changelog.
- Files: `CLAUDE.md`
- Verification: documentation only.
- Notes: `main` does not exist on GitHub yet; it needs to be created (e.g. by merging this branch) before the workflow
  above applies.

### 2026-10-22 — Initial build of Polyglot
- Branch: `claude/festive-brahmagupta-ba5e9f` · PR: not opened · Status: pushed (commit `b76d74c`)
- Changes:
  - Learning path: kana (hiragana/katakana) then JLPT N5–N1 vocabulary + kanji, 12 hand-written N5 grammar lessons.
  - Lesson engine and player: intro cards, choice, listening, typing, match pairs, sentence builder, particle
    fill-in, kanji readings; missed questions repeat; XP (10, +5 for perfect), completion screen.
  - FSRS review queue with memory strength; practice dojo (pick / reverse pick / input / reverse input);
    dictionary search with kanji breakdown.
  - XP, daily goal, streaks, activity calendar, settings (goal, theme, speech speed, sounds, autoplay, readings),
    export/import backup.
  - Responsive shell (bottom tabs on phone, sidebar on desktop), PWA manifest/icons, offline service worker.
  - Google sign-in (popup on desktop, redirect on iOS with `/__/auth` proxy) and local-first Firestore sync;
    `firestore.rules`; `docs/SETUP.md`.
  - Content pipeline `scripts/build-content.ts` (open-anki-jlpt-decks + kanji-data), icon script.
- Files: whole repository (81 files).
- Verification: lint, typecheck, build pass; unit tests 27/27; Firestore rules tests 3/3; Playwright 8/8
  (iPhone + desktop sizes, Chromium); emulator sync test 1/1.
- Notes: not yet deployed; user must complete `docs/SETUP.md` (Firebase project, Vercel env vars, OAuth redirect URI,
  deploy rules). iPhone was emulated in Chromium, not tested in real Safari.
