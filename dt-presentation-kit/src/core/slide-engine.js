import { el, applyTheme, fmt } from "./utils.js";
import { layoutSlide } from "./layout-model.js";
import { renderChart } from "./chart-engine.js";
export function slideTheme(s, t) {
  return s.variant === "dark"
    ? {
        ...t,
        colors: {
          ...t.colors,
          surface: t.colors.darkBackground,
          textPrimary: t.colors.darkText,
          textSecondary: t.colors.darkText,
          primary: t.colors.accent,
          primaryLight: t.colors.primaryDark,
          border: t.colors.secondary,
        },
      }
    : t;
}
export function renderSlide(container, s, theme, index = 0, total = 1) {
  const t = slideTheme(s, theme),
    node = el("article", "slide " + (s.variant === "dark" ? "dark" : ""));
  node.dataset.slideId = s.id;
  applyTheme(node, t);
  for (const item of layoutSlide(s)) {
    let n = el("div", "item " + item.kind);
    Object.assign(n.style, {
      left: item.x + "px",
      top: item.y + "px",
      width: item.w + "px",
      height: item.h + "px",
    });
    if (item.kind === "text" || item.kind === "counter") {
      n.classList.add(item.role);
      n.style.color = t.colors[item.color];
      n.textContent =
        item.kind === "counter"
          ? fmt(item.value) + (item.unit || "")
          : item.text;
      n.dataset.motion = "text";
      if (item.kind === "counter") {
        n.dataset.count = item.value;
        n.dataset.unit = item.unit || "";
      }
    }
    if (item.kind === "chart") {
      n.dataset.animation = JSON.stringify(item.chart.animation || {});
      renderChart(n, item.chart, t);
    }
    if (item.kind === "table") {
      const table = el("table"),
        head = el("thead"),
        hr = el("tr");
      for (const h of item.headers) hr.append(el("th", "", h));
      head.append(hr);
      table.append(head);
      const body = el("tbody");
      item.rows.forEach((r, ri) => {
        const tr = el("tr");
        r.forEach((v, ci) => {
          const td = el("td", "", v);
          if (item.highlightCells.some(([a, b]) => a === ri && b === ci))
            td.className = "highlight";
          tr.append(td);
        });
        body.append(tr);
      });
      table.append(body);
      n.append(table);
    }
    node.append(n);
  }
  if (theme.logo) {
    const img = el("img", "slide-logo");
    img.src = theme.logo;
    img.alt = "회사 로고";
    node.append(img);
  }
  const foot = el("footer", "slide-footer");
  foot.append(
    el("span", "", s.source || s.chart?.source || ""),
    el("span", "", s.note || ""),
    el(
      "span",
      "",
      `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
    ),
  );
  node.append(foot);
  container.append(node);
  return node;
}
export function detectOverflow(node) {
  const issues = [];
  node.querySelectorAll(".text,.counter,td,th").forEach((n) => {
    if (
      n.scrollHeight > n.clientHeight + 3 ||
      n.scrollWidth > n.clientWidth + 3
    )
      issues.push(n.textContent.slice(0, 45));
  });
  return [...new Set(issues)];
}
