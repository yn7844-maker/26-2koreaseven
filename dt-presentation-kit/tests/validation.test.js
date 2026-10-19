import { test } from "node:test";
import assert from "node:assert/strict";
import { validateChart, validatePresentation } from "../src/core/validation.js";
import config from "../src/config/presentation.config.js";
import slides from "../data/sample-presentation.js";
import charts from "../data/sample-charts.js";
import { chartScene } from "../src/charts/primitives.js";
test("all demo layouts and chart scenes are valid", () => {
  assert.equal(validatePresentation({ ...config, slides }).length, 0);
  assert.equal(Object.keys(charts).length, 12);
  for (const c of Object.values(charts)) {
    assert.deepEqual(validateChart(c), []);
    assert.ok(chartScene(c).length);
    for (const p of chartScene(c))
      for (const [k, v] of Object.entries(p))
        if (typeof v === "number") assert.ok(Number.isFinite(v), k);
  }
});
test("reject invalid data and invalid ranges", () => {
  for (const c of [
    { type: "line", data: [] },
    { type: "line", data: [{ value: NaN }] },
    { type: "ring-gauge", data: [{ label: "x", value: 110, max: 100 }] },
    { type: "funnel", data: [{ label: "x", value: -2 }] },
    { type: "scatter", data: [{ label: "x", x: 1, y: undefined }] },
  ])
    assert.ok(validateChart(c).length);
});
test("negative line data retains finite geometry", () => {
  const c = {
    type: "line",
    data: [
      { label: "a", value: -30 },
      { label: "b", value: 15 },
    ],
  };
  assert.deepEqual(validateChart(c), []);
  assert.ok(
    chartScene(c).every((p) =>
      Object.values(p).every(
        (v) => typeof v !== "number" || Number.isFinite(v),
      ),
    ),
  );
});
test("duplicate ids rejected", () =>
  assert.ok(
    validatePresentation({ ...config, slides: [slides[0], slides[0]] }).length,
  ));

test("missing layout content and malformed records are rejected safely", () => {
  for (const slide of [
    { id: "x", title: "x", type: "full-chart" },
    { id: "x", title: "x", type: "kpi", kpis: [] },
    { id: "x", title: "x", type: "table", headers: ["A"], rows: [null] },
    null,
  ])
    assert.ok(validatePresentation({ ...config, slides: [slide] }).length);
  assert.ok(validateChart({ type: "line", data: [null] }).length);
  assert.ok(
    validatePresentation({
      ...config,
      animation: { ...config.animation, chartDuration: -2 },
      slides,
    }).length,
  );
});

test("progress labels use max and ranking sorts descending", () => {
  const progress = chartScene({
    type: "progress-bar",
    data: [{ label: "A", value: 50, max: 200 }],
  });
  assert.ok(progress.some((p) => p.text === "25%"));
  const ranking = chartScene({
    type: "ranking",
    data: [
      { label: "A", value: 2 },
      { label: "B", value: 7 },
    ],
  });
  assert.ok(ranking.some((p) => p.text === "1. B"));
});
