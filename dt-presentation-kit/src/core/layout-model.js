export function layoutSlide(s) {
  const items = [],
    text = (x, y, w, h, text, role = "body", color = "textPrimary") =>
      items.push({
        kind: "text",
        x,
        y,
        w,
        h,
        text: String(text ?? ""),
        role,
        color,
      });
  const box = (x, y, w, h) => items.push({ kind: "box", x, y, w, h });
  if (s.type === "title") {
    text(64, 105, 1100, 35, s.eyebrow, "caption", "accent");
    text(64, 185, 1140, 185, s.title, "display");
    text(64, 405, 1100, 40, s.subtitle, "subtitle");
    text(64, 475, 1100, 45, s.description, "body", "textSecondary");
    return items;
  }
  text(64, 54, 1152, 70, s.title, "title");
  if (s.subtitle)
    text(64, 127, 1152, 35, s.subtitle, "subtitle", "textSecondary");
  if (s.type === "section") {
    text(64, 200, 250, 100, s.number, "kpiLarge", "accent");
    text(64, 340, 1100, 100, s.description, "sectionTitle");
  }
  if (["key-message", "conclusion"].includes(s.type)) {
    text(64, 200, 1152, 130, s.statement, "sectionTitle");
    (s.points || []).forEach((v, i) => {
      box(64 + i * 392, 390, 368, 180);
      text(88 + i * 392, 414, 320, 40, `0${i + 1}`, "caption", "accent");
      text(88 + i * 392, 468, 320, 80, v);
    });
  }
  if (s.type === "kpi") {
    (s.kpis || []).forEach((k, i) => {
      const ww = 1152 / s.kpis.length - 20,
        xx = 64 + i * (ww + 20);
      box(xx, 220, ww, 300);
      text(xx + 24, 250, ww - 48, 45, k.label, "subtitle");
      items.push({
        kind: "counter",
        x: xx + 24,
        y: 325,
        w: ww - 48,
        h: 90,
        value: k.value,
        unit: k.unit,
        role: "kpiLarge",
        color: "primary",
      });
      text(xx + 24, 447, ww - 48, 40, k.delta || "", "body", "positive");
    });
  }
  if (["chart-insight", "full-chart"].includes(s.type)) {
    items.push({
      kind: "chart",
      x: 64,
      y: 190,
      w: s.type === "chart-insight" ? 780 : 1152,
      h: 415,
      chart: s.chart,
    });
    if (s.type === "chart-insight")
      (s.insights || []).forEach((v, i) => {
        text(880, 220 + i * 110, 330, 80, v, "body");
      });
  }
  if (["comparison", "three-column"].includes(s.type)) {
    const cols = s.columns || [];
    cols.forEach((c, i) => {
      const ww = 1152 / cols.length - 20,
        xx = 64 + i * (ww + 20);
      box(xx, 210, ww, 340);
      text(
        xx + 28,
        245,
        ww - 56,
        85,
        c.title,
        "sectionTitle",
        i ? "accent" : "primary",
      );
      text(xx + 28, 340, ww - 56, 180, c.body, "body", "textSecondary");
    });
  }
  if (["process", "timeline"].includes(s.type)) {
    const ss = s.steps || [];
    ss.forEach((v, i) => {
      const ww = 1152 / ss.length - 24,
        xx = 64 + i * (ww + 24);
      box(xx, 260, ww, 240);
      text(
        xx + 20,
        285,
        ww - 40,
        35,
        String(i + 1).padStart(2, "0"),
        "caption",
        "accent",
      );
      text(xx + 20, 345, ww - 40, 55, v.title, "subtitle");
      text(xx + 20, 410, ww - 40, 70, v.body);
      if (i < ss.length - 1) text(xx + ww, 355, 24, 30, "→", "body", "accent");
    });
  }
  if (s.type === "table")
    items.push({
      kind: "table",
      x: 64,
      y: 200,
      w: 1152,
      h: 370,
      headers: s.headers,
      rows: s.rows,
      highlightCells: s.highlightCells || [],
    });
  if (s.type === "dashboard") {
    const n = s.charts.length,
      cols = n <= 2 ? 2 : n <= 4 ? 2 : 3,
      rows = Math.ceil(n / cols);
    s.charts.forEach((chart, i) => {
      const ww = 1152 / cols - 20,
        hh = 430 / rows - 16,
        xx = 64 + (i % cols) * (ww + 20),
        yy = 190 + Math.floor(i / cols) * (hh + 16);
      box(xx, yy, ww, hh);
      items.push({
        kind: "chart",
        x: xx + 12,
        y: yy + 12,
        w: ww - 24,
        h: hh - 24,
        chart,
      });
    });
  }
  return items;
}
