import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const x =
    c.type === "scatter"
      ? d3
          .scaleLinear()
          .domain(d3.extent(d, (a) => a.x))
          .nice()
          .range([100, 820])
      : d3
          .scalePoint()
          .domain(d.map((a) => a.label))
          .range([120, 800]);
  const y =
    c.type === "scatter"
      ? d3
          .scaleLinear()
          .domain([
            Math.min(0, ...d.map((a) => a.y)),
            Math.max(1, ...d.map((a) => a.y)),
          ])
          .nice()
          .range([330, 40])
      : sy;
  for (const tick of y.ticks(4)) {
    line(85, y(tick), 850, y(tick));
    text(10, y(tick) + 5, fmt(tick), 14);
  }
  if (c.type === "scatter")
    for (const tick of x.ticks(5)) text(x(tick) - 12, 365, fmt(tick), 14);
  const zero = y(0);
  d.forEach((a, i) => {
    const xx = x(c.type === "scatter" ? a.x : a.label),
      yy = y(c.type === "scatter" ? a.y : a.value);
    if (c.type === "vertical-bar")
      rect(
        xx - 28,
        Math.min(zero, yy),
        56,
        Math.max(1, Math.abs(zero - yy)),
        "primary",
        i,
      );
    else {
      if (c.type === "line" && i)
        line(x(d[i - 1].label), y(d[i - 1].value), xx, yy, "primary", i);
      dot(xx, yy, c.type === "scatter" ? a.size || 8 : 6, "accent", i);
    }
    text(xx - 20, yy - 16, c.type === "scatter" ? a.label : fmt(a.value), 15);
    if (c.type !== "scatter") text(xx - 20, 365, a.label, 15);
  });

  return out;
}
