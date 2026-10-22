import type { GrammarLesson } from "@/lib/types";

/** Hand-written N5 grammar lessons. Tiles are split at word/particle boundaries. */
export const GRAMMAR: GrammarLesson[] = [
  {
    id: "g-desu",
    title: "X は Y です",
    notes: [
      "「AはBです」 means “A is B”. は (read “wa”) marks the topic, です makes it polite.",
      "• Add か at the end to make a question: 学生ですか。",
      "• Negative: じゃないです (or ではありません).",
    ],
    examples: [
      { jp: "わたしは がくせいです。", en: "I am a student." },
      { jp: "これは ほんですか。", en: "Is this a book?" },
    ],
    sentences: [
      { tiles: ["わたし", "は", "学生", "です"], kana: "わたしはがくせいです", en: "I am a student." },
      { tiles: ["これ", "は", "本", "です"], kana: "これはほんです", en: "This is a book." },
      { tiles: ["田中さん", "は", "先生", "です", "か"], kana: "たなかさんはせんせいですか", en: "Is Mr. Tanaka a teacher?" },
      { tiles: ["それ", "は", "水", "です"], kana: "それはみずです", en: "That is water." },
      { tiles: ["わたし", "は", "日本人", "じゃないです"], kana: "わたしはにほんじんじゃないです", en: "I am not Japanese." },
      { tiles: ["あれ", "は", "山", "です", "か"], kana: "あれはやまですか", en: "Is that (over there) a mountain?" },
    ],
  },
  {
    id: "g-no",
    title: "の — possession",
    notes: [
      "の links two nouns: 「AのB」 = “A's B” or “B of A”.",
      "• わたしの本 = my book",
      "• 日本の車 = a Japanese car (car of Japan)",
    ],
    examples: [
      { jp: "これは わたしの かばんです。", en: "This is my bag." },
      { jp: "日本語の 先生", en: "Japanese-language teacher" },
    ],
    sentences: [
      { tiles: ["これ", "は", "わたし", "の", "かばん", "です"], kana: "これはわたしのかばんです", en: "This is my bag." },
      { tiles: ["あれ", "は", "先生", "の", "車", "です"], kana: "あれはせんせいのくるまです", en: "That is the teacher's car." },
      { tiles: ["それ", "は", "だれ", "の", "本", "です", "か"], kana: "それはだれのほんですか", en: "Whose book is that?" },
      { tiles: ["日本語", "の", "先生", "です"], kana: "にほんごのせんせいです", en: "(They) are a Japanese teacher." },
      { tiles: ["友だち", "の", "名前", "は", "ゆきです"], kana: "ともだちのなまえはゆきです", en: "My friend's name is Yuki." },
    ],
  },
  {
    id: "g-masu",
    title: "Verbs: ます form",
    notes: [
      "Polite verbs end in ます. Negative: ません. Past: ました.",
      "• 食べます = (I) eat / will eat",
      "• 食べません = don't eat",
      "• 食べました = ate",
    ],
    examples: [
      { jp: "まいにち コーヒーを のみます。", en: "I drink coffee every day." },
      { jp: "きのう テレビを 見ませんでした。", en: "I didn't watch TV yesterday." },
    ],
    sentences: [
      { tiles: ["わたし", "は", "パン", "を", "食べます"], kana: "わたしはパンをたべます", en: "I eat bread." },
      { tiles: ["毎日", "コーヒー", "を", "飲みます"], kana: "まいにちコーヒーをのみます", en: "I drink coffee every day." },
      { tiles: ["テレビ", "を", "見ません"], kana: "テレビをみません", en: "I don't watch TV." },
      { tiles: ["きのう", "本", "を", "読みました"], kana: "きのうほんをよみました", en: "I read a book yesterday." },
      { tiles: ["あした", "学校", "に", "行きます"], kana: "あしたがっこうにいきます", en: "I will go to school tomorrow." },
      { tiles: ["音楽", "を", "聞きました"], kana: "おんがくをききました", en: "I listened to music." },
    ],
  },
  {
    id: "g-wo",
    title: "を — the object",
    notes: [
      "を (read “o”) marks the thing an action is done to.",
      "• 水を飲みます = drink water",
      "• Word order: [topic は] [object を] [verb].",
    ],
    examples: [
      { jp: "すしを 食べます。", en: "I eat sushi." },
      { jp: "手紙を 書きました。", en: "I wrote a letter." },
    ],
    sentences: [
      { tiles: ["すし", "を", "食べます"], kana: "すしをたべます", en: "I eat sushi." },
      { tiles: ["手紙", "を", "書きました"], kana: "てがみをかきました", en: "I wrote a letter." },
      { tiles: ["母", "は", "りんご", "を", "買いました"], kana: "はははりんごをかいました", en: "My mother bought apples." },
      { tiles: ["日本語", "を", "勉強します"], kana: "にほんごをべんきょうします", en: "I study Japanese." },
      { tiles: ["しゃしん", "を", "とります"], kana: "しゃしんをとります", en: "I take photos." },
    ],
  },
  {
    id: "g-ni-de",
    title: "に & で — places",
    notes: [
      "に marks a destination or where something exists; で marks where an action happens.",
      "• 学校に行きます = go to school",
      "• 学校で勉強します = study at school",
      "• へ (read “e”) can also mark direction: 日本へ行きます.",
    ],
    examples: [
      { jp: "としょかんで 本を 読みます。", en: "I read books at the library." },
      { jp: "日本に 行きたいです。", en: "I want to go to Japan." },
    ],
    sentences: [
      { tiles: ["としょかん", "で", "本", "を", "読みます"], kana: "としょかんでほんをよみます", en: "I read books at the library." },
      { tiles: ["駅", "に", "行きます"], kana: "えきにいきます", en: "I go to the station." },
      { tiles: ["レストラン", "で", "ばんごはん", "を", "食べました"], kana: "レストランでばんごはんをたべました", en: "I ate dinner at a restaurant." },
      { tiles: ["うち", "に", "帰ります"], kana: "うちにかえります", en: "I go home." },
      { tiles: ["公園", "で", "あそびます"], kana: "こうえんであそびます", en: "I play in the park." },
      { tiles: ["来年", "日本", "へ", "行きます"], kana: "らいねんにほんへいきます", en: "I'm going to Japan next year." },
    ],
  },
  {
    id: "g-aru-iru",
    title: "あります / います",
    notes: [
      "“There is / I have”: あります for things, います for people and animals.",
      "• Place に Thing が あります.",
      "• が marks the thing that exists.",
    ],
    examples: [
      { jp: "つくえの 上に ねこが います。", en: "There is a cat on the desk." },
      { jp: "時間が ありません。", en: "I don't have time." },
    ],
    sentences: [
      { tiles: ["へや", "に", "テレビ", "が", "あります"], kana: "へやにテレビがあります", en: "There is a TV in the room." },
      { tiles: ["公園", "に", "子ども", "が", "います"], kana: "こうえんにこどもがいます", en: "There are children in the park." },
      { tiles: ["時間", "が", "ありません"], kana: "じかんがありません", en: "I don't have time." },
      { tiles: ["いぬ", "が", "います", "か"], kana: "いぬがいますか", en: "Do you have a dog?" },
      { tiles: ["かばん", "の", "中", "に", "さいふ", "が", "あります"], kana: "かばんのなかにさいふがあります", en: "There is a wallet in the bag." },
    ],
  },
  {
    id: "g-adj",
    title: "Adjectives い & な",
    notes: [
      "い-adjectives end in い: 高い, 安い. な-adjectives need な before a noun: しずかな町.",
      "• Negative い-adj: 高くないです",
      "• Negative な-adj: しずかじゃないです",
    ],
    examples: [
      { jp: "この りんごは おいしいです。", en: "This apple is delicious." },
      { jp: "きれいな 花ですね。", en: "What a pretty flower." },
    ],
    sentences: [
      { tiles: ["この", "りんご", "は", "おいしい", "です"], kana: "このりんごはおいしいです", en: "This apple is delicious." },
      { tiles: ["きれいな", "花", "です", "ね"], kana: "きれいなはなですね", en: "It's a pretty flower, isn't it?" },
      { tiles: ["東京", "は", "大きい", "町", "です"], kana: "とうきょうはおおきいまちです", en: "Tokyo is a big city." },
      { tiles: ["この", "へや", "は", "しずか", "です"], kana: "このへやはしずかです", en: "This room is quiet." },
      { tiles: ["テスト", "は", "むずかしくない", "です"], kana: "テストはむずかしくないです", en: "The test is not difficult." },
      { tiles: ["あの", "店", "は", "高い", "です"], kana: "あのみせはたかいです", en: "That store is expensive." },
    ],
  },
  {
    id: "g-time",
    title: "Time with に",
    notes: [
      "Specific times take に: 7時に起きます. Relative times (今日, 毎日, あした) don't.",
      "• 〜から〜まで = from … until …",
    ],
    examples: [
      { jp: "七時に おきます。", en: "I get up at seven." },
      { jp: "九時から 五時まで はたらきます。", en: "I work from nine to five." },
    ],
    sentences: [
      { tiles: ["七時", "に", "起きます"], kana: "しちじにおきます", en: "I get up at seven o'clock." },
      { tiles: ["九時", "から", "五時", "まで", "働きます"], kana: "くじからごじまではたらきます", en: "I work from nine to five." },
      { tiles: ["日曜日", "に", "友だち", "と", "会います"], kana: "にちようびにともだちとあいます", en: "I meet my friend on Sunday." },
      { tiles: ["毎朝", "シャワー", "を", "あびます"], kana: "まいあさシャワーをあびます", en: "I take a shower every morning." },
      { tiles: ["何時", "に", "寝ます", "か"], kana: "なんじにねますか", en: "What time do you go to bed?" },
    ],
  },
  {
    id: "g-tai",
    title: "〜たい — want to",
    notes: [
      "Replace ます with たい to say “want to do”: 食べます → 食べたいです.",
      "• Negative: 食べたくないです",
      "• Use が or を for the object: すしが食べたいです.",
    ],
    examples: [
      { jp: "日本へ 行きたいです。", en: "I want to go to Japan." },
      { jp: "なにを 飲みたいですか。", en: "What do you want to drink?" },
    ],
    sentences: [
      { tiles: ["日本", "へ", "行きたい", "です"], kana: "にほんへいきたいです", en: "I want to go to Japan." },
      { tiles: ["何", "を", "飲みたい", "です", "か"], kana: "なにをのみたいですか", en: "What do you want to drink?" },
      { tiles: ["すし", "が", "食べたい", "です"], kana: "すしがたべたいです", en: "I want to eat sushi." },
      { tiles: ["今日", "は", "勉強したくない", "です"], kana: "きょうはべんきょうしたくないです", en: "I don't want to study today." },
      { tiles: ["新しい", "車", "を", "買いたい", "です"], kana: "あたらしいくるまをかいたいです", en: "I want to buy a new car." },
    ],
  },
  {
    id: "g-te",
    title: "〜てください — please",
    notes: [
      "The て form + ください makes a polite request.",
      "• 見ます → 見て → 見てください (please look)",
      "• 書きます → 書いて, 読みます → 読んで, 待ちます → 待って",
    ],
    examples: [
      { jp: "ちょっと 待ってください。", en: "Please wait a moment." },
      { jp: "ここに 名前を 書いてください。", en: "Please write your name here." },
    ],
    sentences: [
      { tiles: ["ちょっと", "待って", "ください"], kana: "ちょっとまってください", en: "Please wait a moment." },
      { tiles: ["ここ", "に", "名前", "を", "書いて", "ください"], kana: "ここになまえをかいてください", en: "Please write your name here." },
      { tiles: ["ゆっくり", "話して", "ください"], kana: "ゆっくりはなしてください", en: "Please speak slowly." },
      { tiles: ["この", "本", "を", "読んで", "ください"], kana: "このほんをよんでください", en: "Please read this book." },
      { tiles: ["まど", "を", "開けて", "ください"], kana: "まどをあけてください", en: "Please open the window." },
    ],
  },
  {
    id: "g-mo-to",
    title: "も & と",
    notes: [
      "も means “also / too” and replaces は, が or を. と means “and” between nouns, or “with” a person.",
      "• わたしも学生です = I am a student too",
      "• パンとたまご = bread and eggs",
    ],
    examples: [
      { jp: "わたしも 行きます。", en: "I'll go too." },
      { jp: "ともだちと えいがを 見ました。", en: "I watched a movie with a friend." },
    ],
    sentences: [
      { tiles: ["わたし", "も", "行きます"], kana: "わたしもいきます", en: "I'll go too." },
      { tiles: ["友だち", "と", "映画", "を", "見ました"], kana: "ともだちとえいがをみました", en: "I watched a movie with a friend." },
      { tiles: ["パン", "と", "たまご", "を", "食べます"], kana: "パンとたまごをたべます", en: "I eat bread and eggs." },
      { tiles: ["ねこ", "も", "いぬ", "も", "すき", "です"], kana: "ねこもいぬもすきです", en: "I like both cats and dogs." },
      { tiles: ["家族", "と", "旅行", "します"], kana: "かぞくとりょこうします", en: "I travel with my family." },
    ],
  },
  {
    id: "g-suki",
    title: "好き & じょうず",
    notes: [
      "“I like X” is 「Xがすきです」. Likewise じょうず (good at) and へた (bad at) take が.",
      "• 何がすきですか = What do you like?",
      "• だいすき = love, really like",
    ],
    examples: [
      { jp: "わたしは 音楽が すきです。", en: "I like music." },
      { jp: "ともだちは りょうりが じょうずです。", en: "My friend is good at cooking." },
    ],
    sentences: [
      { tiles: ["わたし", "は", "音楽", "が", "好き", "です"], kana: "わたしはおんがくがすきです", en: "I like music." },
      { tiles: ["友だち", "は", "料理", "が", "じょうず", "です"], kana: "ともだちはりょうりがじょうずです", en: "My friend is good at cooking." },
      { tiles: ["何", "が", "好き", "です", "か"], kana: "なにがすきですか", en: "What do you like?" },
      { tiles: ["わたし", "は", "歌", "が", "へた", "です"], kana: "わたしはうたがへたです", en: "I'm bad at singing." },
      { tiles: ["ねこ", "が", "大好き", "です"], kana: "ねこがだいすきです", en: "I love cats." },
    ],
  },
];

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((g) => [g.id, g]));

export const PARTICLES = new Set(["は", "が", "を", "に", "で", "へ", "と", "も", "の", "か", "ね", "から", "まで", "よ"]);
