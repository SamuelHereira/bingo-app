import { calculateImagePlan, validatePlan } from './image-plan.js';
export function validateCount(value) {
  if (String(value).trim() === '') return 'Debes ingresar la cantidad de cartones.';
  const n=Number(value);
  if (!Number.isSafeInteger(n)) return 'La cantidad debe ser un número entero.';
  if(n<=0)return 'La cantidad de cartones debe ser mayor a 0.';
  if(n>5000)return 'Puedes generar hasta 5.000 cartones por lote.';
  return '';
}
export function shuffle(values) {
  const result=[...values];
  for(let i=result.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
export async function generateCards({type,count,size,images=[],color='#216449',plan},onProgress=()=>{}) {
  const error=validateCount(count);if(error)throw new Error(error);
  if(!['numbers','images'].includes(type))throw new Error('Tipo inválido.');
  let mapping;
  if(type==='images') {
    plan ||= calculateImagePlan(size,count);
    if(plan.size!==size||plan.count!==count)throw new Error('La configuración cambió; recalcula las imágenes.');
    validatePlan(plan);
    if(images.length<plan.minimum)throw new Error(`Necesitas al menos ${plan.minimum} imágenes diferentes.`);
    if(new Set(images.map(image=>image.hash??image.id??image)).size!==images.length)throw new Error('El banco contiene imágenes repetidas.');
    mapping=shuffle(images).slice(0,plan.minimum);
  }
  const cards=[],seen=new Set();
  for(let index=0;index<count;index++) {
    let cells,key;
    if(type==='images')cells=shuffle(plan.sets[index]).map(id=>mapping[id]);
    else do {
      const columns=Array.from({length:5},(_,c)=>shuffle(Array.from({length:15},(_,i)=>c*15+i+1)).slice(0,5));
      cells=Array.from({length:25},(_,i)=>i===12?null:columns[i%5][Math.floor(i/5)]);
      key=JSON.stringify(cells);
    } while(seen.has(key));
    seen.add(key);cards.push({type,size:type==='numbers'?5:size,cells,color});
    if(index%20===0||index===count-1){onProgress(index+1,count);await pause();}
  }
  return type==='images'?shuffle(cards):cards;
}
