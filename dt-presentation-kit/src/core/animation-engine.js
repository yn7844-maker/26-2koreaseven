import { fmt } from "./utils.js";
export class AnimationEngine {
  constructor(config) {
    this.config = config;
    this.mode = config.mode;
    this.animations = [];
    this.state = "paused";
    this.frame = 0;
  }
  restoreCounts() {
    this.node
      ?.querySelectorAll("[data-count]")
      .forEach(
        (n) => (n.textContent = fmt(Number(n.dataset.count)) + n.dataset.unit),
      );
  }
  clear() {
    this.restoreCounts();
    this.animations.forEach((a) => a.cancel());
    this.animations = [];
    cancelAnimationFrame(this.frame);
  }
  attach(node) {
    this.clear();
    this.node = node;
    if (
      this.mode === "static" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.state = "static";
      return;
    }
    this.replay();
  }
  replay() {
    this.clear();
    if (!this.node) return;
    if (
      this.mode === "static" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.state = "static";
      return;
    }
    const c = this.config,
      els = [...this.node.querySelectorAll("[data-motion]")];
    const cycle = Math.max(
      c.totalDuration,
      c.introDuration + c.chartDuration + c.holdDuration,
    );
    this.cycle = cycle;
    els.forEach((n, i) => {
      const local = {
        ...c,
        ...JSON.parse(n.closest("[data-animation]")?.dataset.animation || "{}"),
      };
      const delay =
        local.introDuration + Math.min(i * local.stagger, local.chartDuration);
      let frames = [{ opacity: 0 }, { opacity: 1 }];
      if (n.dataset.motion === "grow")
        frames = [
          { opacity: 0, transform: "scaleX(0)" },
          { opacity: 1, transform: "scaleX(1)" },
        ];
      if (n.dataset.motion === "growY")
        frames = [
          { opacity: 0, transform: "scaleY(0)" },
          { opacity: 1, transform: "scaleY(1)" },
        ];
      if (n.dataset.motion === "point")
        frames = [
          { opacity: 0, transform: "scale(.2)" },
          { opacity: 1, transform: "scale(1)" },
        ];
      if (n.dataset.motion === "draw") {
        const len = n.getTotalLength?.() || 100;
        n.style.strokeDasharray = len;
        frames = [
          { opacity: 1, strokeDashoffset: len },
          { opacity: 1, strokeDashoffset: 0 },
        ];
      }
      const duration =
        n.dataset.motion === "text" ? local.introDuration : local.chartDuration;
      const end = Math.max(0.001, Math.min(0.95, (delay + duration) / cycle));
      const start = Math.min(end - 0.001, delay / cycle);
      n.style.transformBox = "fill-box";
      n.style.transformOrigin =
        n.dataset.motion === "growY" ? "center bottom" : "left center";
      const a = n.animate(
        [
          { ...frames[0], offset: 0 },
          { ...frames[0], offset: start },
          { ...frames[1], offset: end },
          { ...frames[1], offset: 1 },
        ],
        {
          duration: cycle,
          iterations: this.mode === "loop" ? Infinity : 1,
          fill: "both",
          easing: local.easing,
        },
      );
      this.animations.push(a);
    });
    this.started = performance.now();
    this.pausedAt = 0;
    this.state = "playing";
    this.tick();
  }
  tick() {
    if (this.state !== "playing") return;
    let time = this.animations[0]?.currentTime || 0;
    if (this.mode === "loop") time %= this.cycle;
    const f = Math.max(
      0,
      Math.min(
        1,
        (time - this.config.introDuration) /
          Math.max(1, this.config.chartDuration),
      ),
    );
    this.node
      ?.querySelectorAll("[data-count]")
      .forEach(
        (n) =>
          (n.textContent = fmt(Number(n.dataset.count) * f) + n.dataset.unit),
      );
    if (this.mode !== "loop" && time >= this.cycle) this.state = "finished";
    else this.frame = requestAnimationFrame(() => this.tick());
  }
  pause() {
    this.animations.forEach((a) => a.pause());
    this.state = "paused";
    cancelAnimationFrame(this.frame);
  }
  play() {
    if (
      this.mode === "static" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    if (this.state === "finished") {
      this.replay();
      return;
    }
    this.animations.forEach((a) => a.play());
    this.state = "playing";
    this.tick();
  }
  setMode(mode) {
    this.mode = mode;
    this.attach(this.node);
  }
}
