import { scene as sharedScene } from "./bar-scene.js";
import { renderScene } from "./svg-renderer.js";
export const scene = (c) => sharedScene({ ...c, type: "horizontal-bar" });
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "horizontal-bar" }, theme, scene);
