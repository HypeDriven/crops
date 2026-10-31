// Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
// PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
import assert from 'node:assert/strict';
import {REGIONAL_CROPS} from '../regional-crops.js';
import {regionalPlant,regionalStudy} from '../regional-plants.js';
import {regionalBodyPoint,regionalFramePoint,regionalPatchPoint,regionalCorollaPoint} from '../crop-surfaces.js';
import {regionalFibreCurve,LEGUME_ORGANS} from '../reproductive-organs.js';
import {createPlantGeometry} from '../crop-model.js';
const state=(crop,maturity=.65)=>({crop,season:'summer',maturity,seed:1847,variation:.24});
const shared=REGIONAL_CROPS.filter(p=>!['barley','maize','sunflower','soybean'].includes(p.model));
for(const p of shared)for(const maturity of [.14,.65,.90]){
 const s=state(p.id,maturity),field=regionalPlant(s,s.seed),close=regionalPlant(s,s.seed,true),sites=close.filter(o=>o.primary&&o.reproductive);
 assert.deepEqual(field.filter(o=>o.type==='leaf'),close.filter(o=>o.type==='leaf'),p.id+' foliage survives reproductive detail');
 for(const o of close){
  if(o.type==='tube'){assert(o.points.flat().every(Number.isFinite));continue;}
  if(o.type==='leaf')continue;
  if(o.type==='fibres'){
   for(const i of [0,Math.floor(o.count/2),o.count-1])if(i>=0&&o.count){const points=regionalFibreCurve(o,i);assert(points.flat().every(Number.isFinite));assert.deepEqual(points,regionalFibreCurve(o,i));}
  }else{
   const point=o.type==='patch'?regionalPatchPoint:o.type==='corolla'?regionalCorollaPoint:regionalBodyPoint;
   for(const t of [0,.18,.5,.84,1])for(const v of o.type==='patch'?[-1,0,1]:[0,.4,Math.PI])assert(point(o,t,v).every(Number.isFinite),p.id+' finite reproductive tissue');
  }
 }
 for(const site of sites){
  assert(site.siteCenter.every(Number.isFinite)&&site.siteRadius>0);const children=close.filter(o=>o.siteId===site.siteId);assert(children.length);
  if(site.supportAt){const stalk=children.find(o=>['Flower pedicel','Pod pedicel','Fruit pedicel','Boll pedicel','Spikelet attachment','Reproductive attachment'].includes(o.role));assert(stalk,p.id+' attached reproductive stalk');assert.deepEqual(stalk.points[0],site.supportAt,p.id+' stalk starts at its parent');}
 }
 if(sites.length){const view=regionalStudy(s,'ear');assert(view&&view.target.every(Number.isFinite)&&view.span>0);assert(view.labels.length>=1);if(view.cameraDirection)assert(Math.abs(Math.hypot(...view.cameraDirection)-1)<1e-10,'Flower close-ups face the corolla');}
}
const cotton=regionalPlant(state('r13-cotton',.85),1847,true),clouds=cotton.filter(o=>o.mode==='lint');
assert(clouds.length>=3&&clouds.every(o=>o.count>=3000&&o.segments>=12),'Cotton must be dense curved fibre geometry');
assert(cotton.some(o=>o.role==='Recurved boll valve'));assert(cotton.some(o=>o.role==='Lint-bearing seed'));
for(const o of clouds){
 const points=regionalFibreCurve(o,12),root=o.seedOrigins[12%o.seedOrigins.length],distance=Math.hypot(...points[0].map((v,k)=>(v-root[k])/o.seedSize[k]));assert(Math.abs(distance-1)<1e-10,'Lint originates on the actual ellipsoidal seed surface');
 const a=points[0],b=points.at(-1),axis=b.map((v,k)=>v-a[k]),L=Math.hypot(...axis),mid=points[7],t=mid.reduce((sum,v,k)=>sum+(v-a[k])*axis[k],0)/(L*L),deviation=Math.hypot(...mid.map((v,k)=>v-a[k]-t*axis[k]));assert(deviation>.0002,'Cotton fibres cannot be straight spokes');
}
const cottonFlower=regionalPlant(state('r13-cotton',.14),1847,true),cottonSite=cottonFlower.find(o=>o.primary).siteId;
assert.equal(cottonFlower.filter(o=>o.siteId===cottonSite&&o.role==='Corolla petal').length,5);
assert.equal(cottonFlower.filter(o=>o.siteId===cottonSite&&o.role==='Laciniate epicalyx bract').length,3);
for(const species of Object.keys(LEGUME_ORGANS)){
 const p=shared.find(p=>p.species===species);if(!p||p.model==='groundlegume')continue;
 const pods=regionalPlant(state(p.id),1847,true).filter(o=>o.role==='Seed-bearing pod');assert(pods.length,p.id+' pods');
 for(const pod of pods){assert.equal(pod.seeds,LEGUME_ORGANS[species].seeds);const stalk=regionalPlant(state(p.id),1847,true).find(o=>o.siteId===pod.siteId&&o.role==='Pod pedicel');assert.deepEqual(stalk.points.at(-1),regionalBodyPoint(pod,1,0),'Stalk ends on the rotated pod pole');for(const t of [.1,.3,.5,.7,.9])assert(Math.hypot(...regionalBodyPoint(pod,t,0).map((v,k)=>v-regionalFramePoint(pod,[0,(t*2-1)*pod.size[1],0])[k]))>0,'Continuous valve wall');}
 const flowers=regionalPlant(state(p.id,.14),1847,true),site=flowers.find(o=>o.primary)?.siteId;
 assert.equal(flowers.filter(o=>o.siteId===site&&o.role==='Standard petal').length,1);assert.equal(flowers.filter(o=>o.siteId===site&&o.role==='Wing petal').length,2);assert.equal(flowers.filter(o=>o.siteId===site&&o.role==='Keel petal').length,2);
 const keels=flowers.filter(o=>o.siteId===site&&o.role==='Keel petal');for(const t of [0,.3,.6,1])assert.deepEqual(regionalPatchPoint(keels[0],t,-1),regionalPatchPoint(keels[1],t,-1),'Keel petals join along their enclosing seam');
}
for(const [crop,role,count] of [['r03-poppy','Corolla petal',4],['r01-flax','Corolla petal',5]]){
 const organs=regionalPlant(state(crop,.14),1847,true),site=organs.find(o=>o.primary).siteId;assert.equal(organs.filter(o=>o.siteId===site&&o.role===role).length,count);
 if(crop==='r03-poppy')assert(!organs.some(o=>o.role==='Style'),'Poppy stigmatic disc is sessile');
 if(crop==='r01-flax')assert.equal(organs.filter(o=>o.siteId===site&&o.role==='Style').length,5,'Flax has five free styles');
}
const potato=regionalPlant(state('r05-potato',.14),1847,true);assert(potato.some(o=>o.role==='Fused corolla'));assert(potato.filter(o=>o.role==='Anther theca').length>=10);
const peanut=regionalPlant(state('r25-peanut'),1847,true,true);assert(peanut.some(o=>o.role==='Reticulate shell ridge'));
for(const crop of ['r13-cotton','r24-bean','r03-poppy','r05-potato']){
 const s=state(crop,crop==='r13-cotton'?.85:.14),low=createPlantGeometry(s,1847),high=createPlantGeometry(s,1847,true);
 assert(low.attributes.position.count<24000);assert(high.attributes.position.count>low.attributes.position.count*3,'Visible detail must increase geometry');assert(high.attributes.position.count<1900000,'Close-up mesh budget');assert(Array.from(high.attributes.position.array).every(Number.isFinite));low.dispose();high.dispose();
}
console.log('All regional reproductive stages, fibre/seed anchoring, pod walls, species floral organs, close-up bounds and mesh budgets passed.');
