import type { StudyItem } from "./types";

/** Groups items into distractor pools: kana by script, vocab/kanji by level. */
export function poolKey(item: StudyItem): string {
  return item.kind === "kana" ? `kana-${item.script}` : `${item.kind}-${item.level}`;
}

export function buildPools(index: Map<string, StudyItem>): Map<string, StudyItem[]> {
  const pools = new Map<string, StudyItem[]>();
  for (const item of index.values()) {
    const k = poolKey(item);
    let list = pools.get(k);
    if (!list) pools.set(k, (list = []));
    list.push(item);
  }
  return pools;
}

/** A plausible distractor pool for an item: ~80 neighbours from the same group. */
export function poolFor(item: StudyItem, pools: Map<string, StudyItem[]>): StudyItem[] {
  const list = pools.get(poolKey(item)) ?? [];
  if (list.length <= 120) return list;
  const i = list.indexOf(item);
  const start = Math.max(0, Math.min(list.length - 120, i - 60));
  return list.slice(start, start + 120);
}
