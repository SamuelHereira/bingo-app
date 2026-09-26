import { createGame, drawNext, restartGame, numberLabel } from './draw-engine.js';
import { loadGame, saveGame, clearGame } from './draw-storage.js';
import { loadImage } from './image-files.js';
import './draw.css';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cloneBank = images => images.map(image => ({...image, url: URL.createObjectURL(image.blob)}));
const releaseBank = images => images.forEach(image => URL.revokeObjectURL(image.url));

export function mountDraw(root) {
  const state = { type: 'numbers', images: [], generated: [], game: null, busy: true, bankSaved: false, saved: false };
  let replacement = null;
  const $ = selector => root.querySelector(selector);
  root.innerHTML = `
    <div class="draw-heading"><div><div class="eyebrow">EL SIGUIENTE PUEDE SER EL TUYO</div><h1>Sorteo<span>.</span></h1><p>Una partida, todos atentos. Cada elemento sale una sola vez.</p></div><button id="draw-fullscreen" class="button secondary" type="button">⛶ Pantalla completa</button></div>
    <p id="draw-storage-note" class="draw-note" role="status">Comprobando si hay una partida guardada…</p>
    <p id="draw-message" class="draw-note" role="status" aria-live="polite"></p>
    <section id="draw-setup" class="panel draw-setup" aria-labelledby="draw-config-title">
      <h2 id="draw-config-title">Prepara el sorteo</h2>
      <fieldset id="draw-types"><legend class="field-label">¿Qué quieres sortear?</legend><div class="type-options"><label class="type-option"><input type="radio" name="draw-type" value="numbers" checked><span class="type-symbol">75</span><strong>Números</strong><small>Bingo tradicional</small><span class="radio-dot"></span></label><label class="type-option"><input type="radio" name="draw-type" value="images"><span class="type-symbol">▧</span><strong>Imágenes</strong><small>Tu propio banco</small><span class="radio-dot"></span></label></div></fieldset>
      <div id="draw-number-info" class="draw-ranges" aria-label="Rangos de números"><span><b>B</b>1–15</span><span><b>I</b>16–30</span><span><b>N</b>31–45</span><span><b>G</b>46–60</span><span><b>O</b>61–75</span></div>
      <div id="draw-image-config" hidden>
        <div id="draw-reuse" class="draw-reuse" hidden><p id="draw-reuse-text"></p><div class="draw-actions"><button id="draw-use-bank" class="button secondary" type="button">Usar estas imágenes</button><button id="draw-other-bank" class="text-button" type="button">Cargar otras imágenes</button></div></div>
        <label id="draw-dropzone" class="dropzone" tabindex="0"><span class="upload-icon">↥</span><strong>Arrastra tus imágenes aquí</strong><span>o <u>selecciona archivos</u></span><small>PNG, JPG, JPEG, WEBP · hasta 15 MB por imagen</small><input id="draw-upload" type="file" multiple accept="image/png,image/jpeg,image/webp" hidden></label>
        <div id="draw-bank" class="thumbnails"></div><input id="draw-replace" type="file" accept="image/png,image/jpeg,image/webp" hidden>
      </div>
      <div class="draw-summary"><div><strong id="draw-summary-title">Bingo tradicional</strong><p id="draw-summary-count">75 números disponibles</p></div><button id="draw-start" class="button primary" type="button">Iniciar sorteo ↗</button></div>
      <p class="helper">Al iniciar, el banco queda fijo. Podrás volver a configurarlo con confirmación.</p>
    </section>
    <section id="draw-game" hidden aria-label="Partida de bingo">
      <div class="draw-game-top"><strong id="draw-game-title"></strong><span id="draw-progress"></span><span id="draw-remaining"></span></div>
      <progress id="draw-progress-bar" aria-label="Progreso del sorteo" value="0" max="75"></progress>
      <div class="draw-board"><div class="draw-stage panel"><span class="eyebrow">ELEMENTO ACTUAL</span><div id="draw-current" aria-live="polite" aria-atomic="true"></div><p id="draw-complete" hidden>Todos los elementos han sido sorteados.</p><button id="draw-next" class="button primary" type="button">SORTEAR</button></div><aside class="draw-previous panel"><h2>Elemento anterior</h2><div id="draw-previous"></div></aside></div>
      <div class="draw-actions draw-game-actions"><button id="draw-reset" class="button secondary" type="button">Reiniciar sorteo</button><button id="draw-config" class="text-button" type="button">Volver a la configuración</button><span class="helper">Puedes ir a Generar cartones y volver sin perder esta partida.</span></div>
      <section class="draw-history panel" aria-labelledby="draw-history-title"><h2 id="draw-history-title">Historial del sorteo</h2><p class="helper">En orden de salida · el más reciente está resaltado.</p><ol id="draw-history"></ol><p id="draw-history-empty">Aquí aparecerán los elementos sorteados.</p></section>
    </section>
    <dialog id="draw-confirm" class="draw-confirm" aria-labelledby="draw-confirm-title" aria-describedby="draw-confirm-text"><form method="dialog"><h2 id="draw-confirm-title"></h2><p id="draw-confirm-text"></p><div class="draw-actions"><button class="button secondary" value="cancel" autofocus>Cancelar</button><button id="draw-confirm-yes" class="button primary" value="confirm">Reiniciar</button></div></form></dialog>`;

  function message(text, error = false) {
    $('#draw-message').textContent = text;
    $('#draw-message').classList.toggle('error', error);
  }
  function storageNote(text) { $('#draw-storage-note').textContent = text; }
  function renderBank() {
    $('#draw-bank').innerHTML = state.images.map(image => `<div class="thumbnail"><img src="${escape(image.url)}" alt="${escape(image.name)}"><div><button type="button" data-replace="${escape(image.id)}" aria-label="Reemplazar ${escape(image.name)}">↻</button><button type="button" data-remove="${escape(image.id)}" aria-label="Eliminar ${escape(image.name)}">×</button></div></div>`).join('');
  }
  function sync() {
    const active = !!state.game;
    $('#draw-setup').hidden = active;
    $('#draw-game').hidden = !active;
    $('#draw-types').disabled = state.busy || active;
    root.querySelectorAll('[name="draw-type"]').forEach(input => { input.checked = input.value === state.type; });
    $('#draw-number-info').hidden = state.type !== 'numbers';
    $('#draw-image-config').hidden = state.type !== 'images';
    $('#draw-reuse').hidden = !state.generated.length;
    $('#draw-reuse-text').textContent = `Se encontraron ${state.generated.length} imágenes utilizadas para generar tus cartones.`;
    $('#draw-summary-title').textContent = state.type === 'numbers' ? 'Bingo tradicional' : 'Bingo de imágenes';
    $('#draw-summary-count').textContent = state.type === 'numbers' ? '75 números disponibles' : `${state.images.length} imágenes disponibles`;
    for (const id of ['draw-upload','draw-replace','draw-use-bank','draw-other-bank']) $(`#${id}`).disabled = state.busy || active;
    $('#draw-dropzone').setAttribute('aria-disabled', String(state.busy || active));
    root.querySelectorAll('#draw-bank button').forEach(button => { button.disabled = state.busy || active; });
    $('#draw-start').disabled = state.busy || (state.type === 'images' && !state.images.length);
    for (const id of ['draw-next','draw-reset','draw-config']) $(`#${id}`).disabled = state.busy || !active;
    if (active && !state.game.available.length) $('#draw-next').disabled = true;
    $('#draw-next').textContent = state.busy ? 'Guardando…' : 'SORTEAR';
  }
  function element(id, compact = false) {
    if (id === undefined) return `<span class="draw-placeholder">${compact ? 'Todavía no hay un elemento anterior' : 'Todo listo para empezar'}</span>`;
    if (state.game.type === 'numbers') {
      const label = numberLabel(id);
      return compact ? `<strong class="draw-small-number">${label}</strong>` : `<div class="draw-number" aria-label="${label}"><span>${label[0]}</span><strong>${id}</strong></div>`;
    }
    const image = state.images.find(image => image.id === id);
    return `<img class="draw-result-image" src="${escape(image.url)}" alt="${escape(image.name)}"><span class="draw-image-name">${escape(image.name)}</span>`;
  }
  function renderGame() {
    if (!state.game) return;
    const {game} = state, total = game.bank.length;
    $('#draw-game-title').textContent = game.type === 'numbers' ? 'Bingo tradicional' : 'Bingo de imágenes';
    $('#draw-progress').textContent = `Sorteados: ${game.drawn.length} / ${total}`;
    $('#draw-remaining').textContent = `Restantes: ${game.available.length}`;
    $('#draw-progress-bar').max = total;
    $('#draw-progress-bar').value = game.drawn.length;
    $('#draw-current').innerHTML = element(game.drawn.at(-1));
    $('#draw-previous').innerHTML = element(game.drawn.at(-2), true);
    $('#draw-complete').hidden = !!game.available.length;
    $('#draw-history-empty').hidden = !!game.drawn.length;
    $('#draw-history').innerHTML = game.drawn.map((id,index) => `<li class="${index === game.drawn.length-1 ? 'latest' : ''}"><span class="draw-history-index">${index+1}.</span>${element(id,true)}${index === game.drawn.length-1 ? '<span class="draw-latest">Último</span>' : ''}</li>`).join('');
  }
  async function persist() {
    try {
      await saveGame(state.game, state.bankSaved ? undefined : state.game.type === 'images' ? state.images : []);
      state.bankSaved = true;
      state.saved = true;
      storageNote('Partida guardada en este navegador. Puedes recuperarla al recargar.');
    } catch {
      state.saved = false;
      storageNote('No se pudo guardar el último estado. Puedes jugar, pero evita recargar o cerrar esta pestaña.');
    }
  }
  function confirm(title, text, button) {
    const dialog = $('#draw-confirm');
    $('#draw-confirm-title').textContent = title;
    $('#draw-confirm-text').textContent = text;
    $('#draw-confirm-yes').textContent = button;
    dialog.returnValue = '';
    return new Promise(resolve => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), {once:true});
      dialog.showModal();
    });
  }
  async function changeGame(action) {
    if (state.busy) return;
    state.busy = true;
    sync();
    try {
      if (action === 'start') {
        state.game = createGame(state.type, state.images);
        state.bankSaved = false;
      } else if (action === 'next') state.game = drawNext(state.game);
      else if (action === 'reset') {
        if (!await confirm('¿Deseas reiniciar el sorteo?', 'Se perderá el historial de elementos sorteados. Todos los elementos volverán a estar disponibles.', 'Reiniciar')) return;
        state.game = restartGame(state.game);
      } else {
        if (!await confirm('¿Volver a la configuración?', 'Se perderá el historial y terminará la partida actual. Podrás cambiar el tipo y el banco de imágenes.', 'Volver a configurar')) return;
        // Do not leave an old persisted game to unexpectedly return after a reload.
        try { await clearGame(); }
        catch (error) { if (state.bankSaved) throw error; }
        state.game = null;
        state.bankSaved = false;
        state.saved = false;
        storageNote('Configura una nueva partida.');
        message('Partida finalizada. Puedes modificar la configuración.');
        return;
      }
      await persist();
      renderGame();
      message('');
    } catch (error) { message(`No se pudo completar la acción: ${error.message}`, true); }
    finally { state.busy = false; sync(); }
  }
  async function upload(files, replaceId = null) {
    if (state.busy || state.game) return;
    state.busy = true; sync();
    const errors = [];
    try {
      for (const file of Array.from(files)) {
        try {
          const image = await loadImage(file);
          if (state.images.some(previous => previous.id !== replaceId && previous.hash === image.hash)) {
            URL.revokeObjectURL(image.url);
            throw new Error(`${file.name}: esta imagen ya está en el banco.`);
          }
          if (replaceId) {
            const index = state.images.findIndex(image => image.id === replaceId);
            if (index < 0) { URL.revokeObjectURL(image.url); throw new Error('La imagen que quieres reemplazar ya no existe.'); }
            URL.revokeObjectURL(state.images[index].url);
            state.images[index] = image;
          } else state.images.push(image);
        } catch (error) { errors.push(error.message); }
      }
      renderBank();
      message(errors.length ? errors.join(' ') : `${state.images.length} imágenes listas para el sorteo.`, !!errors.length);
    } finally { state.busy = false; $('#draw-upload').value = ''; $('#draw-replace').value = ''; sync(); }
  }

  $('#draw-types').onchange = event => {
    if (state.busy || state.game) return;
    state.type = event.target.value; message(''); sync();
  };
  $('#draw-use-bank').onclick = () => {
    if (state.busy || state.game) return;
    releaseBank(state.images); state.images = cloneBank(state.generated);
    renderBank(); sync(); message(`Banco completo reutilizado: ${state.images.length} imágenes.`);
  };
  $('#draw-other-bank').onclick = () => {
    if (state.busy || state.game) return;
    releaseBank(state.images); state.images = []; renderBank(); sync(); $('#draw-upload').click();
  };
  $('#draw-upload').onchange = event => upload(event.target.files);
  $('#draw-replace').onchange = event => upload(event.target.files, replacement);
  $('#draw-bank').onclick = event => {
    const button = event.target.closest('button');
    if (!button || state.busy || state.game) return;
    if (button.dataset.remove) {
      const image = state.images.find(image => image.id === button.dataset.remove);
      URL.revokeObjectURL(image.url); state.images = state.images.filter(item => item !== image); renderBank(); sync();
    } else if (button.dataset.replace) { replacement = button.dataset.replace; $('#draw-replace').click(); }
  };
  $('#draw-dropzone').onkeydown = event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!state.busy && !state.game) $('#draw-upload').click(); }
  };
  for (const name of ['dragenter','dragover','dragleave','drop']) $('#draw-dropzone').addEventListener(name, event => {
    event.preventDefault();
    $('#draw-dropzone').classList.toggle('dragging', !state.busy && !state.game && (name === 'dragenter' || name === 'dragover'));
    if (name === 'drop') upload(event.dataTransfer.files);
  });
  $('#draw-start').onclick = () => changeGame('start');
  $('#draw-next').onclick = () => changeGame('next');
  $('#draw-reset').onclick = () => changeGame('reset');
  $('#draw-config').onclick = () => changeGame('config');
  $('#draw-fullscreen').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.requestFullscreen) await root.requestFullscreen();
      else message('Este navegador no admite pantalla completa. Puedes ampliar la ventana para proyectar.');
    } catch { message('No se pudo activar la pantalla completa. Puedes ampliar la ventana para proyectar.', true); }
  };
  document.addEventListener('fullscreenchange', () => { $('#draw-fullscreen').textContent = document.fullscreenElement ? '⛶ Salir de pantalla completa' : '⛶ Pantalla completa'; });
  window.addEventListener('beforeunload', event => {
    if (state.game && (!state.saved || state.busy)) { event.preventDefault(); event.returnValue = ''; }
  });
  sync();
  const ready = (async () => {
    try {
      const saved = await loadGame();
      if (saved) {
        state.game = saved.game; state.type = saved.game.type;
        state.images = saved.game.type === 'images' ? cloneBank(saved.images) : [];
        state.bankSaved = true; state.saved = true;
        renderBank(); renderGame(); storageNote('Partida recuperada: conservamos el historial y los elementos restantes.');
        return true;
      }
      storageNote('La partida se guardará en este navegador al comenzar.');
      return false;
    } catch {
      storageNote('No se pudo recuperar una partida guardada. Puedes iniciar una nueva; te avisaremos si no se puede guardar.');
      return false;
    } finally { state.busy = false; sync(); }
  })();
  return {
    ready,
    setGeneratedBank(images) {
      releaseBank(state.generated);
      state.generated = cloneBank(images);
      sync();
    },
  };
}
