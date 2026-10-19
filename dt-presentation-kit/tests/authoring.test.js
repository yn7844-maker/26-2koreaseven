import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolvePresentation } from "../src/core/resolve-presentation.js";
test("deck JSON resolves partial theme and animation without losing defaults", async () => {
  const input = JSON.parse(
    await readFile("../presentations/example/deck.json", "utf8"),
  );
  const p = resolvePresentation(input);
  assert.equal(p.slides.length, 8);
  assert.equal(p.meta.title, input.meta.title);
  assert.ok(p.theme.colors.border);
  assert.equal(p.animation.chartDuration, 1800);
  p.slides[0].title = "changed";
  assert.notEqual(input.slides[0].title, "changed");
});
test("invalid deck data is rejected before generation", () => {
  assert.throws(
    () =>
      resolvePresentation({
        slides: [
          {
            id: "x",
            title: "Bad",
            type: "full-chart",
            chart: { type: "line", data: [] },
          },
        ],
      }),
    /データ|데이터/,
  );
});
