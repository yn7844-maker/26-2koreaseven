import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const a = d[0],
    pct = a.value / a.max;
  for (let i = 0; i < 80; i++) {
    const angle = (i / 80) * 2 * Math.PI - Math.PI / 2;
    dot(
      450 + 125 * Math.cos(angle),
      180 + 125 * Math.sin(angle),
      5,
      i / 80 < pct ? "accent" : "border",
      i,
    );
  }
  text(355, 200, fmt(pct * 100) + "%", 64, "textPrimary");
  text(355, 355, a.label, 22);

  return out;
}
import { renderScene } from "./svg-renderer.js";
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "ring-gauge" }, theme, scene);
