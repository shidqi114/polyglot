// Runs after `npm install` (the "prepare" script). Points git at the versioned hooks in
// scripts/git-hooks so every clone gets the same checks. Skipped on CI and Vercel builds.
import { chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";

if (process.env.CI || process.env.VERCEL) process.exit(0);
try {
  execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" });
} catch {
  process.exit(0); // not a git checkout (e.g. a source archive)
}
execFileSync("git", ["config", "core.hooksPath", "scripts/git-hooks"]);
try {
  chmodSync("scripts/git-hooks/pre-commit", 0o755);
} catch {
  // Windows does not use the executable bit; git runs the hook through sh anyway.
}
console.log("git hooks: core.hooksPath -> scripts/git-hooks");
