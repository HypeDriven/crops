// Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
// PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
// Geometry and portable-renderer regression checks; no GPU or browser required.
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { createHash } from 'node:crypto';
import { createPlantGeometry, createRootGeometry, Build } from '../crop-model.js';
import { CROPS, cropDimensions, inspection, anatomyLabels, leafDevelopment, shootTermination, maizeEar, soybeanAxisNodes, seeded, soybeanPodShape, soybeanPodSurface, sunflowerHead, sunflowerDiskLayout, fieldPlantTraits } from '../crops.js';
import { drawCrop, drawTaproots } from '../crop-canvas.js';
let cases=0;
function verify(g,label){const count=g.getAttribute('position').count;assert(count>0,label);for(const name of ['position','normal','color','uv','organ']){const a=g.getAttribute(name);assert(a,label+': '+name);assert(Array.from(a.array).every(Number.isFinite),label+': finite '+name);}assert(Array.from(g.index.array).every(i=>i>=0&&i<count),label+': indices');assert(Number.isFinite(g.boundingSphere.radius)&&g.boundingSphere.radius>0,label+': bounds');}
const digest=g=>createHash('sha256').update(new Uint8Array(g.attributes.position.array.buffer)).digest('hex');
const gradient={addColorStop(t,color){assert(Number.isFinite(t));assert.equal(typeof color,'string');}};
const mock=new Proxy({}, {get(_,key){if(['createLinearGradient','createRadialGradient'].includes(key))return()=>gradient;if(key==='ellipse')return(...a)=>{assert(a.every(Number.isFinite));assert(a[2]>=0&&a[3]>=0);};return(...a)=>{for(const v of a)if(typeof v==='number')assert(Number.isFinite(v),'Canvas '+String(key));};},set(){return true;}});
for(const crop of Object.keys(CROPS))for(const season of ['spring','summer','autumn','winter'])for(const maturity of [0,.25,.65,1])for(const detail of [false,true]){
 const state={crop,season,maturity,seed:1847,cutaway:false};
 const g=createPlantGeometry(state,1847,detail);verify(g,`${crop}/${season}/${maturity}/${detail}`);
 const d=cropDimensions(state),organs=Array.from(g.getAttribute('organ').array);
 if(d.residue){assert(!organs.includes(1)&&!organs.includes(6),'No living foliage on harvested annuals');assert(!organs.includes(2)&&!organs.includes(7)&&!organs.includes(8)&&!organs.includes(9),'No reproductive organs on stubble');}
 if(season!=='summer')assert(!organs.includes(7)&&!organs.includes(8)&&!organs.includes(9),'No summer reproductive organs outside summer');
 for(const part of ['whole','ear','leaf','root','flower','tip']){const view=inspection(state,part);assert(view.target.every(Number.isFinite)&&view.span>0);assert(anatomyLabels(state,part).every(a=>a.slice(1).every(Number.isFinite)));}
 if(detail){const roots=createRootGeometry(state);verify(roots,'roots '+crop+'/'+season);if(crop==='soybean'&&!d.residue)assert(Array.from(roots.attributes.organ.array).includes(10),'Soybean nodules');if(d.residue)assert(!Array.from(roots.attributes.organ.array).includes(10),'No live nodules in residue');roots.dispose();}
 if(crop!=='wheat')drawCrop(mock,state,0,600,400,1847,detail,5,.1);
 if(['sunflower','soybean'].includes(crop))drawTaproots(mock,state,100,100,400);
 if(season==='summer'&&maturity===.65&&detail){const repeat=createPlantGeometry(state,1847,true);assert.equal(digest(g),digest(repeat),'Seed determinism');repeat.dispose();}
 g.dispose();cases++;
}
for(const crop of ['maize','soybean']){const s={crop,season:'summer',maturity:.65,seed:1847,cutaway:true},g=createPlantGeometry(s,1847,true);verify(g,crop+' cutaway');assert(Array.from(g.attributes.organ.array).includes(8),'Cutaway exposes seeds');drawCrop(mock,s,0,500,600,1847,true);g.dispose();}
console.log(`Passed ${cases} crop/season/progression/detail combinations, root and Canvas checks, seed determinism, and reproductive cutaways.`);

// Young apices, positional leaf ageing, finite acute blade tips, and closed culms.
for(const crop of Object.keys(CROPS)){
 const s={crop,season:'spring',maturity:.65,seed:1847},old=leafDevelopment(s,0,8,1),middle=leafDevelopment(s,4,8,1),young=leafDevelopment(s,7,8,1);
 assert(old.relativeAge>middle.relativeAge&&middle.relativeAge>young.relativeAge);
 assert(young.expansion<middle.expansion&&young.size<middle.size&&young.fold>middle.fold,'Youngest leaves are smaller and folded');
 assert(['leaf-whorl','young-simple-leaves','young-trifoliate'].includes(shootTermination(s)));
 s.season='summer';s.maturity=.8;
 assert(!shootTermination(s).startsWith('young'),'Reproductive apex does not grow fictitious terminal leaves');
}
const b=new Build();b.leaf(new THREE.Vector3(),.25,.02,0,.4,new THREE.Color('#638344'),true);
const pg=b.geometry(),pp=pg.attributes.position;const last=new THREE.Vector3().fromBufferAttribute(pp,pp.count-1);
for(let i=pp.count-9;i<pp.count;i++)assert(last.distanceTo(new THREE.Vector3().fromBufferAttribute(pp,i))<1e-9,'Blade tip converges to a single point');pg.dispose();
const tube=new Build();tube.tube([new THREE.Vector3(),new THREE.Vector3(0,.1,0)],[.01,.005],new THREE.Color('#638344'),8);const tg=tube.geometry();
const edgeCounts=new Map();for(let i=0;i<tg.index.count;i+=3){const ids=[0,1,2].map(k=>tg.index.array[i+k]);const coords=ids.map(id=>new THREE.Vector3().fromBufferAttribute(tg.attributes.position,id).toArray().map(x=>String(Math.round(x*1e6))).join(','));for(let k=0;k<3;k++){const key=[coords[k],coords[(k+1)%3]].sort().join('|');edgeCounts.set(key,(edgeCounts.get(key)||0)+1);}}
assert([...edgeCounts.values()].every(n=>n===2),'Culm mesh has no open end or seam edges');tg.dispose();
const cs={crop:'maize',season:'summer',maturity:.65,seed:1847,cutaway:false},ear=maizeEar(cs),corn=createPlantGeometry(cs,1847,true),base=new THREE.Vector3(...ear.base),axis=new THREE.Vector3(...ear.direction).normalize();
for(let i=0;i<corn.attributes.position.count;i++)if(corn.attributes.organ.array[i]===8){let v=new THREE.Vector3().fromBufferAttribute(corn.attributes.position,i).sub(base),y=v.dot(axis);if(y<0||y>ear.length+.01)continue;const t=(y+.008)/(ear.length*1.09),radius=v.addScaledVector(axis,-y).length(),huskRadius=ear.radius*1.26*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.43)*(1-.24*t);assert(radius<huskRadius+.0001,'Closed husk encloses kernels');}corn.dispose();
console.log('Passed positional leaf development, shoot termination, convergent tip, closed culm, and closed-husk containment checks.');

// Every green main/branch apex retains an attached final leaf across the
// growing-to-arrested boundary. Check mesh vertices, not just layout metadata.
for(const season of ['spring','summer'])for(const maturity of [.26,.5,.619,.62,.65,.85,1])for(const seed of [1,1847,9923])for(const detail of [false,true]){
 const s={crop:'soybean',season,maturity,seed},h=cropDimensions(s).h,g=createPlantGeometry(s,seed,detail),p=g.attributes.position,o=g.attributes.organ;
 const axes=[{start:new THREE.Vector3(),end:new THREE.Vector3(.014,h,0),count:season==='summer'?7:3,main:true}];
 if(season==='summer')for(let branch=0;branch<3;branch++){const a=branch*2.39996+.8;axes.push({start:new THREE.Vector3(.0024,h*.17,0),end:new THREE.Vector3(Math.cos(a)*.13,h*(.56+branch*.035),Math.sin(a)*.13),count:4,seed:branch*113+59});}
 // Main axis uses the first seeded random number for developmental variation.
 const random=seeded(seed);
 for(const axis of axes){const length=axis.main?h:axis.start.distanceTo(axis.end),nodes=soybeanAxisNodes(s,length,axis.count,axis.main?Math.floor(random()*100000):axis.seed),last=nodes.at(-1),at=axis.start.clone().lerp(axis.end,last.t);
  assert(length*(1-last.t)<=.00221,'Final leaf attaches within 2.2 mm of the bud');
  assert(nodes.at(-1).t-nodes.at(-2).t<nodes[1].t-nodes[0].t,'Upper internodes shorten');
  let attachment=Infinity,leaf=Infinity;
  for(let i=0;i<p.count;i++){const q=new THREE.Vector3().fromBufferAttribute(p,i);if(o.array[i]===0)attachment=Math.min(attachment,q.distanceTo(at));if(o.array[i]===6)leaf=Math.min(leaf,q.distanceTo(axis.end));}
  assert(attachment<.00001,`Final petiole actually joins axis: ${season}/${maturity}/${seed}/${axis.main?'main':'branch'}`);
  assert(leaf<.030,'Leaflets remain beside every green shoot tip');
 }
 g.dispose();
}
console.log('Passed soybean main and branch apex attachments across growth arrest, both detail levels, and varied seeds.');

// Continuous, gently compressed soybean valves and fine, short surface hairs.
for(const seeds of [2,3]){const shape=soybeanPodShape({maturity:.65},seeds,21);assert(shape.length>.039&&shape.length<.060);assert(shape.width>=.008&&shape.width<=.015);assert(shape.depth<shape.width);assert.equal(soybeanPodSurface(0,0,shape)[0],0);assert.equal(soybeanPodSurface(1,0,shape)[0],0);
 for(let k=1;k<seeds;k++){const between=(shape.centers[k-1]+shape.centers[k])/2;assert(soybeanPodSurface(between,0,shape)[0]>shape.width*.36,'Continuous pod wall does not pinch into disconnected beads');}}
const fuzzy=createPlantGeometry({crop:'soybean',season:'summer',maturity:.65,seed:1847},1847,true),hairPoints=[];
for(let i=0;i<fuzzy.attributes.organ.count;i++)if(fuzzy.attributes.organ.array[i]===3)hairPoints.push(new THREE.Vector3().fromBufferAttribute(fuzzy.attributes.position,i));
assert(hairPoints.length>30000,'Pubescence is present on close-up organs');assert.equal(hairPoints.length%10,0);
for(let i=0;i<hairPoints.length;i+=10){const base=hairPoints[i].clone().add(hairPoints[i+1]).multiplyScalar(.5),tip=hairPoints[i+4],length=tip.distanceTo(base);assert(length>.00024&&length<.00125,'Trichomes remain submillimetre scale');assert(hairPoints[i].distanceTo(hairPoints[i+1])<.000045,'Hairs are fine rather than thick spikes');}fuzzy.dispose();
// Sunflower packing, dense ligules, and maturity-dependent head posture.
for(const maturity of [.2,.4,.65,.88])for(const seed of [1,1847,999]){const s={crop:'sunflower',season:'summer',maturity,seed,variation:.24},f=sunflowerHead(s),units=sunflowerDiskLayout(f,true);assert(units.length>1000&&units.length<2300);assert(f.rayCount>=32&&f.rayCount<=46);assert(f.rayWidth>Math.PI*2*(f.radius+f.rayLength*.5)/f.rayCount,'Ligules overlap at maximum breadth');assert(units.every(u=>Math.hypot(u.x,u.y)<f.radius&&u.size>0));assert.deepEqual(units,sunflowerDiskLayout(f,true));if(maturity>.8)assert(units.every(u=>u.phase==='seed'));}
const early=sunflowerHead({crop:'sunflower',season:'summer',maturity:.2,seed:1847}),late=sunflowerHead({crop:'sunflower',season:'summer',maturity:.9,seed:1847});assert(late.tilt<early.tilt-.7,'Ripening heads droop');
const azimuths=Array.from({length:8000},(_,seed)=>fieldPlantTraits({crop:'sunflower',maturity:.65,variation:.24},seed).azimuth),mean=azimuths.reduce((a,b)=>a+b,0)/azimuths.length,sd=Math.sqrt(azimuths.reduce((a,b)=>a+(b-mean)**2,0)/azimuths.length);assert(Math.abs(mean)<.04&&sd>.69&&sd<.79,'Easterly population has the published approximate azimuth spread');
for(const crop of Object.keys(CROPS)){const s={crop,maturity:.65,variation:.24};for(let seed=0;seed<200;seed++){const t=fieldPlantTraits(s,seed);assert(t.height>.85&&t.height<1.16&&t.breadth>.85&&t.breadth<1.16);assert(Math.abs(t.stage-s.maturity)<.034);assert.deepEqual(t,fieldPlantTraits(s,seed));}const z=fieldPlantTraits({...s,variation:0},8);assert.equal(z.height,1);assert.equal(z.breadth,1);assert.equal(z.stage,s.maturity);}
console.log('Passed continuous soybean pod walls, fine pubescence, sunflower floret packing, ray overlap, head droop, and seeded population distribution checks.');
