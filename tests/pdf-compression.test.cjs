const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const modules = Promise.all([
  import(pathToFileURL(path.join(__dirname, '../alex-compressor-util/pdf-compression-core.mjs')).href),
  import(pathToFileURL(path.join(__dirname, '../alex-compressor-util/vendor/mupdf/mupdf.mjs')).href)
]);

// Large PDFs are optional local regression fixtures, not runtime/module assets.
const fixturePath = name => path.join(process.env.GARAGE_PDF_FIXTURES_DIR || path.join(__dirname, 'fixtures/pdf'), name);

function text(page) {
  const content = page.toStructuredText();
  try { return content.asText(); } finally { content.destroy(); }
}

test('20 MB regression: masked and large images compress below 750 KB with every page and its appearance preserved', async t => {
  const [{compressPdfBytes}, {default: m}] = await modules;
  const file = fixturePath('20MB-TESTFILE.ORG.pdf');
  if (!fs.existsSync(file)) return t.skip('Set GARAGE_PDF_FIXTURES_DIR to run the large-PDF regression fixtures.');
  const input = fs.readFileSync(file);
  const output = compressPdfBytes(input);
  assert.ok(output.length < 750000, `Actual size: ${output.length}`);
  const original = new m.PDFDocument(input), result = new m.PDFDocument(output);
  try {
    assert.equal(original.countPages(), 19); assert.equal(result.countPages(), 19);
    let worstRMSE = 0;
    for (let i = 0; i < 19; i++) {
      const a = original.loadPage(i), b = result.loadPage(i);
      try {
        assert.deepEqual(b.getBounds(), a.getBounds()); assert.equal(text(b), text(a));
        const x = a.toPixmap(m.Matrix.scale(.5, .5), m.ColorSpace.DeviceRGB, false);
        const y = b.toPixmap(m.Matrix.scale(.5, .5), m.ColorSpace.DeviceRGB, false);
        try {
          const before = x.getPixels(), after = y.getPixels(); assert.equal(after.length, before.length);
          let difference = 0;
          for (let p = 0; p < before.length; p++) difference += (before[p] - after[p]) ** 2;
          worstRMSE = Math.max(worstRMSE, Math.sqrt(difference / before.length));
        } finally { x.destroy(); y.destroy(); }
      } finally { a.destroy(); b.destroy(); }
    }
    assert.ok(worstRMSE < 8, `Images/transparency changed unexpectedly: RMSE ${worstRMSE}`);
    t.diagnostic(`${input.length} -> ${output.length} bytes; 19 rendered pages checked; worst pixel RMSE ${worstRMSE.toFixed(2)}.`);
  } finally { original.destroy(); result.destroy(); }
});

test('5 MB regression: text-only PDF reduces below 2.3 MB with text intact on all 1619 pages', async t => {
  const [{compressPdfBytes}, {default: m}] = await modules;
  const file = fixturePath('5-mb-example-file.pdf');
  if (!fs.existsSync(file)) return t.skip('Set GARAGE_PDF_FIXTURES_DIR to run the large-PDF regression fixtures.');
  const input = fs.readFileSync(file), output = compressPdfBytes(input);
  assert.ok(output.length < 2300000);
  const original = new m.PDFDocument(input), result = new m.PDFDocument(output);
  try {
    assert.equal(result.countPages(), 1619);
    for (let i = 0; i < result.countPages(); i++) {
      const a = original.loadPage(i), b = result.loadPage(i);
      try { assert.deepEqual(b.getBounds(), a.getBounds()); assert.equal(text(b), text(a)); }
      finally { a.destroy(); b.destroy(); }
    }
    t.diagnostic(`${input.length} -> ${output.length} bytes; text verified on all 1619 pages.`);
  } finally { original.destroy(); result.destroy(); }
});
