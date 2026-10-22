import type { GrammarLesson } from "@/lib/types";

/** N4 grammar points, in the order they are placed on the learning path. */
export const GRAMMAR_N4: GrammarLesson[] = [
  {
    id: "g4-te-kara",
    title: "〜てから — after doing",
    notes: ["Verb て-form + から means \"after doing ~\": 食べてから、出かけます (after eating, I go out)."],
    examples: [{ jp: "宿題をしてから、遊びます。", en: "I play after doing my homework." }],
    sentences: [
      { tiles: ["宿題", "を", "してから", "遊びます"], kana: "しゅくだいをしてからあそびます", en: "I play after doing my homework." },
      { tiles: ["手", "を", "洗ってから", "食べます"], kana: "てをあらってからたべます", en: "I eat after washing my hands." },
      { tiles: ["日本", "に", "来てから", "二年", "です"], kana: "にほんにきてからにねんです", en: "It has been two years since I came to Japan." },
    ],
  },
  {
    id: "g4-nakereba",
    title: "〜なければなりません — must",
    notes: [
      "Negative stem + なければなりません means \"must\": 行かなければなりません (I must go).",
      "In casual speech, 〜なきゃいけない is common.",
    ],
    examples: [{ jp: "明日は早く起きなければなりません。", en: "I must get up early tomorrow." }],
    sentences: [
      { tiles: ["明日", "は", "早く", "起きなければ", "なりません"], kana: "あしたははやくおきなければなりません", en: "I must get up early tomorrow." },
      { tiles: ["薬", "を", "飲まなければ", "なりません"], kana: "くすりをのまなければなりません", en: "I have to take the medicine." },
      { tiles: ["宿題", "を", "しなければ", "なりません"], kana: "しゅくだいをしなければなりません", en: "I have to do my homework." },
      { tiles: ["ここ", "に", "名前", "を", "書かなければ", "なりません"], kana: "ここになまえをかかなければなりません", en: "You must write your name here." },
    ],
  },
  {
    id: "g4-potential",
    title: "Potential form — can do",
    notes: [
      "Ichidan verbs: drop る and add られる: 食べる → 食べられる (can eat).",
      "Godan verbs: change the final u sound to e and add る: 書く → 書ける (can write).",
    ],
    examples: [{ jp: "寿司が食べられますか。", en: "Can you eat sushi?" }],
    sentences: [
      { tiles: ["わたし", "は", "寿司", "が", "食べられます"], kana: "わたしはすしがたべられます", en: "I can eat sushi." },
      { tiles: ["日本語", "が", "話せます"], kana: "にほんごがはなせます", en: "I can speak Japanese." },
      { tiles: ["漢字", "が", "読めません"], kana: "かんじがよめません", en: "I can't read kanji." },
      { tiles: ["一人", "で", "行けます", "か"], kana: "ひとりでいけますか", en: "Can you go alone?" },
    ],
  },
  {
    id: "g4-tekureru",
    title: "〜てあげる / もらう / くれる — favours",
    notes: [
      "Verb て-form + あげます: I do it for someone. もらいます: I receive the favour. くれます: someone does it for me.",
    ],
    examples: [{ jp: "母に料理を作ってもらいました。", en: "My mother cooked for me." }],
    sentences: [
      { tiles: ["母", "に", "料理", "を", "作って", "もらいました"], kana: "ははにりょうりをつくってもらいました", en: "My mother cooked for me." },
      { tiles: ["友だち", "に", "駅", "まで", "送って", "あげました"], kana: "ともだちにえきまでおくってあげました", en: "I took my friend to the station." },
      { tiles: ["先生", "が", "説明", "して", "くれました"], kana: "せんせいがせつめいしてくれました", en: "The teacher explained it to me." },
      { tiles: ["手紙", "を", "書いて", "あげます"], kana: "てがみをかいてあげます", en: "I'll write a letter for you." },
    ],
  },
  {
    id: "g4-you-ni",
    title: "〜ようになる / 〜ようにする",
    notes: [
      "Dictionary form + ようになる: come to be able to do, or come to do. 〜ようにする: make an effort to do.",
    ],
    examples: [{ jp: "日本語が話せるようになりました。", en: "I've come to be able to speak Japanese." }],
    sentences: [
      { tiles: ["日本語", "が", "話せる", "ようになりました"], kana: "にほんごがはなせるようになりました", en: "I've come to be able to speak Japanese." },
      { tiles: ["毎日", "早く", "寝る", "ようにしています"], kana: "まいにちはやくねるようにしています", en: "I make an effort to go to bed early every day." },
      { tiles: ["漢字", "を", "覚える", "ようにします"], kana: "かんじをおぼえるようにします", en: "I'll try to memorize kanji." },
    ],
  },
  {
    id: "g4-mae-ato",
    title: "〜前に / 〜あとで — before and after",
    notes: ["Dictionary form + 前に: before doing. Past form + あとで: after doing."],
    examples: [{ jp: "寝る前に歯を磨きます。", en: "I brush my teeth before bed." }],
    sentences: [
      { tiles: ["寝る", "前に", "歯", "を", "磨きます"], kana: "ねるまえにはをみがきます", en: "I brush my teeth before bed." },
      { tiles: ["食べた", "あとで", "散歩", "します"], kana: "たべたあとでさんぽします", en: "I take a walk after eating." },
      { tiles: ["出かける", "前に", "連絡", "してください"], kana: "でかけるまえにれんらくしてください", en: "Please contact me before you leave." },
      { tiles: ["仕事", "が", "終わった", "あとで", "電話", "します"], kana: "しごとがおわったあとででんわします", en: "I'll call after work." },
    ],
  },
  {
    id: "g4-yori",
    title: "〜より — comparison",
    notes: ["AはBより〜です: A is more ~ than B. Use 一番 for \"the most\": 一番好き (my favourite)."],
    examples: [{ jp: "電車はバスより速いです。", en: "The train is faster than the bus." }],
    sentences: [
      { tiles: ["電車", "は", "バス", "より", "速い", "です"], kana: "でんしゃはばすよりはやいです", en: "The train is faster than the bus." },
      { tiles: ["日本", "より", "中国", "の方が", "大きい", "です"], kana: "にほんよりちゅうごくのほうがおおきいです", en: "China is bigger than Japan." },
      { tiles: ["これ", "が", "一番", "好き", "です"], kana: "これがいちばんすきです", en: "This is my favourite." },
      { tiles: ["冬", "より", "夏", "の方が", "暑い", "です"], kana: "ふゆよりなつのほうがあついです", en: "Summer is hotter than winter." },
    ],
  },
  {
    id: "g4-sugiru",
    title: "〜すぎる — too much",
    notes: ["Verb stem or adjective stem + すぎる: 食べすぎる (eat too much), 高すぎる (too expensive)."],
    examples: [{ jp: "このケーキは甘すぎます。", en: "This cake is too sweet." }],
    sentences: [
      { tiles: ["このケーキ", "は", "甘すぎます"], kana: "このケーキはあますぎます", en: "This cake is too sweet." },
      { tiles: ["昨日", "飲みすぎた"], kana: "きのうのみすぎた", en: "I drank too much yesterday." },
      { tiles: ["テレビ", "を", "見すぎない", "でください"], kana: "テレビをみすぎないでください", en: "Please don't watch too much TV." },
    ],
  },
  {
    id: "g4-yasui-nikui",
    title: "〜やすい / 〜にくい — easy or hard to do",
    notes: ["Verb stem + やすい: easy to do. Verb stem + にくい: hard to do. 読みやすい (easy to read), 書きにくい (hard to write)."],
    examples: [{ jp: "この本は読みやすいです。", en: "This book is easy to read." }],
    sentences: [
      { tiles: ["この本", "は", "読みやすい", "です"], kana: "このほんはよみやすいです", en: "This book is easy to read." },
      { tiles: ["このペン", "は", "書きにくい", "です"], kana: "このペンはかきにくいです", en: "This pen is hard to write with." },
      { tiles: ["漢字", "は", "覚えにくい", "です"], kana: "かんじはおぼえにくいです", en: "Kanji are hard to memorize." },
    ],
  },
  {
    id: "g4-nagara",
    title: "〜ながら — while doing",
    notes: ["Verb stem + ながら: two actions at the same time. The main action comes after: 音楽を聞きながら勉強します."],
    examples: [{ jp: "音楽を聞きながら勉強します。", en: "I study while listening to music." }],
    sentences: [
      { tiles: ["音楽", "を", "聞き", "ながら", "勉強", "します"], kana: "おんがくをききながらべんきょうします", en: "I study while listening to music." },
      { tiles: ["歩き", "ながら", "電話", "します"], kana: "あるきながらでんわします", en: "I talk on the phone while walking." },
      { tiles: ["朝ご飯", "を", "食べ", "ながら", "新聞", "を", "読みます"], kana: "あさごはんをたべながらしんぶんをよみます", en: "I read the newspaper while eating breakfast." },
    ],
  },
  {
    id: "g4-bakari",
    title: "〜ばかり — just, or nothing but",
    notes: ["Past form + ばかり: have just done. 〜ばかり: nothing but, or only."],
    examples: [{ jp: "今、来たばかりです。", en: "I have just arrived." }],
    sentences: [
      { tiles: ["今", "来た", "ばかり", "です"], kana: "いまきたばかりです", en: "I have just arrived." },
      { tiles: ["ゲーム", "ばかり", "して", "いる"], kana: "ゲームばかりしている", en: "He does nothing but play games." },
      { tiles: ["さっき", "食べた", "ばかり", "です"], kana: "さっきたべたばかりです", en: "I just ate." },
    ],
  },
  {
    id: "g4-kamo",
    title: "〜かもしれない — might",
    notes: ["Plain form + かもしれない: might or maybe. 〜かもしれません is the polite form."],
    examples: [{ jp: "明日は雨が降るかもしれません。", en: "It might rain tomorrow." }],
    sentences: [
      { tiles: ["明日", "は", "雨", "が", "降る", "かもしれません"], kana: "あしたはあめがふるかもしれません", en: "It might rain tomorrow." },
      { tiles: ["彼", "は", "来ない", "かもしれません"], kana: "かれはこないかもしれません", en: "He might not come." },
      { tiles: ["遅れる", "かもしれません"], kana: "おくれるかもしれません", en: "I might be late." },
    ],
  },
  {
    id: "g4-tsumori",
    title: "〜つもり — intend to",
    notes: ["Dictionary form + つもり: I intend or plan to do. 〜ないつもり: I don't intend to."],
    examples: [{ jp: "来年、日本へ行くつもりです。", en: "I plan to go to Japan next year." }],
    sentences: [
      { tiles: ["来年", "日本", "へ", "行く", "つもり", "です"], kana: "らいねんにほんへいくつもりです", en: "I plan to go to Japan next year." },
      { tiles: ["今夜", "は", "早く", "寝る", "つもり", "です"], kana: "こんやははやくねるつもりです", en: "I intend to go to bed early tonight." },
      { tiles: ["勉強", "しない", "つもり", "です"], kana: "べんきょうしないつもりです", en: "I don't plan to study." },
    ],
  },
  {
    id: "g4-hou-ga",
    title: "〜方がいい — you should",
    notes: ["Plain past form + ほうがいい gives advice: 早く寝たほうがいいです (you should go to bed early)."],
    examples: [{ jp: "薬を飲んだほうがいいです。", en: "You should take the medicine." }],
    sentences: [
      { tiles: ["早く", "寝た", "ほうが", "いい", "です"], kana: "はやくねたほうがいいです", en: "You should go to bed early." },
      { tiles: ["薬", "を", "飲んだ", "ほうが", "いい", "です"], kana: "くすりをのんだほうがいいです", en: "You should take the medicine." },
      { tiles: ["病院", "へ", "行った", "ほうが", "いい", "です"], kana: "びょういんへいったほうがいいです", en: "You should see a doctor." },
    ],
  },
  {
    id: "g4-te-oku",
    title: "〜ておく — do in advance",
    notes: ["Verb て-form + おく: do something in advance, or leave something as it is: 買っておく (buy in advance)."],
    examples: [{ jp: "ドアを開けておいてください。", en: "Please leave the door open." }],
    sentences: [
      { tiles: ["明日", "の", "準備", "を", "しておきます"], kana: "あしたのじゅんびをしておきます", en: "I'll prepare for tomorrow in advance." },
      { tiles: ["ドア", "を", "開けておいて", "ください"], kana: "ドアをあけておいてください", en: "Please leave the door open." },
      { tiles: ["切符", "を", "買っておきました"], kana: "きっぷをかっておきました", en: "I bought the ticket in advance." },
    ],
  },
  {
    id: "g4-to-iu",
    title: "〜と言う — said that",
    notes: ["Plain form + と言いました reports what someone said. 〜と言っていました is the reported form for an earlier statement."],
    examples: [{ jp: "先生は明日テストがあると言いました。", en: "The teacher said there is a test tomorrow." }],
    sentences: [
      { tiles: ["先生", "は", "明日", "テスト", "が", "ある", "と", "言いました"], kana: "せんせいはあしたてすとがあるといいました", en: "The teacher said there is a test tomorrow." },
      { tiles: ["彼", "は", "来る", "と", "言いました"], kana: "かれはくるといいました", en: "He said he would come." },
      { tiles: ["母", "は", "もう", "寝る", "と", "言っていました"], kana: "はははもうねるといっていました", en: "My mother said she was going to bed." },
    ],
  },
];
