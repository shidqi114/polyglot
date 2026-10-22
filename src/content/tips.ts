/** Study tips. Each tip is tied to a trigger, and the app shows the tip for the most urgent trigger that applies. */

export type TipTrigger =
  | "due-backlog"
  | "leeches"
  | "streak-broken"
  | "low-accuracy"
  | "confusions"
  | "idle"
  | "kana"
  | "steady"
  | "new"
  | "general";

export interface Tip {
  id: string;
  trigger: TipTrigger;
  text: string;
}

const t = (id: string, trigger: TipTrigger, text: string): Tip => ({ id, trigger, text });

export const TIPS: Tip[] = [
  // Many reviews are due.
  t("due-1", "due-backlog", "Many reviews are due. Clear them in sessions of 10 to 15 cards rather than all at once."),
  t("due-2", "due-backlog", "Reviews are cheaper than new lessons. Clearing the backlog first keeps the next lessons easy."),
  t("due-3", "due-backlog", "A few cards while you wait for a train add up faster than you think."),
  t("due-4", "due-backlog", "If a card feels too hard, answer honestly. A miss is still useful, and the schedule adapts."),
  t("due-5", "due-backlog", "Daily reviews work better than one long session each week. Memory depends on spacing."),
  t("due-6", "due-backlog", "The oldest due cards come first in the Review tab. Start there."),
  t("due-7", "due-backlog", "Say each word aloud before you answer. Speaking helps recall as well as recognition."),
  t("due-8", "due-backlog", "After a busy week, a backlog is normal. Ten minutes a day gets it back under control."),
  t("due-9", "due-backlog", "Use the “Only items I’ve learned” filter in the dojo to practise exactly what you are reviewing."),
  t("due-10", "due-backlog", "Skip a new lesson for one day if the backlog is large. Reviews come first."),

  // Items that keep coming back wrong.
  t("leech-1", "leeches", "Some items keep coming back wrong. Write each one out by hand, then use it in a sentence."),
  t("leech-2", "leeches", "Open a leech in the dictionary and read its example sentences. Seeing it in context often fixes it."),
  t("leech-3", "leeches", "Add your own note to a leech. A mnemonic you invent is worth more than a generic one."),
  t("leech-4", "leeches", "Compare a leech with the word it gets mixed up with. Two similar items often fail together."),
  t("leech-5", "leeches", "Practise leeches in the input mode. Typing the reading makes you recall it, not just recognise it."),
  t("leech-6", "leeches", "Leeches are a normal part of learning. Give them a little more practice than the rest."),
  t("leech-7", "leeches", "If a word keeps slipping, look at its kanji. Knowing the parts can make the whole word easier to keep."),
  t("leech-8", "leeches", "Say a leech out loud three times in a row before the next review. A short repeat helps."),

  // The streak has ended.
  t("streak-1", "streak-broken", "Your streak ended. One short lesson today starts a new one, and that is enough."),
  t("streak-2", "streak-broken", "Missing a day is not a failure. Pick the smallest task you can finish: one review, then one lesson."),
  t("streak-3", "streak-broken", "Study at the same time each day, such as after breakfast. A fixed time makes a streak easier to keep."),
  t("streak-4", "streak-broken", "The daily goal is a floor, not a ceiling. Even ten XP today counts toward the streak."),
  t("streak-5", "streak-broken", "A quick review before bed can save the streak on a busy day."),

  // Accuracy has dropped.
  t("acc-1", "low-accuracy", "Your accuracy is low right now. Slow down and read every choice before you tap."),
  t("acc-2", "low-accuracy", "Use the easier modes first (pick, then reverse pick) before the input modes."),
  t("acc-3", "low-accuracy", "Read the “Why?” explanation after each wrong answer. It shows the pattern behind the mistake."),
  t("acc-4", "low-accuracy", "Low accuracy often means too many new items at once. Review what you have before new lessons."),
  t("acc-5", "low-accuracy", "Say the answer before you type it. Hearing the reading often shows an error you would miss."),
  t("acc-6", "low-accuracy", "The Weekly review shows which level or kana row causes most of your misses. Start there."),

  // Items are being mixed up.
  t("conf-1", "confusions", "You mix some items up. Compare the pairs in the Weekly review, then practise them together."),
  t("conf-2", "confusions", "When two kana look alike, write each one ten times. Shape memory separates them."),
  t("conf-3", "confusions", "は marks the topic of a sentence, and が marks the subject of a new fact. Notice which one a sentence uses."),
  t("conf-4", "confusions", "に and で both follow places. に is often a destination; で is where an action happens."),
  t("conf-5", "confusions", "For look-alike kanji, check the radical first. It often hints at the meaning."),
  t("conf-6", "confusions", "If two words feel the same, make a sentence with each one. Context keeps them apart."),

  // No activity for a couple of days.
  t("idle-1", "idle", "Welcome back. Start with a review rather than a new lesson: it is the quickest way back in."),
  t("idle-2", "idle", "After a break, old items will be due. Clear a few reviews, then try one lesson."),
  t("idle-3", "idle", "A five-minute session counts. Open the app and do just one review."),
  t("idle-4", "idle", "Long breaks are normal. Keep the first few sessions back short."),

  // Kana not all learned yet.
  t("kana-1", "kana", "Learn hiragana first. Almost every lesson on the path builds on it."),
  t("kana-2", "kana", "Read each kana out loud as you learn it. Sound and shape together stick better."),
  t("kana-3", "kana", "Katakana is for foreign words and some sounds. Learn it after hiragana, not before."),
  t("kana-4", "kana", "A small っ is a short pause before the next consonant. Hold that beat."),
  t("kana-5", "kana", "The long vowel mark ー repeats the vowel before it: ラー is raa."),
  t("kana-6", "kana", "The dakuten (゛) changes the consonant: か becomes が, and は becomes ぱ with the handakuten (゜)."),

  // A week-long streak or more.
  t("steady-1", "steady", "A week-long streak is a good habit. Keep the same time each day and it becomes automatic."),
  t("steady-2", "steady", "You are building a solid routine. Try a practice mode you have not used yet."),
  t("steady-3", "steady", "Consistency beats intensity. Keep the daily goal easy to reach and enjoy the streak."),
  t("steady-4", "steady", "Have a fallback for busy days: one review takes two minutes and keeps the streak alive."),

  // Nothing studied yet.
  t("new-1", "new", "Start with the first kana lesson. It takes about five minutes."),
  t("new-2", "new", "The path goes in order, and each lesson opens the next one."),
  t("new-3", "new", "The dictionary and the practice dojo are open from the start, even before your first lesson."),
  t("new-4", "new", "Turn on sound and autoplay in Profile to hear each item as you learn it."),

  // Any learner.
  t("gen-1", "general", "Say each new word out loud. Hearing yourself helps the pronunciation stick."),
  t("gen-2", "general", "Japanese words have pitch accent. The word page draws the pitch graph for most words."),
  t("gen-3", "general", "Look up any word from a lesson in the dictionary. Looking it up again strengthens memory."),
  t("gen-4", "general", "Write a mnemonic in your note for a hard item. Notes sync across your devices when you are signed in."),
  t("gen-5", "general", "Sentences teach more than single words. Try the Sentences mode in the practice dojo."),
  t("gen-6", "general", "The stroke-order animation on a kanji page shows how to write it. Trace it in the air first."),
  t("gen-7", "general", "When you meet an unknown word, guess from its kanji. Many kanji carry the meaning."),
  t("gen-8", "general", "Read the example sentences out loud, then cover the English and translate them yourself."),
  t("gen-9", "general", "Stories let you practise replying in context. Try one from the Practice tab."),
  t("gen-10", "general", "Culture makes words stick. Read the culture note on the home screen."),
  t("gen-11", "general", "If you are tired, do one lesson and stop. Finishing matters more than the length."),
  t("gen-12", "general", "Many kanji have two kinds of reading. Learn them inside words first, then alone."),
  t("gen-13", "general", "Particles are small words with big jobs: は, が, を, に and で cover most sentences."),
  t("gen-14", "general", "Counters change with the object: 一人 (hitori) for people, 一本 (ippon) for long things, 一枚 (ichimai) for flat things."),
  t("gen-15", "general", "です and ます are the safe polite forms with people you do not know well."),
  t("gen-16", "general", "Press the audio button even when you know the answer. It trains your ears."),
  t("gen-17", "general", "When a sentence pattern puzzles you, open the grammar reference. Every point has sample sentences."),
  t("gen-18", "general", "Change one part of a sentence, such as the tense or the particle, and check the result with the Why? panel."),
  t("gen-19", "general", "After a mistake, reread the item once, then meet it again later in the same session."),
  t("gen-20", "general", "Reading a short text every day, even a sentence, builds recognition faster than extra drills."),
  t("gen-21", "general", "Verbs change form: the ます stem, the て form and the past form each have their own pattern. The verb forms drill covers them."),
  t("gen-22", "general", "Keep a list of words you looked up. Reviewing your own list is more personal than a generic deck."),
];
