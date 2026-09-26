import { test } from 'node:test';
import assert from 'node:assert/strict';
import {calculateImagePlan,validatePlan} from '../src/image-plan.js';
import {generateCards,validateCount} from '../src/engine.js';
function verify(sets,k) {
  for(let i=0;i<sets.length;i++) {
    assert.equal(sets[i].length,k);assert.equal(new Set(sets[i]).size,k);
    const current=new Set(sets[i]);
    for(let j=0;j<i;j++) assert.ok(sets[j].filter(id=>current.has(id)).length<=k-Math.ceil(k/4),`pair ${i},${j}`);
  }
}
test('mínimos demostrados: uno, dos y planos proyectivos',()=>{
  for(const size of [3,4,5,6]) {
    assert.equal(calculateImagePlan(size,1).minimum,size*size);
    assert.equal(calculateImagePlan(size,2).minimum,size*size+Math.ceil(size*size/4));
  }
  for(const [size,count,m] of [[3,13,13],[4,5,20],[4,20,21],[4,21,21]]) {
    const plan=calculateImagePlan(size,count);assert.equal(plan.minimum,m);assert.equal(plan.exact,true);verify(plan.sets,size*size);
  }
});
test('todos los pares cumplen 25%, también en lotes grandes',()=>{
  for(const size of [3,4,5,6])for(const count of [40,153]) {
    const plan=calculateImagePlan(size,count);verify(plan.sets,size*size);assert.ok(plan.minimum>=plan.lowerBound);
    assert.equal(plan.exact,plan.minimum===plan.lowerBound);
  }
});
test('rechaza planes alterados, configuración obsoleta y banco insuficiente',async()=>{
  const plan=calculateImagePlan(4,20),images=Array.from({length:21},(_,id)=>({id}));
  const bad=structuredClone(plan);bad.sets[19]=[...bad.sets[0]];
  assert.throws(()=>validatePlan(bad),/diferencia/);
  await assert.rejects(generateCards({type:'images',size:4,count:20,images,plan:bad}),/diferencia/);
  await assert.rejects(generateCards({type:'images',size:4,count:21,images,plan}),/configuración/);
  await assert.rejects(generateCards({type:'images',size:4,count:20,images:images.slice(1),plan}),/21 imágenes/);
  await assert.rejects(generateCards({type:'images',size:4,count:20,images:[...images,images[0]],plan}),/repetidas/);
});
test('generar y regenerar conserva las diferencias con imágenes y color reales',async()=>{
  const plan=calculateImagePlan(4,20),images=Array.from({length:24},(_,id)=>({id}));
  for(let repeat=0;repeat<2;repeat++) {
    const cards=await generateCards({type:'images',size:4,count:20,images,plan,color:'#C7A58E'});
    verify(cards.map(c=>c.cells.map(v=>v.id)),16);
    assert.ok(cards.every(c=>c.color==='#C7A58E'&&c.cells.every(img=>images.includes(img))));
  }
});
test('validación de configuración',()=>{
  for(const count of ['',0,-1,1.3,'abc',Infinity,5001])assert.ok(validateCount(count));
  assert.equal(validateCount('20'),'');
  assert.throws(()=>calculateImagePlan(2,20));assert.throws(()=>calculateImagePlan(4,0));
});
test('bingo numérico: 500 cartones únicos, columnas y centro libre',async()=>{
  const cards=await generateCards({type:'numbers',count:500});
  assert.equal(new Set(cards.map(c=>JSON.stringify(c.cells))).size,500);
  for(const {cells} of cards) {assert.equal(cells[12],null);assert.equal(new Set(cells).size,25);cells.forEach((v,i)=>{if(v!==null)assert.ok(v>=(i%5)*15+1&&v<=((i%5)+1)*15);});}
});
