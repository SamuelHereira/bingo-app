export const differenceFor = k => Math.ceil(k / 4);

// Necessary bounds: total pair intersections and Johnson's packing bound.
export function bankLowerBound(k, count) {
  if (count === 1) return k;
  const d = differenceFor(k), x = BigInt(count);
  for (let n = k + d; ; n++) {
    const q = Math.floor(count * k / n), r = count * k % n;
    const shared = BigInt(n-r)*BigInt(q)*BigInt(q-1)/2n + BigInt(r)*BigInt(q+1)*BigInt(q)/2n;
    if (shared > x*(x-1n)/2n*BigInt(k-d)) continue;
    const w = Math.min(k, n-k), t = w-d+1;
    let bound = 1n;
    for (let j = t-1; j >= 0; j--) bound = BigInt(n-j)*bound/BigInt(w-j);
    if (bound >= x) return n;
  }
}

function checker(n, count, limit) {
  const postings = Array.from({length:n},()=>[]), overlaps = new Uint16Array(count), stamps = new Uint32Array(count);
  let stamp = 0;
  return {
    accepts(set) {
      stamp++;
      for (const id of set) for (const previous of postings[id]) {
        if (stamps[previous] !== stamp) { stamps[previous] = stamp; overlaps[previous] = 0; }
        if (++overlaps[previous] > limit) return false;
      }
      return true;
    },
    add(set, index) { for (const id of set) postings[id].push(index); },
  };
}

export function validatePlan(plan) {
  const {size,count,minimum:n,sets} = plan;
  if (![3,4,5,6].includes(size) || !Number.isInteger(count) || count < 1 || count > 5000 || !Number.isInteger(n) || n < size*size || n > 200000 || !Array.isArray(sets) || sets.length !== count) throw new Error('Plan de imágenes inválido.');
  const k = size*size, check = checker(n,count,k-differenceFor(k));
  sets.forEach((set,i) => {
    if (!Array.isArray(set) || set.length !== k || new Set(set).size !== k || set.some(id=>!Number.isInteger(id)||id<0||id>=n) || !check.accepts(set)) throw new Error('El plan no cumple la diferencia mínima entre todos los cartones.');
    check.add(set,i);
  });
  return true;
}

function plane(q) {
  const n = q*q+q+1, lines = [];
  const add = (a,b) => q===4 ? a^b : (a+b)%q;
  const mul = (a,b) => {
    if (q!==4) return a*b%q;
    let v=0;
    while(b) { if(b&1)v^=a; b>>=1; a<<=1; if(a&4)a^=7; }
    return v;
  };
  for(let a=0;a<q;a++) for(let b=0;b<q;b++) lines.push([...Array.from({length:q},(_,x)=>x*q+add(mul(a,x),b)),q*q+a]);
  for(let x=0;x<q;x++) lines.push([...Array.from({length:q},(_,y)=>x*q+y),q*q+q]);
  lines.push(Array.from({length:q+1},(_,i)=>q*q+i));
  return lines.map(line=>Array.from({length:n},(_,i)=>i).filter(i=>!line.includes(i)));
}

function greedy(n,k,count,d,seed,deadline) {
  const w=Math.min(k,n-k), check=checker(n,count,w-d), sets=[], uses=Array(n).fill(0);
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  let budget=Math.max(3000,count*12);
  while(sets.length<count) {
    if (Date.now() > deadline) return null;
    let accepted;
    for(let attempt=0;attempt<200 && budget-->0;attempt++) {
      const ids=Array.from({length:n},(_,id)=>({id,score:random()+(attempt%3===0?uses[id]:0)})).sort((a,b)=>a.score-b.score).slice(0,w).map(v=>v.id);
      if(check.accepts(ids)) {accepted=ids;break;}
    }
    if(!accepted)return null;
    check.add(accepted,sets.length); accepted.forEach(id=>uses[id]++); sets.push(accepted);
  }
  return w===k ? sets : sets.map(set=>Array.from({length:n},(_,i)=>i).filter(i=>!set.includes(i)));
}

// Affine words over a prime field agree in at most one position.
function fallback(k,count,d) {
  const length=d+1;
  let q=Math.max(length,Math.ceil(Math.sqrt(count)));
  while(Array.from({length:Math.max(0,Math.floor(Math.sqrt(q))-1)},(_,i)=>i+2).some(i=>q%i===0))q++;
  const common=k-length;
  return {minimum:common+length*q,sets:Array.from({length:count},(_,i)=>[
    ...Array.from({length:common},(_,j)=>j),
    ...Array.from({length},(_,j)=>common+j*q+(Math.floor(i/q)*j+i%q)%q),
  ])};
}

export function calculateImagePlan(size,count,onProgress=()=>{}) {
  if (![3,4,5,6].includes(size)||!Number.isInteger(count)||count<1||count>5000) throw new Error('Configuración inválida.');
  const k=size*size,d=differenceFor(k),lowerBound=bankLowerBound(k,count);
  const finish=(minimum,sets)=>{const plan={size,count,k,d,minimum,lowerBound,exact:minimum===lowerBound,sets};validatePlan(plan);return plan;};
  if(count===1)return finish(k,[Array.from({length:k},(_,i)=>i)]);
  if(count*d<=k+d) return finish(k+d,Array.from({length:count},(_,c)=>Array.from({length:k+d},(_,i)=>i).filter(i=>i<c*d||i>=(c+1)*d)));
  if((size===3||size===4)&&count<=size*size+size+1)return finish(size*size+size+1,plane(size).slice(0,count));
  const safe=fallback(k,count,d);
  const deadline=Date.now()+4000;
  // A failed bounded search is not an impossibility proof. Expose that distinction.
  for(let n=lowerBound;n<Math.min(safe.minimum,lowerBound+20);n++) {
    if (Date.now() > deadline) break;
    onProgress(n);
    const sets=greedy(n,k,count,d,12345+count*31+n,deadline);
    if(sets)return finish(n,sets);
  }
  return finish(safe.minimum,safe.sets);
}
