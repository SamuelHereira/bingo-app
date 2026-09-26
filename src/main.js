import "./style.css";
import { loadImage } from "./image-files.js";
import { mountDraw } from "./draw-ui.js";
import { usedImageBank } from "./draw-engine.js";
import {
  validateCount,
  generateCards,
} from "./engine.js";
import { renderCard, download, exportAll, filename } from "./export.js";
import { cardStyle, defaultColor } from "./card-style.js";

const state = {
  type: "numbers",
  count: "20",
  size: 4,
  color: defaultColor,
  images: [],
  cards: [],
  current: 0,
  busy: false,
  loading: false,
  plan: null,
  calculation: "",
};
const $ = (selector) => document.querySelector(selector);
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
document.querySelector("#app").innerHTML = `
  <header class="topbar"><a class="brand" href="./" aria-label="Bingo, inicio"><span class="brand-icon">▦</span> bingo<span class="brand-dot">.</span></a><span class="top-note">PEQUEÑOS CARTONES, GRANDES MOMENTOS</span><span class="local-badge"><span></span> 100% en tu navegador</span></header>
  <nav class="main-nav" aria-label="Secciones principales"><button id="nav-generator" class="active" aria-current="page" aria-controls="generator-view">Generar cartones</button><button id="nav-draw" aria-controls="draw-view">Sorteo</button></nav>
  <main>
    <div id="generator-view">
    <section class="intro"><div class="eyebrow">CREA · IMPRIME · JUEGA</div><h1>La próxima partida<br>empieza <em>contigo.</em></h1><p>Un bingo tan único como tu grupo. Personaliza tus cartones,<br class="desktop"> descárgalos y que empiece la diversión.</p><div class="intro-decoration" aria-hidden="true"><span class="ball ball-one">24</span><span class="spark">✳</span><span class="ball ball-two">7</span><span class="little-star">✦</span></div></section>
    <div class="workspace">
      <section class="configuration panel" aria-labelledby="config-title"><div class="section-heading"><span class="step">01</span><h2 id="config-title">Prepara tu bingo</h2></div>
        <label class="field-label" for="count">¿Cuántos cartones necesitas?</label><div class="count-control"><button id="minus" aria-label="Reducir cantidad">−</button><input id="count" type="number" min="1" max="5000" step="1" value="20" aria-describedby="count-error"><button id="plus" aria-label="Aumentar cantidad">+</button></div><p id="count-error" class="error" aria-live="polite"></p>
        <fieldset><legend class="field-label">Elige tu tipo de bingo</legend><div class="type-options"><label class="type-option"><input type="radio" name="type" value="numbers" checked><span class="type-symbol">01<span>23</span></span><strong>Números</strong><small>El clásico de siempre</small><span class="radio-dot"></span></label><label class="type-option"><input type="radio" name="type" value="images"><span class="type-symbol picture-symbol">▧</span><strong>Imágenes</strong><small>Hecho a tu manera</small><span class="radio-dot"></span></label></div></fieldset>
        <div id="number-info" class="info-box"><span>✦</span><div><strong>Un clásico que nunca falla</strong><p>Cuadrícula 5 × 5, números del 1 al 75 y una casilla central libre. ¡Todo listo!</p></div></div>
        <div id="image-options" hidden><label class="field-label" for="size">Tamaño de la cuadrícula</label><select id="size"><option value="3">3 × 3 · 9 casillas</option><option value="4" selected>4 × 4 · 16 casillas</option><option value="5">5 × 5 · 25 casillas</option><option value="6">6 × 6 · 36 casillas</option></select><div class="bank-heading"><strong>Tu banco de imágenes</strong><span id="image-count"></span></div><progress id="image-progress" value="0" max="1"></progress><p id="image-help" class="helper"></p><label id="dropzone" class="dropzone" tabindex="0"><span class="upload-icon">↥</span><strong>Arrastra tus imágenes aquí</strong><span>o <u>selecciona archivos</u></span><small>PNG, JPG, WEBP · hasta 15 MB por imagen</small><input id="upload" type="file" multiple accept="image/png,image/jpeg,image/webp" hidden></label><div id="thumbnails" class="thumbnails"></div><p id="capacity" class="helper"></p></div>
        <div class="color-field"><label class="field-label" for="card-color">Color de las cartillas</label><div class="color-picker"><input type="color" id="card-color" value="#216449"><span id="color-value">#216449</span><span id="color-help" class="helper">Bordes y encabezado</span></div></div>
        <button id="generate" class="button primary">Generar 20 cartones <span>↗</span></button><p class="privacy">♧ Tus imágenes se quedan en este dispositivo.</p>
      </section>
      <section class="preview panel" aria-labelledby="preview-title"><div class="preview-heading"><div class="section-heading"><span class="step">02</span><h2 id="preview-title">Tus cartones</h2></div><span id="preview-badge" class="badge">VISTA PREVIA</span></div><div id="preview-area"></div><div id="result-controls" hidden><div class="navigation"><button id="previous" class="icon-button" aria-label="Cartón anterior">←</button><label for="card-select">Cartón <select id="card-select"></select><span id="card-total"></span></label><button id="next" class="icon-button" aria-label="Cartón siguiente">→</button></div><div class="downloads"><button id="download-one" class="button secondary">↓ Descargar PNG</button><button id="download-all" class="button primary">↓ Descargar todos · ZIP</button></div><button id="regenerate" class="text-button">⟳ Regenerar cartones</button></div><div id="empty-caption"><strong>Así se verá tu próxima partida</strong><p>Configura tu bingo y genera tus primeros cartones.</p></div></section>
    </div><div id="status" role="status" aria-live="polite"></div><div id="alert" role="alert" hidden></div>
    <section class="benefits"><div><span>✧</span><p><strong>Cada cartón, diferente</strong><small>Combinaciones únicas para jugar juntos.</small></p></div><div><span>↓</span><p><strong>Listos para imprimir</strong><small>Descarga tus cartones en alta resolución.</small></p></div><div><span>♡</span><p><strong>Sin cuentas, sin complicaciones</strong><small>Solo tú, tu grupo y una buena partida.</small></p></div></section>
    </div><section id="draw-view" hidden aria-label="Sorteo"></section>
  </main><footer><span class="footer-brand">bingo.</span><span>Hecho para compartir buenos momentos.</span><span>De tu pantalla a la mesa ↗</span></footer>
  <dialog id="image-dialog"><button id="close-dialog" class="icon-button" aria-label="Cerrar imagen">×</button><img alt=""><p></p></dialog><input id="replace-input" type="file" accept="image/png,image/jpeg,image/webp" hidden>`;

const drawing = mountDraw($("#draw-view"));
function showSection(section) {
  const draw = section === "draw";
  $("#generator-view").hidden = draw;
  $("#draw-view").hidden = !draw;
  for (const [id, active] of [["#nav-generator", !draw], ["#nav-draw", draw]]) {
    $(id).classList.toggle("active", active);
    if(active) $(id).setAttribute("aria-current", "page"); else $(id).removeAttribute("aria-current");
  }
}
$("#nav-generator").onclick = () => showSection("generator");
$("#nav-draw").onclick = () => showSection("draw");
drawing.ready.then(restored => { if(restored) showSection("draw"); });

const demo = [
  3,
  19,
  34,
  48,
  63,
  12,
  27,
  41,
  53,
  72,
  7,
  22,
  null,
  59,
  68,
  15,
  16,
  38,
  46,
  75,
  9,
  30,
  44,
  55,
  61,
];
let replaceId = null;
function notify(message, error = false) {
  if (error) {
    $("#alert").textContent = message;
    $("#alert").hidden = false;
  } else {
    $("#status").textContent = message;
    $("#alert").hidden = true;
  }
}
let planWorker, planKey = '';
const planCache = new Map();
function calculatePlan() {
  const key = state.type === 'images' && !validateCount(state.count) ? state.size + ':' + Number(state.count) : '';
  if (key === planKey) return;
  planKey = key;
  planWorker?.terminate();
  state.plan = null;
  state.calculation = '';
  if (!key) return;
  if (planCache.has(key)) { state.plan = planCache.get(key); return; }
  state.calculation = 'Calculando y verificando los conjuntos de imágenes…';
  const worker = new Worker(new URL('./image-plan.worker.js', import.meta.url), {type:'module'});
  planWorker = worker;
  worker.onmessage = ({data}) => {
    if (planKey !== key) return;
    if (data.plan) {
      state.plan = data.plan;
      if(planCache.size >= 12) planCache.delete(planCache.keys().next().value);
      planCache.set(key,data.plan);
      state.calculation = '';
      worker.terminate();
    } else if (data.error) { state.calculation = data.error; worker.terminate(); }
    else state.calculation = 'Buscando conjuntos válidos con ' + data.minimum + ' imágenes…';
    sync();
  };
  worker.onerror = () => { if(planKey===key) {state.calculation='No se pudo calcular el banco. Cambia la configuración para reintentar.';sync();} worker.terminate(); };
  worker.postMessage({size:state.size,count:Number(state.count)});
}
function sync() {
  const error = validateCount(state.count),
    count = error ? 1 : Number(state.count),
    k = state.size ** 2;
  const minimum = state.plan?.minimum,
    enough = !!state.plan && state.images.length >= minimum;
  $("#count-error").textContent = error;
  $("#count").setAttribute("aria-invalid", String(!!error));
  $("#number-info").hidden = state.type !== "numbers";
  $("#image-options").hidden = state.type !== "images";
  $("#color-help").textContent =
    state.type === "images" ? "Bordes de la cuadrícula" : "Bordes y encabezado";
  $('#image-count').textContent = state.images.length + ' / ' + (minimum ?? '…');
  $('#image-progress').max = minimum || 1;
  $('#image-progress').value = Math.min(state.images.length,minimum || 0);
  $('#dropzone').hidden = !state.plan;
  $('#image-help').textContent = error
    ? 'Ingresa una cantidad válida para calcular las imágenes necesarias.'
    : !state.plan ? state.calculation
    : count + ' cartones de ' + state.size + ' × ' + state.size + '. Cada cartón contiene ' + k + ' imágenes. Diferencia mínima: ' + state.plan.d + ' imágenes entre cualquier par; comparten como máximo ' + (k-state.plan.d) + '. Necesitas adjuntar ' + minimum + ' imágenes diferentes. ' + (state.plan.exact ? 'Mínimo demostrado.' : 'Banco válido verificado. El mínimo exacto no está demostrado: está entre ' + state.plan.lowerBound + ' y ' + minimum + '.');
  $('#capacity').textContent = !state.plan ? '' : state.images.length + ' imágenes cargadas. ' + (enough ? '✓ Banco suficiente para generar los cartones.' : 'Faltan ' + (minimum-state.images.length) + ' imágenes.');
  $("#generate").disabled =
    !!error ||
    state.busy ||
    state.loading ||
    (state.type === "images" && !enough);
  $("#generate").innerHTML =
    `${state.busy ? "Procesando…" : `Generar ${error ? "" : count} cartones`} <span>↗</span>`;
  for (const id of ["regenerate", "download-one", "download-all"])
    $(`#${id}`).disabled = state.busy || state.loading;
  $("#count").disabled = state.busy;
  $("#size").disabled = state.busy;
  $("#card-color").disabled = state.busy;
  $("#minus").disabled = state.busy;
  $("#plus").disabled = state.busy;
  document
    .querySelectorAll('[name="type"]')
    .forEach((el) => (el.disabled = state.busy));
  $("#upload").disabled = state.busy || state.loading || !state.plan;
  document
    .querySelectorAll("#thumbnails button")
    .forEach((el) => (el.disabled = state.busy || state.loading));
}
function invalidate() {
  calculatePlan();
  state.cards = [];
  state.current = 0;
  renderPreview();
  sync();
}
function renderPreview() {
  const card = state.cards[state.current] || {
    type: state.type,
    size: state.type === "numbers" ? 5 : state.size,
    color: state.color,
    cells:
      state.type === "numbers"
        ? demo
        : Array.from(
            { length: state.size ** 2 },
            (_, i) => state.images[i] || null,
          ),
  };
  const style = cardStyle(card.color);
  $("#preview-area").innerHTML =
    `<div class="bingo-card ${card.type === "images" ? "image-card" : ""} ${!state.cards.length && card.type === "numbers" ? "sample" : ""}" style="--size:${card.size};--card-color:${style.color};--card-header-text:${style.headerText};--card-number-text:${style.numberText};--card-tint:${style.tint}" aria-label="${state.cards.length ? "Cartón generado" : "Cartón de ejemplo"}">${card.type === "numbers" ? `<div class="bingo-letters">${[..."BINGO"].map((c) => `<span>${c}</span>`).join("")}</div>` : ""}<div class="bingo-grid">${card.cells.map((cell) => `<div class="bingo-cell ${cell === null && card.type === "numbers" ? "free" : ""}">${card.type === "images" ? (cell ? `<img src="${cell.url}" alt="${escape(cell.name)}">` : "") : cell === null ? "<span>✳<small>LIBRE</small></span>" : cell}</div>`).join("")}</div></div>`;
  $("#result-controls").hidden = !state.cards.length;
  $("#empty-caption").hidden = !!state.cards.length;
  $("#preview-badge").textContent = state.cards.length
    ? `${state.cards.length} GENERADOS ✓`
    : "VISTA PREVIA";
  if (state.cards.length) {
    $("#card-select").innerHTML = state.cards
      .map(
        (_, i) =>
          `<option value="${i}" ${i === state.current ? "selected" : ""}>${i + 1}</option>`,
      )
      .join("");
    $("#card-total").textContent = ` de ${state.cards.length}`;
    $("#previous").disabled = state.current === 0;
    $("#next").disabled = state.current === state.cards.length - 1;
  }
}
function renderBank() {
  $("#thumbnails").innerHTML = state.images
    .map(
      (img) =>
        `<div class="thumbnail"><button data-view="${img.id}" title="Ver ${escape(img.name)}"><img src="${img.url}" alt="${escape(img.name)}"></button><div><button data-replace="${img.id}" aria-label="Reemplazar ${escape(img.name)}">↻</button><button data-remove="${img.id}" aria-label="Eliminar ${escape(img.name)}">×</button></div></div>`,
    )
    .join("");
}
async function upload(files, replacement = null) {
  if (state.busy || state.loading || !state.plan) return;
  state.loading = true;
  sync();
  const errors = [];
  try {
    for (const [i, file] of Array.from(files).entries()) {
      notify(`Cargando imagen ${i + 1} de ${files.length}…`);
      try {
        const img = await loadImage(file);
        if (
          state.images.some(
            (existing) =>
              existing.id !== replacement && existing.hash === img.hash,
          )
        ) {
          URL.revokeObjectURL(img.url);
          throw new Error(`${file.name}: esta imagen ya está en el banco.`);
        }
        if (replacement) {
          const index = state.images.findIndex((v) => v.id === replacement);
          URL.revokeObjectURL(state.images[index].url);
          state.images[index] = img;
        } else state.images.push(img);
      } catch (error) {
        errors.push(error.message);
      }
      renderBank();
      sync();
    }
    invalidate();
    notify(
      errors.length
        ? errors.join(" ")
        : `${state.images.length} imágenes cargadas.`,
      !!errors.length,
    );
  } finally {
    state.loading = false;
    $("#upload").value = "";
    $("#replace-input").value = "";
    sync();
  }
}
async function generate() {
  if ($("#generate").disabled) return;
  state.busy = true;
  sync();
  try {
    state.cards = await generateCards(
      { ...state, count: Number(state.count) },
      (n, total) => notify(`Generando cartones: ${n} / ${total}…`),
    );
    if (state.type === "images") drawing.setGeneratedBank(usedImageBank(state.cards));
    state.current = 0;
    renderPreview();
    notify(`${state.cards.length} cartones generados correctamente.`);
  } catch (error) {
    notify(error.message, true);
  } finally {
    state.busy = false;
    sync();
  }
}
$("#count").addEventListener("input", (event) => {
  state.count = event.target.value;
  invalidate();
});
for (const [id, delta] of [
  ["minus", -1],
  ["plus", 1],
])
  $(`#${id}`).onclick = () => {
    state.count = String(
      Math.max(1, Math.min(5000, (Number(state.count) || 1) + delta)),
    );
    $("#count").value = state.count;
    invalidate();
  };
document.querySelectorAll('[name="type"]').forEach(
  (el) =>
    (el.onchange = () => {
      state.type = el.value;
      invalidate();
    }),
);
$("#size").onchange = (event) => {
  state.size = Number(event.target.value);
  invalidate();
};
$("#card-color").addEventListener("input", (event) => {
  state.color = event.target.value;
  $("#color-value").textContent = state.color.toUpperCase();
  state.cards.forEach((card) => {
    card.color = state.color;
  });
  renderPreview();
});
$("#generate").onclick = generate;
$("#regenerate").onclick = generate;
$("#upload").onchange = (event) => upload(event.target.files);
$("#replace-input").onchange = (event) => upload(event.target.files, replaceId);
$("#dropzone").onkeydown = (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    $("#upload").click();
  }
};
for (const name of ["dragenter", "dragover"])
  $("#dropzone").addEventListener(name, (event) => {
    event.preventDefault();
    $("#dropzone").classList.add("dragging");
  });
for (const name of ["dragleave", "drop"])
  $("#dropzone").addEventListener(name, (event) => {
    event.preventDefault();
    $("#dropzone").classList.remove("dragging");
    if (name === "drop") upload(event.dataTransfer.files);
  });
$("#thumbnails").onclick = (event) => {
  const button = event.target.closest("button");
  if (!button || state.busy || state.loading) return;
  if (button.dataset.remove) {
    const img = state.images.find((v) => v.id === button.dataset.remove);
    URL.revokeObjectURL(img.url);
    state.images = state.images.filter((v) => v !== img);
    renderBank();
    invalidate();
  }
  if (button.dataset.replace) {
    replaceId = button.dataset.replace;
    $("#replace-input").click();
  }
  if (button.dataset.view) {
    const img = state.images.find((v) => v.id === button.dataset.view);
    $("#image-dialog img").src = img.url;
    $("#image-dialog img").alt = img.name;
    $("#image-dialog p").textContent = img.name;
    $("#image-dialog").showModal();
  }
};
$("#close-dialog").onclick = () => $("#image-dialog").close();
$("#previous").onclick = () => {
  state.current--;
  renderPreview();
};
$("#next").onclick = () => {
  state.current++;
  renderPreview();
};
$("#card-select").onchange = (event) => {
  state.current = Number(event.target.value);
  renderPreview();
};
async function exportCards(all) {
  if (state.busy || !state.cards.length) return;
  state.busy = true;
  sync();
  notify("Preparando descarga…");
  try {
    if (all)
      await exportAll(state.cards, (n, total) =>
        notify(`Preparando ZIP: ${n} / ${total} cartones…`),
      );
    else {
      const index = state.current;
      download(await renderCard(state.cards[index]), filename(index));
    }
    notify("Descarga lista. ¡Que empiece la partida!");
  } catch (error) {
    notify(`No se pudo completar la descarga: ${error.message}`, true);
  } finally {
    state.busy = false;
    sync();
  }
}
$("#download-one").onclick = () => exportCards(false);
$("#download-all").onclick = () => exportCards(true);
renderPreview();
sync();
