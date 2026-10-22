/** Short dialogues: the learner hears the other characters, picks what to say, then answers questions about the story. */

export interface StoryLine {
  type: "line";
  speaker: string;
  jp: string;
  /** Full reading in hiragana or katakana, used for audio. */
  kana: string;
  en: string;
}

export interface StoryOption {
  jp: string;
  kana: string;
  en: string;
  correct: boolean;
  /** Shown after the option is picked: why it fits, or what is wrong with it. */
  feedback: string;
}

export interface StoryReply {
  type: "reply";
  /** What the learner should say, in English. */
  prompt: string;
  options: StoryOption[];
}

export interface StoryQuestion {
  question: string;
  options: string[];
  /** Index into options. */
  answer: number;
}

export interface Story {
  id: string;
  title: string;
  setting: string;
  level: "n5" | "n4";
  steps: (StoryLine | StoryReply)[];
  questions: StoryQuestion[];
}

const line = (speaker: string, jp: string, kana: string, en: string): StoryLine => ({ type: "line", speaker, jp, kana, en });
const right = (jp: string, kana: string, en: string, feedback: string): StoryOption => ({ jp, kana, en, correct: true, feedback });
const wrong = (jp: string, kana: string, en: string, feedback: string): StoryOption => ({ jp, kana, en, correct: false, feedback });
const reply = (prompt: string, ...options: StoryOption[]): StoryReply => ({ type: "reply", prompt, options });
const ask = (question: string, options: string[], answer: number): StoryQuestion => ({ question, options, answer });

export const STORIES: Story[] = [
  {
    id: "n5-konbini",
    title: "コンビニで",
    setting: "Buying lunch at a convenience store",
    level: "n5",
    steps: [
      line("Clerk", "いらっしゃいませ。", "いらっしゃいませ", "Welcome!"),
      line("Clerk", "お弁当は温めますか。", "おべんとうはあたためますか", "Shall I warm up your bento?"),
      reply(
        "Say yes, please.",
        right("はい、お願いします。", "はいおねがいします", "Yes, please.", "お願いします is the polite way to accept a service."),
        wrong("いいえ、結構です。", "いいえけっこうです", "No, that's fine.", "This declines the offer. You want it warmed."),
        wrong("ありがとう。", "ありがとう", "Thanks.", "Thanks does not answer the question. Answer with はい or いいえ first."),
      ),
      line("Clerk", "袋はいりますか。", "ふくろはいりますか", "Do you need a bag?"),
      reply(
        "Say no, you don't need one.",
        right("いいえ、いりません。", "いいえいりません", "No, I don't need one.", "いりません is the polite negative of いります (to need)."),
        wrong("はい、いります。", "はいいります", "Yes, I need one.", "はい means yes. You are refusing the bag."),
        wrong("いいえ、いります。", "いいえいります", "No, I need one.", "いります means 'I need it'. For 'I don't need it', use いりません."),
      ),
      line("Clerk", "合計は六百五十円です。", "ごうけいはろっぴゃくごじゅうえんです", "The total is 650 yen."),
      line("Clerk", "ありがとうございました。", "ありがとうございました", "Thank you very much."),
    ],
    questions: [
      ask("What did the customer say about the bento?", ["Did not want it warmed", "Wanted it warmed", "Asked for a spoon", "Paid in advance"], 1),
      ask("How much is the total?", ["580 yen", "650 yen", "1,000 yen", "500 yen"], 1),
    ],
  },
  {
    id: "n5-restaurant",
    title: "レストランで",
    setting: "Ordering at a family restaurant",
    level: "n5",
    steps: [
      line("Waiter", "いらっしゃいませ。何名様ですか。", "いらっしゃいませなんめいさまですか", "Welcome! How many people?"),
      reply(
        "Say there are two of you.",
        right("二人です。", "ふたりです", "There are two of us.", "人 counts people, and 二人 is read ふたり."),
        wrong("二つです。", "ふたつです", "Two (things).", "つ counts things in general, not people."),
        wrong("二本です。", "にほんです", "Two (long things).", "本 counts long objects such as bottles and pens."),
      ),
      line("Waiter", "ご注文はお決まりですか。", "ごちゅうもんはおきまりですか", "Have you decided on your order?"),
      reply(
        "Order one hamburger steak, please.",
        right("ハンバーグを一つください。", "はんばーぐをひとつください", "One hamburger steak, please.", "〜をください asks for something you want."),
        wrong("ハンバーグを食べます。", "はんばーぐをたべます", "I eat a hamburger steak.", "This is a statement about eating, not an order."),
        wrong("ハンバーグはどこですか。", "はんばーぐはどこですか", "Where is the hamburger steak?", "どこ asks for a place. You want to order it."),
      ),
      line("Waiter", "お飲み物はいかがですか。", "おのみものはいかがですか", "Would you like something to drink?"),
      line("Waiter", "少々お待ちください。", "しょうしょうおまちください", "Please wait a moment."),
      line("Waiter", "お待たせしました。ハンバーグです。", "おまたせしましたはんばーぐです", "Sorry to keep you waiting. Here is your hamburger steak."),
    ],
    questions: [
      ask("How many people are in the party?", ["One", "Two", "Three", "Four"], 1),
      ask("What did the customer order?", ["Hamburger steak", "Curry", "Ramen", "Only water"], 0),
    ],
  },
  {
    id: "n5-directions",
    title: "道を聞く",
    setting: "Asking a passer-by for directions to the station",
    level: "n5",
    steps: [
      reply(
        "Ask where the station is.",
        right("駅はどこですか。", "えきはどこですか", "Where is the station?", "どこ asks for a place."),
        wrong("駅は何ですか。", "えきはなんですか", "What is the station?", "何 asks what something is. You need a place."),
        wrong("駅へ行きますか。", "えきへいきますか", "Are you going to the station?", "This asks about their plans, not where the station is."),
      ),
      line("Passer-by", "まっすぐ行ってください。", "まっすぐいってください", "Please go straight."),
      line("Passer-by", "二つ目の角を右に曲がってください。", "ふたつめのかどをみぎにまがってください", "Turn right at the second corner."),
      line("Passer-by", "駅は銀行の隣です。", "えきはぎんこうのとなりです", "The station is next to the bank."),
      reply(
        "Thank the passer-by.",
        right("ありがとうございます。", "ありがとうございます", "Thank you.", "ありがとうございます is the polite way to say thank you."),
        wrong("さようなら。", "さようなら", "Goodbye.", "さようなら is goodbye, used when parting, not for thanks."),
        wrong("いただきます。", "いただきます", "Let's eat (said before a meal).", "いただきます is said before eating, not for thanks."),
      ),
      line("Passer-by", "どういたしまして。", "どういたしまして", "You're welcome."),
    ],
    questions: [
      ask("Which corner should you turn at?", ["The first", "The second", "The third", "The last"], 1),
      ask("Where is the station?", ["Across from a school", "Next to the bank", "Behind the post office", "Past the park"], 1),
    ],
  },
  {
    id: "n5-introduction",
    title: "自己紹介",
    setting: "Your first day at a Japanese class",
    level: "n5",
    steps: [
      line("Teacher", "はじめまして。どこから来ましたか。", "はじめましてどこからきましたか", "Nice to meet you. Where did you come from?"),
      reply(
        "Say you came from America.",
        right("アメリカから来ました。", "あめりかからきました", "I came from America.", "から marks the starting point. 来ました is the past of 来ます (to come)."),
        wrong("アメリカに来ました。", "あめりかにきました", "I came to America.", "に marks the destination. For 'from', use から."),
        wrong("アメリカへ行きました。", "あめりかへいきました", "I went to America.", "行きました means you went there, not that you came from there."),
      ),
      line("Teacher", "よろしくお願いします。", "よろしくおねがいします", "Nice to meet you. (Please treat me well.)"),
      line("Friend", "日本語が上手ですね。", "にほんごがじょうずですね", "Your Japanese is good, isn't it?"),
      reply(
        "Say you are still studying.",
        right("まだ勉強中です。", "まだべんきょうちゅうです", "I'm still studying.", "まだ means 'still', and 勉強中 means 'in the middle of studying'."),
        wrong("もう上手です。", "もうじょうずです", "I'm already good.", "もう means 'already'. This sounds like you think you have finished learning."),
        wrong("日本語は嫌いです。", "にほんごはきらいです", "I don't like Japanese.", "This says the opposite of what you mean."),
      ),
      line("Friend", "一緒に勉強しましょう。", "いっしょにべんきょうしましょう", "Let's study together."),
    ],
    questions: [
      ask("Where did the learner come from?", ["Japan", "America", "The station", "The teacher's house"], 1),
      ask("How does the learner describe their Japanese?", ["It is perfect", "They are still studying", "They don't like it", "They have no time"], 1),
    ],
  },
  {
    id: "n5-clothes",
    title: "服を買う",
    setting: "Looking for a jacket in a clothing shop",
    level: "n5",
    steps: [
      line("Clerk", "何かお探しですか。", "なにかおさがしですか", "Are you looking for anything?"),
      reply(
        "Say you're looking for a jacket.",
        right("ジャケットを探しています。", "じゃけっとをさがしています", "I'm looking for a jacket.", "探しています means 'am looking for', an action in progress."),
        wrong("ジャケットを買いました。", "じゃけっとをかいました", "I bought a jacket.", "買いました is the past tense of 'buy'. You have not bought it yet."),
        wrong("ジャケットを売っています。", "じゃけっとをうっています", "A jacket is being sold.", "売っています means someone is selling it. You are the one looking."),
      ),
      line("Clerk", "こちらはいかがですか。", "こちらはいかがですか", "How about this one?"),
      line("Clerk", "色は青と黒があります。", "いろはあおとくろがあります", "It comes in blue and black."),
      reply(
        "Ask if you can try it on.",
        right("試着してもいいですか。", "しちゃくしてもいいですか", "May I try it on?", "〜てもいいですか asks permission. 試着 means trying clothes on."),
        wrong("試着が好きです。", "しちゃくがすきです", "I like trying things on.", "This states a like, not a request to try it on."),
        wrong("試着しました。", "しちゃくしました", "I tried it on.", "This says you already tried it on. Ask first."),
      ),
      line("Clerk", "どうぞ。鏡はあちらです。", "どうぞかがみはあちらです", "Please go ahead. The mirror is over there."),
      reply(
        "Say you'll take it.",
        right("これをください。", "これをください", "I'll take this, please.", "〜をください is the usual way to say you want to buy something."),
        wrong("これはいくらですか。", "これはいくらですか", "How much is this?", "This asks the price. You are ready to buy, so say you'll take it."),
        wrong("これは高いです。", "これはたかいです", "This is expensive.", "This comments on the price, but does not say you will buy it."),
      ),
    ],
    questions: [
      ask("What colours does the jacket come in?", ["Red and white", "Blue and black", "Green and brown", "Only black"], 1),
      ask("What does the learner ask before trying it on?", ["Where to pay", "If they may try it on", "What size it is", "How much it costs"], 1),
    ],
  },
  {
    id: "n5-ticket",
    title: "切符を買う",
    setting: "Buying a train ticket at the station",
    level: "n5",
    steps: [
      line("Staff", "どちらまでですか。", "どちらまでですか", "Where to?"),
      reply(
        "Say one adult ticket to Yokohama, please.",
        right("横浜まで大人一枚ください。", "よこはままでおとないちまいください", "One adult ticket to Yokohama, please.", "〜まで marks the destination. 一枚 counts flat things such as tickets."),
        wrong("横浜へ大人二枚。", "よこはまへおとなにまい", "Yokohama, two adults.", "Two tickets is the wrong number. Ask with ください to be polite."),
        wrong("横浜は大人一枚です。", "よこはまはおとないちまいです", "Yokohama is one adult.", "です says what something is. Here you are asking for a ticket."),
      ),
      line("Staff", "千二百円です。", "せんにひゃくえんです", "That's 1,200 yen."),
      reply(
        "Ask which platform the train leaves from.",
        right("何番線ですか。", "なんばんせんですか", "Which platform is it?", "番線 is the platform number. 何番線 asks which one."),
        wrong("何時ですか。", "なんじですか", "What time is it?", "何時 asks the time. You want the platform."),
        wrong("どこへ行きますか。", "どこへいきますか", "Where are you going?", "This asks the traveller's destination. You need to ask about the platform."),
      ),
      line("Staff", "三番線です。電車は十分後に来ます。", "さんばんせんですでんしゃはじゅっぷんごにきます", "It's platform 3. The train comes in ten minutes."),
      line("Staff", "いってらっしゃい。", "いってらっしゃい", "Have a good trip."),
    ],
    questions: [
      ask("How much is the ticket?", ["120 yen", "1,200 yen", "2,400 yen", "It is free"], 1),
      ask("Which platform does the train leave from?", ["Platform 1", "Platform 2", "Platform 3", "Platform 10"], 2),
    ],
  },
  {
    id: "n4-doctor",
    title: "病院で",
    setting: "Visiting a clinic with a cold",
    level: "n4",
    steps: [
      line("Doctor", "どうしましたか。", "どうしましたか", "What's the matter?"),
      reply(
        "Say you've had a headache and a fever since yesterday.",
        right("昨日から頭が痛くて、熱があります。", "きのうからあたまがいたくてねつがあります", "I've had a headache and a fever since yesterday.", "から means 'since'. 〜くて joins two descriptions: headache and fever."),
        wrong("昨日から頭を痛いです。", "きのうからあたまをいたいです", "My head is painful since yesterday.", "痛い is an adjective, so the subject takes が, not を."),
        wrong("昨日、頭が痛かったから来ました。", "きのうあたまがいたかったからきました", "I came yesterday because my head hurt.", "This is about one past day and a reason. Say how long it has lasted."),
      ),
      line("Doctor", "熱を測りましょう。", "ねつをはかりましょう", "Let's take your temperature."),
      line("Doctor", "三十八度あります。風邪ですね。", "さんじゅうはちどありますかぜですね", "It's 38 degrees. It's a cold, isn't it?"),
      reply(
        "Ask if you should take medicine.",
        right("薬を飲んだほうがいいですか。", "くすりをのんだほうがいいですか", "Should I take medicine?", "〜たほうがいいですか asks for advice: would it be better to…?"),
        wrong("薬を飲みたいです。", "くすりをのみたいです", "I want to take medicine.", "This says what you want, not what you should do. Ask for advice instead."),
        wrong("薬を飲みましたか。", "くすりをのみましたか", "Did you take medicine?", "This asks about the past. The question is about what to do now."),
      ),
      line("Doctor", "はい、薬を出します。今日は早く寝てください。", "はいくすりをだしますきょうははやくねてください", "Yes, I'll prescribe medicine. Please go to bed early today."),
      line("Doctor", "お大事に。", "おだいじに", "Take care of yourself."),
    ],
    questions: [
      ask("Since when has the patient had the fever?", ["Today", "Since yesterday", "For a week", "Since last month"], 1),
      ask("What does the doctor advise?", ["Go to work early", "Go to bed early", "Drink more coffee", "Exercise every day"], 1),
    ],
  },
  {
    id: "n4-trip",
    title: "旅行の計画",
    setting: "Planning a weekend trip with a friend",
    level: "n4",
    steps: [
      line("Friend", "今度の週末、どこかへ行きませんか。", "こんどのしゅうまつどこかへいきませんか", "Shall we go somewhere this weekend?"),
      reply(
        "Say you'd like to go to the mountains.",
        right("山へ行きたいです。", "やまへいきたいです", "I'd like to go to the mountains.", "〜たいです means 'want to'. へ marks the direction of travel."),
        wrong("山を行きたいです。", "やまをいきたいです", "I want to go through the mountains.", "行く takes へ or に for the destination, not を."),
        wrong("山へ行ったことがあります。", "やまへいったことがあります", "I have been to the mountains.", "This describes an experience you already have. It does not express a wish to go."),
      ),
      line("Friend", "いいですね。どこに泊まるつもりですか。", "いいですねどこにとまるつもりですか", "Sounds good. Where do you plan to stay?"),
      reply(
        "Say you plan to stay at a traditional inn (ryokan).",
        right("旅館に泊まるつもりです。", "りょかんにとまるつもりです", "I plan to stay at a ryokan.", "〜つもりです means a plan you have already decided on."),
        wrong("旅館に泊まるかもしれません。", "りょかんにとまるかもしれません", "I might stay at a ryokan.", "かもしれません means 'might'. That is uncertain, not a plan."),
        wrong("旅館に泊まってから帰ります。", "りょかんにとまってからかえります", "I'll go home after staying at a ryokan.", "〜てから means 'after doing'. It does not say you plan to stay there."),
      ),
      line("Friend", "雨が降ったら、どうしましょうか。", "あめがふったらどうしましょうか", "What shall we do if it rains?"),
      line("Friend", "美術館に行きましょう。", "びじゅつかんにいきましょう", "Let's go to an art museum, then."),
      line("Friend", "電車で行くのがいいと思います。", "でんしゃでいくのがいいとおもいます", "I think going by train is best."),
    ],
    questions: [
      ask("Where does the learner want to go?", ["The sea", "The mountains", "The city", "A museum only"], 1),
      ask("What does the friend suggest if it rains?", ["Go to the beach", "Go to a museum", "Stay home", "Cancel the trip"], 1),
    ],
  },
  {
    id: "n4-notes",
    title: "ノートを借りる",
    setting: "Borrowing notes from a classmate",
    level: "n4",
    steps: [
      line("Classmate", "昨日の授業、休んだね。", "きのうのじゅぎょうやすんだね", "You missed yesterday's class, didn't you?"),
      reply(
        "Ask if you can see their notes.",
        right("ノートを見せてもらえませんか。", "のーとをみせてもらえませんか", "Would you mind letting me see your notes?", "〜てもらえませんか is a polite request for a favour."),
        wrong("ノートを見せてあげませんか。", "のーとをみせてあげませんか", "Shall I show you my notes?", "あげる means giving to someone else. This offers your notes, the opposite of what you want."),
        wrong("ノートを見ましたか。", "のーとをみましたか", "Did you look at the notes?", "This asks whether they looked, not a request to see the notes."),
      ),
      line("Classmate", "いいよ。でも、明日返してね。", "いいよでもあしたかえしてね", "Sure. But give them back tomorrow."),
      line("Classmate", "漢字も教えてあげようか。", "かんじもおしえてあげようか", "Shall I teach you the kanji too?"),
      reply(
        "Say thank you and ask them to teach you.",
        right("ありがとう。教えてください。", "ありがとうおしえてください", "Thanks. Please teach me.", "〜てください asks someone to do something for you."),
        wrong("ありがとう。教えてあげます。", "ありがとうおしえてあげます", "Thanks. I'll teach you.", "This makes you the teacher. Ask them to teach you instead."),
        wrong("ありがとう。教えましょう。", "ありがとうおしえましょう", "Thanks. Let's teach.", "教えましょう is an offer from you. To ask for help, use 〜てください."),
      ),
      line("Classmate", "今日、図書館で一緒に勉強しませんか。", "きょうとしょかんでいっしょにべんきょうしませんか", "Shall we study together at the library today?"),
    ],
    questions: [
      ask("Why did the learner need the notes?", ["They missed a class", "They lost their notebook", "They are the teacher", "They wanted to go home"], 0),
      ask("What else does the classmate offer?", ["Help with kanji", "Cooking", "A ride home", "Money"], 0),
    ],
  },
  {
    id: "n4-wallet",
    title: "財布をなくした",
    setting: "Reporting a lost wallet at a station",
    level: "n4",
    steps: [
      line("Staff", "どうしましたか。", "どうしましたか", "What happened?"),
      reply(
        "Say you left your wallet on the train.",
        right("電車に財布を忘れてしまいました。", "でんしゃにさいふをわすれてしまいました", "I left my wallet on the train, unfortunately.", "〜てしまいました shows that something regrettable happened. 忘れる means 'to leave behind' or 'forget'."),
        wrong("電車で財布を買ってしまいました。", "でんしゃでさいふをかってしまいました", "I bought a wallet on the train, unfortunately.", "買う means 'to buy'. The verb is wrong here."),
        wrong("電車に財布を忘れましょう。", "でんしゃにさいふをわすれましょう", "Let's forget the wallet on the train.", "忘れましょう means 'let's forget'. You need the past form with てしまいました."),
      ),
      line("Staff", "何色の財布ですか。", "なにいろのさいふですか", "What colour is the wallet?"),
      reply(
        "Ask them to call you if it is found.",
        right("見つかったら、連絡してください。", "みつかったられんらくしてください", "If it's found, please contact me.", "〜たら means 'if' or 'when'. 〜てください asks someone to do something."),
        wrong("見つけたら、連絡します。", "みつけたられんらくします", "If I find it, I'll contact them.", "This says you will find it yourself. You need to ask them to call you."),
        wrong("見つかって、連絡しました。", "みつかってれんらくしました", "It was found, and I contacted them.", "This says it is already found and you already called. You need a request for the future."),
      ),
      line("Staff", "わかりました。見つかったらご連絡します。", "わかりましたみつかったらごれんらくします", "Understood. If it's found, we'll contact you."),
      line("Staff", "電話番号を教えてください。", "でんわばんごうをおしえてください", "Please tell me your phone number."),
    ],
    questions: [
      ask("Where did the learner lose the wallet?", ["At home", "On the train", "In a shop", "At school"], 1),
      ask("What will the staff do if the wallet is found?", ["Contact the learner", "Throw it away", "Keep it forever", "Nothing"], 0),
    ],
  },
  {
    id: "n4-party",
    title: "週末のパーティー",
    setting: "A classmate invites you to a party",
    level: "n4",
    steps: [
      line("Classmate", "土曜日、うちでパーティーをするんだけど、来ない？", "どようびうちでぱーてぃーをするんだけどこない", "I'm having a party at my place on Saturday. Want to come?"),
      reply(
        "Say you'd love to come, and thank them.",
        right("ぜひ行きたいです。ありがとうございます。", "ぜひいきたいですありがとうございます", "I'd love to come. Thank you.", "ぜひ means 'definitely'. Thank them for the invitation."),
        wrong("行きたくないです。", "いきたくないです", "I don't want to go.", "This refuses the invitation. Accept politely."),
        wrong("行かなければなりません。", "いかなければなりません", "I have to go.", "This means you are obliged to go. It sounds like a chore, not an invitation."),
      ),
      line("Classmate", "よかった！飲み物を持ってきてくれる？", "よかったのみものをもってきてくれる", "Great! Could you bring some drinks?"),
      reply(
        "Say you'll bring some juice to their place.",
        right("ジュースを持っていきます。", "じゅーすをもっていきます", "I'll take some juice there.", "持っていく means taking something to where you are going."),
        wrong("ジュースを持ってきます。", "じゅーすをもってきます", "I'll bring some juice here.", "持ってくる means bringing it to where you are now. You are going to their home, so use 持っていく."),
        wrong("ジュースを飲みます。", "じゅーすをのみます", "I'll drink juice.", "This is about drinking, not bringing."),
      ),
      line("Classmate", "楽しみにしていますね。七時からだから、遅れないでね。", "たのしみにしていますねしちじからだからおくれないでね", "I'm looking forward to it. It starts at seven, so don't be late."),
      line("Classmate", "じゃあ、土曜日に！", "じゃあどようびに", "See you on Saturday!"),
    ],
    questions: [
      ask("What does the learner promise to bring?", ["Juice", "Cake", "A guitar", "Nothing"], 0),
      ask("What time does the party start?", ["Five", "Six", "Seven", "Eight"], 2),
    ],
  },
  {
    id: "n4-apartment",
    title: "部屋を探す",
    setting: "Talking to a real estate agent about a room",
    level: "n4",
    steps: [
      line("Agent", "どんな部屋をお探しですか。", "どんなへやをおさがしですか", "What kind of room are you looking for?"),
      reply(
        "Say the room can be small, but it must be near the station.",
        right("狭くてもいいですが、駅から近いのがいいです。", "せまくてもいいですがえきからちかいのがいいです", "It can be small, but I'd prefer one close to the station.", "〜くてもいい means 'it's fine even if'. のがいい states a preference."),
        wrong("狭いですが、駅から近いです。", "せまいですがえきからちかいです", "It's small, but it's near the station.", "This describes a room. You are stating what you want, not describing a room."),
        wrong("狭くなければいけません。駅から近いです。", "せまくなければいけませんえきからちかいです", "It must not be small. It is near the station.", "This says the room must not be small, the opposite of what you want."),
      ),
      line("Agent", "家賃は八万円までですか。", "やちんははちまんえんまでですか", "Is the rent up to 80,000 yen?"),
      reply(
        "Say you'd prefer 70,000 yen or less.",
        right("七万円以下がいいです。", "ななまんえんいかがいいです", "I'd prefer 70,000 yen or less.", "以下 means 'or less', and includes the number itself."),
        wrong("七万円以上がいいです。", "ななまんえんいじょうがいいです", "I'd prefer 70,000 yen or more.", "以上 means 'or more'. You want the rent to be low."),
        wrong("七万円でも高いです。", "ななまんえんでもたかいです", "Even 70,000 yen is expensive.", "This says the price is too high in general. The question asks for a limit."),
      ),
      line("Agent", "来週、見に行きましょうか。", "らいしゅうみにいきましょうか", "Shall we go and see one next week?"),
      line("Agent", "部屋を見てから決めることもできますよ。", "へやをみてからきめることもできますよ", "You can also decide after you've seen the room."),
      line("Agent", "来週の水曜日はどうですか。", "らいしゅうのすいようびはどうですか", "How about next Wednesday?"),
    ],
    questions: [
      ask("What is the highest rent the learner will accept?", ["70,000 yen", "80,000 yen", "60,000 yen", "No limit"], 0),
      ask("When will they go to see the room?", ["Tomorrow", "Next Wednesday", "Last week", "They won't go"], 1),
    ],
  },
];

export const STORY_BY_ID = new Map(STORIES.map((s) => [s.id, s]));
