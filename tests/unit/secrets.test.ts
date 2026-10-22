import { describe, expect, it } from "vitest";
import { findSecretsInText, isForbiddenPath } from "../../scripts/lib/secret-patterns.mjs";

// Fake credentials are assembled at runtime so this file never contains a key-shaped literal.
const fakeGoogleKey = "AIza" + "A".repeat(35);
const fakePrivateKeyHeader = "-----BEGIN " + "PRIVATE KEY-----";

describe("secret scanner", () => {
  it("flags a Google/Firebase API key", () => {
    expect(findSecretsInText(`const k = "${fakeGoogleKey}";`)).toContain("Google/Firebase API key");
  });

  it("flags a private key block and service account JSON", () => {
    expect(findSecretsInText(fakePrivateKeyHeader)).toContain("private key block");
    const serviceAccountJson = JSON.stringify({ type: "service_account", project_id: "x" });
    expect(findSecretsInText(serviceAccountJson)).toContain("service account credentials");
  });

  it("ignores ordinary code and short look-alikes", () => {
    expect(findSecretsInText('const appName = "Polyglot";')).toEqual([]);
    expect(findSecretsInText("AIza-too-short")).toEqual([]);
  });

  it("blocks credential files but allows .env.example", () => {
    expect(isForbiddenPath(".env.local")).toBe(true);
    expect(isForbiddenPath("config/.env.production")).toBe(true);
    expect(isForbiddenPath("keys/deploy.pem")).toBe(true);
    expect(isForbiddenPath("ops/polyglot-service-account-prod.json")).toBe(true);
    expect(isForbiddenPath(".env.example")).toBe(false);
    expect(isForbiddenPath("src/app/page.tsx")).toBe(false);
  });
});
