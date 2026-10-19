import { mkdir } from "node:fs/promises";
import config from "../src/config/presentation.config.js";
import slides from "../data/sample-presentation.js";
import { createPptx } from "../src/export/pptx-exporter.js";
await mkdir("exports", { recursive: true });
const { pptx, warnings } = createPptx({ ...config, slides });
await pptx.writeFile({ fileName: "exports/presentation.pptx" });
for (const warning of warnings) console.warn(warning);
console.log("Created exports/presentation.pptx");
