import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
export async function standaloneHtml(presentation) {
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
  if (presentation) {
    const payload = JSON.stringify(presentation)
      .replaceAll("<", "\\u003c")
      .replaceAll("\u2028", "\\u2028")
      .replaceAll("\u2029", "\\u2029");
    html = html.replace(
      "<head>",
      () => `<head><script>window.__DT_PRESENTATION__=${payload};</script>`,
    );
  }
  return html;
}
