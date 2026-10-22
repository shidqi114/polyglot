import { z } from "zod";

// Validates backup files before they touch the progress store. Anything outside these shapes is refused,
// including keys such as "__proto__", so an imported file can only ever set the documented fields.

const MAX_BYTES = 5 * 1024 * 1024;
const timestamp = z.number().min(0).max(4102444800000); // milliseconds, up to 2100

const settingsSchema = z
  .strictObject({
    dailyGoal: z.number().min(1).max(1000),
    theme: z.enum(["system", "light", "dark"]),
    sound: z.boolean(),
    autoplayAudio: z.boolean(),
    ttsRate: z.number().min(0.3).max(2),
    showReadings: z.boolean(),
  })
  .partial();

const lessonSchema = z.strictObject({
  done: timestamp,
  best: z.number().min(0).max(1),
  times: z.number().int().min(0).max(100000),
  up: timestamp,
});

const daySchema = z.strictObject({
  xp: z.number().min(0).max(100000),
  lessons: z.number().int().min(0).max(10000),
  reviews: z.number().int().min(0).max(10000),
});

const cardSchema = z.strictObject({
  due: timestamp,
  s: z.number().min(0).max(36500),
  d: z.number().min(0).max(11),
  sd: z.number().min(0).max(36500),
  ls: z.number().int().min(0).max(10),
  reps: z.number().int().min(0).max(100000),
  lapses: z.number().int().min(0).max(100000),
  st: z.number().int().min(0).max(3),
  lr: timestamp.nullable(),
  up: timestamp,
  cf: z.array(z.string().max(64)).max(5).optional(),
});

const noteSchema = z.strictObject({ text: z.string().max(2000), up: timestamp });

export const backupSchema = z.strictObject({
  app: z.literal("polyglot"),
  version: z.literal(1),
  exportedAt: z.string().max(40).optional(),
  settings: settingsSchema.optional(),
  lessons: z.record(z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/), lessonSchema),
  cards: z.record(z.string().regex(/^[kvj]:[^\u0000-\u001f/]{1,120}$/u), cardSchema),
  days: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), daySchema),
  notes: z.record(z.string().regex(/^[kvj]:[^\u0000-\u001f/]{1,120}$/u), noteSchema).optional(),
});

export type Backup = z.infer<typeof backupSchema>;

export class BackupError extends Error {}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// The schema drops "__proto__" keys without an error, so refuse them explicitly, anywhere in the file.
function findForbiddenKey(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findForbiddenKey(item);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (FORBIDDEN_KEYS.has(key)) return key;
      const found = findForbiddenKey((value as Record<string, unknown>)[key]);
      if (found) return found;
    }
  }
  return null;
}

/** Parses an exported backup. Throws BackupError with a reason the user can act on. */
export function parseBackup(text: string): Backup {
  if (new TextEncoder().encode(text).byteLength > MAX_BYTES) throw new BackupError("This file is larger than 5 MB.");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupError("This file is not valid JSON.");
  }
  const forbidden = findForbiddenKey(json);
  if (forbidden) throw new BackupError(`Not a valid Polyglot backup (forbidden key "${forbidden}").`);
  const result = backupSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue.path.length ? issue.path.join(".") : "file";
    throw new BackupError(`Not a valid Polyglot backup (${where}: ${issue.message}).`);
  }
  return result.data;
}
