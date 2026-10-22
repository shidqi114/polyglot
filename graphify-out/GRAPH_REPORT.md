# Graph Report - polyglot  (2026-10-22)

## Corpus Check
- 120 files · ~218,620 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 714 nodes · 1660 edges · 28 communities (25 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9087dc06`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- progress.ts
- sync.ts
- Project documentation
- Lesson exercises and dictionary UI
- n1
- next.config.ts
- Build scripts and secret scanner
- TypeScript configuration
- Package manifest
- Dev dependencies
- Runtime dependencies
- npm scripts
- End-to-end tests
- Answer checking
- Lint configuration
- vitest
- Rules tests
- Backup validation
- PostCSS configuration
- UI conventions
- profile/page.tsx
- Dependency overrides
- review/page.tsx
- lesson-engine.ts
- build-packs.ts
- packs.ts

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 40 edges
2. `cn` - 37 edges
3. `Card()` - 31 edges
4. `Button()` - 29 edges
5. `LessonPlayer()` - 25 edges
6. `react` - 21 edges
7. `AudioButton()` - 18 edges
8. `vitest` - 17 edges
9. `compilerOptions` - 17 edges
10. `lucide-react` - 16 edges

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

## Communities (28 total, 3 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.05
Nodes (59): HomePage(), LearningPath(), lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, SectionHeader(), UNIT_COLORS (+51 more)

### Community 1 - "progress.ts"
Cohesion: 0.11
Nodes (25): ts-fsrs, Activity(), addDays(), computeStreak(), dayKey(), fromCard(), GRADES, Grading (+17 more)

### Community 2 - "sync.ts"
Cohesion: 0.11
Nodes (31): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync(), completeRedirectSignIn(), config (+23 more)

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "Lesson exercises and dictionary UI"
Cohesion: 0.09
Nodes (47): lucide-react, wanakana, Detail(), DictionaryPage(), DictionaryTabs(), search(), Strength(), Tab (+39 more)

### Community 5 - "n1"
Cohesion: 0.05
Nodes (43): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+35 more)

### Community 6 - "next.config.ts"
Cohesion: 0.20
Nodes (7): nextConfig, securityHeaders, withSerwist, serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 7 - "Build scripts and secret scanner"
Cohesion: 0.09
Nodes (20): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+12 more)

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
Cohesion: 0.20
Nodes (7): PORT, @playwright/test, ALL_KANA, test, kanaOf, playKanaLesson(), romajiOf

### Community 14 - "Answer checking"
Cohesion: 0.49
Nodes (8): checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana(), readingVariants()

### Community 15 - "Lint configuration"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "vitest"
Cohesion: 0.08
Nodes (23): vitest, PitchGraph(), STORIES, Story, STORY_BY_ID, StoryLine, StoryOption, StoryQuestion (+15 more)

### Community 17 - "Rules tests"
Cohesion: 0.22
Nodes (3): firebase, @firebase/rules-unit-testing, settings

### Community 18 - "Backup validation"
Cohesion: 0.15
Nodes (15): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+7 more)

### Community 22 - "profile/page.tsx"
Cohesion: 0.09
Nodes (53): next, react, LEVELS, StoryList(), StoryPage(), StoryRoute(), StoryView(), CreditsPage() (+45 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "review/page.tsx"
Cohesion: 0.15
Nodes (10): formatIn(), ReviewPage(), start(), PlayerResult, getItems(), loadIndex(), buildPools(), poolFor() (+2 more)

### Community 25 - "lesson-engine.ts"
Cohesion: 0.09
Nodes (47): Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage(), CompleteScreen(), Stat(), Props (+39 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.13
Nodes (23): kuromoji, buildTokenizer(), CACHE, fetchCached(), KanjiEntry, katakanaToHiragana(), kuromojiSegments(), Level (+15 more)

### Community 27 - "packs.ts"
Cohesion: 0.21
Nodes (16): base(), cache, getJson(), loadExtras(), loadKanji(), loadManifest(), loadStrokes(), loadWords() (+8 more)

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 277 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `types.ts`, `progress.ts`, `Lesson exercises and dictionary UI`, `Build scripts and secret scanner`, `Package manifest`, `Answer checking`, `Rules tests`, `Backup validation`, `lesson-engine.ts`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05297297297297297 - nodes in this community are weakly interconnected._
- **Why does `react` connect `profile/page.tsx` to `types.ts`, `sync.ts`, `Lesson exercises and dictionary UI`, `Package manifest`, `review/page.tsx`, `lesson-engine.ts`, `packs.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `progress.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._