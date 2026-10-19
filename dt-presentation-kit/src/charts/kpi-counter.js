import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const a = d[0];
  text(70, 90, a.label, 25);
  text(70, 235, fmt(a.value) + (a.unit || ""), 100, "accent");

  return out;
}
import { renderScene } from "./svg-renderer.js";
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "kpi-counter" }, theme, scene);
