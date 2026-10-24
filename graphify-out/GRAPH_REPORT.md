# Graph Report - polyglot  (2026-10-24)

## Corpus Check
- 156 files · ~275,837 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .rules 1)

## Summary
- 966 nodes · 2465 edges · 42 communities (38 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c6dca9b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- run/page.tsx
- achievements.ts
- progress.ts
- Project documentation
- cn
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
- useProgress
- types.ts
- build-packs.ts
- packs.ts
- today-card.tsx
- dictionary/page.tsx
- srs.ts
- topic-sessions.ts
- vitest
- next
- firestore.rules.test.ts
- word-panel.tsx
- progress.ts
- ui.tsx
- providers.tsx
- explain.ts
- ProgressActions
- review/page.tsx

## God Nodes (most connected - your core abstractions)
1. `useProgress` - 53 edges
2. `cn` - 43 edges
3. `Card()` - 39 edges
4. `Button()` - 32 edges
5. `react` - 26 edges
6. `vitest` - 26 edges
7. `LessonPlayer()` - 26 edges
8. `shuffle()` - 26 edges
9. `AudioButton()` - 22 edges
10. `StudyItem` - 22 edges

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

## Communities (42 total, 4 thin omitted)

### Community 0 - "run/page.tsx"
Cohesion: 0.23
Nodes (15): Lesson(), LessonPage(), LessonRoute(), PracticeRun(), PracticeRunPage(), CompleteScreen(), Stat(), PlayerResult (+7 more)

### Community 1 - "achievements.ts"
Cohesion: 0.10
Nodes (11): Achievement, EvaluatedAchievement, HIRAGANA, KANA_ROW_ITEMS, KATAKANA, LESSONS_N5, N4_GRAMMAR, N5_GRAMMAR (+3 more)

### Community 2 - "progress.ts"
Cohesion: 0.07
Nodes (62): zustand, CreditsPage(), INSPIRATION, SOURCES, TabsLayout(), AccountCard(), Activity(), DangerZone() (+54 more)

### Community 3 - "Project documentation"
Cohesion: 0.07
Nodes (46): Project changelog, npm command set, Content licensing constraints, Content generation pipeline, Course structure (sections, units, lessons), Derived XP and streaks, Environment variables and secrets policy, Firebase Auth and Firestore (+38 more)

### Community 4 - "cn"
Cohesion: 0.20
Nodes (23): wanakana, GrammarDetail(), AudioButton(), BuildExercise(), ChoiceExercise(), Ex, GrammarNote(), InputExercise() (+15 more)

### Community 5 - "n1"
Cohesion: 0.04
Nodes (48): bytes, extras, idioms, proverbs, generatedAt, levels, n1, n2 (+40 more)

### Community 6 - "next.config.ts"
Cohesion: 0.33
Nodes (4): nextConfig, securityHeaders, withSerwist, @serwist/next

### Community 7 - "build-content.ts"
Cohesion: 0.07
Nodes (24): fetchText(), KanjiEntry, Level, LEVELS, main(), OUT_DIR, parseCsv(), RawKanji (+16 more)

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
Cohesion: 0.16
Nodes (9): PORT, @playwright/test, ALL_KANA, test, kanaOf, meaningOfWord, playKanaLesson(), playLearnSession() (+1 more)

### Community 14 - "Answer checking"
Cohesion: 0.49
Nodes (8): checkEnglish(), checkInput(), checkKana(), checkRomaji(), editDistance(), normalizeEnglish(), normalizeKana(), readingVariants()

### Community 15 - "Lint configuration"
Cohesion: 0.25
Nodes (5): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc

### Community 16 - "Button"
Cohesion: 0.07
Nodes (40): kuromoji, LEVELS, loadTokenizer(), main(), ROOT, WORD_TYPE_OVERRIDES, buildWordTypes(), classify() (+32 more)

### Community 17 - "lesson-engine.ts"
Cohesion: 0.19
Nodes (24): AMBIGUOUS, answerLabel(), buildGrammarLesson(), buildItemLesson(), buildPracticeExercise(), buildReviewExercise(), capitalize(), choiceFromItems() (+16 more)

### Community 18 - "Backup validation"
Cohesion: 0.15
Nodes (15): zod, Backup, BackupError, backupSchema, cardSchema, daySchema, findForbiddenKey(), FORBIDDEN_KEYS (+7 more)

### Community 22 - "weekly.ts"
Cohesion: 0.21
Nodes (17): Tile(), WeeklyPage(), accuracyByGroup(), cardAccuracy(), Cards, coachingState(), confusions(), GroupAccuracy (+9 more)

### Community 23 - "Dependency overrides"
Cohesion: 0.67
Nodes (3): overrides, @grpc/grpc-js, postcss

### Community 24 - "useProgress"
Cohesion: 0.27
Nodes (14): HomePage(), KnownNote(), LearningPath(), lessonDescription(), LessonIcon(), LessonNode(), OFFSETS, SectionHeader() (+6 more)

### Community 25 - "types.ts"
Cohesion: 0.07
Nodes (41): LEVELS, ALL_LESSONS, chunk(), COURSE, evenChunks(), kanaSection(), KANJI_PER_LESSON, LESSON_BY_ID (+33 more)

### Community 26 - "build-packs.ts"
Cohesion: 0.05
Nodes (61): buildTokenizer(), CACHE, fetchCached(), KanjiEntry, Level, LEVEL_NUMBER, LEVELS, main() (+53 more)

### Community 27 - "packs.ts"
Cohesion: 0.08
Nodes (36): serwist, serwist, WorkerGlobalScope, cachedAll(), LEVELS, mb(), OfflineContent(), base() (+28 more)

### Community 28 - "today-card.tsx"
Cohesion: 0.21
Nodes (11): CULTURE, CultureNote, Tip, TIPS, TipTrigger, activeTriggers(), CoachingState, dailyIndex() (+3 more)

### Community 29 - "dictionary/page.tsx"
Cohesion: 0.24
Nodes (13): Detail(), DictionaryPage(), DictionaryRoute(), DictionaryTabs(), DictionaryView(), scopeItems(), search(), Strength() (+5 more)

### Community 30 - "srs.ts"
Cohesion: 0.23
Nodes (11): fromCard(), GRADES, Grading, isDue(), retrievability(), reviewCard(), scheduler, SrsCard (+3 more)

### Community 31 - "topic-sessions.ts"
Cohesion: 0.06
Nodes (73): Props, grammarLessonId(), GROUPS, TYPES, cache, getItems(), kanjiItem(), LevelData (+65 more)

### Community 32 - "vitest"
Cohesion: 0.18
Nodes (8): vitest, HIRAGANA_ROWS, hiraganaToKatakana(), KANA_BY_ID, KANA_ROWS, kanaItem(), ACHIEVEMENTS, Progress

### Community 33 - "next"
Cohesion: 0.27
Nodes (8): next, TopicsPage(), TopicsRoute(), ParticlesView(), ProgressCard(), SaveOffline(), StudySetView(), TopicIndex()

### Community 34 - "firestore.rules.test.ts"
Cohesion: 0.22
Nodes (3): firebase, @firebase/rules-unit-testing, settings

### Community 35 - "word-panel.tsx"
Cohesion: 0.39
Nodes (7): lucide-react, Furigana(), StrokeOrder(), ExampleRow(), FORM_LABELS, NoteEditor(), WordPanel()

### Community 36 - "progress.ts"
Cohesion: 0.22
Nodes (12): bestStreak(), addDays(), computeStreak(), dayKey(), bumpDay(), DayStats, DEFAULT_SETTINGS, emptyPending() (+4 more)

### Community 37 - "ui.tsx"
Cohesion: 0.31
Nodes (7): react, PracticePage(), Toggle(), Variant, VARIANTS, MODE_INFO, PRACTICE_SETS

### Community 38 - "providers.tsx"
Cohesion: 0.33
Nodes (6): metadata, RootLayout(), viewport, Providers(), THEME_SCRIPT, ThemeSync()

### Community 39 - "explain.ts"
Cohesion: 0.36
Nodes (7): confusablePairs(), explainChoice(), explainKana(), isParticle(), KANA_PAIRS, PARTICLE_HINTS, toHiragana()

### Community 41 - "review/page.tsx"
Cohesion: 0.57
Nodes (6): formatIn(), ReviewPage(), start(), buildPools(), poolFor(), poolKey()

## Ambiguous Edges - Review These
- `Content licensing constraints` → `Inspiration projects`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Environment variables and secrets policy` → `Vercel environment variables`  [AMBIGUOUS]
  docs/SETUP.md · relation: conceptually_related_to
- `Content generation pipeline` → `Content and licenses`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **25 isolated node(s):** `framer-motion`, `react-dom`, `@tailwindcss/postcss`, `@types/kuromoji`, `@types/node` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 362 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `firestore.rules.test.ts`, `progress.ts`, `explain.ts`, `build-content.ts`, `Package manifest`, `Answer checking`, `Button`, `lesson-engine.ts`, `Backup validation`, `weekly.ts`, `types.ts`, `build-packs.ts`, `packs.ts`, `today-card.tsx`, `topic-sessions.ts`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `framer-motion`, `react-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `achievements.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `run/page.tsx`, `progress.ts`, `ui.tsx`, `providers.tsx`, `next.config.ts`, `Package manifest`, `Button`, `weekly.ts`, `useProgress`, `dictionary/page.tsx`, `topic-sessions.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `progress.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07122153209109731 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Content licensing constraints` and `Inspiration projects`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Environment variables and secrets policy` and `Vercel environment variables`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._