import { renderScene } from "../charts/primitives.js";
import { validateChart } from "./validation.js";
import { el } from "./utils.js";
export function renderChart(container, chart, theme) {
  const errors = validateChart(chart);
  if (errors.length) {
    container.append(el("div", "validation-warning", errors.join(" ")));
    return { destroy: () => container.replaceChildren() };
  }
  return renderScene(container, chart, theme);
}
