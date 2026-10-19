import "./styles/presentation.css";
import { PresentationEngine } from "./core/presentation-engine.js";
import { resolvePresentation } from "./core/resolve-presentation.js";
try {
  window.presentationKit = new PresentationEngine(
    document.querySelector("#app"),
    resolvePresentation(window.__DT_PRESENTATION__ ?? {}),
  );
} catch (e) {
  document.querySelector("#app").textContent =
    "프레젠테이션을 불러올 수 없습니다: " + e.message;
}
