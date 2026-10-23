# Graph Report - polyglot  (2026-10-23)

## Corpus Check
- 139 files · ~232,838 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 825 nodes · 1987 edges · 32 communities (28 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e694e453`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- achievements.ts
- sync.ts
- Project documentation
- Lesson exercises and dictionary UI
- n1
- next.config.ts
- build-content.ts
- TypeScript configuration
- Package manifest
- Dev dependencies
- Runtime dependencies
- npm scripts
- End-to-end tests
- Answer checking
- Lint configuration
- Button
- build-content.ts
- Backup validation
- PostCSS configuration
- UI conventions
- weekly.ts
- Dependency overrides
- progress.ts
- lesson-engine.ts
- build-packs.ts
- packs.ts
- today-card.tsx
- ProgressActions
- srs.ts
- providers.tsx

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 47 edges
2. `cn` - 41 edges
3. `Card()` - 37 edges
4. `Button()` - 29 edges
5. `LessonPlayer()` - 25 edges
6. `react` - 24 edges
7. `vitest` - 22 edges
8. `AudioButton()` - 20 edges
9. `dayKey()` - 20 edges
10. `lucide-react` - 18 edges

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

## Communities (32 total, 4 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.08
Nodes (36): vitest, LEVELS, lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, UNIT_COLORS, UnitBlock() (+28 more)

### Community 1 - "achievements.ts"
Cohesion: 0.08
Nodes (16): KANA_ROWS, Achievement, ACHIEVEMENTS, evaluate(), EvaluatedAchievement, HIRAGANA, KANA_ROW_ITEMS, KATAKANA (+8 more)

### Community 2 - "sync.ts"
Cohesion: 0.08
Nodes (55): firebase, CreditsPage(), INSPIRATION, SOURCES, TabsLayout(), AccountCard(), DangerZone(), DataCard() (+47 more)

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "Lesson exercises and dictionary UI"
Cohesion: 0.07
Nodes (64): clsx, lucide-react, react, wanakana, Detail(), DictionaryPage(), DictionaryTabs(), search() (+56 more)

### Community 5 - "n1"
Cohesion: 0.05
Nodes (43): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+35 more)

### Community 6 - "next.config.ts"
Cohesion: 0.33
Nodes (4): nextConfig, securityHeaders, withSerwist, @serwist/next

### Community 7 - "build-content.ts"
Cohesion: 0.06
Nodes (22): @firebase/rules-unit-testing, jobs, maskable, square, problems, checkOnly, commit, fail() (+14 more)

### Community 8 - "TypeScript configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Package manifest"
Cohesion: 0.10
Nodes (19): engines, node, name, private, version, eslint, eslint-config-next, firebase-tools (+11 more)

### Community 10 - "Dev dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, @firebase/rules-unit-testing, firebase-tools, kuromoji, @playwright/test (+10 more)

### Community 11 - "Runtime dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, firebase, framer-motion, lucide-react, next, react, react-dom (+5 more)

### Community 12 - "npm scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check:secrets, content, deploy:rules, dev, icons, lint (+9 more)

### Community 13 - "End-to-end tests"
Cohesion: 0.22
Nodes (6): PORT, @playwright/test, test, kanaOf, playKanaLesson(), romajiOf

### Community 14 - "Answer checking"
Cohesion: 0.49
Nodes (8): checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana(), readingVariants()

### Community 15 - "Lint configuration"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "Button"
Cohesion: 0.06
Nodes (43): kuromoji, next, LEVELS, loadTokenizer(), main(), ROOT, WORD_TYPE_OVERRIDES, buildWordTypes() (+35 more)

### Community 17 - "build-content.ts"
Cohesion: 0.22
Nodes (12): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+4 more)

### Community 18 - "Backup validation"
Cohesion: 0.15
Nodes (15): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+7 more)

### Community 22 - "weekly.ts"
Cohesion: 0.21
Nodes (18): Tile(), WeeklyPage(), SrsCard, accuracyByGroup(), cardAccuracy(), Cards, coachingState(), confusions() (+10 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "progress.ts"
Cohesion: 0.19
Nodes (14): Activity(), bestStreak(), addDays(), computeStreak(), dayKey(), bumpDay(), DayStats, DEFAULT_SETTINGS (+6 more)

### Community 25 - "lesson-engine.ts"
Cohesion: 0.06
Nodes (77): Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage(), formatIn(), ReviewPage(), start() (+69 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.14
Nodes (24): buildTokenizer(), CACHE, fetchCached(), KanjiEntry, Level, LEVEL_NUMBER, LEVELS, main() (+16 more)

### Community 27 - "packs.ts"
Cohesion: 0.12
Nodes (27): serwist, serwist, WorkerGlobalScope, cachedAll(), LEVELS, mb(), OfflineContent(), base() (+19 more)

### Community 28 - "today-card.tsx"
Cohesion: 0.19
Nodes (12): Pick(), CULTURE, CultureNote, Tip, TIPS, TipTrigger, activeTriggers(), CoachingState (+4 more)

### Community 30 - "srs.ts"
Cohesion: 0.25
Nodes (10): ts-fsrs, fromCard(), GRADES, Grading, isDue(), retrievability(), reviewCard(), scheduler (+2 more)

### Community 31 - "providers.tsx"
Cohesion: 0.33
Nodes (6): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync()

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 319 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `types.ts` to `achievements.ts`, `Lesson exercises and dictionary UI`, `build-content.ts`, `Package manifest`, `Answer checking`, `Button`, `Backup validation`, `weekly.ts`, `progress.ts`, `lesson-engine.ts`, `build-packs.ts`, `today-card.tsx`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Lesson exercises and dictionary UI` to `types.ts`, `sync.ts`, `Package manifest`, `Button`, `weekly.ts`, `lesson-engine.ts`, `packs.ts`, `today-card.tsx`, `providers.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `achievements.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08045977011494253 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._