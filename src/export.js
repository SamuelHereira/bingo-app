import { zip } from "fflate";
import { pause } from "./engine.js";
import { cardStyle } from "./card-style.js";

export async function renderCard(card) {
  const style = cardStyle(card.color);
  const canvas = document.createElement("canvas");
  const side = 2000,
    cell = side / card.size,
    header = card.type === "numbers" ? 280 : 0;
  canvas.width = side;
  canvas.height = side + header;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (header) {
    ctx.fillStyle = style.color;
    ctx.fillRect(0, 0, side, header);
    ctx.fillStyle = style.headerText;
    ctx.font = "bold 160px Arial";
    [..."BINGO"].forEach((letter, c) =>
      ctx.fillText(letter, c * cell + cell / 2, header / 2),
    );
  }
  for (let i = 0; i < card.cells.length; i++) {
    const x = (i % card.size) * cell,
      y = Math.floor(i / card.size) * cell + header;
    const value = card.cells[i];
    if (card.type === "numbers") {
      if (value === null) {
        ctx.fillStyle = style.tint;
        ctx.fillRect(x, y, cell, cell);
      }
      ctx.fillStyle = style.numberText;
      ctx.font = `bold ${value === null ? 66 : 135}px Arial`;
      ctx.fillText(
        value === null ? "LIBRE" : String(value),
        x + cell / 2,
        y + cell / 2,
      );
    } else {
      const img = new Image();
      img.src = value.url;
      await img.decode();
      const available = cell - 40,
        ratio = Math.min(
          available / img.naturalWidth,
          available / img.naturalHeight,
        );
      const w = img.naturalWidth * ratio,
        h = img.naturalHeight * ratio;
      ctx.drawImage(img, x + (cell - w) / 2, y + (cell - h) / 2, w, h);
    }
  }
  ctx.strokeStyle = style.color;
  ctx.lineWidth = 5;
  for (let i = 0; i <= card.size; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, header);
    ctx.lineTo(i * cell, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, header + i * cell);
    ctx.lineTo(side, header + i * cell);
    ctx.stroke();
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo exportar el cartón.")),
      "image/png",
    ),
  );
}

export function download(blob, name) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export const filename = (index) =>
  `carton-${String(index + 1).padStart(3, "0")}.png`;

export async function exportAll(cards, progress) {
  const files = {};
  for (let i = 0; i < cards.length; i++) {
    files[filename(i)] = [
      new Uint8Array(await (await renderCard(cards[i])).arrayBuffer()),
      { level: 0 },
    ];
    progress(i + 1, cards.length);
    await pause();
  }
  const bytes = await new Promise((resolve, reject) =>
    zip(files, (error, data) => (error ? reject(error) : resolve(data))),
  );
  download(
    new Blob([bytes], { type: "application/zip" }),
    "cartones-bingo.zip",
  );
}
