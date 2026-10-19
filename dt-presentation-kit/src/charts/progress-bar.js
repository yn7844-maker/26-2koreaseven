import { scene as sharedScene } from "./bar-scene.js";
import { renderScene } from "./svg-renderer.js";
export const scene = (c) => sharedScene({ ...c, type: "progress-bar" });
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "progress-bar" }, theme, scene);
