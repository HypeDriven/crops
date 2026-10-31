import assert from 'node:assert/strict';
import {CROPS} from '../crops.js';
import {regionalPlant} from '../regional-plants.js';
import {stalkCurve} from '../crop-surfaces.js';
const angle=(a,b)=>Math.acos(Math.max(-1,Math.min(1,a.reduce((n,v,k)=>n+v*b[k],0)/(Math.hypot(...a)*Math.hypot(...b)||1))));
for(const knots of [[[0,0,0],[.06,.025,0]],[[0,0,0],[.05,.08,0],[.09,.04,.02]],[[0,0,0],[.02,.02,.06]]]){
 const curve=stalkCurve(knots);for(const knot of knots)assert(curve.some(p=>p.every((v,k)=>v===knot[k])),'Curving moved an attachment');
 for(let i=1;i<curve.length-1;i++)assert(angle(curve[i].map((v,k)=>v-curve[i-1][k]),curve[i+1].map((v,k)=>v-curve[i][k]))<Math.PI/4,'Support still has a sharp elbow');
}
let curves=0;
for(const p of Object.values(CROPS).filter(p=>p.region&&!['barley','maize','sunflower','soybean'].includes(p.model)))for(const seed of [1847,9131]){
 const s={crop:p.id,seed,season:'summer',maturity:.45,variation:.24},low=regionalPlant(s,seed),high=regionalPlant(s,seed,true),supports=x=>x.filter(o=>o.type==='tube'&&/pedicel|attachment|Inflorescence branch/.test(o.role||'')).map(o=>({role:o.role,points:o.points}));
 // Floral sampling may add secondary stalks; matched parent paths stay stable.
 for(const tube of supports(low)){
  assert(tube.points.flat().every(Number.isFinite));
  if(tube.points.length>2)curves++;
  assert(supports(high).some(other=>other.role===tube.role&&JSON.stringify(other.points)===JSON.stringify(tube.points)),p.id+' support path changes with detail');
 }
}
assert(curves>100);console.log(`${curves} curved crop supports preserve attachment knots and renderer/detail identity.`);
