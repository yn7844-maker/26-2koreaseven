export const chartTypes = [
  "line",
  "horizontal-bar",
  "vertical-bar",
  "scatter",
  "dumbbell",
  "ring-gauge",
  "treemap",
  "funnel",
  "ranking",
  "progress-bar",
  "kpi-counter",
  "before-after",
];
export const slideTypes = [
  "title",
  "section",
  "key-message",
  "kpi",
  "chart-insight",
  "full-chart",
  "comparison",
  "three-column",
  "process",
  "timeline",
  "table",
  "dashboard",
  "conclusion",
];
export function validateChart(chart) {
  const errors = [];
  if (!chart || !chartTypes.includes(chart.type))
    return ["지원하지 않는 차트 유형입니다."];
  if (!Array.isArray(chart.data) || !chart.data.length)
    return ["차트 데이터가 비어 있습니다."];
  const fields =
    chart.type === "scatter"
      ? ["x", "y"]
      : ["dumbbell", "before-after"].includes(chart.type)
        ? ["before", "after"]
        : ["value"];
  chart.data.forEach((d, i) => {
    if (!d || typeof d !== "object") {
      errors.push(`${i + 1}행: 데이터 객체가 필요합니다.`);
      return;
    }
    if (typeof d.label !== "string" || !d.label.trim())
      errors.push(`${i + 1}행: label이 필요합니다.`);
    for (const f of fields)
      if (typeof d[f] !== "number" || !Number.isFinite(d[f]))
        errors.push(`${i + 1}행: ${f}는 유한한 숫자여야 합니다.`);
    if (
      ["treemap", "funnel", "ring-gauge", "progress-bar", "ranking"].includes(
        chart.type,
      ) &&
      d.value < 0
    )
      errors.push(`${i + 1}행: 음수를 사용할 수 없습니다.`);
    if (
      ["ring-gauge", "progress-bar"].includes(chart.type) &&
      (!(d.max > 0) || !Number.isFinite(d.max) || d.value > d.max)
    )
      errors.push(`${i + 1}행: 0 ≤ value ≤ max, max > 0이어야 합니다.`);
    if (
      chart.type === "scatter" &&
      d.size !== undefined &&
      (!Number.isFinite(d.size) || d.size <= 0)
    )
      errors.push(`${i + 1}행: size는 양수여야 합니다.`);
  });
  if (
    ["treemap", "funnel"].includes(chart.type) &&
    chart.data.every((d) => d?.value === 0)
  )
    errors.push("최소 하나의 양수가 필요합니다.");
  return errors;
}

export function validateAnimation(config = {}) {
  const errors = [];
  for (const key of [
    "totalDuration",
    "introDuration",
    "chartDuration",
    "stagger",
    "holdDuration",
  ]) {
    if (
      config[key] !== undefined &&
      (!Number.isFinite(config[key]) ||
        config[key] < 0 ||
        (key === "totalDuration" && config[key] === 0))
    )
      errors.push(`${key}: 0 이상의 유한한 시간이 필요합니다.`);
  }
  if (
    config.mode !== undefined &&
    !["static", "presentation", "loop"].includes(config.mode)
  )
    errors.push("재생 모드를 확인하세요.");
  return errors;
}
export function validatePresentation(p) {
  const errors = [];
  if (!p || !Array.isArray(p.slides) || !p.slides.length)
    return ["슬라이드가 필요합니다."];
  errors.push(...validateAnimation(p.animation));
  const ids = new Set();
  p.slides.forEach((s, i) => {
    if (!s || typeof s !== "object") {
      errors.push(`${i + 1}장: 슬라이드 객체가 필요합니다.`);
      return;
    }
    const name = s.id || `${i + 1}장`;
    if (typeof s.id !== "string" || !s.id.trim() || ids.has(s.id))
      errors.push(`${name}: 고유 id가 필요합니다.`);
    ids.add(s.id);
    if (!slideTypes.includes(s.type))
      errors.push(`${name}: 지원하지 않는 레이아웃입니다.`);
    if (typeof s.title !== "string" || !s.title.trim())
      errors.push(`${name}: 제목이 필요합니다.`);
    if (["chart-insight", "full-chart"].includes(s.type) && !s.chart)
      errors.push(`${name}: chart가 필요합니다.`);
    const charts = [
      ...(s.chart ? [s.chart] : []),
      ...(Array.isArray(s.charts) ? s.charts : []),
    ];
    charts.forEach((c) =>
      errors.push(
        ...[...validateChart(c), ...validateAnimation(c?.animation)].map(
          (e) => `${name}: ${e}`,
        ),
      ),
    );
    if (
      s.type === "table" &&
      (!Array.isArray(s.headers) ||
        !s.headers.length ||
        !Array.isArray(s.rows) ||
        !s.rows.length ||
        s.rows.some((r) => !Array.isArray(r) || r.length !== s.headers.length))
    )
      errors.push(`${name}: 표의 headers와 rows의 열 수를 확인하세요.`);
    if (
      ["process", "timeline"].includes(s.type) &&
      (!Array.isArray(s.steps) ||
        s.steps.length < 3 ||
        s.steps.length > 6 ||
        s.steps.some(
          (x) =>
            !x || typeof x.title !== "string" || typeof x.body !== "string",
        ))
    )
      errors.push(`${name}: title, body를 포함하는 3~6개 단계가 필요합니다.`);
    if (
      s.type === "dashboard" &&
      (!Array.isArray(s.charts) || s.charts.length < 2 || s.charts.length > 6)
    )
      errors.push(`${name}: charts는 2~6개입니다.`);
    if (
      ["comparison", "three-column"].includes(s.type) &&
      (!Array.isArray(s.columns) ||
        s.columns.length !== (s.type === "comparison" ? 2 : 3) ||
        s.columns.some(
          (x) =>
            !x || typeof x.title !== "string" || typeof x.body !== "string",
        ))
    )
      errors.push(`${name}: 레이아웃에 맞는 title, body 열이 필요합니다.`);
    if (
      s.type === "kpi" &&
      (!Array.isArray(s.kpis) ||
        s.kpis.length < 3 ||
        s.kpis.length > 4 ||
        s.kpis.some(
          (k) => !k || typeof k.label !== "string" || !Number.isFinite(k.value),
        ))
    )
      errors.push(`${name}: 숫자 value와 label을 가진 KPI 3~4개가 필요합니다.`);
    if (
      ["key-message", "conclusion"].includes(s.type) &&
      (!s.statement ||
        !Array.isArray(s.points) ||
        s.points.length < 2 ||
        s.points.length > 3 ||
        s.points.some((x) => typeof x !== "string"))
    )
      errors.push(`${name}: statement와 2~3개의 points가 필요합니다.`);
    if (
      s.insights !== undefined &&
      (!Array.isArray(s.insights) ||
        s.insights.some((x) => typeof x !== "string"))
    )
      errors.push(`${name}: insights는 텍스트 배열이어야 합니다.`);
  });
  return errors;
}
