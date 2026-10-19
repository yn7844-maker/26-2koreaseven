import { test, expect } from "@playwright/test";
test("deck navigation, data, theme, animations and export", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".thumbnail")).toHaveCount(22);
  await page.selectOption("#mode", "static");
  const warnings = [];
  for (let i = 0; i < 22; i++) {
    await page.locator(".thumbnail").nth(i).click();
    await expect(page.locator("#position")).toHaveText(
      `${String(i + 1).padStart(2, "0")} / 22`,
    );
    await page.waitForTimeout(20);
    const msg = await page.locator("#status").textContent();
    if (msg.includes("넘침")) warnings.push([i, msg]);
  }
  expect(warnings).toEqual([]);
  await page.locator(".thumbnail").nth(3).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#position")).toHaveText("05 / 22");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#position")).toHaveText("04 / 22");
  await page.evaluate(() =>
    window.presentationKit.changeChartData("trend", [
      { label: "A", value: 100 },
      { label: "B", value: 250 },
    ]),
  );
  await expect(page.locator("#stage svg")).toContainText("250");
  await page.evaluate(() =>
    window.presentationKit.setTheme({
      colors: { primary: "#884422" },
      fontFamily: "Arial",
    }),
  );
  await expect(page.locator("#stage .slide")).toHaveCSS("font-family", "Arial");
  expect(
    await page.locator('#stage svg line[stroke="#884422"]').count(),
  ).toBeGreaterThan(0);
  await page.click("#edit");
  await page.fill("#json-editor", '{"bad":true}');
  await page.click("#apply");
  await expect(page.locator("#editor-error")).not.toBeEmpty();
  await page.locator('#editor button[value="cancel"]').first().click();
  await page.selectOption("#mode", "presentation");
  await page.click("#pause");
  expect(await page.evaluate(() => window.presentationKit.motion.state)).toBe(
    "paused",
  );
  await page.click("#play");
  expect(await page.evaluate(() => window.presentationKit.motion.state)).toBe(
    "playing",
  );
  await page.click("#replay");
  await page.selectOption("#mode", "loop");
  expect(
    await page.evaluate(
      () =>
        window.presentationKit.motion.animations[0].effect.getTiming()
          .iterations,
    ),
  ).toBe(Infinity);
  await page.selectOption("#mode", "static");
  await page.click("#fullscreen");
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  const download = page.waitForEvent("download");
  await page.click("#export");
  const file = await download;
  expect(file.suggestedFilename()).toBe("presentation.pptx");
  await file.saveAs("test-results/presentation.pptx");
  await page.screenshot({ path: "test-results/workspace.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("JSON roundtrip, slide ordering, 16:9 scale and overflow warning", async ({
  page,
}) => {
  await page.goto("/");
  await page.selectOption("#mode", "static");
  const deck = await page.evaluate(() =>
    structuredClone(window.presentationKit.presentation),
  );
  deck.slides = [deck.slides[2], deck.slides[0], deck.slides[3]];
  await page.locator("#file").setInputFiles({
    name: "deck.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(deck)),
  });
  await expect(page.locator(".thumbnail")).toHaveCount(3);
  await expect(page.locator("#stage")).toContainText("74.3%");
  const rect = await page.locator("#stage").boundingBox();
  expect(rect.width / rect.height).toBeCloseTo(16 / 9, 3);
  await page.setViewportSize({ width: 800, height: 900 });
  const small = await page.locator("#stage").boundingBox();
  expect(small.width / small.height).toBeCloseTo(16 / 9, 3);
  await page.evaluate(() => {
    const kit = window.presentationKit;
    const p = structuredClone(kit.presentation);
    p.slides[0].title = "매우 긴 제목 ".repeat(80);
    kit.load(p);
  });
  await expect(page.locator("#status")).toContainText("넘침 경고");
  const download = page.waitForEvent("download");
  await page.click("#download-json");
  expect((await download).suggestedFilename()).toBe("presentation.json");
});
test("KPI animation pauses and returns to final values in static mode", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".thumbnail").nth(2).click();
  await page.waitForTimeout(800);
  await page.click("#pause");
  const paused = await page
    .locator("#stage [data-count]")
    .first()
    .textContent();
  await page.waitForTimeout(150);
  await expect(page.locator("#stage [data-count]").first()).toHaveText(paused);
  await page.selectOption("#mode", "static");
  await expect(page.locator("#stage [data-count]").first()).toHaveText("74.3%");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.selectOption("#mode", "presentation");
  expect(
    await page.evaluate(() => window.presentationKit.motion.animations.length),
  ).toBe(0);
});

test("explicit Play and Replay work from static and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".thumbnail").nth(4).click();
  await expect(page.locator("#status")).toContainText("동작 줄이기");
  expect(
    await page.evaluate(() => presentationKit.motion.animations.length),
  ).toBe(0);
  await page.click("#play");
  expect(await page.evaluate(() => presentationKit.motion.state)).toBe(
    "playing",
  );
  const target = page.locator('#stage [data-motion="grow"]').first();
  await expect(target).toHaveCSS("opacity", "0");
  await expect(target).toHaveCSS("opacity", "1", { timeout: 7000 });
  await page.selectOption("#mode", "static");
  await page.click("#replay");
  await expect(page.locator("#mode")).toHaveValue("presentation");
  expect(
    await page.evaluate(() => presentationKit.motion.animations.length),
  ).toBeGreaterThan(0);
});
