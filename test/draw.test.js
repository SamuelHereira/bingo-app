import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, drawNext, restartGame, validateGame, numberLabel, randomIndex, usedImageBank } from '../src/draw-engine.js';

test('75 números sin repetición, letras correctas e historial cronológico', () => {
  let game = createGame('numbers');
  for (let i = 0; i < 75; i++) {
    const before = structuredClone(game);
    game = drawNext(game);
    assert.equal(game.drawn.length, i+1);
    assert.equal(game.available.length, 74-i);
    assert.deepEqual(game.drawn.slice(0,-1), before.drawn);
    assert.ok(before.available.includes(game.drawn.at(-1)));
    assert.ok(!game.available.includes(game.drawn.at(-1)));
    validateGame(game);
  }
  assert.equal(new Set(game.drawn).size, 75);
  assert.equal(drawNext(game), game);
  for (const [n,label] of [[1,'B'],[15,'B'],[16,'I'],[30,'I'],[31,'N'],[45,'N'],[46,'G'],[60,'G'],[61,'O'],[75,'O']]) assert.equal(numberLabel(n), `${label} - ${n}`);
});

test('azar uniforme: rechaza la cola que introduciría sesgo de módulo', () => {
  let calls = 0;
  assert.equal(randomIndex(75, words => { words[0] = calls++ === 0 ? 0xffffffff : 74; }), 74);
  assert.equal(calls,2);
  for (let i=0;i<75;i++) assert.equal(randomIndex(75, words => {words[0]=i;}),i);
});

test('imágenes: banco completo de todos los cartones, sorteo y reinicio', () => {
  const images = Array.from({length:24}, (_,i)=>({id:`image-${i}`}));
  const bank = usedImageBank([{type:'images',cells:images.slice(0,16)},{type:'images',cells:images.slice(8)},{type:'numbers',cells:[1]}]);
  assert.equal(bank.length,24);
  let game = createGame('images',bank);
  while(game.available.length) game=drawNext(game, length=>length-1);
  assert.deepEqual(game.drawn, images.map(image=>image.id).reverse());
  const reset=restartGame(game);
  assert.deepEqual(reset.available,images.map(image=>image.id));
  assert.deepEqual(reset.drawn,[]);
  assert.equal(game.drawn.length,24);
});

test('restaurar conserva actual, anterior, orden y restantes; rechaza datos corruptos', () => {
  let game=drawNext(drawNext(createGame('numbers'),()=>4),()=>8);
  const restored=JSON.parse(JSON.stringify(game));
  assert.equal(validateGame(restored),true);
  assert.deepEqual(restored,game);
  assert.equal(restored.drawn.at(-1),10);
  assert.equal(restored.drawn.at(-2),5);
  assert.throws(()=>validateGame({...restored,drawn:[5,5]}),/repetidos/);
  assert.throws(()=>createGame('images',[]));
  assert.throws(()=>createGame('images',[{id:'a'},{id:'a'}]));
  assert.throws(()=>createGame('invalid'));
  assert.throws(()=>drawNext(game,()=>100));
});
