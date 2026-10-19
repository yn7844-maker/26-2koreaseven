import { scene as sharedScene } from "./cartesian.js";
import { renderScene } from "./svg-renderer.js";
export const scene = (c) => sharedScene({ ...c, type: "scatter" });
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "scatter" }, theme, scene);
