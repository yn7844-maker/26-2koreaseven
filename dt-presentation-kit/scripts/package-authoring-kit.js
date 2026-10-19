import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import JSZip from "jszip";
import { resolve } from "node:path";
const root = resolve("..");
const sources = [
  "START_HERE.md",
  "dt-presentation-kit/docs/DESIGN_SYSTEM.md",
  "dt-presentation-kit/docs/CONTENT_GUIDE.md",
  "dt-presentation-kit/docs/COMPONENTS.md",
  "dt-presentation-kit/docs/CHART_LIBRARY.md",
  "dt-presentation-kit/docs/PPTX_EXPORT.md",
];
let context =
  "# AI Presentation Authoring Context\n\n통합 문서입니다. 원본은 각 파일 경로를 참고하세요. npm run ai:pack으로 갱신합니다.\n";
for (const file of sources)
  context += `\n\n---\n\n원본: ${file}\n\n${await readFile(resolve(root, file), "utf8")}`;
await writeFile(resolve(root, "ai-kit/AI_CONTEXT.md"), context);
const zip = new JSZip();
async function addDir(dir) {
  for (const entry of await readdir(resolve(root, dir), {
    withFileTypes: true,
  })) {
    const path = dir + "/" + entry.name;
    if (entry.isDirectory()) await addDir(path);
    else zip.file(path, await readFile(resolve(root, path)));
  }
}
for (const file of [
  "START_HERE.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".agents/skills/create-presentation/SKILL.md",
])
  zip.file(file, await readFile(resolve(root, file)));
for (const dir of [
  "ai-kit",
  "presentations/example",
  "dt-presentation-kit/docs",
])
  await addDir(dir);
await mkdir(resolve(root, "downloads"), { recursive: true });
await writeFile(
  resolve(root, "downloads/AI-Authoring-Kit.zip"),
  await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
);
console.log("Created ai-kit/AI_CONTEXT.md and downloads/AI-Authoring-Kit.zip");
