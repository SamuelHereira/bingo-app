import { validateGame } from './draw-engine.js';

let database;
function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('bingo-draw', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('session');
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); database = null; };
      resolve(request.result);
    };
    request.onerror = () => { database = null; reject(request.error); };
    request.onblocked = () => { database = null; reject(new Error('El almacenamiento está ocupado en otra pestaña.')); };
  });
  return database;
}

// Save game and image blobs atomically at start; subsequent draws only write IDs.
export async function saveGame(game, images) {
  validateGame(game);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('session', 'readwrite');
    const store = tx.objectStore('session');
    store.put(game, 'game');
    if (images !== undefined) store.put(images.map(({id, name, hash, blob}) => ({id, name, hash, blob})), 'images');
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('No se pudo guardar la partida.'));
  });
}

export async function loadGame() {
  const db = await openDatabase();
  const saved = await new Promise((resolve, reject) => {
    const tx = db.transaction('session', 'readonly'), store = tx.objectStore('session');
    const game = store.get('game'), images = store.get('images');
    tx.oncomplete = () => resolve({game: game.result, images: images.result || []});
    tx.onabort = tx.onerror = () => reject(tx.error);
  });
  if (!saved.game) return null;
  validateGame(saved.game);
  if (saved.game.type === 'images') {
    const bank = new Map(saved.images.map(image => [image.id, image]));
    if (bank.size !== saved.game.bank.length || saved.game.bank.some(id => !(bank.get(id)?.blob instanceof Blob))) throw new Error('No se pudo recuperar el banco de la partida.');
  }
  return saved;
}

export async function clearGame() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('session', 'readwrite');
    tx.objectStore('session').clear();
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () => reject(tx.error);
  });
}
