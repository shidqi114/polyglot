import type { StudyItem } from "@/lib/types";

/** Hepburn romaji for each hiragana, grouped into lesson-sized rows. */
export const HIRAGANA_ROWS: { title: string; kana: [string, string][] }[] = [
  { title: "Vowels", kana: [["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]] },
  { title: "K row", kana: [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]] },
  { title: "S row", kana: [["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"]] },
  { title: "T row", kana: [["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"]] },
  { title: "N row", kana: [["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]] },
  { title: "H row", kana: [["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"]] },
  { title: "M row", kana: [["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]] },
  { title: "Y, W & N", kana: [["や", "ya"], ["ゆ", "yu"], ["よ", "yo"], ["わ", "wa"], ["を", "wo"], ["ん", "n"]] },
  { title: "R row", kana: [["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]] },
  { title: "G & Z", kana: [["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"], ["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"]] },
  { title: "D, B & P", kana: [["だ", "da"], ["ぢ", "ji"], ["づ", "zu"], ["で", "de"], ["ど", "do"], ["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"], ["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]] },
  { title: "Combos I", kana: [["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"], ["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"], ["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"]] },
  { title: "Combos II", kana: [["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"], ["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"], ["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"], ["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"]] },
  { title: "Combos III", kana: [["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"], ["じゃ", "ja"], ["じゅ", "ju"], ["じょ", "jo"], ["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"], ["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"]] },
];

const HIRA_START = 0x3041;
const KATA_START = 0x30a1;
export function hiraganaToKatakana(s: string): string {
  return [...s]
    .map((c) => {
      const code = c.charCodeAt(0);
      return code >= HIRA_START && code <= 0x3096 ? String.fromCharCode(code - HIRA_START + KATA_START) : c;
    })
    .join("");
}

function kanaItem(kana: string, romaji: string, script: "hiragana" | "katakana"): StudyItem {
  const front = script === "hiragana" ? kana : hiraganaToKatakana(kana);
  return { id: `k:${front}`, kind: "kana", front, reading: front, meanings: [romaji], script };
}

export const KANA_ROWS = {
  hiragana: HIRAGANA_ROWS.map((row) => ({
    title: row.title,
    items: row.kana.map(([k, r]) => kanaItem(k, r, "hiragana")),
  })),
  katakana: HIRAGANA_ROWS.map((row) => ({
    title: row.title,
    items: row.kana.map(([k, r]) => kanaItem(k, r, "katakana")),
  })),
};

export const ALL_KANA: StudyItem[] = [
  ...KANA_ROWS.hiragana.flatMap((r) => r.items),
  ...KANA_ROWS.katakana.flatMap((r) => r.items),
];

export const KANA_BY_ID = new Map(ALL_KANA.map((k) => [k.id, k]));
