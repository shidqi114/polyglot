# Graph Report - polyglot  (2026-10-22)

## Corpus Check
- 103 files · ~204,024 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 626 nodes · 1359 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a94a39f4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Content model and course data
- Progress, sync and spaced repetition
- App layout and providers
- Project documentation
- Lesson exercises and dictionary UI
- n1
- ProgressActions
- Build scripts and secret scanner
- TypeScript configuration
- Package manifest
- Dev dependencies
- Runtime dependencies
- npm scripts
- End-to-end tests
- Answer checking
- Lint configuration
- Next.js and service worker config
- Rules tests
- Backup validation
- PostCSS configuration
- UI conventions
- App shell and tab navigation
- Dependency overrides
- learning-path.tsx
- packs.ts
- build-packs.ts

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 37 edges
2. `cn` - 31 edges
3. `LessonPlayer()` - 23 edges
4. `Button()` - 23 edges
5. `Card()` - 21 edges
6. `compilerOptions` - 17 edges
7. `scripts` - 15 edges
8. `react` - 15 edges
9. `ProfilePage()` - 14 edges
10. `ReviewPage()` - 14 edges

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

## Communities (27 total, 4 thin omitted)

### Community 0 - "Content model and course data"
Cohesion: 0.07
Nodes (60): vitest, Lesson(), LessonPage(), LessonRoute(), GRAMMAR, GRAMMAR_BY_ID, PARTICLES, ALL_KANA (+52 more)

### Community 1 - "Progress, sync and spaced repetition"
Cohesion: 0.06
Nodes (70): next, ts-fsrs, zustand, CreditsPage(), INSPIRATION, SOURCES, AccountCard(), Activity() (+62 more)

### Community 2 - "App layout and providers"
Cohesion: 0.33
Nodes (6): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync()

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "Lesson exercises and dictionary UI"
Cohesion: 0.10
Nodes (52): lucide-react, react, PracticeRun(), PracticeRunPage(), Detail(), DictionaryPage(), search(), Strength() (+44 more)

### Community 5 - "n1"
Cohesion: 0.05
Nodes (43): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+35 more)

### Community 7 - "Build scripts and secret scanner"
Cohesion: 0.07
Nodes (27): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+19 more)

### Community 8 - "TypeScript configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Package manifest"
Cohesion: 0.10
Nodes (20): engines, node, name, private, version, clsx, eslint, eslint-config-next (+12 more)

### Community 10 - "Dev dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, @firebase/rules-unit-testing, firebase-tools, kuromoji, @playwright/test (+10 more)

### Community 11 - "Runtime dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, firebase, framer-motion, lucide-react, next, react, react-dom (+5 more)

### Community 12 - "npm scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check:secrets, content, dev, icons, lint, packs (+7 more)

### Community 13 - "End-to-end tests"
Cohesion: 0.22
Nodes (6): PORT, @playwright/test, test, kanaOf, playKanaLesson(), romajiOf

### Community 14 - "Answer checking"
Cohesion: 0.42
Nodes (9): wanakana, checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana() (+1 more)

### Community 15 - "Lint configuration"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "Next.js and service worker config"
Cohesion: 0.20
Nodes (7): nextConfig, securityHeaders, withSerwist, serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 17 - "Rules tests"
Cohesion: 0.22
Nodes (3): firebase, @firebase/rules-unit-testing, settings

### Community 18 - "Backup validation"
Cohesion: 0.16
Nodes (14): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+6 more)

### Community 22 - "App shell and tab navigation"
Cohesion: 0.36
Nodes (9): TabsLayout(), AppShell(), BottomNav(), isActive(), MobileHeader(), NAV, Sidebar(), useDue() (+1 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "learning-path.tsx"
Cohesion: 0.11
Nodes (25): HomePage(), LearningPath(), lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, UNIT_COLORS, UnitBlock() (+17 more)

### Community 25 - "packs.ts"
Cohesion: 0.13
Nodes (24): cachedAll(), LEVELS, mb(), OfflineContent(), base(), cache, getJson(), levelFiles() (+16 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.13
Nodes (22): buildTokenizer(), CACHE, fetchCached(), KanjiEntry, katakanaToHiragana(), kuromojiSegments(), Level, LEVEL_NUMBER (+14 more)

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 256 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Content model and course data` to `Progress, sync and spaced repetition`, `Build scripts and secret scanner`, `Package manifest`, `Answer checking`, `Rules tests`, `Backup validation`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Content model and course data` be split into smaller, more focused modules?**
  _Cohesion score 0.0700152207001522 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Lesson exercises and dictionary UI` to `Content model and course data`, `Progress, sync and spaced repetition`, `App layout and providers`, `Package manifest`, `App shell and tab navigation`, `learning-path.tsx`, `packs.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Progress, sync and spaced repetition` be split into smaller, more focused modules?**
  _Cohesion score 0.0608250526949714 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._