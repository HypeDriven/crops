// Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
// PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
// Geometry and portable-renderer regression checks; no GPU or browser required.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createPlantGeometry, createRootGeometry } from '../crop-model.js';
import { CROPS, cropDimensions, inspection, anatomyLabels } from '../crops.js';
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
 for(const part of ['whole','ear','leaf','root','flower']){const view=inspection(state,part);assert(view.target.every(Number.isFinite)&&view.span>0);assert(anatomyLabels(state,part).every(a=>a.slice(1).every(Number.isFinite)));}
 if(detail){const roots=createRootGeometry(state);verify(roots,'roots '+crop+'/'+season);if(crop==='soybean'&&!d.residue)assert(Array.from(roots.attributes.organ.array).includes(10),'Soybean nodules');if(d.residue)assert(!Array.from(roots.attributes.organ.array).includes(10),'No live nodules in residue');roots.dispose();}
 if(crop!=='wheat')drawCrop(mock,state,0,600,400,1847,detail,5,.1);
 if(['sunflower','soybean'].includes(crop))drawTaproots(mock,state,100,100,400);
 if(season==='summer'&&maturity===.65&&detail){const repeat=createPlantGeometry(state,1847,true);assert.equal(digest(g),digest(repeat),'Seed determinism');repeat.dispose();}
 g.dispose();cases++;
}
for(const crop of ['maize','soybean']){const s={crop,season:'summer',maturity:.65,seed:1847,cutaway:true},g=createPlantGeometry(s,1847,true);verify(g,crop+' cutaway');assert(Array.from(g.attributes.organ.array).includes(8),'Cutaway exposes seeds');drawCrop(mock,s,0,500,600,1847,true);g.dispose();}
console.log(`Passed ${cases} crop/season/progression/detail combinations, root and Canvas checks, seed determinism, and reproductive cutaways.`);
