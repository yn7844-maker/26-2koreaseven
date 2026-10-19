import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
let html = await readFile("dist/index.html", "utf8");
for (const match of [
  ...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g),
]) {
  const js = await readFile(
    resolve("dist", match[1].replace(/^\//, "")),
    "utf8",
  );
  html = html.replace(
    match[0],
    () =>
      `<script type="module">${js.replaceAll("</script", "<\\/script")}</script>`,
  );
}
for (const match of [
  ...html.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g),
]) {
  const css = await readFile(
    resolve("dist", match[1].replace(/^\//, "")),
    "utf8",
  );
  html = html.replace(match[0], () => `<style>${css}</style>`);
}
await mkdir("exports", { recursive: true });
await writeFile("exports/Presentation-Kit.html", html);
console.log("Created exports/Presentation-Kit.html");
