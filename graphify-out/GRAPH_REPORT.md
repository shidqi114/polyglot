# Graph Report - polyglot  (2026-10-24)

## Corpus Check
- 150 files · ~269,621 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 912 nodes · 2190 edges · 35 communities (32 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84c92cb9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Card
- achievements.ts
- progress.ts
- Project documentation
- useProgress
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
- lesson-engine.ts
- Backup validation
- PostCSS configuration
- UI conventions
- weekly.ts
- Dependency overrides
- sentences.ts
- types.ts
- build-packs.ts
- packs.ts
- today-card.tsx
- sentences.test.ts
- srs.ts
- topic-exercises.ts
- particles.ts
- packs.test.ts
- dayKey

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 47 edges
2. `cn` - 41 edges
3. `Card()` - 37 edges
4. `Button()` - 29 edges
5. `vitest` - 25 edges
6. `LessonPlayer()` - 25 edges
7. `react` - 24 edges
8. `shuffle()` - 22 edges
9. `AudioButton()` - 20 edges
10. `dayKey()` - 20 edges

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

## Communities (35 total, 3 thin omitted)

### Community 0 - "Card"
Cohesion: 0.11
Nodes (25): LEVELS, StoryList(), StoryPage(), StoryRoute(), StoryView(), CreditsPage(), INSPIRATION, SOURCES (+17 more)

### Community 1 - "achievements.ts"
Cohesion: 0.08
Nodes (18): KANA_ROWS, Achievement, ACHIEVEMENTS, evaluate(), EvaluatedAchievement, HIRAGANA, KANA_ROW_ITEMS, KATAKANA (+10 more)

### Community 2 - "progress.ts"
Cohesion: 0.06
Nodes (62): firebase, next, metadata, RootLayout(), viewport, TabsLayout(), AccountCard(), DangerZone() (+54 more)

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "useProgress"
Cohesion: 0.08
Nodes (59): lucide-react, react, wanakana, Detail(), DictionaryPage(), DictionaryTabs(), search(), Strength() (+51 more)

### Community 5 - "n1"
Cohesion: 0.04
Nodes (48): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+40 more)

### Community 6 - "next.config.ts"
Cohesion: 0.33
Nodes (4): nextConfig, securityHeaders, withSerwist, @serwist/next

### Community 7 - "build-content.ts"
Cohesion: 0.06
Nodes (26): @firebase/rules-unit-testing, fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv() (+18 more)

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
Cohesion: 0.07
Nodes (37): kuromoji, LEVELS, loadTokenizer(), main(), ROOT, WORD_TYPE_OVERRIDES, buildWordTypes(), classify() (+29 more)

### Community 17 - "lesson-engine.ts"
Cohesion: 0.06
Nodes (57): Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage(), formatIn(), ReviewPage(), start() (+49 more)

### Community 18 - "Backup validation"
Cohesion: 0.15
Nodes (15): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+7 more)

### Community 22 - "weekly.ts"
Cohesion: 0.21
Nodes (17): Tile(), WeeklyPage(), accuracyByGroup(), cardAccuracy(), Cards, coachingState(), confusions(), GroupAccuracy (+9 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "sentences.ts"
Cohesion: 0.16
Nodes (16): PoolSentence, Segment, analyse(), Analysis, COMPOUND_BEFORE, CONTENT_POS, FREE_NOUN_SUBTYPES, hiragana() (+8 more)

### Community 25 - "types.ts"
Cohesion: 0.05
Nodes (60): vitest, PracticePage(), LEVELS, lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, UNIT_COLORS (+52 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.13
Nodes (25): buildTokenizer(), CACHE, fetchCached(), KanjiEntry, Level, LEVEL_NUMBER, LEVELS, main() (+17 more)

### Community 27 - "packs.ts"
Cohesion: 0.12
Nodes (28): serwist, serwist, WorkerGlobalScope, cachedAll(), LEVELS, mb(), OfflineContent(), base() (+20 more)

### Community 28 - "today-card.tsx"
Cohesion: 0.21
Nodes (11): CULTURE, CultureNote, Tip, TIPS, TipTrigger, activeTriggers(), CoachingState, dailyIndex() (+3 more)

### Community 29 - "sentences.test.ts"
Cohesion: 0.15
Nodes (10): meaningIn(), sentenceRecord(), Token, VocabEntry, alsoCorrect(), particleItemsFromGrammar(), FORMS, N5 (+2 more)

### Community 30 - "srs.ts"
Cohesion: 0.24
Nodes (10): ts-fsrs, fromCard(), GRADES, Grading, isDue(), retrievability(), reviewCard(), scheduler (+2 more)

### Community 31 - "topic-exercises.ts"
Cohesion: 0.17
Nodes (16): Props, TopicPhrase, blankedRuby(), blankedText(), distractorsFor(), familyItems(), key(), particleDrill() (+8 more)

### Community 32 - "particles.ts"
Cohesion: 0.33
Nodes (5): ALWAYS_ALSO, CASE_PARTICLES, PARTICLE_FAMILIES, PARTICLES, SUBJECT_MARKING

### Community 34 - "packs.test.ts"
Cohesion: 0.24
Nodes (9): EXCLUDED_SENTENCES, PitchGraph(), morae(), pitchPattern(), LEVELS, manifest, read(), ROOT (+1 more)

### Community 36 - "dayKey"
Cohesion: 0.48
Nodes (6): Activity(), bestStreak(), addDays(), computeStreak(), dayKey(), bumpDay()

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 356 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `types.ts` to `Card`, `achievements.ts`, `packs.test.ts`, `useProgress`, `build-content.ts`, `Package manifest`, `Answer checking`, `Button`, `lesson-engine.ts`, `Backup validation`, `weekly.ts`, `build-packs.ts`, `today-card.tsx`, `sentences.test.ts`, `srs.ts`, `topic-exercises.ts`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Card` be split into smaller, more focused modules?**
  _Cohesion score 0.10634920634920635 - nodes in this community are weakly interconnected._
- **Why does `react` connect `useProgress` to `Card`, `progress.ts`, `Package manifest`, `lesson-engine.ts`, `weekly.ts`, `types.ts`, `packs.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `achievements.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07661290322580645 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._