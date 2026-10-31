/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
import { profile, cropDimensions, cropColors, seeded, organVariation, foliageVariation, mixHex } from './crops.js';

import { SURFACE, leafShape, regionalLeafPoint, regionalBodyPoint, stalkCurve, stalkPoint } from './crop-surfaces.js';
import {remasterReproductive,reproductivePoint} from './reproductive-organs.js';

const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const TERMINAL_MODELS=new Set(['spike','dense','panicle','finger','cluster','flax','poppy','potato','banana']);

// Rank is initiation order on THIS axis, not world height (or leaflet index).
// Ages are relative plastochrons, not calibrated days or growing-degree days.
export function regionalDevelopment(s,p,rank,count,axis=0){
 const u=count>1?rank/(count-1):1,d=cropDimensions(s),m=clamp(s.maturity??.65);
 const terminal=d.reproductive&&TERMINAL_MODELS.has(p.model),age=count-1-rank+(terminal?1.8+2*m:.3+.6*m);
 const expansion=smooth(age/2.5),internodeExpansion=smooth((age-.35)/2.7);
 const envelope=.52+.48*Math.sin(Math.PI*(.06+u*.90));
 return {rank,count,axis,age,relativeAge:1-u,expansion,internodeExpansion,
  size:envelope*expansion,widthFactor:envelope*Math.sqrt(expansion),
  petioleFactor:(.30+.70*expansion)*envelope,fold:(1-expansion)*.85,
  elevation:(1-expansion)*1.12,droop:.08+(1-u)*.22,pitch:0,twist:0};
}

// Phyllotaxis constrains the distribution. Noise is bounded around the species
// pattern; a random plant phase rotates the whole arrangement, even at variation=0.
export function regionalPhyllotaxis(s,p,rank,count,axis=0){
 const r=seeded(organVariation(s,`${s.crop??p.species}/plant-phase`,0,axis).seed),phase=r()*Math.PI*2;
 const q=organVariation(s,'regional-node-angle',rank,axis),noise=q.angle*.45;
 const opposite=['olive','coffee','pomegranate','perilla','yam'].includes(p.species)||p.species==='sesame'&&rank<count*.5;
 const distichous=p.cereal||p.model==='cane'||['faba','pea','lentil'].includes(p.species)||axis>0&&['tea','cacao'].includes(p.species);
 const angle=phase+rank*(opposite?Math.PI/2:distichous?Math.PI:2.399963229728653)+noise;
 return opposite?[angle,angle+Math.PI]:[angle];
}

// Integrate internode lengths before attaching anything. Young apical internodes
// expand later than blades; detail level cannot change the attachment positions.
export function regionalAxis(s,p,count,{axis=0,first=.10,last=.99}={}){
 const nodes=Array.from({length:count},(_,rank)=>({dev:regionalDevelopment(s,p,rank,count,axis)}));
 const lengths=nodes.slice(1).map(({dev},i)=>{
  const u=(i+1)/(count-1),q=organVariation(s,'regional-internode',i,axis);
  return (.5+.5*Math.sin(Math.PI*u))*(.10+.90*dev.internodeExpansion)*q.spacing;
 }),total=lengths.reduce((a,b)=>a+b,0);
 let t=first;
 return nodes.map((node,i)=>{if(i)t+=(last-first)*lengths[i-1]/total;return {...node,t:i===count-1?last:t,angles:regionalPhyllotaxis(s,p,i,count,axis)};});
}

// A shared organ layout keeps the mesh and portable projection in agreement.
// Heights describe compact representative specimens, including orchard crops.
export function regionalPlant(s,seed,detail=false,roots=false){
 s={...s,plantSeed:seed};
 const p=profile(s),d=cropDimensions(s),c=cropColors(s),r=seeded(seed),h=d.h,out=[],kind=p.model;
 const surfaceStem=kind==='tree'?SURFACE.BARK:kind==='palm'?SURFACE.PALM:SURFACE.STEM;
 const petioleRise=(rank,axis=0)=>.28+foliageVariation(s,'petiole-pose',rank,axis).pitch*1.5;
 const tube=(points,radius,color=c.stem,organ=0,surface=organ===5?SURFACE.ROOT:surfaceStem,extra={})=>{
  if(points.length===2&&organ===0&&surface===SURFACE.STEM&&extra.axis===undefined&&!extra.terminal&&!d.residue)points=stalkCurve(points);
  return out.push({type:'tube',points,radii:points.map((_,i)=>radius*(1-i/(points.length-1)*.88)),color,organ,surface,...extra});
 };
 let grainSample=0;
 const ball=(at,size,color,organ=2,extra={})=>{
  const pod=['legume','capsule','groundlegume'].includes(kind),grain=['spike','dense','panicle','finger'].includes(kind),fruit=['tree','palm','banana','fruit','cotton'].includes(kind);
  const surface=organ===0?SURFACE.STEM:organ===5?SURFACE.ROOT:organ===9?SURFACE.PETAL:pod?SURFACE.POD:grain?SURFACE.GRAIN:kind==='cotton'&&s.maturity>.6?SURFACE.LINT:fruit?SURFACE.FRUIT:SURFACE.POD;
  const orientation=organVariation(s,`regional-body/${at.join('/')}`,organ);
  out.push({type:'ball',at,size,color,organ,surface,yaw:seeded(orientation.seed)()*Math.PI*2,tilt:organ===5?0:orientation.pitch,roll:orientation.twist,sample:grain?grainSample++:0,shape:pod?'pod':grain?'grain':kind==='banana'?'banana':kind==='fruit'?'pepper':'round',ribs:p.species==='cacao'?.08:p.species==='okra'?.06:kind==='fruit'?.10:0,ribCount:p.species==='cacao'?10:kind==='fruit'?4:6,...extra});
 };
 const blade=(at,length,width,angle,grass=false,rank=0,extra={})=>{
  const v=foliageVariation(s,`${p.species}/regional-leaf`,rank,extra.development?.axis??0),dev=extra.development||{size:1,widthFactor:1,relativeAge:.5,expansion:1,fold:.03,elevation:0},relativeAge=dev.relativeAge;
  const senescence=s.season==='summer'&&p.life!=='evergreen'?Math.max(0,(s.maturity-.68)/.32)*relativeAge*.42:0;
  const color=mixHex(mixHex(c.leaf,v.shade>0?'#a2b976':'#355431',Math.abs(v.shade)), '#ab9756',senescence);
  out.push({type:'leaf',at,length:length*dev.size*v.length,width:width*dev.widthFactor*v.width,angle:angle+v.angle*.4,color,grass,shape:leafShape(p),surface:grass?SURFACE.GRASS:['olive','coffee','tea','cacao'].includes(p.species)?SURFACE.WAXY:SURFACE.LEAF,organ:grass?1:6,...extra,development:{...dev,pitch:(dev.pitch||0)+v.pitch,twist:(dev.twist||0)+v.twist,asymmetry:v.asymmetry,roll:v.roll,camber:v.camber,sweep:v.sweep,curl:v.curl}});
 };
 const apex=(at,scale,axis=0,mode='bud')=>{
  const a=regionalPhyllotaxis(s,p,0,1,axis)[0],rad=Math.min(h*.004,scale*.055),tip=[at[0],at[1]+scale*.20,at[2]];
  ball(tip,[rad,scale*.23,rad],c.node,0,{surface:surfaceStem,terminal:mode,axis,yaw:a,tilt:0,roll:0});
  if(mode==='dormant-bud')return;
  const n=mode==='spear'||mode==='rolled-whorl'?2:3;
  for(let k=0;k<n;k++)blade([at[0],at[1]+scale*.035*k,at[2]],scale*(1-k*.26),scale*(mode==='spear'||mode==='rolled-whorl'?.10:.27),a+k*(mode==='rolled-whorl'?Math.PI:2.399963),mode==='rolled-whorl',9000+axis*10+k,{terminal:mode,development:{size:1,widthFactor:1,relativeAge:0,expansion:.12,fold:.88,elevation:1.35-k*.09,pitch:0,droop:0,axis}});
 };
 const reproductive=d.reproductive;
 const finish=()=>remasterReproductive(s,p,out,detail);
 if(roots){
  const fibrous=p.cereal||p.species==='potato'||['palm','cane','banana'].includes(kind),depth=s.season==='spring'?.22:.43;
  if(!fibrous)tube([[0,0,0],[.008,-depth*.5,0],[0,-depth,0]],.007,c.root,5);
  for(let i=0;i<(detail?18:9);i++){const a=i*2.39996,t=(i+1)/20,len=.07+r()*.13,y=fibrous?0:-depth*t;tube([[0,y,0],[Math.cos(a)*len*.5,Math.max(-depth,y-depth*.3),Math.sin(a)*len*.5],[Math.cos(a)*len,Math.max(-depth,y-depth*.6),Math.sin(a)*len]],.0015,c.root,5);}
  if(!d.residue&&p.life==='root'){
   const color=p.species==='daikon'?'#dfdcc8':p.species==='beet'?'#d0bf93':p.species==='swede'||p.species==='turnip'?'#bca7b5':p.name.includes('Blue')?'#716080':'#b09a6a';
   if(kind==='rosette'||kind==='taro')ball([0,-.07,0],[.055,p.species==='daikon'?.18:.075,.05],color,5);
   else for(let i=0;i<5;i++){const a=i*2.4,at=[Math.cos(a)*.09,-.09-i*.035,Math.sin(a)*.06];tube([[0,-.035,0],at],.001,c.root,5);ball(at,[kind==='groundlegume'?.012:.035,kind==='palmate'?.13:.025,.025],color,5);}
  }
  if(detail){
   const rootRandom=seeded(seed+47021);
   for(const axis of [...out].filter(o=>o.type==='tube'&&o.organ===5)){
    const start=axis.points[0],end=axis.points.at(-1);
    for(let i=1;i<5;i++){
     const t=i/5,at=start.map((v,k)=>v+(end[k]-v)*t),a=rootRandom()*Math.PI*2,L=.008+rootRandom()*.025;
     const tip=[at[0]+Math.cos(a)*L,Math.max(-depth,at[1]-.008-rootRandom()*.015),at[2]+Math.sin(a)*L];
     tube([at,tip],.00025,c.root,5,SURFACE.ROOT);
    }
   }
   for(const organ of [...out].filter(o=>o.type==='ball'&&o.organ===5)){
    if(p.species==='potato')for(let i=0;i<7;i++){
     const t=.15+rootRandom()*.7,a=rootRandom()*Math.PI*2,at=regionalBodyPoint(organ,t,a);
     ball(at,[.0018,.0008,.0014],'#806f4f',5,{surface:SURFACE.ROOT,shape:'round'});
    }
   }
  }
  return p.model==='groundlegume'?remasterReproductive(s,p,out,detail):out;
 }
 if(d.residue){tube([[0,0,0],[.006,h,0]],.004);return finish();}
 if(kind==='palm'){
  tube([[0,0,0],[h*.02,h*.5,0],[h*.04,h,0]],h*.035,'#8c7952',0,SURFACE.PALM,{radii:[h*.035,h*.031,h*.025],axis:0});
  if(detail)for(let i=1;i<24;i++){const t=i/25,points=[];for(let j=0;j<=16;j++){const a=j/16*Math.PI*2;points.push([h*.04*t+Math.cos(a)*h*.035*(1-t*.65),h*t,Math.sin(a)*h*.035*(1-t*.65)]);}tube(points,h*.0014,'#9a8660',0,SURFACE.PALM);}
  for(let i=0;i<9;i++){
   const dev=regionalDevelopment(s,p,i,9),a=regionalPhyllotaxis(s,p,i,9)[0],q=organVariation(s,'frond',i),L=h*.48*dev.size*q.length,points=[];
   for(let j=0;j<13;j++){const t=j/12;points.push([h*.04+Math.cos(a)*L*t,h-h*.035*dev.relativeAge+L*(.40*Math.sin(t*Math.PI)-dev.relativeAge*.60*t*t+(1-dev.expansion)*1.5*t),Math.sin(a)*L*t]);}
   tube(points,h*.006*Math.max(.25,dev.size),c.leaf,1,SURFACE.GRASS,{development:dev,axis:i+1});
   for(let j=1;j<13;j++)for(const sign of [-1,1])blade(points[j],L*.38*Math.pow(Math.sin(Math.PI*j/13),.55),L*.025,a+sign*1.03,true,i*40+j*2+sign,{development:{...dev,size:1,widthFactor:1,elevation:(1-dev.expansion)*.7,axis:i+1}});
  }
  apex([h*.04,h,0],h*.26,0,'spear');
  if(reproductive)for(let i=0;i<(p.species==='coconut'?6:24);i++){const a=i*2.4,rad=p.species==='coconut'?.09:.025;ball([h*.04+Math.cos(a)*h*.09,h-.16-Math.floor(i/6)*.035,Math.sin(a)*h*.09],[rad,rad*1.3,rad],p.species==='oilpalm'?'#b65a29':p.species==='date'?'#ad7638':'#7a8940',2,{supportAt:[h*.04,h-.08,0]});}
  return finish();
 }
 if(kind==='banana'){
  tube([[0,0,0],[0,h*.55,0],[.01,h,0]],h*.045,'#7b9957');
  if(detail)for(let i=1;i<9;i++){const a=i*2.4,y=h*(.10+i*.07);tube([[Math.cos(a)*h*.028,y,Math.sin(a)*h*.028],[Math.cos(a+.4)*h*.031,y+h*.045,Math.sin(a+.4)*h*.031]],h*.002,'#9fa66a',0,SURFACE.STEM);}
  const nodes=regionalAxis(s,p,8,{first:.55,last:.985});
  for(const [i,node] of nodes.entries()){
   const {t,dev,angles:[a]}=node,at=[.01*t,h*t,0],L=h*.10*dev.petioleFactor,end=[at[0]+Math.cos(a)*L,at[1]+L*.4,Math.sin(a)*L];
   tube([at,end],h*.009*Math.max(.2,dev.size),c.leaf,0,SURFACE.STEM,{development:dev});
   blade(end,h*.58,h*.18,a,false,i,{development:dev});
  }
  // The cigar leaf is replaced by the terminal hanging peduncle at flowering.
  if(reproductive)tube([[.01,h,0],[.06,h+h*.04,0],[.14,h*.80,0],[.14,h*.65,0]],h*.012,c.stem,2,SURFACE.STEM,{terminal:'inflorescence'});
  else apex([.01,h,0],h*.20,0,'spear');
  if(reproductive)tube([[.14,h*.65,0],[.14,h*.65-.30,0]],h*.008,c.stem,2,SURFACE.STEM);
  if(reproductive)for(let j=0;j<4;j++)for(let k=0;k<6;k++)ball([.14+Math.cos(k)*.07,h*.65-j*.07,Math.sin(k)*.07],[.025,.085,.025],s.maturity>.8?'#c4b950':'#77963e',2,{supportAt:[.14,h*.65-j*.07,0]});
  return finish();
 }
 if(kind==='tree'&&p.species==='cacao'){
  // Dimorphic cacao: an upright trunk terminates in a jorquette; fan branches
  // carry distichous foliage. Pods arise on older wood, never on leaf tips.
  const phase=regionalPhyllotaxis(s,p,0,1)[0],trunk=[[0,0,0],[h*.012,h*.27,0],[h*.024,h*.55,h*.009]],hub=trunk.at(-1);
  const pathAt=(points,t)=>{const f=Math.max(0,Math.min(1,t))*(points.length-1),i=Math.min(points.length-2,Math.floor(f));return points[i].map((v,k)=>v+(points[i+1][k]-v)*(f-i));};
  tube(trunk,h*.022,'#75614b',0,SURFACE.BARK,{radii:[h*.022,h*.018,h*.012],axis:0,role:'Cacao orthotropic trunk'});
  const flush=(points,angle,axis,count=7,age=.8)=>{
   const nodes=regionalAxis(s,p,count,{axis,first:.22,last:.98});
   for(const [i,node] of nodes.entries()){
    const at=pathAt(points,node.t),q=foliageVariation(s,'cacao-fan-leaf',i,axis),a=angle+(i%2?1:-1)*(1.02+q.angle*.45),dev={...node.dev,axis,
     size:node.dev.size*(.78+.22*age),widthFactor:node.dev.widthFactor,
     elevation:-.10-(1-node.dev.expansion)*.45,droop:.12+node.dev.relativeAge*.16};
    const L=h*.017*dev.petioleFactor*q.petiole,end=[at[0]+Math.cos(a)*L,at[1]+L*.20,at[2]+Math.sin(a)*L];
    tube([at,end],h*.00065,c.stem,0,SURFACE.STEM,{development:dev,axis});
    blade(end,h*.17,h*.050,a,false,axis*100+i,{development:dev,role:'Cacao fan leaf'});
    const leaf=out.at(-1);leaf.color=mixHex(leaf.color,'#b38561',(1-dev.expansion)*.70);
   }
   apex(points.at(-1),h*.025,axis,'bud');
  };
  for(let i=0;i<5;i++){
   const axis=i+1,q=foliageVariation(s,'cacao-scaffold',i),a=phase+i*Math.PI*2/5+q.angle*.55,L=h*.40*q.length;
   const points=Array.from({length:7},(_,j)=>{const t=j/6;return[hub[0]+Math.cos(a)*L*t-Math.sin(a)*L*q.sweep*t*t,hub[1]+L*((.36+q.pitch*.6)*t+.10*Math.sin(Math.PI*t)),hub[2]+Math.sin(a)*L*t+Math.cos(a)*L*q.sweep*t*t];});
   tube(points,h*.009,'#78664d',0,SURFACE.BARK,{axis,role:'Cacao fan branch'});flush(points,a,axis);
   for(let j=0;j<2;j++){
    const at=pathAt(points,.48+j*.24),branchAxis=20+i*2+j,pose=foliageVariation(s,'cacao-secondary',j,axis),aa=a+(j?1:-1)*(.65+pose.angle),length=L*(.48-j*.08)*pose.length;
    const secondary=Array.from({length:5},(_,k)=>{const t=k/4;return[at[0]+Math.cos(aa)*length*t,at[1]+length*(.38*t+.10*Math.sin(Math.PI*t)),at[2]+Math.sin(aa)*length*t];});
    tube(secondary,h*.0038,'#827051',0,SURFACE.BARK,{axis:branchAxis});flush(secondary,aa,branchAxis,5,.65);
   }
  }
  if(reproductive)for(let i=0;i<5;i++){
   const t=.25+i*.13,base=pathAt(trunk,t),a=phase+i*2.399963+organVariation(s,'cacao-pod-angle',i).angle,R=h*(.026+seeded(seed+i*317)()*.012),at=[base[0]+Math.cos(a)*(R+h*.024),base[1]-.012,base[2]+Math.sin(a)*(R+h*.024)];
   ball(at,[R,R*2.05,R*.93],mixHex('#b9a34c','#c57539',i/7),2,{supportAt:base,yaw:a,tilt:.20+organVariation(s,'cacao-pod-pitch',i).pitch,role:'Cauliflorous cacao pod'});
  }
  return finish();
 }
 if(kind==='tree'){
  const stem=t=>[.025*Math.sin(Math.PI*t),h*t,0],main=regionalAxis(s,p,7,{first:.26,last:.985});
  tube([stem(0),...main.map(n=>stem(n.t)),stem(1)],h*.023,'#786548',0,SURFACE.BARK,{axis:0});
  apex(stem(1),h*.045,0,d.dormant?'dormant-bud':'bud');
  for(const [i,node] of main.entries())for(const [side,a] of node.angles.entries()){
   const axis=1+i*2+side,base=stem(node.t),length=h*.32*node.dev.size*organVariation(s,'orchard-branch',i,axis).length, end=[base[0]+Math.cos(a)*length,base[1]+length*(.50+foliageVariation(s,'branch-pose',i,axis).pitch),Math.sin(a)*length];
   const branch=regionalAxis(s,p,7,{axis,first:.16,last:.985}),point=t=>base.map((v,j)=>v+(end[j]-v)*t);
   tube([base,...branch.map(n=>point(n.t)),end],h*.008*Math.max(.15,node.dev.size),'#786548',0,SURFACE.BARK,{axis,development:node.dev});
   if(d.dormant){apex(end,h*.018,axis,'dormant-bud');continue;}
   for(const [k,leafNode] of branch.entries())for(const [pair,angle] of leafNode.angles.entries()){
    const at=point(leafNode.t),dev={...leafNode.dev,size:leafNode.dev.size*Math.sqrt(node.dev.size),widthFactor:leafNode.dev.widthFactor*Math.sqrt(node.dev.size)};
    const petiole=h*.018*dev.petioleFactor,tip=[at[0]+Math.cos(angle)*petiole,at[1]+petiole*petioleRise(k,axis),at[2]+Math.sin(angle)*petiole];
    tube([at,tip],h*.0009*Math.max(.2,dev.size),c.stem,0,SURFACE.STEM,{development:dev});
    blade(tip,h*(p.species==='coffee'?.17:p.species==='tea'?.12:.13),h*(p.species==='olive'?.022:p.species==='coffee'?.075:.055),angle,false,axis*100+k*2+pair,{development:dev});
   }
   apex(end,h*.030*Math.max(.3,node.dev.size),axis,'bud');
   if(reproductive&&p.species!=='tea'){
    const large=['pomegranate','cacao'].includes(p.species),rad=h*(large?.04:.012),at=p.species==='cacao'?[.03,h*(.25+i*.07),.025]:end;


    ball(at,[rad,rad*(p.species==='cacao'?2:1.1),rad],p.species==='coffee'?'#b54436':p.species==='olive'?(s.maturity>.75?'#514553':'#7f9148'):p.species==='cacao'?'#c7953f':'#ba6545',2,{supportAt:p.species==='cacao'?stem(.25+i*.07):end});
   }
  }
  return finish();
 }
 if(kind==='rosette'||kind==='taro'){
  const n=kind==='taro'?7:11;
  for(let i=0;i<n;i++){
   const dev=regionalDevelopment(s,p,i,n),a=regionalPhyllotaxis(s,p,i,n)[0],L=h*(kind==='taro'?.85:.24)*dev.petioleFactor,base=[0,h*.08*i/n,0],at=[Math.cos(a)*L*.30,base[1]+L,Math.sin(a)*L*.30];
   tube([base,at],(kind==='taro'?.009:.004)*Math.max(.15,dev.size),c.stem,0,SURFACE.STEM,{development:dev});
   blade(at,h*(kind==='taro'?.63:.95),h*(kind==='taro'?.42:.34),a,false,i,{development:dev});
  }
  apex([0,h*.08,0],h*.12,0,'rosette-heart');
  return finish();
 }
 const grass=p.cereal||kind==='cane';
 const n=grass?6:kind==='vine'?12:8;
 const terminal=reproductive&&TERMINAL_MODELS.has(kind),nodes=regionalAxis(s,p,n,{last:terminal?(grass?.84:.90):.99}),stem=t=>[.015*t,h*t,0];
 tube([[0,0,0],...nodes.map(node=>stem(node.t)),stem(1)],grass?.003:kind==='palmate'?.012:.005,c.stem,0,surfaceStem,{axis:0});
 if(!terminal)apex(stem(1),h*(grass?.12:.075),0,d.dormant?'dormant-bud':grass?'rolled-whorl':'bud');
 if(d.dormant&&!grass)return finish();
 function emitNodes(nodes,stem,h,axis=0){
 for(const [i,node] of nodes.entries())for(const [pair,a] of node.angles.entries()){
  const {t,dev}=node,at=stem(t),identity=axis*10000+i*100+pair*40;
  if(kind==='palmate'){
   const L=h*.16*dev.petioleFactor,end=[at[0]+Math.cos(a)*L,at[1]+L*petioleRise(i),at[2]+Math.sin(a)*L];tube([at,end],.003*Math.max(.15,dev.size),c.stem,0,SURFACE.STEM,{development:dev});
   for(let j=0;j<7;j++)blade(end,h*.18*(.70+.30*Math.sin(Math.PI*(j+1)/8)),h*.027,a+(j-3)*.55,false,identity+j,{development:dev});
  }else if(kind==='potato'||kind==='legume'||kind==='groundlegume'){
   const baseL=h*(kind==='groundlegume'?.6:.28),L=baseL*dev.petioleFactor,end=[at[0]+Math.cos(a)*L,at[1]+L*petioleRise(i),at[2]+Math.sin(a)*L],rachis=stalkCurve([at,end]);tube(rachis,.0015*Math.max(.15,dev.size),c.stem,0,SURFACE.STEM,{development:dev});
   const pairs=['pea','lentil','chickpea','faba','potato'].includes(p.species)?p.species==='faba'?2:['pea','potato'].includes(p.species)?3:p.species==='chickpea'?6:4:p.species==='peanut'?2:1;
   const leafletLength={pea:.36,faba:.35,chickpea:.16,lentil:.18}[p.species]??.65,leafletWidth={pea:.24,faba:.18,chickpea:.08,lentil:.09}[p.species]??(pairs>1?.16:.34);
   for(let j=0;j<pairs;j++)for(const side of [-1,1])blade(stalkPoint(rachis,.35+j/pairs*.55),baseL*leafletLength*(.75+.25*Math.sin(Math.PI*(j+1)/(pairs+1))),baseL*leafletWidth,a+side*1.1,false,identity+j*2+(side+1)/2,{development:dev});
   if(['pea','lentil'].includes(p.species)){const points=[];for(let k=0;k<18;k++){const t=k/17;points.push([end[0]+Math.cos(a)*L*.45*t+Math.sin(t*12)*.006,end[1]+L*.12*t,end[2]+Math.sin(a)*L*.45*t+Math.cos(t*12)*.006]);}tube(points,.0006,c.leaf,6);}
   else if(!['faba','peanut'].includes(p.species))blade(end,baseL*(p.species==='chickpea'?.18:.75),baseL*(p.species==='chickpea'?.09:.36),a,false,identity+20,{development:dev});
   if(reproductive&&kind==='legume'&&i>1){const len=['cowpea','bean','mung','adzuki'].includes(p.species)?h*.19:h*.075;const at=[end[0],end[1]-len*.5-.008,end[2]];ball(at,[h*(p.species==='chickpea'?.025:.014),len*.5,h*.012],s.maturity>.75?'#b5a16d':'#759448',2,{supportAt:end});}
  }else {
   const petiole=grass?0:h*.055*dev.petioleFactor,end=[at[0]+Math.cos(a)*petiole,at[1]+petiole*petioleRise(i),at[2]+at[2]+Math.sin(a)*petiole];
   if(petiole)tube([at,end],.0015*Math.max(.15,dev.size),c.stem,0,SURFACE.STEM,{development:dev});
   blade(end,h*(grass?.34:.32),h*(grass?.018:kind==='flax'?.025:.13),a,grass,identity,{development:dev});
  }
  if(grass&&detail){ball(at,[.0045,.0025,.0045],c.node,0,{surface:SURFACE.STEM});tube([[at[0],at[1]-h*.08,at[2]],at],.0032,c.leaf,1,SURFACE.GRASS);}
  if(kind==='cane')ball(at,[.013,.008,.013],'#9ba568',0);
  if(reproductive&&kind==='capsule'&&i>1){const fruitAt=[at[0]+Math.cos(a)*.028,at[1]+.035,at[2]+Math.sin(a)*.028];tube([at,fruitAt],.001,c.stem,0,SURFACE.STEM);ball(fruitAt,[.012,p.species==='okra'?.08:.025,.012],s.maturity>.75?'#b49d64':'#70944c',2,{supportAt:fruitAt,yaw:a,tilt:.12+dev.relativeAge*.15});}
  if(reproductive&&kind==='fruit'&&i>1){
   const fruitAt=[at[0]+Math.cos(a)*.09,at[1]-.04,at[2]+Math.sin(a)*.09];
   ball(fruitAt,[.035,.065,.03],s.maturity>.65?'#c94e31':'#5a8b3e',2,{supportAt:at});

  }
  if(reproductive&&kind==='cotton'&&(axis===0?i>2&&i%2===1:axis<3&&i===3)){const bollAt=[at[0]+Math.cos(a)*.10,at[1],at[2]+Math.sin(a)*.10];ball(bollAt,[.025,.03,.025],s.maturity>.6?'#eee7cf':'#7d9446',2,{supportAt:at});}
  if(reproductive&&kind==='groundlegume'&&s.maturity<.26&&i<3){const flowerAt=[at[0]+Math.cos(a)*.025,at[1]-.008,at[2]+Math.sin(a)*.025];tube([at,flowerAt],.0007,c.stem,0,SURFACE.STEM);out.push({type:'flower',at:flowerAt,radius:.008,size:[.008,.008,.008],organ:9,supportAt:flowerAt});}
 }
 }
 emitNodes(nodes,stem,h);
 // Indeterminate herbs form lateral leafy axes rather than a bare pole with
 // eight repeated leaf templates. Branch rank controls size and local age.
 if(!grass&&!d.dormant&&['legume','groundlegume','cotton','fruit','potato','capsule'].includes(kind)){
  const count=['pea','lentil','faba'].includes(p.species)?2:3;
  for(let k=0;k<count;k++){
   const parent=nodes[k+1],base=stem(parent.t),axis=k+1,a=parent.angles[0]+.65,q=foliageVariation(s,'herb-branch',k),L=h*(.62-k*.065)*q.length,
    branch=regionalAxis(s,p,5,{axis,first:.16,last:.98}),point=t=>[base[0]+Math.cos(a)*L*t*.62+Math.sin(a)*L*q.sweep*t*t,base[1]+L*(t*.83+.08*Math.sin(Math.PI*t)),base[2]+Math.sin(a)*L*t*.62-Math.cos(a)*L*q.sweep*t*t];
   tube([base,...branch.map(n=>point(n.t)),point(1)],Math.min(.004,h*.0045)*q.width,c.stem,0,surfaceStem,{axis,role:'Lateral herb shoot'});
   // Inherit the parent axis age; do not confuse leaflet rank with shoot age.
   const grown=branch.map(n=>({...n,dev:{...n.dev,size:n.dev.size*(.75+.25*parent.dev.relativeAge),widthFactor:n.dev.widthFactor*(.85+.15*parent.dev.relativeAge)}}));
   emitNodes(grown,point,L,axis);apex(point(1),h*.040,axis,'bud');
  }
 }

 if(reproductive){
  if(['spike','dense'].includes(kind)){
   const N=20,rows=kind==='dense'?6:p.species==='sixbarley'?6:2;
   const axis=t=>[.015+(p.species==='foxtail'?h*.12*t*t:0),h+h*.17*t-(p.species==='foxtail'?h*.14*t*t*t:0),0];
   tube(Array.from({length:9},(_,i)=>axis(i/8)),kind==='dense'?.008:.0018,c.ear,2,SURFACE.GRAIN);
   for(let j=0;j<N;j++)for(let k=0;k<rows;k++){
    const grainPose=organVariation(s,'grain-angle',j,k),grainSize=organVariation(s,'grain-size',j,k),a=k*Math.PI*2/rows+(kind==='spike'?grainPose.angle*.40:j*.18),t=(j+(kind==='spike'?k/rows:0))/N,taper=.5+.5*Math.sin(Math.PI*(.06+t*.88)),spread=p.species==='sorghum'?h*.045*Math.sin(Math.PI*(.06+t*.88)):kind==='spike'?.0048:.012;
    const base=axis(t),at=[base[0]+Math.cos(a)*spread,base[1]+(kind==='spike'?.005:0),base[2]+Math.sin(a)*spread];
    if(p.species==='sorghum')tube([base,at],.0007,c.ear,2,SURFACE.STEM);
    ball(at,[(kind==='dense'?.007*taper:.006)*grainSize.width,.008*grainSize.length,(kind==='dense'?.005*taper:.005)*grainSize.depth],c.ear,2,{shape:'grain',supportAt:base,yaw:a,tilt:.18+grainPose.pitch});
    if(kind==='spike'||detail&&p.species==='pearl')tube([at,[at[0]+Math.cos(a)*.018,at[1]+(kind==='spike'?.07:.014),at[2]+Math.sin(a)*.018]],kind==='spike'?.0004:.00012,c.ear,2,SURFACE.GRAIN);
   }
  }else if(kind==='panicle'||kind==='finger'){
   const N=kind==='finger'?5:14,grainScale=p.species==='teff'?.4:1;
   tube([[.015,h*.96,0],[.015,h+h*.16,0]],.001,c.ear,2,SURFACE.STEM,{terminal:'inflorescence'});
   for(let j=0;j<N;j++){
    const a=j*2.39996,t=j/N,base=[.015,h-h*.04*t,0],end=[.015+Math.cos(a)*h*.12,h+h*(kind==='finger'?.11:.16)*(1-t*.6)-(p.species==='rice'?h*.10*s.maturity*t*t:0),Math.sin(a)*h*.12];
    tube([base,end],.0009,c.ear,2,SURFACE.STEM);
    for(let k=0;k<(kind==='finger'?10:4);k++){
     const u=(k+1)/11,axis=kind==='finger'?base.map((v,i)=>v+(end[i]-v)*u):[end[0]+k*.002,end[1]-k*.006,end[2]];
     const at=[axis[0]+(k%2?-.004:.004),axis[1]-(kind==='finger'?0:.009),axis[2]+.003];
     tube([axis,at],.00035*grainScale,c.ear,2,SURFACE.STEM);
     ball(at,[.0035*grainScale,.007*grainScale,.0026*grainScale],c.ear,2,{shape:'grain',supportAt:axis});
    }
   }
  }else if(['cluster','flax','poppy','potato'].includes(kind)){
   for(let i=0;i<(kind==='poppy'?1:6);i++){
    const a=regionalPhyllotaxis(s,p,i,6)[0],top=stem(1),at=i===0?[top[0],h+h*.12,top[2]]:[top[0]+Math.cos(a)*h*.09,h+h*(.105+r()*.045),top[2]+Math.sin(a)*h*.09],root=i===0?top:[top[0],h+h*(.020+i*.012),top[2]];
    // A rising peduncle carries curved lateral branches; avoid flat spokes
    // turning straight out of the culm at ninety degrees.
    if(i===0)tube([top,[top[0],h+h*.10,top[2]]],.0019,c.stem,0,SURFACE.STEM,{terminal:'inflorescence',role:'Terminal peduncle'});
    tube(stalkCurve([root,at]),.0015,c.stem,0,SURFACE.STEM,{terminal:'inflorescence',role:'Inflorescence branch'});
    if(s.maturity>.72){ball(at,[kind==='poppy'?.026:.009,kind==='poppy'?.035:.013,.01],p.species==='quinoa'?'#ac6e58':'#a59660',2,{supportAt:at});}
    else {const R=kind==='poppy'?.038:p.species==='potato'?.018:p.species==='tobacco'?.023:.012;out.push({type:'flower',at,radius:R,size:[R,R,R],organ:9,supportAt:at,flowerAxis:p.species==='potato'?[Math.cos(a)*.88,.28+organVariation(s,'flower-pitch',i).pitch,Math.sin(a)*.88]:undefined});}
   }
  }
 }

 return finish();
}


// Inspection framing follows the actual organ instead of the nominal stem tip.
export function regionalStudy(s,part){
 const p=profile(s);
 if(!p.region||!['leaf','ear','flower'].includes(part)||['barley','maize','sunflower','soybean'].includes(p.model)||cropDimensions(s).residue)return null;
 const h=cropDimensions(s).h,layout=regionalPlant(s,s.seed??1847,true),leaves=layout.filter(o=>o.type==='leaf');
 let selected=[];
 if(part==='leaf'||p.species==='tea'){
  const score=o=>Math.abs(o.at[1]/h-.65)*.6-(Math.cos(o.angle)*.48+Math.sin(o.angle)*.85)*.18;
  const leaf=leaves.reduce((best,o)=>!best||score(o)<score(best)?o:best,null);if(leaf)selected=[leaf];
 }else{
  const bodies=layout.filter(o=>o.reproductive&&o.primary);
  if(['legume','fruit','capsule','cotton','tree','banana','cluster','flax','poppy','potato'].includes(p.model)){
   const score=o=>{const at=o.siteCenter;return Math.abs(at[1]/h-.62)*.25-(at[0]*.48+at[2]*.85)/h*.75;};
   const body=bodies.reduce((best,o)=>!best||score(o)<score(best)?o:best,null);if(body)selected=[body];
  }else selected=bodies;
 }
 if(!selected.length)return null;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const o of selected){
  if(o.reproductive){for(let k=0;k<3;k++){min[k]=Math.min(min[k],o.siteCenter[k]-o.siteRadius);max[k]=Math.max(max[k],o.siteCenter[k]+o.siteRadius);}continue;}
  for(let i=0;i<=16;i++)for(let j=0;j<=8;j++){
   const q=regionalLeafPoint(o,i/16,j/8*2-1);
   for(let k=0;k<3;k++){min[k]=Math.min(min[k],q[k]);max[k]=Math.max(max[k],q[k]);}
  }
 }
 const target=min.map((v,k)=>(v+max[k])*.5),radius=Math.hypot(...min.map((v,k)=>(max[k]-v)*.5)),span=selected.length===1&&selected[0].reproductive?Math.max(.06,selected[0].siteRadius*2.6):Math.max(.10,radius*3.2);
 let labels=part==='leaf'||p.species==='tea'?[
  ['Leaf blade',...regionalLeafPoint(selected[0],.55,.45)],['Midrib',...regionalLeafPoint(selected[0],.45,0)],['Leaf attachment',...selected[0].at]
 ]:[[p.fruit,...target],['Organ base',target[0],min[1],target[2]]];
 let desc;
 if(selected[0].reproductive){
  const site=layout.filter(o=>o.siteId===selected[0].siteId),wanted=p.model==='cotton'?(s.maturity<.25?['Corolla petal','Staminal column','Anther theca','Laciniate epicalyx bract']:['Cotton lint fibres','Recurved boll valve','Lint-bearing seed']):p.model==='legume'?['Pod suture','Valve vascular trace','Persistent style beak','Standard petal','Wing petal','Keel petal']:['Fused corolla','Anther theca','Corolla petal','Capsule valve ridge','Persistent stigmatic disc','Caryopsis and hull','Lemma','Palea','Persistent calyx'];
  labels=[[selected[0].flowerAxis?p.name+' flower':p.fruit,...target]];
  for(const role of wanted){const organ=site.find(o=>o.role===role);if(!organ)continue;const at=organ.type==='tube'?organ.points[Math.floor(organ.points.length/2)]:organ.type==='fibres'?organ.at:organ.type==='patch'?reproductivePoint(organ,.65,.3):organ.type==='corolla'?reproductivePoint(organ,.9,.4):organ.at;labels.push([role,...at]);if(labels.length>=4)break;}
  desc=p.model==='cotton'?(s.maturity>.6?'Three seed-cotton locks expand between recurved boll valves. Curved lint fibres form the soft surface and flyaway silhouette; individual fibres are a representative rendering sample.':'Yellow, dark-centred flowers develop into closed green bolls; lint remains enclosed until boll opening.'):p.model==='legume'?(s.maturity<.26?'One standard petal, two wings and two keel petals surround the stamens and style. The calyx persists as the flower develops into a seed pod.':'Continuous pod valves enclose the seeds, with dorsal and ventral sutures, seed-fill bulges, a persistent style and species-dependent surface hairs.'):'Shaped floral tissues, calyces, stamens and styles give way to species-specific fruit surfaces, capsules or grain hulls as the season advances.';
 }
 const flowerAxis=selected.find(o=>o.flowerAxis)?.flowerAxis;
 return {target,span,labels,...(flowerAxis?{cameraDirection:flowerAxis,title:p.name+' flower'}:{}),...(desc?{desc}:{})};
}
