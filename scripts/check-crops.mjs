// Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
// PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
// Geometry and portable-renderer regression checks; no GPU or browser required.
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { createHash } from 'node:crypto';
import { createPlantGeometry, createRootGeometry, Build, wholePlantFrame } from '../crop-model.js';
import { CROPS, cropDimensions, inspection, anatomyLabels, leafDevelopment, shootTermination, maizeEar, soybeanAxisNodes, seeded, soybeanPodShape, soybeanPodSurface, sunflowerHead, sunflowerDiskLayout, fieldPlantTraits, organVariation, axisNodeFractions, soybeanBranches, cerealSpike, sunflowerRays, maizeKernel } from '../crops.js';
import { drawCrop, drawTaproots } from '../crop-canvas.js';
let cases=0;
function verify(g,label){const count=g.getAttribute('position').count;assert(count>0,label);for(const name of ['position','normal','color','uv','organ','surface']){const a=g.getAttribute(name);assert(a,label+': '+name);assert.equal(a.count,count,label+': aligned '+name);assert(Array.from(a.array).every(Number.isFinite),label+': finite '+name);}assert(Array.from(g.index.array).every(i=>i>=0&&i<count),label+': indices');assert(Number.isFinite(g.boundingSphere.radius)&&g.boundingSphere.radius>0,label+': bounds');}
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
 assert(['leaf-whorl','young-simple-leaves','young-trifoliate','spear','rosette-heart'].includes(shootTermination(s)));
 s.season='summer';s.maturity=.8;
 if(cropDimensions(s).reproductive&&(!CROPS[crop].region||CROPS[crop].cereal||['banana','cluster','flax','poppy','potato','maize','sunflower'].includes(CROPS[crop].model)))assert(!shootTermination(s).startsWith('young'),'Terminal inflorescences replace the vegetative apex');
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
 if(season==='summer')for(const branch of soybeanBranches(s))axes.push({start:new THREE.Vector3(...branch.start),end:new THREE.Vector3(...branch.end),count:4,seed:branch.nodeSeed});
 // Main axis uses the first seeded random number for developmental variation.
 const random=seeded(seed);
 for(const axis of axes){const length=axis.main?h:axis.start.distanceTo(axis.end),nodes=soybeanAxisNodes(s,length,axis.count,axis.main?Math.floor(random()*100000):axis.seed),last=nodes.at(-1),at=axis.start.clone().lerp(axis.end,last.t);
  assert(length*(1-last.t)<=.00221,'Final leaf attaches within 2.2 mm of the bud');
  assert(nodes.at(-1).t-nodes.at(-2).t<nodes[1].t-nodes[0].t,'Upper internodes shorten');
  let attachment=Infinity,leaf=Infinity;
  for(let i=0;i<p.count;i++){const q=new THREE.Vector3().fromBufferAttribute(p,i);if(o.array[i]===0)attachment=Math.min(attachment,q.distanceTo(at));if(o.array[i]===6)leaf=Math.min(leaf,q.distanceTo(axis.end));}
  assert(attachment<.00001,`Final petiole actually joins axis: ${season}/${maturity}/${seed}/${axis.main?'main':'branch'}`);
  assert(leaf<.047,'Leaflets remain beside every green shoot tip');
 }
 g.dispose();
}
console.log('Passed soybean main and branch apex attachments across growth arrest, both detail levels, and varied seeds.');

// Continuous, gently compressed soybean valves and fine, short surface hairs.
for(const seeds of [2,3]){const shape=soybeanPodShape({maturity:.65},seeds,21);assert(shape.length>.030&&shape.length<.080);assert(shape.width>=.007&&shape.width<=.019);assert(shape.depth<shape.width);assert.equal(soybeanPodSurface(0,0,shape)[0],0);assert.equal(soybeanPodSurface(1,0,shape)[0],0);
 for(let k=1;k<seeds;k++){const between=(shape.centers[k-1]+shape.centers[k])/2;assert(soybeanPodSurface(between,0,shape)[0]>shape.width*.32,'Continuous pod wall does not pinch into disconnected beads');}}
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

// Within-plant variation, correlation, identity stability, and safe extremes.
const sampleState={crop:'maize',season:'summer',maturity:.65,seed:1847,variation:.24};
const samples=Array.from({length:600},(_,i)=>organVariation(sampleState,'leaf',i)),avg=xs=>xs.reduce((a,b)=>a+b,0)/xs.length,stdev=xs=>Math.sqrt(avg(xs.map(x=>(x-avg(xs))**2)));
assert(stdev(samples.map(q=>q.length))>.09,'Individual organs have visible length variation');
assert(stdev(samples.map(q=>q.width/q.length))>.08,'Width does not merely follow uniform scaling');
const lengths=samples.map(q=>Math.log(q.length)),widths=samples.map(q=>Math.log(q.width)),cov=avg(lengths.map((x,i)=>(x-avg(lengths))*(widths[i]-avg(widths)))),correlation=cov/(stdev(lengths)*stdev(widths));
assert(correlation>.20&&correlation<.85,'Length and width are related but not identical');
for(let i=0;i<30;i++){const q=organVariation(sampleState,'leaf',i);assert.deepEqual(q,organVariation({...sampleState,detail:true},'leaf',i),'LOD does not reseed an organ');assert.deepEqual(q,organVariation({...sampleState,cutaway:true},'leaf',i),'Cutaway does not reseed an organ');assert.notDeepEqual(q,organVariation(sampleState,'leaf',i+1));}
const noVariation={...sampleState,variation:0},noOrgan=organVariation(noVariation,'leaf',9);for(const key of ['length','width','depth','spacing','petiole','density'])assert.equal(noOrgan[key],1);
const nominal=[.07,.19,.32,.46,.61,.74,.91];assert.deepEqual(axisNodeFractions(noVariation,nominal),nominal);const uneven=axisNodeFractions(sampleState,nominal);assert.equal(uneven[0],nominal[0]);assert.equal(uneven.at(-1),nominal.at(-1));assert(uneven.slice(1).every((v,i)=>v>uneven[i]));assert(uneven.some((v,i)=>Math.abs(v-nominal[i])>.004),'Internal nodes change spacing');
for(const crop of Object.keys(CROPS))for(const seed of [1,9923])for(const detail of [false,true]){const s={crop,season:'summer',maturity:.65,seed,variation:1,cutaway:false},g=createPlantGeometry(s,seed,detail);verify(g,`Maximum variation ${crop}/${seed}/${detail}`);g.dispose();if(crop!=='wheat')drawCrop(mock,s,0,600,400,seed,detail);}
for(const seed of [1,31,1847,9923]){
 const s={crop:'maize',season:'summer',maturity:.65,seed,variation:1},e=maizeEar(s),g=createPlantGeometry(s,seed,true),base=new THREE.Vector3(...e.base),axis=new THREE.Vector3(...e.direction).normalize();
 for(let i=0;i<g.attributes.position.count;i++)if(g.attributes.organ.array[i]===8){const v=new THREE.Vector3().fromBufferAttribute(g.attributes.position,i).sub(base),y=v.dot(axis);if(y<0||y>e.length+.01)continue;const t=(y+.008)/(e.length*1.09),radius=v.addScaledVector(axis,-y).length(),husk=e.radius*1.26*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.43)*(1-.24*t);assert(radius<husk+.00012,'Varied ear still encloses every kernel');}g.dispose();
 const f=sunflowerHead({...s,crop:'sunflower',variation:.24}),rays=sunflowerRays(f);for(let i=0;i<rays.length;i++){const a=rays[i],b=rays[(i+1)%rays.length],angle=(b.angle-a.angle+Math.PI*2)%(Math.PI*2),spacing=(f.radius+(a.length+b.length)*.25)*angle;assert(f.rayWidth*(a.width+b.width)*.5>spacing,'Varied rays keep overlapping breadth');}
 const branches=soybeanBranches({...s,crop:'soybean'});assert(new Set(branches.map(b=>b.radius.toFixed(6))).size>1,'Branches have distinct thicknesses');
}
console.log('Passed organ-size distributions, aspect ratios, correlation, nonuniform internodes, identity stability, maximum-variation meshes/Canvas, and reproductive containment.');

for(const seed of [1,1847,9923]){const s={crop:'maize',season:'summer',maturity:.65,seed,variation:1},nodes=axisNodeFractions(s,Array.from({length:15},(_,i)=>.07+i/14*.84)),h=cropDimensions(s).h;assert.equal(maizeEar(s).base[1],h*nodes[8],'Primary ear stays at a varied leaf axil');assert.equal(maizeEar(s,true).base[1],h*nodes[6],'Secondary ear stays at a lower axil');}

// The requested geographic collection has exactly three entries per region.
const {REGIONS,REGIONAL_CROPS}=await import('../regional-crops.js');
const {regionalPlant}=await import('../regional-plants.js');
assert.equal(REGIONS.length,25);assert.equal(REGIONAL_CROPS.length,75);
assert.equal(new Set(REGIONAL_CROPS.map(p=>p.id)).size,75);
assert.equal(Object.keys(CROPS).length,80);
for(const region of REGIONS)assert.equal(REGIONAL_CROPS.filter(p=>p.region===region.id).length,3,region.name);
for(const p of REGIONAL_CROPS){
 const s={crop:p.id,season:'summer',maturity:.65,seed:1847};
 assert(p.name&&p.latin&&p.family&&p.note&&p.model,p.id+' complete metadata');
 assert.equal((p.defaultDensity-p.min)%p.step,0,p.id+' default density aligns with slider');
 for(const part of ['root','whole','leaf','ear'])assert(inspection(s,part).desc,p.id+' inspection description');
 const winter={...s,season:'winter'};
 if(['evergreen','perennial'].includes(p.life))assert(!cropDimensions(winter).residue,p.id+' perennial stays alive');
 if(!p.cereal)drawTaproots(mock,s,0,0,400);
 if(!['barley','maize','sunflower','soybean'].includes(p.model))for(const organ of regionalPlant(s,1847,true,true)){
  const points=organ.points||[organ.at];assert(points.every(p=>p[1]>=-.45),'Regional roots respect depth limit');
 }
 const first=createPlantGeometry(s,1847,false),other=createPlantGeometry({...s,variation:.6},9923,false);
 verify(other,p.id+' alternative seed');
 const mesh=new THREE.Mesh(first),frame=wholePlantFrame(mesh),camera=new THREE.PerspectiveCamera(48,1280/900,.004,200);
 camera.position.copy(frame.target).add(new THREE.Vector3(frame.span*.48,frame.span*.17,frame.span*.85));camera.lookAt(frame.target);camera.updateMatrixWorld();
 const positions=first.attributes.position,point=new THREE.Vector3();
 for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).project(camera);assert(Math.abs(point.x)<1&&Math.abs(point.y)<1,p.id+' whole specimen fits camera');}
 mesh.material.dispose();
 assert.notEqual(digest(first),digest(other),p.id+' variation affects geometry');first.dispose();other.dispose();
}
for(const [id,organ] of [['r09-potato',5],['r23-taro',5],['r14-pearl',2],['r11-date',2]]){
 const state={crop:id,season:'summer',maturity:.65,seed:1847};
 const g=organ===5?createRootGeometry(state):createPlantGeometry(state,1847,true);
 assert(Array.from(g.attributes.organ.array).includes(organ),id+' expected harvest organ');g.dispose();
}
console.log('Passed 25 regions × 3 regional forms, metadata, perennial phases, regional root drawings, seed variation, and harvest organ checks.');

// Surface categories, view framing, geometry budgets and stable organ layouts.
const {SURFACE,regionalLeafPoint,regionalBodyPoint,portablePoint}=await import('../crop-surfaces.js');
const {regionalStudy}=await import('../regional-plants.js');
const surfaces=new Set();
for(const p of REGIONAL_CROPS){
 const s={crop:p.id,season:'summer',maturity:.65,seed:1847};
 const low=createPlantGeometry(s,1847,false),high=createPlantGeometry(s,1847,true);
 for(const a of [low.attributes.surface.array,high.attributes.surface.array])for(const v of a){assert(Number.isInteger(v)&&v>=0&&v<=11,p.id+' valid surface type');surfaces.add(v);}
 if(!['barley','maize','sunflower','soybean'].includes(p.model)){
  assert(high.attributes.position.count>low.attributes.position.count*1.5,p.id+' specimen has more detail');
  assert(low.attributes.position.count<24000,p.id+' field mesh budget');
  const field=regionalPlant(s,1847,false),detail=regionalPlant(s,1847,true);
  assert.deepEqual(field.filter(o=>o.type==='leaf'),detail.filter(o=>o.type==='leaf'&&!o.detailOnly),p.id+' detail preserves each blade');
  for(const part of ['leaf','ear']){const view=regionalStudy(s,part);if(!view)continue;assert(view.target.every(Number.isFinite)&&view.span>=.06);assert(view.labels.every(a=>a.slice(1).every(Number.isFinite)));}
  const blade=detail.find(o=>o.type==='leaf');if(blade){
   for(const t of [0,1]){const a=regionalLeafPoint(blade,t,-1),b=regionalLeafPoint(blade,t,1);assert(Math.hypot(...a.map((v,k)=>v-b[k]))<1e-8,p.id+' closed leaf tips');}
  }
 }
 low.dispose();high.dispose();
}
const rootSurfaces=createRootGeometry({crop:'r09-potato',season:'summer',maturity:.65,seed:1847});
for(const v of rootSurfaces.attributes.surface.array)surfaces.add(v);rootSurfaces.dispose();
for(const type of Object.values(SURFACE))assert(surfaces.has(type),'Surface category rendered: '+type);
const pod={at:[0,0,0],size:[.01,.04,.008],shape:'pod'};
assert(Math.abs(regionalBodyPoint(pod,0,0)[0])<1e-8&&Math.abs(regionalBodyPoint(pod,1,0)[0])<1e-8,'Pod ends close');
const soySurface=createPlantGeometry({crop:'soybean',season:'summer',maturity:.65,seed:1847},1847,true);assert(Array.from(soySurface.attributes.surface.array).includes(SURFACE.POD),'Original soybean uses pod shading');soySurface.dispose();
console.log('Passed material categories, specimen/field detail separation, stable leaves, mesh budgets, closed blade tips, pod ends, and organ-following inspection views.');

const projected=portablePoint([1,2,3]);assert(Math.abs(projected[0]-2.05)<1e-10&&Math.abs(projected[1]+1.64)<1e-10,'Portable organs, labels and camera targets share a projection');
