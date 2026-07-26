import fs from "node:fs";
import path from "node:path";

const sourceDir = process.env.RULEBOOK_TEXT_DIR;
if (!sourceDir) throw new Error("RULEBOOK_TEXT_DIR is required");

const sources = [
  ["korean-history-1", "한국사1", "Korean_History_1_Rulebook(1).md"],
  ["korean-history-2", "한국사2", "Korean_History_2_Rulebook(1).md"],
  ["world-history", "세계사", "World_History_Rulebook(1).md"],
  ["east-asian-history-journey", "동아시아 역사 기행", "East_Asian_History_Journey_Rulebook(1).md"],
  ["modern-world-history", "역사로 탐구하는 현대 세계", "Modern_World_History_Rulebook(1).md"],
];

function clean(value) {
  return value.replace(/<br\s*\/?>/gi, " ").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function parseTopics(markdown) {
  const marker = markdown.indexOf("**교과서 주제 순서표**");
  const section = marker >= 0 ? markdown.slice(marker) : markdown;
  const lines = section.split(/\r?\n/);
  const topics = [];
  let unit = "";
  let group = "";
  for (const line of lines) {
    if (line.startsWith("<table>")) break;
    const cells = line.split("|").slice(1, -1).map(clean);
    if (cells.length !== 5 || !/^\d+$/.test(cells[0])) continue;
    const [orderText, rawUnit, rawGroup, rawTitle, pageText] = cells;
    if (rawUnit && rawUnit !== "〃") unit = rawUnit;
    if (rawGroup && rawGroup !== "〃" && rawGroup !== "—") group = rawGroup;
    if (rawGroup === "—") group = "";
    topics.push({
      id: `topic-${String(Number(orderText)).padStart(2, "0")}`,
      order: Number(orderText),
      unit,
      group,
      title: rawTitle,
      page: Number(pageText),
    });
  }
  return topics;
}

const data = Object.fromEntries(sources.map(([id, title, file]) => {
  const markdown = fs.readFileSync(path.join(sourceDir, file), "utf8");
  return [id, { title, topics: parseTopics(markdown) }];
}));

fs.writeFileSync(new URL("../content/course-topics.json", import.meta.url), `${JSON.stringify(data, null, 2)}\n`);
