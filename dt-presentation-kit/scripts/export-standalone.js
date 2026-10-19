import { writeFile, mkdir } from "node:fs/promises";
import { standaloneHtml } from "./standalone-utils.js";
await mkdir("exports", { recursive: true });
await writeFile("exports/Presentation-Kit.html", await standaloneHtml());
console.log("Created exports/Presentation-Kit.html");
