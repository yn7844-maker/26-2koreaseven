import { scene as sharedScene } from "./cartesian.js";
import { renderScene } from "./svg-renderer.js";
export const scene = (c) => sharedScene({ ...c, type: "vertical-bar" });
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "vertical-bar" }, theme, scene);
