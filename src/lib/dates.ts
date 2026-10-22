/** Local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date | number = Date.now()): string {
  const date = typeof d === "number" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

/** Current streak: consecutive active days ending today (or yesterday if today isn't done yet). */
export function computeStreak(activeDays: Set<string>, today = dayKey()): { current: number; best: number } {
  let current = 0;
  let cursor = activeDays.has(today) ? today : addDays(today, -1);
  while (activeDays.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  let best = 0;
  for (const day of activeDays) {
    if (activeDays.has(addDays(day, -1))) continue; // not the start of a run
    let len = 0;
    let c = day;
    while (activeDays.has(c)) {
      len++;
      c = addDays(c, 1);
    }
    best = Math.max(best, len);
  }
  return { current, best: Math.max(best, current) };
}
