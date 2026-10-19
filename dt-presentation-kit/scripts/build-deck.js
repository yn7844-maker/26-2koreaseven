import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { resolvePresentation } from "../src/core/resolve-presentation.js";
import { createPptx } from "../src/export/pptx-exporter.js";
import { standaloneHtml } from "./standalone-utils.js";
try {
  const { values } = parseArgs({
    options: { input: { type: "string" }, out: { type: "string" } },
  });
  if (!values.input)
    throw Error(
      "사용법: npm run deck:build -- --input ../presentations/<slug>/deck.json --out exports/<slug>",
    );
  const input = resolve(values.input),
    out = resolve(values.out || "exports/custom");
  if (
    input === resolve(out, "presentation.json") ||
    input === resolve(out, "Presentation.html") ||
    input === resolve(out, "presentation.pptx")
  )
    throw Error("입력 파일과 출력 파일을 같은 경로로 지정할 수 없습니다.");
  const presentation = resolvePresentation(
    JSON.parse(await readFile(input, "utf8")),
  );
  const { pptx, warnings } = createPptx(presentation);
  const html = await standaloneHtml(presentation);
  await mkdir(out, { recursive: true });
  await pptx.writeFile({ fileName: resolve(out, "presentation.pptx") });
  await writeFile(resolve(out, "Presentation.html"), html);
  await writeFile(
    resolve(out, "presentation.json"),
    JSON.stringify(presentation, null, 2) + "\n",
  );
  console.log(`Created ${presentation.slides.length} slides in ${out}`);
  for (const warning of warnings) console.warn(warning);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
