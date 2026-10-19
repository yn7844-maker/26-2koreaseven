import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const a = d[0];
  text(100, 85, "BEFORE", 19);
  text(560, 85, "AFTER", 19);
  text(100, 210, fmt(a.before), 88, "secondary");
  text(560, 210, fmt(a.after), 88, "accent");
  text(425, 195, "→", 45);
  text(100, 290, a.label + (a.unit ? " · " + a.unit : ""), 22);
  text(
    560,
    290,
    `변화 ${a.after - a.before >= 0 ? "+" : ""}${fmt(a.after - a.before)}`,
    24,
    "accent",
  );

  return out;
}
import { renderScene } from "./svg-renderer.js";
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "before-after" }, theme, scene);
