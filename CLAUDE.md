# CLAUDE.md — Polyglot

This file is the project's memory for Claude Code. It explains how the app is built, how changes reach GitHub `main`,
and keeps a **changelog of every change**. Read it before working on the repo, and update it as part of every change.

## Project overview

Polyglot is a personal, Duolingo-style **Japanese learning web app** (PWA). It runs on desktop and is installed on iPhone
from Safari (Add to Home Screen). It is deployed on **Vercel**; progress can sync through **Firebase Auth (Google) +
Firestore**.

- Path: Hiragana → Katakana → JLPT N5 → N4 → N3 → N2 → N1 (≈210 kana, ≈8,000 words, ≈2,200 kanji, 12 N5 grammar lessons)
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
| `src/content/kana.ts`, `grammar.ts` | Hand-written kana table and N5 grammar lessons |
| `src/content/course.ts` | Builds sections → units → lessons (6 words / 4 kanji per lesson) |
| `src/content/generated/*.json` | Generated JLPT vocab/kanji (do not edit by hand; run `npm run content`) |
| `src/content/loader.ts` | Lazy loading of level data, lesson items and distractor pools |
| `src/lib/lesson-engine.ts` | Exercise generation for lessons, reviews and practice |
| `src/lib/answer-check.ts` | Romaji/kana/English answer normalisation |
| `src/lib/srs.ts` | FSRS wrapper (compact card format) |
| `src/lib/firebase.ts`, `sync.ts` | Firebase init/sign-in and local-first Firestore sync |
| `src/store/progress.ts` | Progress store: lessons, cards, day counters, settings, pending sync changes |
| `firestore.rules`, `firebase.json` | Security rules and emulator config |
| `docs/SETUP.md` | Firebase + Vercel + iPhone setup guide for the user |
| `tests/unit`, `tests/rules`, `tests/e2e` | Unit tests, Firestore rules tests, Playwright tests (`sync.spec.ts` needs emulators) |

## Key conventions

- **Local-first**: all progress changes go through `useProgress` actions; they mark `pending` changes that `sync.ts`
  flushes to Firestore. Day stats are counters written with `increment()`; cards merge by `up` timestamp.
  Total XP and streaks are *derived* from `days` — never store them separately.
- Firestore layout: `users/{uid}` (settings), `users/{uid}/days/{YYYY-MM-DD}`, `users/{uid}/lessons/{id}`,
  `users/{uid}/cards/{itemId}`. Update `firestore.rules` and `tests/rules` together.
- Item ids: `k:<kana>`, `v:<word>:<reading>`, `j:<kanji>`. Lesson ids: `kana-h-<row>-<n>`, `n5-v-<n>`, `n5-k-<n>`,
  `n5-g-<grammarId>`. **Changing ids or lesson sizes breaks saved progress** — avoid, or add a migration.
- UI: colours are CSS variables in `globals.css` (light + `.dark`); chunky buttons use `.btn-3d` with `--shadow`.
  Japanese text uses the `.jp` class. Layout must work at 390px wide (iPhone) and on desktop with no horizontal scroll.
- Content licensing: vocabulary/kanji data is CC BY-SA 4.0 (EDRDG) via MIT-licensed converters. Do **not** copy code
  from the AGPL/GPL reference repos (kana-dojo, read-frog, LLPlayer) or data from anki-jlpt-decks (CC BY-NC, Chinese).
- Never commit secrets. Firebase web config goes in Vercel env vars / `.env.local` (see `.env.example`).

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
8. **After merge** — if `firestore.rules` changed, deploy them:
   `npx firebase deploy --only firestore:rules --project <firebase-project-id>`.
   If new env vars were added, set them in Vercel and redeploy.
9. **Follow-up work** — a merged branch is finished; start the next change from the updated `main` (step 1).

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
