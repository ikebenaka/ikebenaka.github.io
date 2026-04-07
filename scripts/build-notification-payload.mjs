import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const baseSha = process.env.GITHUB_EVENT_BEFORE;
const headSha = process.env.GITHUB_SHA;
const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");
const outputPath = process.env.NOTIFICATION_PAYLOAD_PATH || path.join(repoRoot, "notification-payload.json");

if (!baseSha || !headSha) {
  console.log("Skipping notification payload build because the GitHub SHAs are missing.");
  process.exit(0);
}

function getChangedFiles() {
  const diffOutput = execFileSync(
    "git",
    ["diff", "--name-status", baseSha, headSha],
    { cwd: repoRoot, encoding: "utf8" }
  ).trim();

  if (!diffOutput) return [];

  return diffOutput
    .split("\n")
    .map((line) => line.split("\t"))
    .map((parts) => ({
      status: parts[0],
      filePath: parts[parts.length - 1]
    }))
    .filter(({ status, filePath }) =>
      !status.startsWith("D") &&
      /^site\/collections\/_(posts|projects)\//.test(filePath) &&
      /\.(md|markdown|html)$/i.test(filePath)
    );
}

function parseFrontMatter(contents) {
  if (!contents.startsWith("---")) return {};

  const lines = contents.split(/\r?\n/);
  const frontMatter = {};
  let index = 1;

  while (index < lines.length && lines[index] !== "---") {
    const line = lines[index];
    const separatorIndex = line.indexOf(":");
    if (separatorIndex > -1) {
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      frontMatter[key] = value;
    }
    index += 1;
  }

  return frontMatter;
}

function slugFromFile(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function buildItem(filePath) {
  const absolutePath = path.join(repoRoot, filePath);
  const contents = readFileSync(absolutePath, "utf8");
  const frontMatter = parseFrontMatter(contents);
  const collection = filePath.includes("_posts") ? "post" : "project";
  const slug = slugFromFile(filePath);
  const relativeUrl = collection === "post" ? `/blog/${slug}` : `/project/${slug}`;

  return {
    title: frontMatter.title || slug.replace(/-/g, " "),
    description: frontMatter.description || "",
    date: frontMatter.date || path.basename(filePath).slice(0, 10),
    type: collection,
    url: siteUrl ? `${siteUrl}${relativeUrl}` : relativeUrl
  };
}

const items = getChangedFiles().map(({ filePath }) => buildItem(filePath));

writeFileSync(outputPath, JSON.stringify({ items }, null, 2));
console.log(`Wrote ${items.length} notification item(s) to ${outputPath}`);
