import { scene as sharedScene } from "./bar-scene.js";
import { renderScene } from "./svg-renderer.js";
export const scene = (c) => sharedScene({ ...c, type: "ranking" });
export default (container, options, theme) =>
  renderScene(container, { ...options, type: "ranking" }, theme, scene);
