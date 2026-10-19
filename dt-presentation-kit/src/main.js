import "./styles/presentation.css";
import config from "./config/presentation.config.js";
import slides from "../data/sample-presentation.js";
import { PresentationEngine } from "./core/presentation-engine.js";
try {
  window.presentationKit = new PresentationEngine(
    document.querySelector("#app"),
    { ...config, slides },
  );
} catch (e) {
  document.querySelector("#app").textContent =
    "프레젠테이션을 불러올 수 없습니다: " + e.message;
}
