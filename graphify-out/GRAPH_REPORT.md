# Graph Report - polyglot  (2026-10-22)

## Corpus Check
- 111 files · ~208,629 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 667 nodes · 1514 edges · 27 communities (24 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e53f4c9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Content model and course data
- Progress, sync and spaced repetition
- App layout and providers
- Project documentation
- Lesson exercises and dictionary UI
- n1
- sw.ts
- Build scripts and secret scanner
- TypeScript configuration
- Package manifest
- Dev dependencies
- Runtime dependencies
- npm scripts
- End-to-end tests
- Answer checking
- Lint configuration
- next
- Rules tests
- Backup validation
- PostCSS configuration
- UI conventions
- App shell and tab navigation
- Dependency overrides
- learning-path.tsx
- lesson/page.tsx
- build-packs.ts

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 40 edges
2. `cn` - 33 edges
3. `LessonPlayer()` - 25 edges
4. `Button()` - 25 edges
5. `Card()` - 23 edges
6. `react` - 18 edges
7. `compilerOptions` - 17 edges
8. `shuffle()` - 16 edges
9. `scripts` - 15 edges
10. `vitest` - 14 edges

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

## Communities (27 total, 3 thin omitted)

### Community 0 - "Content model and course data"
Cohesion: 0.07
Nodes (62): formatIn(), ReviewPage(), start(), GRAMMAR, GRAMMAR_BY_ID, PARTICLES, HIRAGANA_ROWS, hiraganaToKatakana() (+54 more)

### Community 1 - "Progress, sync and spaced repetition"
Cohesion: 0.06
Nodes (73): ts-fsrs, zustand, CreditsPage(), INSPIRATION, SOURCES, PracticePage(), AccountCard(), Activity() (+65 more)

### Community 2 - "App layout and providers"
Cohesion: 0.33
Nodes (6): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync()

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "Lesson exercises and dictionary UI"
Cohesion: 0.12
Nodes (43): clsx, lucide-react, react, wanakana, Detail(), DictionaryPage(), search(), Strength() (+35 more)

### Community 5 - "n1"
Cohesion: 0.05
Nodes (43): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+35 more)

### Community 6 - "sw.ts"
Cohesion: 0.40
Nodes (4): serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 7 - "Build scripts and secret scanner"
Cohesion: 0.05
Nodes (36): vitest, fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv() (+28 more)

### Community 8 - "TypeScript configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Package manifest"
Cohesion: 0.11
Nodes (18): engines, node, name, private, version, eslint, eslint-config-next, firebase-tools (+10 more)

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
Cohesion: 0.20
Nodes (7): PORT, @playwright/test, ALL_KANA, test, kanaOf, playKanaLesson(), romajiOf

### Community 14 - "Answer checking"
Cohesion: 0.49
Nodes (8): checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana(), readingVariants()

### Community 15 - "Lint configuration"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "next"
Cohesion: 0.25
Nodes (4): nextConfig, securityHeaders, withSerwist, next

### Community 17 - "Rules tests"
Cohesion: 0.22
Nodes (3): firebase, @firebase/rules-unit-testing, settings

### Community 18 - "Backup validation"
Cohesion: 0.15
Nodes (15): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+7 more)

### Community 22 - "App shell and tab navigation"
Cohesion: 0.36
Nodes (9): TabsLayout(), AppShell(), BottomNav(), isActive(), MobileHeader(), NAV, Sidebar(), useDue() (+1 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "learning-path.tsx"
Cohesion: 0.10
Nodes (26): HomePage(), LearningPath(), lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, UNIT_COLORS, UnitBlock() (+18 more)

### Community 25 - "lesson/page.tsx"
Cohesion: 0.06
Nodes (47): Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage(), CompleteScreen(), Stat(), PlayerResult (+39 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.13
Nodes (23): kuromoji, buildTokenizer(), CACHE, fetchCached(), KanjiEntry, katakanaToHiragana(), kuromojiSegments(), Level (+15 more)

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 263 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Build scripts and secret scanner` to `Content model and course data`, `Progress, sync and spaced repetition`, `Package manifest`, `Answer checking`, `Rules tests`, `Backup validation`, `lesson/page.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Content model and course data` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Lesson exercises and dictionary UI` to `Content model and course data`, `Progress, sync and spaced repetition`, `App layout and providers`, `Package manifest`, `App shell and tab navigation`, `learning-path.tsx`, `lesson/page.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `Progress, sync and spaced repetition` be split into smaller, more focused modules?**
  _Cohesion score 0.06171025565677343 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._