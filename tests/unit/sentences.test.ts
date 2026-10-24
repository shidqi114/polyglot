import { describe, expect, it } from "vitest";
import { alsoCorrect } from "@/content/particles";
import { analyse, blankIsPlain, meaningIn, sentenceRecord, verbPairCounts, vocabForms, type Token, type VocabEntry } from "../../scripts/content/sentences";

const VOCAB: VocabEntry[] = [
  { id: "v:学校:がっこう", w: "学校", r: "がっこう", m: ["school"] },
  { id: "v:行く:いく", w: "行く", r: "いく; ゆく", m: ["to go"] },
  { id: "v:会う:あう", w: "会う", r: "あう", m: ["to meet"] },
  { id: "v:友達:ともだち", w: "友達", r: "ともだち", m: ["friend"] },
  { id: "v:大学:だいがく", w: "大学", r: "だいがく", m: ["university"] },
];
const FORMS = vocabForms(VOCAB);
const N5 = new Set(VOCAB.map((v) => v.id));

const noun = (surface: string, basic = surface, reading = surface): Token => ({ surface_form: surface, pos: "名詞", pos_detail_1: "一般", basic_form: basic, reading });
const particle = (surface: string): Token => ({ surface_form: surface, pos: "助詞", pos_detail_1: "格助詞", basic_form: surface, reading: surface });
const verb = (surface: string, basic: string): Token => ({ surface_form: surface, pos: "動詞", pos_detail_1: "自立", basic_form: basic, reading: surface });
const punct: Token = { surface_form: "。", pos: "記号", pos_detail_1: "句点", basic_form: "。", reading: "。" };
const pronoun = (surface: string): Token => ({ surface_form: surface, pos: "名詞", pos_detail_1: "代名詞", basic_form: surface, reading: surface });

describe("vocabForms", () => {
  it("maps headwords, readings and each part of a variant to the entry id", () => {
    const forms = vocabForms([{ id: "v:行く:いく", w: "行く", r: "いく; ゆく", m: ["to go"] }]);
    expect(forms.get("行く")).toBe("v:行く:いく");
    expect(forms.get("いく")).toBe("v:行く:いく");
    expect(forms.get("ゆく")).toBe("v:行く:いく");
  });

  it("keeps the first entry for a spelling that two entries share", () => {
    const forms = vocabForms([
      { id: "a", w: "開く", r: "あく", m: [] },
      { id: "b", w: "開く", r: "ひらく", m: [] },
    ]);
    expect(forms.get("開く")).toBe("a");
    expect(forms.get("ひらく")).toBe("b");
  });
});

describe("analyse", () => {
  it("blanks the first particle, and gives its offset in the plain sentence", () => {
    const tokens = [noun("学校", "学校", "がっこう"), particle("に"), verb("行き", "行く"), punct];
    const a = analyse(tokens, FORMS, N5);
    expect(a).toMatchObject({ at: 2, p: "に", verb: "行く", level: "n5" });
    expect(a?.ids).toEqual(["v:学校:がっこう", "v:行く:いく"]);
  });

  it("rejects a sentence with a content word that is not in the vocabulary", () => {
    const tokens = [noun("図書館", "図書館", "としょかん"), particle("に"), verb("行き", "行く"), punct];
    expect(analyse(tokens, FORMS, N5)).toBeNull();
  });

  it("rejects a sentence with fewer than two known words", () => {
    const tokens = [noun("学校", "学校", "がっこう"), particle("に"), punct];
    expect(analyse(tokens, FORMS, N5)).toBeNull();
  });

  it("rejects a sentence with no particle to blank", () => {
    expect(analyse([noun("学校", "学校", "がっこう"), verb("行き", "行く"), punct], FORMS, N5)).toBeNull();
  });

  it("does not blank まで or から after a word that forms one word with them (これまで)", () => {
    const tokens = [pronoun("これ"), { ...particle("まで"), pos_detail_1: "副助詞" }, noun("学校", "学校", "がっこう"), particle("に"), verb("行き", "行く"), punct];
    expect(analyse(tokens, FORMS, N5)).toBeNull();
  });

  it("marks a sentence N4 when one of its words is N4 and not in the N5 list", () => {
    const n4 = [...VOCAB, { id: "v:会社:かいしゃ", w: "会社", r: "かいしゃ", m: ["company"] }];
    const forms = vocabForms(n4);
    const tokens = [noun("会社", "会社", "かいしゃ"), particle("に"), verb("行き", "行く"), punct];
    expect(analyse(tokens, forms, N5)).toMatchObject({ level: "n4" });
  });

  it("uses the reading of a token when its surface is not in the vocabulary", () => {
    const tokens = [{ surface_form: "がっこう", pos: "名詞", pos_detail_1: "一般", basic_form: "*", reading: "ガッコウ" }, particle("に"), verb("行き", "行く"), punct];
    expect(analyse(tokens, FORMS, N5)?.ids).toContain("v:学校:がっこう");
  });
});

describe("blankIsPlain", () => {
  it("is true on plain text and false on a furigana base", () => {
    const ja = [["学校", "がっこう"] as [string, string], "に行きます"];
    expect(blankIsPlain(ja, 2)).toBe(true);
    expect(blankIsPlain(ja, 0)).toBe(false);
    expect(blankIsPlain(ja, 99)).toBe(false);
  });
});

describe("meaningIn", () => {
  it("finds a meaning as a whole word in the English", () => {
    expect(meaningIn("I went to school.", ["school"])).toBe(true);
    expect(meaningIn("Please go to the schoolhouse.", ["school"])).toBe(false);
    expect(meaningIn("We will walk together.", ["to walk"])).toBe(true);
  });

  it("ignores very short meanings, which match too much", () => {
    expect(meaningIn("Take me home.", ["me"])).toBe(false);
  });
});

describe("verb pairs and also-correct particles", () => {
  it("counts each verb with each particle across the sentences", () => {
    const a = analyse([noun("友達", "友達", "ともだち"), particle("に"), verb("会い", "会う"), punct], FORMS, N5);
    const b = analyse([noun("友達", "友達", "ともだち"), particle("と"), verb("会い", "会う"), punct], FORMS, N5);
    const pairs = verbPairCounts([a!, a!, b!].filter(Boolean));
    expect(pairs.get("会う|に")).toBe(2);
    expect(pairs.get("会う|と")).toBe(1);
  });

  it("offers の, は and も as never interchangeable by verb", () => {
    expect(alsoCorrect("の", "行く", new Map([["行く|が", 500], ["行く|の", 1]]))).toEqual([]);
  });

  it("lets a case particle swap for another that the same verb takes often", () => {
    const pairs = new Map([["会う|に", 10], ["会う|と", 6]]);
    expect(alsoCorrect("に", "会う", pairs)).toEqual(["へ", "と"]);
    expect(alsoCorrect("と", "会う", pairs)).toEqual(["に"]);
  });

  it("keeps the が and は pair apart for verbs that mark their subject with が", () => {
    expect(alsoCorrect("は", "好き")).toEqual(["が"]);
    expect(alsoCorrect("が", "分かる")).toEqual(["は"]);
  });

  it("builds a record with the English check on the words it links", () => {
    const a = analyse([noun("学校", "学校", "がっこう"), particle("に"), verb("行き", "行く"), punct], FORMS, N5)!;
    const meanings = new Map(VOCAB.map((v) => [v.id, v.m]));
    const record = sentenceRecord(a, ["学校", "に行きます。"], "I'm going to school.", meanings, new Map());
    expect(record).toMatchObject({ at: 2, p: "に", w: ["v:学校:がっこう"] });
  });
});
