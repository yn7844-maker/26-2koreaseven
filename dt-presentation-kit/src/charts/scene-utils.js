import * as d3 from "d3";
export function createScene(c) {
  const out = [],
    d = c.data,
    W = 900,
    H = 400;
  const text = (x, y, text, size = 18, color = "textSecondary") =>
    out.push({ kind: "text", x, y, text: String(text), size, color });
  const rect = (x, y, w, h, color = "primary", i = 0) =>
    out.push({ kind: "rect", x, y, w, h, color, i });
  const line = (x, y, x2, y2, color = "border", i = 0) =>
    out.push({ kind: "line", x, y, x2, y2, color, i });
  const dot = (x, y, r = 7, color = "accent", i = 0) =>
    out.push({ kind: "circle", x, y, r, color, i });
  const values = d.flatMap((a) =>
    c.type === "scatter"
      ? [a.x, a.y]
      : ["dumbbell", "before-after"].includes(c.type)
        ? [a.before, a.after]
        : [a.value],
  );
  const extent = [Math.min(0, ...values), Math.max(1, ...values)];
  const sx = d3.scaleLinear().domain(extent).nice().range([130, 820]);
  const sy = d3.scaleLinear().domain(extent).nice().range([330, 40]);
  return { out, d, text, rect, line, dot, sx, sy };
}
