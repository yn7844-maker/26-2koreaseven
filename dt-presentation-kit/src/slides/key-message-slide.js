import { renderSlide } from "../core/slide-engine.js";
export default (container, data, theme) =>
  renderSlide(container, { ...data, type: data.type || "key-message" }, theme);
