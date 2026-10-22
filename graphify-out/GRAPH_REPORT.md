# Graph Report - polyglot  (2026-10-22)

## Corpus Check
- 73 files · ~36,931 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 468 nodes · 1106 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d77abd86`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- profile/page.tsx
- sync.ts
- Setup guide (Firebase, Vercel, iPhone)
- useProgress
- lesson-engine.ts
- review/page.tsx
- build-content.ts
- compilerOptions
- package.json
- devDependencies
- dependencies
- scripts
- helpers.ts
- answer-check.ts
- eslint.config.mjs
- next.config.ts
- vitest
- progress.ts
- postcss.config.mjs
- UI conventions

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 37 edges
2. `cn` - 31 edges
3. `LessonPlayer()` - 23 edges
4. `Button()` - 20 edges
5. `Card()` - 18 edges
6. `compilerOptions` - 17 edges
7. `react` - 14 edges
8. `ReviewPage()` - 14 edges
9. `scripts` - 12 edges
10. `ProfilePage()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Updating content` --semantically_similar_to--> `Content generation pipeline`  [INFERRED] [semantically similar]
  docs/SETUP.md → CLAUDE.md
- `Firebase project creation` --semantically_similar_to--> `Firebase Auth and Firestore`  [INFERRED] [semantically similar]
  docs/SETUP.md → CLAUDE.md
- `Firestore data storage` --semantically_similar_to--> `Local-first progress store`  [INFERRED] [semantically similar]
  docs/SETUP.md → CLAUDE.md
- `Local development and checks` --semantically_similar_to--> `Playwright sandbox browser path`  [INFERRED] [semantically similar]
  docs/SETUP.md → CLAUDE.md
- `Vercel first deploy` --semantically_similar_to--> `Vercel deployment`  [INFERRED] [semantically similar]
  docs/SETUP.md → CLAUDE.md

## Import Cycles
- None detected.

## Communities (22 total, 3 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (53): Lesson(), LessonPage(), LessonRoute(), PlayerResult, ALL_LESSONS, chunk(), COURSE, evenChunks() (+45 more)

### Community 1 - "profile/page.tsx"
Cohesion: 0.08
Nodes (52): next, CreditsPage(), INSPIRATION, SOURCES, TabsLayout(), HomePage(), PracticePage(), AccountCard() (+44 more)

### Community 2 - "sync.ts"
Cohesion: 0.16
Nodes (21): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync(), completeRedirectSignIn(), getFirebase() (+13 more)

### Community 3 - "Setup guide (Firebase, Vercel, iPhone)"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "useProgress"
Cohesion: 0.17
Nodes (27): lucide-react, wanakana, Detail(), DictionaryPage(), search(), Strength(), AudioButton(), BuildExercise() (+19 more)

### Community 5 - "lesson-engine.ts"
Cohesion: 0.19
Nodes (26): Props, AMBIGUOUS, answerLabel(), buildGrammarLesson(), buildItemLesson(), buildPracticeExercise(), buildReviewExercise(), capitalize() (+18 more)

### Community 6 - "review/page.tsx"
Cohesion: 0.16
Nodes (13): react, PracticeRun(), PracticeRunPage(), formatIn(), ReviewPage(), start(), CompleteScreen(), Stat() (+5 more)

### Community 7 - "build-content.ts"
Cohesion: 0.12
Nodes (15): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+7 more)

### Community 8 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "package.json"
Cohesion: 0.10
Nodes (19): engines, node, name, private, version, clsx, eslint, eslint-config-next (+11 more)

### Community 10 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, @firebase/rules-unit-testing, firebase-tools, @playwright/test, serwist (+8 more)

### Community 11 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, clsx, firebase, framer-motion, lucide-react, next, react, react-dom (+4 more)

### Community 12 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, content, dev, icons, lint, start, test (+4 more)

### Community 13 - "helpers.ts"
Cohesion: 0.21
Nodes (6): PORT, @playwright/test, ALL_KANA, kanaOf, playKanaLesson(), romajiOf

### Community 14 - "answer-check.ts"
Cohesion: 0.49
Nodes (8): checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana(), readingVariants()

### Community 15 - "eslint.config.mjs"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "next.config.ts"
Cohesion: 0.25
Nodes (6): nextConfig, withSerwist, serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 17 - "vitest"
Cohesion: 0.33
Nodes (4): firebase, @firebase/rules-unit-testing, vitest, card

### Community 18 - "progress.ts"
Cohesion: 0.12
Nodes (25): ts-fsrs, Activity(), addDays(), computeStreak(), dayKey(), fromCard(), GRADES, Grading (+17 more)

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **24 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 164 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `types.ts`, `lesson-engine.ts`, `build-content.ts`, `package.json`, `answer-check.ts`, `progress.ts`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058653846153846154 - nodes in this community are weakly interconnected._
- **Why does `next` connect `profile/page.tsx` to `types.ts`, `sync.ts`, `review/page.tsx`, `package.json`, `next.config.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `profile/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08283730158730158 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._