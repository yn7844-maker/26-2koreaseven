import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  d.forEach((a, i) => {
    const yy = 70 + i * 100;
    text(0, yy + 5, a.label);
    line(sx(a.before), yy, sx(a.after), yy, "secondary", i);
    dot(sx(a.before), yy, 9, "secondary", i * 2);
    dot(sx(a.after), yy, 9, "accent", i * 2 + 1);
    text(sx(a.before) - 15, yy - 22, fmt(a.before));
    text(sx(a.after) - 15, yy - 22, fmt(a.after));
  });

  return out;
}
import { renderScene } from "./svg-renderer.js";
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "dumbbell" }, theme, scene);
