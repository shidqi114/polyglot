// Fails when a credential or a credential file is about to be committed (--staged),
// or is already tracked by git (--all). Usage: node scripts/check-secrets.mjs --staged | --all
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { findSecretsInText, isForbiddenPath } from "./lib/secret-patterns.mjs";

const git = (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const problems = [];

if (process.argv.includes("--all")) {
  for (const file of git(["ls-files", "-z"]).split("\0").filter(Boolean)) {
    if (isForbiddenPath(file)) {
      problems.push(`${file}: credential file must not be tracked`);
      continue;
    }
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue; // deleted or unreadable: nothing to scan
    }
    for (const hit of findSecretsInText(text)) problems.push(`${file}: ${hit}`);
  }
} else {
  for (const file of git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]).split("\0").filter(Boolean)) {
    if (isForbiddenPath(file)) problems.push(`${file}: credential file must not be committed`);
  }
  // Only lines this commit adds; each "+++ b/<path>" header names the file they belong to.
  let file = "";
  for (const line of git(["diff", "--cached", "-U0", "--no-color"]).split("\n")) {
    if (line.startsWith("+++ b/")) file = line.slice(6);
    else if (line.startsWith("+") && !line.startsWith("+++")) {
      for (const hit of findSecretsInText(line.slice(1))) problems.push(`${file}: ${hit}`);
    }
  }
}

if (problems.length) {
  console.error("Secret scan failed:");
  for (const p of [...new Set(problems)]) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`Secret scan: clean (${process.argv.includes("--all") ? "all tracked files" : "staged changes"})`);
