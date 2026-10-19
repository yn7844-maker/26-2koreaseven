import * as d3 from "d3";
import { fmt } from "../core/utils.js";
import { createScene } from "./scene-utils.js";
export function scene(c) {
  const { out, d, text, rect, line, dot, sx, sy } = createScene(c);

  const step = 300 / d.length;
  const ordered =
    c.type === "ranking" ? [...d].sort((a, b) => b.value - a.value) : d;
  ordered.forEach((a, i) => {
    const yy = 40 + i * step,
      xx =
        c.type === "progress-bar" ? 130 + (690 * a.value) / a.max : sx(a.value),
      zz = c.type === "progress-bar" ? 130 : sx(0);
    text(0, yy + 22, (c.type === "ranking" ? `${i + 1}. ` : "") + a.label, 18);
    rect(130, yy, 690, 28, "primaryLight");
    rect(
      Math.min(zz, xx),
      yy,
      Math.max(1, Math.abs(xx - zz)),
      28,
      i % 2 ? "accent" : "primary",
      i,
    );
    text(
      830,
      yy + 22,
      c.type === "progress-bar"
        ? fmt((a.value / a.max) * 100) + "%"
        : fmt(a.value),
      17,
    );
  });

  return out;
}
