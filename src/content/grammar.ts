import type { GrammarLesson } from "@/lib/types";
import { GRAMMAR_N4 } from "./grammar-n4";

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
  {
    id: "g-kosoado",
    title: "この・その・あの・どの + noun",
    notes: [
      "この (this), その (that, near the listener), あの (that, over there) and どの (which) come before a noun: この本.",
    ],
    examples: [{ jp: "この本は高いです。", en: "This book is expensive." }],
    sentences: [
      { tiles: ["この", "本", "は", "高い", "です"], kana: "このほんはたかいです", en: "This book is expensive." },
      { tiles: ["あの", "人", "は", "先生", "です"], kana: "あのひとはせんせいです", en: "That person is a teacher." },
      { tiles: ["その", "ペン", "は", "わたし", "の", "です"], kana: "そのペンはわたしのです", en: "That pen is mine." },
      { tiles: ["どの", "傘", "が", "あなた", "の", "ですか"], kana: "どのかさがあなたのですか", en: "Which umbrella is yours?" },
    ],
  },
  {
    id: "g-counters",
    title: "Counters",
    notes: [
      "Numbers take a counter that matches the thing counted: 〜つ (general, up to ten), 〜人 (people), 〜本 (long things), 〜枚 (flat things), 〜冊 (books), 〜匹 (small animals).",
    ],
    examples: [{ jp: "りんごを三つ買いました。", en: "I bought three apples." }],
    sentences: [
      { tiles: ["りんご", "を", "三つ", "買いました"], kana: "りんごをみっつかいました", en: "I bought three apples." },
      { tiles: ["友だち", "が", "二人", "来ます"], kana: "ともだちがふたりきます", en: "Two friends are coming." },
      { tiles: ["本", "を", "一冊", "読みました"], kana: "ほんをいっさつよみました", en: "I read one book." },
      { tiles: ["ねこ", "が", "三匹", "います"], kana: "ねこがさんびきいます", en: "There are three cats." },
    ],
  },
  {
    id: "g-question-words",
    title: "Question words",
    notes: [
      "何 (なに/なん) what, 誰 (だれ) who, どこ where, いつ when, どう how, なぜ or どうして why.",
      "Put the question word where the answer would go. か at the end turns a statement into a question.",
    ],
    examples: [{ jp: "これは何ですか。", en: "What is this?" }],
    sentences: [
      { tiles: ["これ", "は", "何", "です", "か"], kana: "これはなんですか", en: "What is this?" },
      { tiles: ["どこ", "へ", "行き", "ます", "か"], kana: "どこへいきますか", en: "Where are you going?" },
      { tiles: ["いつ", "来ます", "か"], kana: "いつきますか", en: "When will you come?" },
      { tiles: ["だれ", "と", "行きました", "か"], kana: "だれといきましたか", en: "Who did you go with?" },
    ],
  },
  {
    id: "g-deshita",
    title: "でした — past of です",
    notes: [
      "The past of です is でした. The negative past is じゃありませんでした.",
    ],
    examples: [{ jp: "昨日は雨でした。", en: "It rained yesterday." }],
    sentences: [
      { tiles: ["昨日", "は", "雨", "でした"], kana: "きのうはあめでした", en: "It rained yesterday." },
      { tiles: ["わたし", "は", "学生", "じゃ", "ありませんでした"], kana: "わたしはがくせいじゃありませんでした", en: "I was not a student." },
      { tiles: ["日曜日", "は", "休み", "でした"], kana: "にちようびはやすみでした", en: "Sunday was a day off." },
    ],
  },
  {
    id: "g-adj-past",
    title: "Past and negative of adjectives",
    notes: [
      "い-adjectives: drop い and add かった (past) or くない (negative): 高い → 高かった, 高くない.",
      "な-adjectives use でした and じゃありません: 静か → 静かでした.",
    ],
    examples: [{ jp: "映画はおもしろかったです。", en: "The movie was interesting." }],
    sentences: [
      { tiles: ["映画", "は", "おもしろかった", "です"], kana: "えいがはおもしろかったです", en: "The movie was interesting." },
      { tiles: ["今日", "は", "寒くない", "です"], kana: "きょうはさむくないです", en: "Today is not cold." },
      { tiles: ["部屋", "は", "静か", "でした"], kana: "へやはしずかでした", en: "The room was quiet." },
      { tiles: ["料理", "は", "おいしく", "なかった", "です"], kana: "りょうりはおいしくなかったです", en: "The food was not delicious." },
    ],
  },
  {
    id: "g-teiru",
    title: "〜ています — doing now, or a state",
    notes: [
      "Verb て-form + います shows an action in progress: 食べています (is eating).",
      "It also describes a state that follows a change: 住んでいます (lives), 知っています (knows).",
    ],
    examples: [{ jp: "今、本を読んでいます。", en: "I am reading a book now." }],
    sentences: [
      { tiles: ["今", "本", "を", "読んで", "います"], kana: "いまほんをよんでいます", en: "I am reading a book now." },
      { tiles: ["雨", "が", "降って", "います"], kana: "あめがふっています", en: "It is raining." },
      { tiles: ["友だち", "は", "日本語", "を", "勉強", "して", "います"], kana: "ともだちはにほんごをべんきょうしています", en: "My friend is studying Japanese." },
      { tiles: ["わたし", "は", "東京", "に", "住んで", "います"], kana: "わたしはとうきょうにすんでいます", en: "I live in Tokyo." },
    ],
  },
  {
    id: "g-mashou",
    title: "〜ましょう — let's",
    notes: [
      "Verb stem + ましょう suggests doing something together: 行きましょう (let's go).",
      "Yes: はい、行きましょう. Politely declining: すみません、ちょっと…",
    ],
    examples: [{ jp: "いっしょにご飯を食べましょう。", en: "Let's eat together." }],
    sentences: [
      { tiles: ["いっしょに", "映画", "を", "見ましょう"], kana: "いっしょにえいがをみましょう", en: "Let's watch a movie together." },
      { tiles: ["少し", "休みましょう"], kana: "すこしやすみましょう", en: "Let's take a short break." },
      { tiles: ["もう", "帰りましょう"], kana: "もうかえりましょう", en: "Let's go home now." },
      { tiles: ["どこ", "で", "会いましょう", "か"], kana: "どこであいましょうか", en: "Where shall we meet?" },
    ],
  },
  {
    id: "g-yo-ne",
    title: "よ and ね — sentence endings",
    notes: [
      "よ tells the listener something new, or gives a firm opinion.",
      "ね asks for agreement or shares a feeling: いい天気ですね (nice weather, isn't it?).",
    ],
    examples: [{ jp: "駅はあそこですよ。", en: "The station is over there, you know." }],
    sentences: [
      { tiles: ["いい", "天気", "です", "ね"], kana: "いいてんきですね", en: "Nice weather, isn't it?" },
      { tiles: ["駅", "は", "あそこ", "です", "よ"], kana: "えきはあそこですよ", en: "The station is over there." },
      { tiles: ["もう", "十時", "です", "よ"], kana: "もうじゅうじですよ", en: "It's already ten o'clock." },
    ],
  },
  {
    id: "g-ni-iku",
    title: "Verb stem + に行きます — going to do",
    notes: ["Verb stem + に行きます means “go to do something”: 買い物に行きます (I am going shopping)."],
    examples: [{ jp: "映画を見に行きます。", en: "I am going to see a movie." }],
    sentences: [
      { tiles: ["買い物", "に", "行きます"], kana: "かいものにいきます", en: "I am going shopping." },
      { tiles: ["映画", "を", "見", "に", "行きます"], kana: "えいがをみにいきます", en: "I am going to see a movie." },
      { tiles: ["ご飯", "を", "食べ", "に", "来ました"], kana: "ごはんをたべにきました", en: "I came to eat." },
      { tiles: ["友だち", "に", "会い", "に", "行きます"], kana: "ともだちにあいにいきます", en: "I am going to meet a friend." },
    ],
  },
  {
    id: "g-agemasu",
    title: "あげます / もらいます / くれます — giving and receiving",
    notes: [
      "あげます: I give to someone else. もらいます: I receive from someone. くれます: someone gives to me.",
      "Mark the giver with に or から: 友だちに本をもらいました.",
    ],
    examples: [{ jp: "母が花をくれました。", en: "My mother gave me flowers." }],
    sentences: [
      { tiles: ["わたし", "は", "友だち", "に", "本", "を", "あげました"], kana: "わたしはともだちにほんをあげました", en: "I gave a book to my friend." },
      { tiles: ["友だち", "に", "本", "を", "もらいました"], kana: "ともだちにほんをもらいました", en: "I received a book from my friend." },
      { tiles: ["先生", "が", "辞書", "を", "くれました"], kana: "せんせいがじしょをくれました", en: "The teacher gave me a dictionary." },
      { tiles: ["これ", "は", "あなた", "に", "あげます"], kana: "これはあなたにあげます", en: "I'll give this to you." },
    ],
  },
  {
    id: "g-kara",
    title: "〜から — because",
    notes: [
      "〜から after a statement gives the reason: 時間がないから、行けません (I have no time, so I can't go).",
    ],
    examples: [{ jp: "忙しいから、行けません。", en: "I'm busy, so I can't go." }],
    sentences: [
      { tiles: ["時間", "が", "ない", "から", "行けません"], kana: "じかんがないからいけません", en: "I have no time, so I can't go." },
      { tiles: ["寒い", "から", "コート", "を", "着ます"], kana: "さむいからコートをきます", en: "It's cold, so I'll wear a coat." },
      { tiles: ["日本語", "が", "好き", "だから", "勉強", "します"], kana: "にほんごがすきだからべんきょうします", en: "I like Japanese, so I study it." },
      { tiles: ["疲れた", "から", "休みます"], kana: "つかれたからやすみます", en: "I'm tired, so I'll rest." },
    ],
  },
  {
    id: "g-omoimasu",
    title: "〜と思います — I think",
    notes: [
      "Plain form + と思います gives an opinion: 明日は雨だと思います (I think it will rain tomorrow).",
      "The negative is 〜ないと思います (I don't think).",
    ],
    examples: [{ jp: "彼は来ないと思います。", en: "I don't think he'll come." }],
    sentences: [
      { tiles: ["明日", "は", "雨", "だと", "思います"], kana: "あしたはあめだとおもいます", en: "I think it will rain tomorrow." },
      { tiles: ["これ", "は", "おいしい", "と", "思います"], kana: "これはおいしいとおもいます", en: "I think this is delicious." },
      { tiles: ["彼", "は", "来ない", "と", "思います"], kana: "かれはこないとおもいます", en: "I don't think he will come." },
    ],
  },
  {
    id: "g-kedo",
    title: "〜けど — but",
    notes: ["けど (casual) and けれど (polite) join two statements: 行きたいけど、行けません (I want to go, but I can't)."],
    examples: [{ jp: "高いけど、おいしいです。", en: "It's expensive, but it's delicious." }],
    sentences: [
      { tiles: ["行きたい", "けど", "行けません"], kana: "いきたいけどいけません", en: "I want to go, but I can't." },
      { tiles: ["寒い", "けど", "がんばります"], kana: "さむいけどがんばります", en: "It's cold, but I'll do my best." },
      { tiles: ["安い", "けど", "品質", "は", "いい", "です"], kana: "やすいけどひんしつはいいです", en: "It's cheap, but the quality is good." },
    ],
  },
  {
    id: "g-masen-ka",
    title: "〜ませんか — would you like to",
    notes: ["Verb stem + ませんか invites politely: 一緒に行きませんか (won't you go together?)."],
    examples: [{ jp: "コーヒーを飲みませんか。", en: "Would you like some coffee?" }],
    sentences: [
      { tiles: ["コーヒー", "を", "飲みません", "か"], kana: "コーヒーをのみませんか", en: "Would you like some coffee?" },
      { tiles: ["明日", "いっしょに", "映画", "を", "見ませんか"], kana: "あしたいっしょにえいがをみませんか", en: "Would you like to watch a movie with me tomorrow?" },
      { tiles: ["ちょっと", "休みませんか"], kana: "ちょっとやすみませんか", en: "Shall we take a short break?" },
    ],
  },
];

export const GRAMMAR_BY_ID = new Map([...GRAMMAR, ...GRAMMAR_N4].map((g) => [g.id, g]));

export const PARTICLES = new Set(["は", "が", "を", "に", "で", "へ", "と", "も", "の", "か", "ね", "から", "まで", "よ"]);
