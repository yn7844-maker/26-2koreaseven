import { chartScene } from "../charts/primitives.js";
import { hex, inches } from "./pptx-utils.js";
export function mapChart(pptx, slide, c, box, t) {
  if (c.type === "ranking")
    c = { ...c, data: [...c.data].sort((a, b) => b.value - a.value) };
  const colors = [t.colors.primary, t.colors.accent, t.colors.secondary].map(
      hex,
    ),
    base = {
      x: inches(box.x),
      y: inches(box.y),
      w: inches(box.w),
      h: inches(box.h),
      showLegend: false,
      showTitle: false,
      showValue: true,
      showCatName: false,
      showBorder: false,
      chartColors: colors,
      fontFace: t.fontFamily.split(",")[0].trim(),
      catAxisLabelColor: hex(t.colors.textSecondary),
      valAxisLabelColor: hex(t.colors.textSecondary),
      catAxisLabelFontSize: 11,
      valAxisLabelFontSize: 11,
      showCatName: false,
      showMarker: true,
      showLine: true,
      showShadow: false,
      showCatName: false,
      catAxisLineColor: hex(t.colors.border),
      valGridLine: { color: hex(t.colors.border), width: 0.5 },
    };
  if (["line", "horizontal-bar", "vertical-bar", "ranking"].includes(c.type)) {
    slide.addChart(
      c.type === "line" ? pptx.ChartType.line : pptx.ChartType.bar,
      [
        {
          name: c.unit || "값",
          labels: c.data.map((d) => d.label),
          values: c.data.map((d) => d.value),
        },
      ],
      {
        ...base,
        barDir: ["horizontal-bar", "ranking"].includes(c.type) ? "bar" : "col",
        showMarker: c.type === "line",
      },
    );
    return;
  }
  if (c.type === "scatter") {
    slide.addChart(
      pptx.ChartType.scatter,
      [
        { name: "X", values: c.data.map((d) => d.x) },
        { name: "Y", values: c.data.map((d) => d.y) },
      ],
      { ...base, showLine: false, showValue: false },
    );
    return;
  }
  if (c.type === "ring-gauge") {
    const d = c.data[0];
    slide.addChart(
      pptx.ChartType.doughnut,
      [
        {
          name: d.label,
          labels: ["달성", "잔여"],
          values: [d.value, d.max - d.value],
        },
      ],
      {
        ...base,
        chartColors: [hex(t.colors.accent), hex(t.colors.border)],
        holeSize: 78,
        showValue: false,
        showLabel: false,
      },
    );
    slide.addText(`${Math.round((d.value / d.max) * 100)}%`, {
      x: inches(box.x + box.w * 0.35),
      y: inches(box.y + box.h * 0.38),
      w: inches(box.w * 0.3),
      h: inches(box.h * 0.2),
      fontSize: 28,
      bold: true,
      color: hex(t.colors.textPrimary),
      align: "center",
      margin: 0,
    });
    slide.addText(d.label, {
      x: inches(box.x + box.w * 0.2),
      y: inches(box.y + box.h * 0.86),
      w: inches(box.w * 0.6),
      h: inches(box.h * 0.1),
      fontSize: 12,
      color: hex(t.colors.textSecondary),
      align: "center",
      margin: 0,
    });
    return;
  }
  const sx = box.w / 900,
    sy = box.h / 400;
  for (const p of chartScene(c)) {
    const x = inches(box.x + p.x * sx),
      y = inches(box.y + p.y * sy),
      color = hex(t.colors[p.color]);
    if (p.kind === "text")
      slide.addText(p.text, {
        x,
        y: y - inches(p.size * sy),
        w: inches(Math.max(70, 900 - p.x) * sx),
        h: inches(p.size * 1.5 * sy),
        fontSize: p.size * sy * 0.75,
        fontFace: t.fontFamily.split(",")[0],
        color,
        margin: 0,
        breakLine: false,
      });
    if (p.kind === "rect")
      slide.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w: inches(p.w * sx),
        h: inches(p.h * sy),
        line: { color, transparency: 100 },
        fill: { color },
      });
    if (p.kind === "circle")
      slide.addShape(pptx.ShapeType.ellipse, {
        x: x - inches(p.r * sx),
        y: y - inches(p.r * sy),
        w: inches(p.r * 2 * sx),
        h: inches(p.r * 2 * sy),
        line: { color, transparency: 100 },
        fill: { color },
      });
    if (p.kind === "line")
      slide.addShape(pptx.ShapeType.line, {
        x: inches(box.x + Math.min(p.x, p.x2) * sx),
        y: inches(box.y + Math.min(p.y, p.y2) * sy),
        w: inches(Math.abs(p.x2 - p.x) * sx),
        h: inches(Math.abs(p.y2 - p.y) * sy),
        flipV: p.y2 < p.y,
        line: { color, width: p.color === "border" ? 0.5 : 2 },
      });
  }
}
