// Deploys firestore.rules to the Firebase project named in FIREBASE_PROJECT_ID (`npm run deploy:rules`).
//
// The deploy only goes ahead when the rules tests pass and firestore.rules has no uncommitted changes, so the live
// rules always match a commit. Pass --check to run every gate without deploying.
import { execFileSync, spawnSync } from "node:child_process";

const checkOnly = process.argv.includes("--check");
const project = process.env.FIREBASE_PROJECT_ID;

if (!project) fail("FIREBASE_PROJECT_ID is not set. Set it to the Firebase project id, then run again.");
if (git(["status", "--porcelain", "--", "firestore.rules"]) !== "") {
  fail("firestore.rules has uncommitted changes. Commit them first, so the deployed rules match a commit.");
}

const commit = git(["rev-parse", "--short", "HEAD"]);
run("npm", ["run", "test:rules"]);

if (checkOnly) {
  console.log(`Checks passed. firestore.rules at ${commit} is ready to deploy to the project in FIREBASE_PROJECT_ID.`);
} else {
  run("firebase", ["deploy", "--only", "firestore:rules", "--project", project]);
  console.log(`Deployed firestore.rules from commit ${commit}.`);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed.`, result.status ?? 1);
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}
