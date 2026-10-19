import pptxgen from "pptxgenjs";
import { mapSlide } from "./slide-mapper.js";
import { validatePresentation } from "../core/validation.js";
import { exportWarnings } from "./pptx-utils.js";
export function createPptx(p) {
  const errors = validatePresentation(p);
  if (errors.length) throw new Error(errors.join("\n"));
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "DT_WIDE", width: 1280 / 96, height: 720 / 96 });
  pptx.layout = "DT_WIDE";
  pptx.author = p.meta.department || "DT Presentation Kit";
  pptx.subject = "Static editable presentation";
  pptx.title = p.meta.title;
  pptx.lang = "ko-KR";
  pptx.theme = {
    headFontFace: p.theme.fontFamily.split(",")[0],
    bodyFontFace: p.theme.fontFamily.split(",")[0],
    lang: "ko-KR",
  };
  p.slides.forEach((s, i) => mapSlide(pptx, s, p.theme, i, p.slides.length));
  return { pptx, warnings: exportWarnings(p) };
}
export async function exportPptx(p) {
  const { pptx, warnings } = createPptx(p);
  await pptx.writeFile({ fileName: "presentation.pptx" });
  return warnings;
}
