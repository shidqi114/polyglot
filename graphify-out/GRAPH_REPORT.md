# Graph Report - polyglot  (2026-10-22)

## Corpus Check
- 132 files · ~228,023 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 798 nodes · 1915 edges · 37 communities (33 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af93150b`
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
- vitest
- Rules tests
- Backup validation
- PostCSS configuration
- UI conventions
- weekly.ts
- Dependency overrides
- progress.ts
- lesson-engine.ts
- build-packs.ts
- packs.ts
- coaching.ts
- ProgressActions
- srs.ts
- vitest
- check-secrets.mjs
- explain.ts
- ref_node_fs
- deploy-rules.mjs
- pitch-graph.tsx

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 47 edges
2. `cn` - 41 edges
3. `Card()` - 37 edges
4. `Button()` - 29 edges
5. `LessonPlayer()` - 25 edges
6. `react` - 24 edges
7. `vitest` - 20 edges
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

## Communities (37 total, 4 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.08
Nodes (38): HomePage(), LEVELS, LearningPath(), lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, UNIT_COLORS (+30 more)

### Community 1 - "achievements.ts"
Cohesion: 0.08
Nodes (16): KANA_ROWS, Achievement, ACHIEVEMENTS, evaluate(), EvaluatedAchievement, HIRAGANA, KANA_ROW_ITEMS, KATAKANA (+8 more)

### Community 2 - "sync.ts"
Cohesion: 0.07
Nodes (58): next, zustand, metadata, RootLayout(), viewport, CreditsPage(), INSPIRATION, SOURCES (+50 more)

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "Lesson exercises and dictionary UI"
Cohesion: 0.09
Nodes (56): lucide-react, react, wanakana, Detail(), DictionaryPage(), DictionaryTabs(), search(), Strength() (+48 more)

### Community 5 - "n1"
Cohesion: 0.05
Nodes (43): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+35 more)

### Community 6 - "next.config.ts"
Cohesion: 0.20
Nodes (7): nextConfig, securityHeaders, withSerwist, serwist, @serwist/next, serwist, WorkerGlobalScope

### Community 7 - "build-content.ts"
Cohesion: 0.22
Nodes (12): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+4 more)

### Community 8 - "TypeScript configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Package manifest"
Cohesion: 0.10
Nodes (19): engines, node, name, private, version, clsx, eslint, eslint-config-next (+11 more)

### Community 10 - "Dev dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, @firebase/rules-unit-testing, firebase-tools, kuromoji, @playwright/test (+10 more)

### Community 11 - "Runtime dependencies"
Cohesion: 0.15
Nodes (13): dependencies, clsx, firebase, framer-motion, lucide-react, next, react, react-dom (+5 more)

### Community 12 - "npm scripts"
Cohesion: 0.12
Nodes (16): scripts, build, check:secrets, content, deploy:rules, dev, icons, lint (+8 more)

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
Cohesion: 0.10
Nodes (24): LEVELS, StoryList(), StoryPage(), StoryRoute(), StoryView(), Bubble(), QuestionStep(), ReplyStep() (+16 more)

### Community 17 - "Rules tests"
Cohesion: 0.22
Nodes (3): firebase, @firebase/rules-unit-testing, settings

### Community 18 - "Backup validation"
Cohesion: 0.15
Nodes (15): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+7 more)

### Community 22 - "weekly.ts"
Cohesion: 0.23
Nodes (16): Tile(), WeeklyPage(), accuracyByGroup(), cardAccuracy(), Cards, coachingState(), confusions(), GroupAccuracy (+8 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "progress.ts"
Cohesion: 0.21
Nodes (13): Activity(), bestStreak(), addDays(), computeStreak(), dayKey(), bumpDay(), DEFAULT_SETTINGS, emptyPending() (+5 more)

### Community 25 - "lesson-engine.ts"
Cohesion: 0.06
Nodes (75): Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage(), formatIn(), ReviewPage(), start() (+67 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.13
Nodes (23): kuromoji, buildTokenizer(), CACHE, fetchCached(), KanjiEntry, katakanaToHiragana(), kuromojiSegments(), Level (+15 more)

### Community 27 - "packs.ts"
Cohesion: 0.14
Nodes (25): cachedAll(), LEVELS, mb(), OfflineContent(), base(), cache, getJson(), levelFiles() (+17 more)

### Community 28 - "coaching.ts"
Cohesion: 0.18
Nodes (14): Pick(), TodayCard(), CULTURE, CultureNote, PackExtra, Tip, TIPS, TipTrigger (+6 more)

### Community 30 - "srs.ts"
Cohesion: 0.21
Nodes (11): ts-fsrs, fromCard(), GRADES, Grading, isDue(), retrievability(), reviewCard(), scheduler (+3 more)

### Community 31 - "vitest"
Cohesion: 0.24
Nodes (6): vitest, LEVELS, manifest, read(), ROOT, vocabIds()

### Community 32 - "check-secrets.mjs"
Cohesion: 0.33
Nodes (5): problems, findSecretsInText(), FORBIDDEN_PATHS, isForbiddenPath(), RULES

### Community 33 - "explain.ts"
Cohesion: 0.36
Nodes (7): confusablePairs(), explainChoice(), explainKana(), isParticle(), KANA_PAIRS, PARTICLE_HINTS, toHiragana()

### Community 34 - "ref_node_fs"
Cohesion: 0.25
Nodes (3): jobs, maskable, square

### Community 35 - "deploy-rules.mjs"
Cohesion: 0.40
Nodes (4): checkOnly, commit, fail(), run()

### Community 36 - "pitch-graph.tsx"
Cohesion: 0.73
Nodes (3): PitchGraph(), morae(), pitchPattern()

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 313 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `types.ts`, `achievements.ts`, `explain.ts`, `check-secrets.mjs`, `pitch-graph.tsx`, `Package manifest`, `Answer checking`, `vitest`, `Rules tests`, `Backup validation`, `weekly.ts`, `progress.ts`, `lesson-engine.ts`, `coaching.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Lesson exercises and dictionary UI` to `types.ts`, `sync.ts`, `Package manifest`, `vitest`, `weekly.ts`, `lesson-engine.ts`, `packs.ts`, `coaching.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `achievements.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08045977011494253 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._