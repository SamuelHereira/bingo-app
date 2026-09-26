import 'fake-indexeddb/auto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, drawNext } from '../src/draw-engine.js';
import { saveGame, clearGame, loadGame } from '../src/draw-storage.js';

test('IndexedDB conserva números e imágenes binarias entre instancias, sin guardar URLs efímeras', async () => {
  await clearGame();
  assert.equal(await loadGame(), null);
  const numbers = drawNext(drawNext(createGame('numbers'), () => 0), () => 0);
  await saveGame(numbers, []);
  const anotherPage = await import('../src/draw-storage.js?reload');
  assert.deepEqual((await anotherPage.loadGame()).game, numbers);

  const images = [
    { id:'one', name:'uno.png', hash:'hash1', blob:new Blob(['image1'],{type:'image/png'}), url:'blob:expired1' },
    { id:'two', name:'dos.webp', hash:'hash2', blob:new Blob(['image2'],{type:'image/webp'}), url:'blob:expired2' },
  ];
  let game = createGame('images', images);
  await saveGame(game, images);
  game = drawNext(game, () => 1);
  await saveGame(game);
  const restored = await anotherPage.loadGame();
  assert.deepEqual(restored.game, game);
  assert.deepEqual(restored.game.drawn, ['two']);
  assert.deepEqual(restored.game.available, ['one']);
  assert.equal(await restored.images[1].blob.text(), 'image2');
  assert.equal(restored.images[1].blob.type, 'image/webp');
  assert.equal(restored.images[1].url, undefined);
  await clearGame();
  assert.equal(await anotherPage.loadGame(), null);
});
