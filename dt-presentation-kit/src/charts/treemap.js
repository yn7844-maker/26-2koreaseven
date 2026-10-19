import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const root = d3.hierarchy({ children: d }).sum((a) => a.value || 0);
  d3.treemap().size([860, 340]).padding(5)(root);
  root.leaves().forEach((a, i) => {
    rect(
      a.x0 + 20,
      a.y0 + 10,
      a.x1 - a.x0,
      a.y1 - a.y0,
      i % 2 ? "accent" : "primary",
      i,
    );
    text(a.x0 + 34, a.y0 + 40, a.data.label, 18, "surface");
    text(a.x0 + 34, a.y0 + 68, fmt(a.value), 22, "surface");
  });

  return out;
}
import { renderScene } from "./svg-renderer.js";
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "treemap" }, theme, scene);
