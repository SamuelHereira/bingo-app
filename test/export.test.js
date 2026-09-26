import { test } from "node:test";
import assert from "node:assert/strict";
import { renderCard } from "../src/export.js";
import { cardStyle } from "../src/card-style.js";

test("exportación: color elegido y solo cuadrícula en los cuatro tamaños de imágenes", async () => {
  const originalDocument = globalThis.document,
    originalImage = globalThis.Image;
  const text = [],
    strokes = [],
    images = [],
    fills = [];
  const ctx = {
    fillRect(...args) {
      fills.push({ color: this.fillStyle, args });
    },
    fillText(value) {
      text.push(value);
    },
    drawImage(...args) {
      images.push(args);
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {
      strokes.push(this.strokeStyle);
    },
  };
  const canvas = {
    getContext: () => ctx,
    toBlob(callback) {
      callback(new Blob(["test"], { type: "image/png" }));
    },
  };
  globalThis.document = { createElement: () => canvas };
  globalThis.Image = class {
    naturalWidth = 200;
    naturalHeight = 100;
    async decode() {}
  };
  try {
    for (const size of [3, 4, 5, 6]) {
      text.length = strokes.length = images.length = fills.length = 0;
      const blob = await renderCard({
        type: "images",
        size,
        color: "#a13481",
        cells: Array(size ** 2).fill({ url: "test" }),
      });
      assert.equal(blob.type, "image/png");
      assert.equal(canvas.width, 2000);
      assert.equal(canvas.height, 2000);
      assert.deepEqual(text, []);
      assert.equal(images.length, size ** 2);
      assert.ok(strokes.every((color) => color === "#a13481"));
      for (const args of images) assert.equal(args[3] / args[4], 2);
    }
    text.length = fills.length = 0;
    await renderCard({
      type: "numbers",
      size: 5,
      color: "#a13481",
      cells: Array.from({ length: 25 }, (_, i) => (i === 12 ? null : i + 1)),
    });
    assert.equal(canvas.height, 2280);
    assert.deepEqual(text.slice(0, 5), [..."BINGO"]);
    assert.ok(text.includes("LIBRE"));
    assert.ok(fills.some((fill) => fill.color === "#a13481"));
  } finally {
    globalThis.document = originalDocument;
    globalThis.Image = originalImage;
  }
});

test("los colores claros conservan texto oscuro legible", () => {
  assert.equal(cardStyle("#ffffff").headerText, "#18251d");
  assert.equal(cardStyle("#ffffff").numberText, "#18251d");
  assert.equal(cardStyle("#000000").headerText, "#ffffff");
});
