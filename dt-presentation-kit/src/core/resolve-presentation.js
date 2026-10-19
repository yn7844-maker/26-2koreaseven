import config from "../config/presentation.config.js";
import demoSlides from "../../data/sample-presentation.js";
import { mergeTheme, clone } from "./utils.js";
import { validatePresentation } from "./validation.js";
export function resolvePresentation(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("프레젠테이션은 JSON 객체여야 합니다.");
  const presentation = {
    meta: { ...config.meta, ...input.meta },
    theme: mergeTheme(config.theme, input.theme),
    animation: { ...config.animation, ...input.animation },
    slides: input.slides ?? demoSlides,
  };
  const errors = validatePresentation(presentation);
  if (errors.length) throw Error(errors.join("\n"));
  return clone(presentation);
}
