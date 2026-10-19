import chartConfig from "../config/chart.config.js";
export function renderScene(container, c, theme, buildScene) {
  const ns = "http://www.w3.org/2000/svg",
    svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 900 400");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", c.type + " chart");
  for (const p of buildScene(c)) {
    const n = document.createElementNS(
      ns,
      p.kind === "rect"
        ? "rect"
        : p.kind === "circle"
          ? "circle"
          : p.kind === "line"
            ? "line"
            : "text",
    );
    const color = theme.colors[p.color];
    if (p.kind === "text") {
      n.setAttribute("x", p.x);
      n.setAttribute("y", p.y);
      n.setAttribute("font-size", p.size);
      n.setAttribute("fill", color);
      n.textContent = p.text;
    }
    if (p.kind === "rect") {
      for (const k of ["x", "y", "width", "height"])
        n.setAttribute(k, k === "width" ? p.w : k === "height" ? p.h : p[k]);
      n.setAttribute("fill", color);
      n.dataset.motion = c.type === "vertical-bar" ? "growY" : "grow";
    }
    if (p.kind === "circle") {
      n.setAttribute("cx", p.x);
      n.setAttribute("cy", p.y);
      n.setAttribute("r", p.r);
      n.setAttribute("fill", color);
      n.dataset.motion = "point";
      const tip = document.createElementNS(ns, "title");
      tip.textContent =
        c.data[Math.min(p.i || 0, c.data.length - 1)]?.label || c.type;
      n.append(tip);
    }
    if (p.kind === "line") {
      for (const k of ["x1", "y1", "x2", "y2"])
        n.setAttribute(k, k === "x1" ? p.x : k === "y1" ? p.y : p[k]);
      n.setAttribute("stroke", color);
      n.setAttribute(
        "stroke-width",
        p.color === "border" ? 1 : chartConfig.strokeWidth,
      );
      if (p.color !== "border") n.dataset.motion = "draw";
    }
    if (p.kind === "text") {
      n.dataset.motion = "label";
      if (c.type === "kpi-counter" && p.size === 100) {
        n.dataset.count = c.data[0].value;
        n.dataset.unit = c.data[0].unit || "";
      }
      if (c.type === "ring-gauge" && p.size === 64) {
        n.dataset.count = (c.data[0].value / c.data[0].max) * 100;
        n.dataset.unit = "%";
      }
    }
    svg.append(n);
  }
  container.append(svg);
  return { destroy: () => svg.remove() };
}
