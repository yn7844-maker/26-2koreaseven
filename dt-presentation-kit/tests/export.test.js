import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import config from "../src/config/presentation.config.js";
import slides from "../data/sample-presentation.js";
import { createPptx } from "../src/export/pptx-exporter.js";
test("PPTX retains editable texts, tables, shapes, charts and workbooks", async () => {
  const { pptx } = createPptx({ ...config, slides });
  const buf = await pptx.write({ outputType: "nodebuffer" }),
    zip = await JSZip.loadAsync(buf);
  const files = Object.keys(zip.files);
  assert.equal(
    files.filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).length,
    slides.length,
  );
  assert.ok(files.some((f) => f.endsWith(".xlsx")));
  assert.ok(files.some((f) => /^ppt\/charts\/chart\d+\.xml$/.test(f)));
  const xmls = await Promise.all(
    files
      .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
      .map((f) => zip.file(f).async("string")),
  );
  assert.ok(xmls.some((x) => x.includes("<a:tbl>")));
  assert.ok(xmls.every((x) => x.includes("<a:t>")));
  assert.ok(xmls.some((x) => x.includes("<p:sp>")));
  assert.ok(
    xmls.every((x) => !x.includes("<p:pic>")),
    "no full-slide screenshot",
  );
  const pres = await zip.file("ppt/presentation.xml").async("string");
  assert.ok(pres.includes('cx="12192000"'));
});
