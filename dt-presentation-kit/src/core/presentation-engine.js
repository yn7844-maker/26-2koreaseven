import { el, clone, mergeTheme, applyTheme } from "./utils.js";
import { renderSlide, detectOverflow } from "./slide-engine.js";
import { AnimationEngine } from "./animation-engine.js";
import { validatePresentation, validateChart } from "./validation.js";
import { setupNavigation } from "./navigation.js";
import { exportPptx } from "../export/pptx-exporter.js";
export class PresentationEngine {
  constructor(root, p) {
    this.root = root;
    this.presentation = clone(p);
    this.index = 0;
    this.motion = new AnimationEngine(p.animation);
    this.build();
    this.load(p);
    this.unbind = setupNavigation(this);
  }
  message(text, error = false) {
    this.status.textContent = text;
    this.status.classList.toggle("error", error);
  }
  build() {
    this.root.innerHTML = `<header class="app-header"><a class="brand" href="#"><span class="brand-mark">DT</span><span>Presentation Kit<small>SEVEN ELEVEN · WORKSPACE</small></span></a><div class="header-actions"><span class="demo-badge">DEMO DATA</span><button id="import">JSON 불러오기</button><button id="download-json">JSON 저장</button><button id="export" class="primary">Export PPTX ↗</button></div></header><div class="workspace"><aside class="sidebar"><div class="sidebar-heading">SLIDE LIBRARY <span id="total"></span></div><nav id="thumbnails" aria-label="슬라이드 탐색"></nav><div class="sidebar-foot">CONFIG-DRIVEN PRESENTATIONS<br>Design once. Present again.</div></aside><main><div class="stage-meta"><div><span class="overline">PRESENTATION</span><h1 id="deck-title"></h1></div><div><label>재생 모드 <select id="mode"><option value="static">Static</option><option value="presentation" selected>Presentation</option><option value="loop">Loop · 8s</option></select></label></div></div><div class="stage-viewport"><div id="stage"></div></div><div class="transport"><span id="position"></span><div class="transport-buttons"><button id="prev" aria-label="Previous">← Previous</button><button id="play">Play</button><button id="pause">Pause</button><button id="replay">↻ Replay</button><button id="next" aria-label="Next">Next →</button></div><button id="fullscreen">⛶ Fullscreen</button></div><p id="status" role="status" aria-live="polite"></p><section class="workbench"><div><span class="overline">MAKE IT YOURS</span><h2>내용에 집중하세요.</h2><p>텍스트, 데이터, 테마를 바꾸면 같은 디자인으로 다시 만듭니다.</p></div><div class="theme-controls"><label>Primary<input id="primary" type="color"></label><label>Accent<input id="accent" type="color"></label><label>Font<select id="font"><option>Pretendard</option><option>Arial</option><option>Noto Sans KR</option></select></label><button id="edit">현재 장표 JSON 편집</button></div></section><details class="shortcuts"><summary>키보드 단축키 · 사용 안내</summary><p>← → 장표 이동 · Space 재생/정지 · R 다시 재생 · F 전체 화면</p><p>PPTX는 편집 가능한 정적 자료입니다. 데모 수치는 실제 회사 실적이 아닙니다.</p></details></main></div><dialog id="editor"><form method="dialog"><header><h2>슬라이드 JSON 편집</h2><button value="cancel" aria-label="닫기">×</button></header><p>텍스트·데이터·차트 유형을 수정하세요. 적용 전 데이터를 검증합니다.</p><textarea id="json-editor" spellcheck="false" aria-label="슬라이드 JSON"></textarea><p id="editor-error" role="alert"></p><footer><button value="cancel">취소</button><button id="apply" type="button" class="primary">변경 적용</button></footer></form></dialog><input type="file" id="file" accept=".json,application/json" hidden>`;
    const q = (id) => this.root.querySelector("#" + id);
    this.q = q;
    this.stage = q("stage");
    this.status = q("status");
    this.thumbs = q("thumbnails");
    for (const [id, fn] of Object.entries({
      prev: () => this.previous(),
      next: () => this.next(),
      play: () => this.play(),
      pause: () => this.pause(),
      replay: () => this.replay(),
      fullscreen: () => this.fullscreen(),
      export: () => this.export(),
      import: () => q("file").click(),
      edit: () => {
        q("json-editor").value = JSON.stringify(
          this.presentation.slides[this.index],
          null,
          2,
        );
        q("editor-error").textContent = "";
        q("editor").showModal();
      },
      apply: () => {
        try {
          const s = JSON.parse(q("json-editor").value),
            p = clone(this.presentation);
          p.slides[this.index] = s;
          const errors = validatePresentation(p);
          if (errors.length) throw Error(errors.join(" "));
          this.load(p);
          q("editor").close();
        } catch (e) {
          q("editor-error").textContent = e.message;
        }
      },
      "download-json": () => {
        const a = el("a");
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(this.presentation, null, 2)], {
            type: "application/json",
          }),
        );
        a.href = url;
        a.download = "presentation.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
    }))
      q(id).onclick = fn;
    q("mode").onchange = (e) => {
      this.presentation.animation.mode = e.target.value;
      this.motion.setMode(e.target.value);
    };
    for (const key of ["primary", "accent"])
      q(key).oninput = (e) =>
        this.setTheme({ colors: { [key]: e.target.value } });
    q("font").onchange = (e) =>
      this.setTheme({ fontFamily: e.target.value + ", Arial, sans-serif" });
    q("file").onchange = async (e) => {
      try {
        const data = JSON.parse(await e.target.files[0].text());
        this.load({
          ...this.presentation,
          ...data,
          theme: mergeTheme(this.presentation.theme, data.theme),
          animation: { ...this.presentation.animation, ...data.animation },
        });
      } catch (error) {
        this.message(error.message, true);
      }
      e.target.value = "";
    };
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.stage.parentElement);
    document.addEventListener("fullscreenchange", () => this.resize());
  }
  load(p) {
    const errors = validatePresentation(p);
    if (errors.length) throw Error(errors.join(" "));
    this.presentation = clone(p);
    this.motion.config = this.presentation.animation;
    this.motion.mode = this.presentation.animation.mode;
    applyTheme(this.root, p.theme);
    this.q("deck-title").textContent = p.meta.title;
    this.q("total").textContent = p.slides.length;
    this.q("primary").value = p.theme.colors.primary;
    this.q("accent").value = p.theme.colors.accent;
    this.q("mode").value = p.animation.mode;
    const family = p.theme.fontFamily.split(",")[0].replaceAll('"', "").trim();
    if ([...this.q("font").options].some((o) => o.value === family))
      this.q("font").value = family;
    this.thumbs.replaceChildren();
    p.slides.forEach((s, i) => {
      const b = el("button", "thumbnail");
      b.setAttribute("aria-label", `${i + 1}. ${s.title}`);
      const preview = el("div", "thumb-window"),
        mini = el("div", "thumb-scale");
      renderSlide(mini, s, p.theme, i, p.slides.length);
      preview.append(mini);
      b.append(
        preview,
        el(
          "span",
          "thumb-title",
          `${String(i + 1).padStart(2, "0")}  ${s.title.replaceAll("\n", " ")}`,
        ),
      );
      b.onclick = () => this.go(i);
      this.thumbs.append(b);
    });
    this.go(Math.min(this.index, p.slides.length - 1));
  }
  go(i) {
    this.index = Math.max(0, Math.min(i, this.presentation.slides.length - 1));
    this.stage.replaceChildren();
    const s = this.presentation.slides[this.index],
      node = renderSlide(
        this.stage,
        s,
        this.presentation.theme,
        this.index,
        this.presentation.slides.length,
      );
    this.motion.attach(node);
    this.q("position").textContent =
      `${String(this.index + 1).padStart(2, "0")} / ${this.presentation.slides.length}`;
    this.thumbs.querySelectorAll(".thumbnail").forEach((b, j) => {
      b.classList.toggle("active", j === this.index);
      b.setAttribute("aria-current", j === this.index ? "true" : "false");
    });
    this.q("prev").disabled = this.index === 0;
    this.q("next").disabled =
      this.index === this.presentation.slides.length - 1;
    this.resize();
    requestAnimationFrame(() => {
      const issues = detectOverflow(node);
      this.message(
        issues.length
          ? "넘침 경고: " + issues.join(" · ")
          : "가상 데이터 데모 · PPTX에서는 텍스트·도형·표·차트를 편집할 수 있습니다.",
        !!issues.length,
      );
    });
  }
  resize() {
    const v = this.stage.parentElement;
    const scale = Math.min(
      v.clientWidth / 1280,
      (document.fullscreenElement ? window.innerHeight - 20 : Infinity) / 720,
    );
    this.stage.style.transform = `scale(${scale})`;
    v.style.height = 720 * scale + "px";
  }
  next() {
    this.go(this.index + 1);
  }
  previous() {
    this.go(this.index - 1);
  }
  play() {
    this.motion.play();
  }
  pause() {
    this.motion.pause();
  }
  replay() {
    this.motion.replay();
  }
  async fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await this.stage.parentElement.requestFullscreen();
    } catch (e) {
      this.message("전체 화면을 열 수 없습니다: " + e.message, true);
    }
  }
  setTheme(patch) {
    this.load({
      ...this.presentation,
      theme: mergeTheme(this.presentation.theme, patch),
    });
  }
  changeChartData(id, data, chartIndex) {
    const p = clone(this.presentation),
      s = p.slides.find((s) => s.id === id);
    if (!s) throw Error("슬라이드를 찾을 수 없습니다.");
    const chart = chartIndex === undefined ? s.chart : s.charts?.[chartIndex];
    if (!chart) throw Error("대상 차트를 찾을 수 없습니다.");
    const errors = validateChart({ ...chart, data });
    if (errors.length) throw Error(errors.join(" "));
    chart.data = data;
    this.load(p);
  }
  async export() {
    const button = this.q("export");
    button.disabled = true;
    try {
      const warnings = await exportPptx(this.presentation);
      this.message(
        warnings.length
          ? warnings.join(" ")
          : "presentation.pptx 다운로드 완료 · PowerPoint에서 최종 배치를 확인하세요.",
        warnings.length > 0,
      );
    } catch (e) {
      this.message("내보내기 실패: " + e.message, true);
    } finally {
      button.disabled = false;
    }
  }
}
