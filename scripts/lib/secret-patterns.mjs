// Credentials that must never reach the repository. Shared by the pre-commit hook
// (staged changes) and `npm run check:secrets` (all tracked files).

const RULES = [
  { name: "Google/Firebase API key", re: /AIza[0-9A-Za-z_-]{35}/ },
  { name: "private key block", re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: "service account credentials", re: /"type"\s*:\s*"service_account"/ },
  { name: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "secret API key (sk-…)", re: /\bsk-[A-Za-z0-9_-]{40,}/ },
];

// Files that should never be committed, whatever their content.
// `.env.example` is the one allowed env file (it only has placeholders).
const FORBIDDEN_PATHS = [
  /(^|\/)\.env(\..+)?$/,
  /\.(pem|p12|pfx|key)$/i,
  /(^|\/)[^/]*service[-_]?account[^/]*\.json$/i,
  /(^|\/)[^/]*-firebase-adminsdk-[^/]*\.json$/i,
];

export function findSecretsInText(text) {
  return RULES.filter((rule) => rule.re.test(text)).map((rule) => rule.name);
}

export function isForbiddenPath(path) {
  if (/(^|\/)\.env\.example$/.test(path)) return false;
  return FORBIDDEN_PATHS.some((re) => re.test(path));
}
