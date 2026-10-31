// Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
// PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
import assert from 'node:assert/strict';
import {REGIONAL_CROPS} from '../regional-crops.js';
import {cropDimensions,shootTermination} from '../crops.js';
import {regionalPlant,regionalDevelopment,regionalAxis,regionalPhyllotaxis} from '../regional-plants.js';
import {regionalLeafPoint,regionalBodyPoint} from '../crop-surfaces.js';
import {reproductivePoint,regionalFibreCurve} from '../reproductive-organs.js';

const shared=REGIONAL_CROPS.filter(p=>!['barley','maize','sunflower','soybean'].includes(p.model));
for(const p of shared)for(const season of ['spring','summer','autumn','winter'])for(const maturity of [0,.65,1])for(const variation of [0,.24,1]){
 const s={crop:p.id,season,maturity,variation,seed:1847},d=cropDimensions(s);
 if(d.residue){assert(regionalPlant(s,s.seed).every(o=>o.type==='tube'));continue;}
 const axis=regionalAxis(s,p,8),dev=axis.map(n=>n.dev);
 assert(axis.slice(1).every((n,i)=>n.t>axis[i].t),p.id+' node order');
 assert(dev.slice(1).every((n,i)=>n.age<dev[i].age),p.id+' initiation age order');
 assert(dev[3].size>dev[0].size&&dev[3].size>dev.at(-1).size,p.id+' rank envelope');
 assert(dev.at(-1).internodeExpansion<=dev.at(-1).expansion,p.id+' internodes expand after blades');
 if(season==='spring')assert(axis.at(-1).t-axis.at(-2).t<axis[3].t-axis[2].t,p.id+' compressed growing apex');
 const low=regionalPlant(s,s.seed),high=regionalPlant(s,s.seed,true),leaves=low.filter(o=>o.type==='leaf');
 assert.deepEqual(leaves,high.filter(o=>o.type==='leaf'&&!o.detailOnly),p.id+' LOD preserves development and rotations');
 assert.deepEqual(low,regionalPlant(s,s.seed),p.id+' repeatable layout');
 for(const o of low){
  if(o.type==='tube'){assert(o.points.flat().every(Number.isFinite));assert(o.radii.every(v=>v>0));continue;}
  if(o.type==='fibres'){if(o.count)assert(regionalFibreCurve(o,0).flat().every(Number.isFinite));continue;}
  if(o.type==='patch'||o.type==='corolla'){for(const t of [0,.5,1])assert(reproductivePoint(o,t,.4).every(Number.isFinite));continue;}
  if(o.type==='leaf'){
   assert(o.length>0&&o.width>0);
   for(const t of [0,.21,.6,1])for(const v of [-1,0,1])assert(regionalLeafPoint(o,t,v).every(Number.isFinite));
   const insertion=regionalLeafPoint(o,o.shape==='peltate'?.21:0,0);
   assert(Math.hypot(...insertion.map((v,k)=>v-o.at[k]))<1e-10,p.id+' rotated insertion remains attached');
  }else for(const t of [0,.5,1])assert(regionalBodyPoint(o,t,.4).every(Number.isFinite));
 }
 if(!d.dormant){
  const termination=shootTermination(s),tips=low.filter(o=>o.terminal);
  assert(tips.length||termination==='terminal-inflorescence',p.id+' living apex is covered');
  if(termination==='terminal-inflorescence')assert(!tips.some(o=>(o.axis??o.development?.axis??0)===0&&(o.terminal==='bud'||o.terminal==='spear')),p.id+' terminal flowers replace growing apex');
 }
}
const bySpecies=species=>shared.find(p=>p.species===species),state=p=>({crop:p.id,season:'spring',maturity:.65,seed:1847,variation:0});
for(const species of ['olive','coffee','pomegranate','perilla','yam']){
 const p=bySpecies(species),s=state(p),a=regionalPhyllotaxis(s,p,0,8),b=regionalPhyllotaxis(s,p,1,8);
 assert.equal(a.length,2);assert(Math.abs(a[1]-a[0]-Math.PI)<1e-10);assert(Math.abs(b[0]-a[0]-Math.PI/2)<1e-10);
}
for(const p of shared.filter(p=>p.cereal||p.model==='cane')){
 const s=state(p),a=regionalPhyllotaxis(s,p,0,8),b=regionalPhyllotaxis(s,p,1,8);
 assert.equal(a.length,1);assert(Math.abs(b[0]-a[0]-Math.PI)<1e-10,p.id+' two-ranked grass');
}
const sesame=bySpecies('sesame');assert.equal(regionalPhyllotaxis(state(sesame),sesame,0,8).length,2);assert.equal(regionalPhyllotaxis(state(sesame),sesame,7,8).length,1);
for(const species of ['tea','cacao'])assert.equal(regionalPhyllotaxis(state(bySpecies(species)),bySpecies(species),0,8,1).length,1,'Alternate lateral tree leaves');
const p=bySpecies('cotton'),angles=Array.from({length:1000},(_,seed)=>regionalPhyllotaxis({...state(p),seed},p,0,8)[0]);
assert(Math.abs(angles.reduce((n,a)=>n+Math.sin(a),0)/angles.length)<.08);
assert(Math.abs(angles.reduce((n,a)=>n+Math.cos(a),0)/angles.length)<.08,'No preferred plant azimuth');
const early=regionalDevelopment({...state(p),maturity:0},p,7,8),late=regionalDevelopment({...state(p),maturity:1},p,7,8);
assert(late.expansion>early.expansion&&late.internodeExpansion>early.internodeExpansion,'Stage advances local expansion');
console.log('Regional crop age/rank growth, phyllotaxis, rotations, attachments, apices, seasons and LOD identity passed.');
