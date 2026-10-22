# Graph Report - polyglot  (2026-10-22)

## Corpus Check
- 80 files · ~41,143 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 516 nodes · 1190 edges · 24 communities (21 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4cd9f9a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Content model and course data
- progress.ts
- providers.tsx
- Project documentation
- Lesson exercises and dictionary UI
- Lesson generation engine
- Lesson player and route pages
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
- firestore.rules.test.ts
- backup.ts
- PostCSS configuration
- UI conventions
- app-shell.tsx
- overrides

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 37 edges
2. `cn` - 31 edges
3. `LessonPlayer()` - 23 edges
4. `Button()` - 21 edges
5. `Card()` - 19 edges
6. `compilerOptions` - 17 edges
7. `scripts` - 14 edges
8. `react` - 14 edges
9. `ReviewPage()` - 14 edges
10. `ProfilePage()` - 13 edges

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

## Communities (24 total, 3 thin omitted)

### Community 0 - "Content model and course data"
Cohesion: 0.05
Nodes (57): vitest, HomePage(), LearningPath(), lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, UNIT_COLORS (+49 more)

### Community 1 - "progress.ts"
Cohesion: 0.07
Nodes (67): ts-fsrs, zustand, CreditsPage(), INSPIRATION, SOURCES, AccountCard(), Activity(), DangerZone() (+59 more)

### Community 2 - "providers.tsx"
Cohesion: 0.33
Nodes (6): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync()

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "Lesson exercises and dictionary UI"
Cohesion: 0.15
Nodes (33): Detail(), DictionaryPage(), search(), Strength(), SectionHeader(), AudioButton(), BuildExercise(), ChoiceExercise() (+25 more)

### Community 5 - "Lesson generation engine"
Cohesion: 0.24
Nodes (24): AMBIGUOUS, answerLabel(), buildGrammarLesson(), buildItemLesson(), buildPracticeExercise(), buildReviewExercise(), capitalize(), choiceFromItems() (+16 more)

### Community 6 - "Lesson player and route pages"
Cohesion: 0.10
Nodes (28): lucide-react, next, react, Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage() (+20 more)

### Community 7 - "Build scripts and secret scanner"
Cohesion: 0.08
Nodes (20): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+12 more)

### Community 8 - "TypeScript configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Package manifest"
Cohesion: 0.10
Nodes (19): engines, node, name, private, version, clsx, eslint, eslint-config-next (+11 more)

### Community 10 - "Dev dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, @firebase/rules-unit-testing, firebase-tools, @playwright/test, serwist (+8 more)

### Community 11 - "Runtime dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, firebase, framer-motion, lucide-react, next, react, react-dom (+5 more)

### Community 12 - "npm scripts"
Cohesion: 0.14
Nodes (14): scripts, build, check:secrets, content, dev, icons, lint, prepare (+6 more)

### Community 13 - "End-to-end tests"
Cohesion: 0.22
Nodes (6): PORT, @playwright/test, test, kanaOf, playKanaLesson(), romajiOf

### Community 14 - "Answer checking"
Cohesion: 0.49
Nodes (8): checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana(), readingVariants()

### Community 15 - "Lint configuration"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "Next.js and service worker config"
Cohesion: 0.20
Nodes (7): nextConfig, securityHeaders, withSerwist, serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 17 - "firestore.rules.test.ts"
Cohesion: 0.22
Nodes (3): firebase, @firebase/rules-unit-testing, settings

### Community 18 - "backup.ts"
Cohesion: 0.16
Nodes (14): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+6 more)

### Community 22 - "app-shell.tsx"
Cohesion: 0.36
Nodes (9): TabsLayout(), AppShell(), BottomNav(), isActive(), MobileHeader(), NAV, Sidebar(), useDue() (+1 more)

### Community 23 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **24 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 191 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Content model and course data` to `progress.ts`, `Build scripts and secret scanner`, `Package manifest`, `Answer checking`, `firestore.rules.test.ts`, `backup.ts`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Content model and course data` be split into smaller, more focused modules?**
  _Cohesion score 0.05442428730099963 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Lesson player and route pages` to `Content model and course data`, `progress.ts`, `providers.tsx`, `Package manifest`, `Next.js and service worker config`, `app-shell.tsx`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `progress.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06596035543403965 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._