import { layoutSlide } from "../core/layout-model.js";
import { slideTheme } from "../core/slide-engine.js";
import { hex, inches, textOptions } from "./pptx-utils.js";
import { mapChart } from "./chart-mapper.js";
import { fmt } from "../core/utils.js";
export function mapSlide(pptx, s, theme, index, total) {
  const t = slideTheme(s, theme),
    slide = pptx.addSlide();
  slide.background = { color: hex(t.colors.surface) };
  for (const item of layoutSlide(s)) {
    if (item.kind === "text" || item.kind === "counter")
      slide.addText(
        item.kind === "counter"
          ? fmt(item.value) + (item.unit || "")
          : item.text,
        textOptions(item, t),
      );
    if (item.kind === "box")
      slide.addShape(pptx.ShapeType.rect, {
        x: inches(item.x),
        y: inches(item.y),
        w: inches(item.w),
        h: inches(item.h),
        line: { color: hex(t.colors.border), width: 0.7 },
        fill: { color: hex(t.colors.primaryLight) },
      });
    if (item.kind === "chart") mapChart(pptx, slide, item.chart, item, t);
    if (item.kind === "table") {
      const rows = [
        item.headers.map((text) => ({
          text,
          options: {
            bold: true,
            color: hex(t.colors.surface),
            fill: hex(t.colors.primary),
          },
        })),
        ...item.rows.map((row, ri) =>
          row.map((text, ci) => ({
            text: String(text),
            options: item.highlightCells.some(([a, b]) => a === ri && b === ci)
              ? {
                  fill: hex(t.colors.primaryLight),
                  color: hex(t.colors.accent),
                  bold: true,
                }
              : {},
          })),
        ),
      ];
      slide.addTable(rows, {
        x: inches(item.x),
        y: inches(item.y),
        w: inches(item.w),
        rowH: 0.65,
        fontFace: t.fontFamily.split(",")[0],
        fontSize: t.typography.tableBody.fontSize * 0.75,
        color: hex(t.colors.textPrimary),
        border: { type: "solid", color: hex(t.colors.border), pt: 0.5 },
        margin: 0.14,
      });
    }
  }
  if (theme.logo)
    slide.addImage({ path: theme.logo, x: 11.5, y: 0.15, w: 1.1, h: 0.35 });
  slide.addText(
    [s.source || s.chart?.source, s.note].filter(Boolean).join(" · "),
    {
      x: inches(64),
      y: inches(658),
      w: 11,
      h: 0.22,
      fontSize: 9,
      color: hex(t.colors.textMuted),
      margin: 0,
    },
  );
  slide.addText(`${index + 1} / ${total}`, {
    x: 12,
    y: inches(658),
    w: 0.6,
    h: 0.22,
    fontSize: 9,
    color: hex(t.colors.textMuted),
    align: "right",
    margin: 0,
  });
  return slide;
}
