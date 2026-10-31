// Original wheat has its own builder: regional-only attachment tests miss it.
import assert from 'node:assert/strict';
import {wheatSpikeLayout,cerealSpike,cropDimensions} from '../crops.js';
import {createPlantGeometry} from '../crop-model.js';
const key=p=>p.map(v=>Math.round(v*1e7)).join('/');
let florets=0;
for(const seed of [1,37,1847,9131])for(const variation of [0,.24,1])for(const detail of [false,true]){
 const s={crop:'wheat',plantSeed:seed,seed,variation,season:'summer',maturity:.65},spike=wheatSpikeLayout(s),g=createPlantGeometry(s,seed,detail),positions=g.attributes.position.array,organs=g.attributes.organ.array,stems=new Set(),hulls=new Set(),world=p=>p.map((v,k)=>v+spike.origin[k]);
 for(let i=0;i<organs.length;i++){const p=key(Array.from(positions.slice(i*3,i*3+3)));if(organs[i]===0)stems.add(p);if(organs[i]===2)hulls.add(p);}
 // Buffer coordinates are float32: compare with the same precision when welding.
 const emitted=p=>key(Array.from(new Float32Array(world(p))));
 for(const site of spike.spikelets){
  assert(stems.has(emitted(site.base)),'Missing supporting rachilla');
  for(const organ of [...site.glumes,...site.florets]){
   assert(stems.has(emitted(organ.base)),'Support does not reach the actual hull base');
   assert(hulls.has(emitted(organ.base)),'Hull does not meet its support');
   florets++;
  }
 }
 assert(g.attributes.position.array.every(Number.isFinite));g.dispose();
}
console.log(`${florets} original-wheat hull attachments meet emitted support geometry at both detail levels.`);

// The other original cereal also keeps its fertile and sterile spikelets rooted.
for(const seed of [37,1847,9131])for(const detail of [false,true]){
 const s={crop:'barley',seed,plantSeed:seed,variation:.24,season:'summer',maturity:.65},spike=cerealSpike(s),h=cropDimensions(s).h,g=createPlantGeometry(s,seed,detail),p=g.attributes.position.array,organs=g.attributes.organ.array,stems=new Set(),hulls=new Set(),emitted=p=>key(Array.from(new Float32Array(p)));
 for(let i=0;i<organs.length;i++){const k=key(Array.from(p.slice(i*3,i*3+3)));if(organs[i]===0)stems.add(k);if(organs[i]===2)hulls.add(k);}
 for(const [j,t] of spike.nodes.entries()){
  const side=j%2?1:-1,axis=[.018+.025*t*t,h+spike.length*t-.012*t*t,0];
  for(const base of [[axis[0]+side*.004,axis[1]-.001,0],...[1,-1].map(z=>[axis[0]+side*.002,axis[1],z*.0035])]){const k=emitted(base);assert(stems.has(k)&&hulls.has(k),'Barley spikelet misses its emitted support');}
 }g.dispose();
}
console.log('Original barley fertile and sterile spikelets meet their supports.');
