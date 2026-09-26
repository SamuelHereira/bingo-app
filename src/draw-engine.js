export function numberLabel(number) {
  if (!Number.isInteger(number) || number < 1 || number > 75) throw new Error('Número de bingo inválido.');
  return `${'BINGO'[Math.floor((number - 1) / 15)]} - ${number}`;
}

// Rejection sampling avoids modulo bias: every remaining index is equally likely.
export function randomIndex(length, randomWords = words => crypto.getRandomValues(words)) {
  if (!Number.isInteger(length) || length < 1 || length > 0x100000000) throw new Error('No hay elementos disponibles.');
  const limit = Math.floor(0x100000000 / length) * length;
  const words = new Uint32Array(1);
  do { randomWords(words); } while (words[0] >= limit);
  return words[0] % length;
}

export function createGame(type, images = []) {
  const bank = type === 'numbers' ? Array.from({ length: 75 }, (_, i) => i + 1) : images.map(image => image.id);
  const game = { version: 1, type, bank, available: [...bank], drawn: [] };
  validateGame(game);
  return game;
}

export function validateGame(game) {
  if (!game || game.version !== 1 || !['numbers', 'images'].includes(game.type) || !Array.isArray(game.bank) || !game.bank.length || !Array.isArray(game.available) || !Array.isArray(game.drawn)) throw new Error('Partida guardada inválida.');
  const ids = [...game.available, ...game.drawn];
  const bank = new Set(game.bank);
  if (bank.size !== game.bank.length || ids.length !== bank.size || new Set(ids).size !== bank.size || ids.some(id => !bank.has(id))) throw new Error('La partida contiene elementos repetidos o faltantes.');
  if (game.type === 'numbers' && (bank.size !== 75 || game.bank.some(n => !Number.isInteger(n) || n < 1 || n > 75))) throw new Error('El bingo numérico requiere los números del 1 al 75.');
  if (game.type === 'images' && game.bank.some(id => typeof id !== 'string' || !id)) throw new Error('Banco de imágenes inválido.');
  return true;
}

export function drawNext(game, pick = randomIndex) {
  validateGame(game);
  if (!game.available.length) return game;
  const index = pick(game.available.length);
  if (!Number.isInteger(index) || index < 0 || index >= game.available.length) throw new Error('Selección inválida.');
  const available = [...game.available];
  const [current] = available.splice(index, 1);
  return { ...game, available, drawn: [...game.drawn, current] };
}

export function restartGame(game) {
  validateGame(game);
  return { ...game, available: [...game.bank], drawn: [] };
}

// Union of every generated card, never just the selected preview or unused uploads.
export function usedImageBank(cards) {
  const bank = new Map();
  for (const card of cards) if (card.type === 'images') for (const image of card.cells) bank.set(image.id, image);
  return [...bank.values()];
}
