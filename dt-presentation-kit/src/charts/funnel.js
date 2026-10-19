import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const max = Math.max(...d.map((a) => a.value)),
    step = 320 / d.length;
  d.forEach((a, i) => {
    const ww = (760 * a.value) / max;
    rect(
      450 - ww / 2,
      20 + i * step,
      ww,
      step - 9,
      i % 2 ? "accent" : "primary",
      i,
    );
    text(355, 52 + i * step, `${a.label}  ${fmt(a.value)}`, 18, "surface");
  });

  return out;
}
import { renderScene } from "./svg-renderer.js";
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "funnel" }, theme, scene);
