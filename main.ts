import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The roast, embedded as a fallback in case entry.txt is not beside the script.
const FALLBACK =
  "My robot vacuum mapped my entire apartment down to the centimeter, then spent its whole shift ramming one chair leg like it owed it money.";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const entryPath = join(scriptDir, "entry.txt");

const text = existsSync(entryPath)
  ? readFileSync(entryPath, "utf8").trim()
  : FALLBACK;

// Fail loudly instead of writing an entry the gate would refuse:
// the text must be 1-200 characters and not only whitespace.
if (text.length < 1 || text.length > 200 || text.trim().length === 0) {
  console.error(
    `error: entry text is ${text.length} chars; the gate requires 1-200 non-whitespace characters`
  );
  process.exit(1);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, "utf8");

// Read back what was written and verify it matches, so a truncated or
// corrupted write fails loudly instead of being silently judged.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  console.error("error: written output does not match the entry text");
  process.exit(1);
}
console.log(`wrote /output/entry.txt (${text.length} chars, verified)`);
