#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SOURCE =
  "https://raw.githubusercontent.com/SmilingWayne/puzzlekit-dataset/main/assets/data/NumberLink/NumberLink_dataset.json";

const MAX_SIZE = 15;

const LABEL_ALPHABET =
  "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toChar(n) {
  if (n <= 0 || n > LABEL_ALPHABET.length) {
    throw new Error(`Endpoint index ${n} out of single-char label range.`);
  }
  return LABEL_ALPHABET[n - 1];
}

function parseProblem(problem) {
  const lines = problem.split("\n").filter((l) => l.length > 0);
  const [a, b] = lines[0].split(/\s+/).map(Number);
  const body = lines.slice(1);
  const rowCellCounts = body.map((l) => l.trim().split(/\s+/).length);

  // Some entries label dims in (height width) order instead of (width height).
  // Pick whichever interpretation matches the body shape.
  let width, height;
  if (body.length === b && rowCellCounts.every((c) => c === a)) {
    width = a;
    height = b;
  } else if (body.length === a && rowCellCounts.every((c) => c === b)) {
    width = b;
    height = a;
  } else {
    throw new Error(
      `Dims mismatch: header ${a}x${b}, body ${body.length} rows, widths ${[...new Set(rowCellCounts)].join("/")}.`,
    );
  }

  const rows = body.map((line) =>
    line
      .trim()
      .split(/\s+/)
      .map((cell) => (cell === "-" ? "." : toChar(Number(cell))))
      .join(""),
  );
  return { width, height, rows };
}

async function main() {
  console.log(`Fetching ${SOURCE}`);
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const raw = await res.json();

  const out = [];
  for (const key of Object.keys(raw.data)) {
    const entry = raw.data[key];
    try {
      const { width, height, rows } = parseProblem(entry.problem);
      if (width > MAX_SIZE || height > MAX_SIZE) continue;
      out.push({
        id: `janko-${key}`,
        title: `${width}\u00D7${height} #${key.split("_")[0]}`,
        source: entry.source || "janko.at/Raetsel/Arukone",
        rows,
      });
    } catch (err) {
      console.warn(`Skipping ${key}: ${err.message}`);
    }
  }

  out.sort((a, b) => {
    const areaA = a.rows.length * a.rows[0].length;
    const areaB = b.rows.length * b.rows[0].length;
    if (areaA !== areaB) return areaA - areaB;
    return a.id.localeCompare(b.id);
  });

  const here = path.dirname(fileURLToPath(import.meta.url));
  const dest = path.resolve(here, "..", "assets", "levels.json");
  await writeFile(dest, JSON.stringify(out) + "\n");

  const sizes = out.reduce((acc, l) => {
    const k = `${l.rows[0].length}x${l.rows.length}`;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  console.log(`Wrote ${out.length} levels → ${dest}`);
  console.log("Sizes:", sizes);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
