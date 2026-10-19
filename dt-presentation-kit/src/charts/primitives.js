import { chartRegistry } from "./registry.js";
export const chartScene = (c) => chartRegistry[c.type].scene(c);
export const renderScene = (container, c, theme) =>
  chartRegistry[c.type].render(container, c, theme);
