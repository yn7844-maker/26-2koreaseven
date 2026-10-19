export function setupNavigation(engine) {
  const handler = (e) => {
    if (
      e.target.closest("input,textarea,select") ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    )
      return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      engine.next();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      engine.previous();
    }
    if (e.code === "Space" && !e.target.closest("button")) {
      e.preventDefault();
      engine.motion.state === "playing" ? engine.pause() : engine.play();
    }
    if (e.key.toLowerCase() === "r") engine.replay();
    if (e.key.toLowerCase() === "f") engine.fullscreen();
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}
