// Compare actual organ surfaces and parent connections across the collection.
import assert from 'node:assert/strict';
import {CROPS} from '../crops.js';
import {regionalPlant} from '../regional-plants.js';
import {regionalLeafPoint,regionalBodyPoint} from '../crop-surfaces.js';
const distance=(p,a,b)=>{const d=b.map((v,k)=>v-a[k]),n=d.reduce((s,v)=>s+v*v,0),t=Math.max(0,Math.min(1,p.reduce((s,v,k)=>s+(v-a[k])*d[k],0)/(n||1)));return Math.hypot(...p.map((v,k)=>v-a[k]-t*d[k]));};
let plants=0,sites=0;
for(const p of Object.values(CROPS).filter(p=>p.region&&!['barley','maize','sunflower','soybean'].includes(p.model)))for(const seed of [1847,9131])for(const maturity of [.16,.65,.85]){
 const s={crop:p.id,season:'summer',maturity,seed,variation:.24},layout=regionalPlant(s,seed,false),supports=layout.filter(o=>o.type==='tube'&&!o.reproductive),leaves=layout.filter(o=>o.type==='leaf'&&!o.terminal);
 for(const leaf of leaves){
  const point=regionalLeafPoint(leaf,leaf.shape==='peltate'?.21:0,0);
  assert(supports.some(t=>t.points.slice(1).some((b,i)=>distance(point,t.points[i],b)<Math.max(t.radii[i],t.radii[i+1])+.0005)),p.id+' leaf has no parent stalk');
 }
 if(leaves.length>4){
  // Remove world azimuth, position and size: measure the blade's own geometry.
  const signatures=leaves.map(o=>{
   const a=regionalLeafPoint(o,.65,.65),b=regionalLeafPoint(o,.65,-.65),tip=regionalLeafPoint(o,1,0),c=Math.cos(o.angle),sn=Math.sin(o.angle);
   const local=q=>[c*q[0]+sn*q[2],q[1],-sn*q[0]+c*q[2]];
   return [...local(a.map((v,k)=>(v-b[k])/o.length)),...local(tip.map((v,k)=>(v-o.at[k])/o.length))].map(v=>v.toFixed(3)).join('/');
  });
  assert(new Set(signatures).size>leaves.length*.85,p.id+' repeated relative blade geometry');
 }
 for(const site of layout.filter(o=>o.reproductive&&o.primary)){
  assert(site.supportAt,p.id+' missing explicit reproductive parent');
  assert(supports.some(t=>t.points.slice(1).some((b,i)=>distance(site.supportAt,t.points[i],b)<Math.max(t.radii[i],t.radii[i+1])+.001)),p.id+' reproductive parent misses emitted axis');
  const stalks=layout.filter(o=>o.siteId===site.siteId&&o.type==='tube'&&/pedicel|attachment/i.test(o.role||''));
  assert(stalks.some(t=>distance(site.supportAt,t.points[0],t.points[0])<1e-9),p.id+' missing connected reproductive stalk');
  const tissues=layout.filter(o=>o.siteId===site.siteId&&['ball','patch','corolla'].includes(o.type));
  assert(stalks.some(t=>tissues.some(o=>{
   const end=t.points.at(-1),tolerance=Math.max(...(o.size||[o.length,o.width,o.radius||0]))*.15+.0002;
   if(o.type==='ball')return [o.at,regionalBodyPoint(o,0,0),regionalBodyPoint(o,1,0)].some(p=>distance(end,p,p)<tolerance);
   return distance(end,o.at,o.at)<tolerance;
  })),p.id+' stalk does not reach its transformed tissue');sites++;
 }
 plants++;
}
const cacao=regionalPlant({crop:'r24-cacao',season:'summer',maturity:.85,seed:1847},1847);
assert.equal(cacao.filter(o=>o.role==='Cacao fan branch').length,5);assert(cacao.filter(o=>o.role==='Cacao fan leaf').length>70);
const potato=regionalPlant({crop:'r05-potato',season:'summer',maturity:.45,seed:1847},1847);
for(const o of potato.filter(o=>o.primary&&o.flowerAxis))assert(o.flowerAxis[0]*(o.siteCenter[0]-.015)+o.flowerAxis[2]*o.siteCenter[2]>=-1e-6,'Potato corolla faces inward');
console.log(`${plants} seeded crop layouts: distinct blade surfaces, attached leaves, ${sites} supported reproductive sites, cacao architecture and outward potato flowers passed.`);
