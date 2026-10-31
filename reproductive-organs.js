/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
import {seeded,organVariation,mixHex} from './crops.js';
import {SURFACE,regionalBodyPoint,regionalFramePoint,regionalPatchPoint,regionalCorollaPoint,stalkCurve} from './crop-surfaces.js';

const add=(a,b)=>a.map((v,k)=>v+b[k]),sub=(a,b)=>a.map((v,k)=>v-b[k]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),clamp=x=>Math.max(0,Math.min(1,x));
const frame=axis=>{const side=norm(cross(axis,Math.abs(axis[1])>.9?[0,0,1]:[0,1,0]));return {axis,side,normal:norm(cross(side,axis))};};

// Representative organ architecture, not fitted cultivar measurements. A seed
// count changes valve bulges, never replaces a pod wall with disconnected beads.
export const LEGUME_ORGANS={
 bean:{seeds:6,bulge:.14,curvature:.18,depth:.46,color:'#91a957',flower:'#ece3eb',hair:true},
 cowpea:{seeds:12,bulge:.055,curvature:.10,depth:.65,color:'#89a451',flower:'#b7a0d0'},
 mung:{seeds:10,bulge:.09,curvature:.08,depth:.65,color:'#879c48',flower:'#e6d36c',hair:true},
 adzuki:{seeds:8,bulge:.08,curvature:.13,depth:.60,color:'#809b49',flower:'#edda79',hair:true},
 faba:{seeds:4,bulge:.11,curvature:.12,depth:.62,color:'#80994d',flower:'#ede8db'},
 pea:{seeds:7,bulge:.07,curvature:.24,depth:.65,color:'#77a24c',flower:'#e0c7df'},
 chickpea:{seeds:2,bulge:.04,curvature:.08,depth:.82,color:'#9eb669',flower:'#e4c6d6',hair:true,inflated:true},
 lentil:{seeds:2,bulge:.04,curvature:.04,depth:.30,color:'#a2ad6b',flower:'#d6cae6'},
 pigeon:{seeds:4,bulge:.13,curvature:.16,depth:.58,color:'#8fa758',flower:'#e6c94d',hair:true},
 peanut:{seeds:2,bulge:.15,curvature:.07,depth:.65,color:'#b9a278',flower:'#e9cc45'},
 bambara:{seeds:1,bulge:.03,curvature:.03,depth:.90,color:'#ac976e',flower:'#e4d058'}
};

// Reproductive organs are built in a separate stream keyed by their parent site.
// The biological layout and identities survive field/specimen tessellation.
export function remasterReproductive(s,p,layout,detail){
 const out=[];
 for(const source of layout){
  if(source.type!=='flower'&&!(source.type==='ball'&&([2,9].includes(source.organ)||source.organ===5&&p.model==='groundlegume'))){out.push(source);continue;}
  if(source.legacyDetail)continue;
  const key=`${p.id}/${source.at.map(v=>v.toFixed(8)).join('/')}/${source.organ}`,q=organVariation(s,key),r=seeded(q.seed),siteId=q.seed;
  const size=source.size||[source.radius,source.radius,source.radius],R=Math.max(...size),siteCenter=source.at;
  let siteRadius=R*1.40,first=true;
  const emit=o=>{out.push({reproductive:true,siteId,siteCenter,siteRadius,supportAt:source.supportAt,primary:first,...o});first=false;return out.at(-1);};
  const ball=(at,size,color,organ=2,extra={})=>emit({type:'ball',at,size,color,organ,surface:organ===9?SURFACE.PETAL:SURFACE.FRUIT,shape:'round',yaw:0,tilt:0,roll:0,...extra});
  const tube=(points,radius,color,organ=2,surface=SURFACE.STEM,extra={})=>{
   if(/pedicel|attachment/i.test(extra.role||''))points=stalkCurve(points,{endDirection:extra.endDirection});
   return emit({type:'tube',points,radii:points.map((_,i)=>radius*(1-i/(points.length-1)*.72)),color,organ,surface,...extra});
  };
  const patch=(at,axis,normal,length,width,color,extra={})=>emit({type:'patch',at,axis:norm(axis),normal:norm(normal),side:norm(cross(axis,normal)),length,width,color,baseColor:color,organ:9,surface:SURFACE.PETAL,shape:'petal',cup:.16,...extra});
  const stage=clamp(s.maturity??.65),heading=source.yaw??r()*Math.PI*2,axis=norm([Math.cos(heading)*.70,.55,Math.sin(heading)*.70]);
  const body={...source,reproductive:true,siteId,siteCenter,siteRadius,primary:true,seed:q.seed};

  function hairs(parent,count,length=.0008,mode='hair'){
   emit({type:'fibres',at:parent.at,size:parent.size,body:parent,color:mode==='husk'?'#947354':'#cbd3a7',surface:mode==='husk'?SURFACE.ROOT:SURFACE.POD,organ:2,seed:q.seed+143,mode,count:detail?count:0,segments:mode==='husk'?12:4,length,radius:mode==='husk'?.000055:.000016,role:mode==='husk'?'Husk fibres':'Pod trichomes'});
  }
  function calyx(center,normal,radius,count=5,color='#728342'){
   const f=frame(normal);
   for(let k=0;k<count;k++){
    const a=k*Math.PI*2/count,d=add(mul(f.side,Math.cos(a)),mul(f.normal,Math.sin(a)));
    patch(center,d,normal,radius,radius*.48,color,{organ:2,surface:SURFACE.STEM,shape:'sepal',cup:-.25,role:'Persistent calyx'});
   }
  }
  function stamen(center,n,radius,length,count,color='#d4ae42',cone=false){
   const f=frame(n),N=detail?count:Math.min(count,3);
   for(let k=0;k<N;k++){
    const index=Math.floor(k*count/N),random=seeded(q.seed+index*719+Math.round(center[1]*1e7)),a=index*Math.PI*2/count,dir=add(mul(f.side,Math.cos(a)),mul(f.normal,Math.sin(a))),base=add(center,mul(dir,radius)),tip=add(add(base,mul(n,length*(cone?.14:.90+random()*.15))),mul(dir,cone?-radius*.55:radius*.35));
    if(detail)tube([base,add(base,mul(n,length*(cone?.07:.55))),tip],Math.max(.000055,radius*.035),'#e0c997',9,SURFACE.PETAL,{role:'Filament'});
    for(const side of detail?[-1,1]:[0])ball(add(add(tip,mul(f.side,side*radius*.075)),mul(n,cone?length*.25:0)),[Math.max(.00016,radius*.12),Math.max(.0003,length*(cone?.25:.19)),Math.max(.00012,radius*.08)],color,9,{role:'Anther theca',axis:n,yaw:Math.atan2(n[2],n[0])+Math.PI,tilt:Math.acos(Math.min(1,n[1]))});
   }
  }
  function flower(center,radius,species=p.species,n=source.flowerAxis?norm(source.flowerAxis):axis){
   siteRadius=Math.max(siteRadius,radius*1.7);const f=frame(n),legume=LEGUME_ORGANS[species],mallow=['cotton','okra'].includes(species),poppy=species==='poppy',flowerRandom=seeded(q.seed+Math.round(center.reduce((sum,v,k)=>sum+v*(k+3)*1e7,0)));
   const color=legume?.flower??({cotton:'#eedf9c',okra:'#e9d389',flax:'#8eace1',poppy:'#d7a6c5',potato:'#c6a9d4',pepper:'#ecebd8',sesame:'#dec7de',tobacco:'#d7a0b8',perilla:'#d7c5dd',coffee:'#eae8d5',olive:'#e7e0bd',cacao:'#d5b3a6',pomegranate:'#dc6d43',jute:'#e4ca55',buckwheat:'#eadbcf',quinoa:'#a2af65'}[species]??'#d9d4b4');
   const ovaryAt=poppy?add(center,mul(n,radius*.08)):legume?add(center,mul(f.normal,-radius*.24)):add(center,mul(n,-radius*.10)),ovary=ball(ovaryAt,[radius*(poppy?.20:.06),radius*(poppy?.25:.09),radius*(poppy?.20:.06)],'#799044',9,{surface:SURFACE.STEM,role:'Ovary',flower:species,flowerRadius:radius,flowerAxis:n,yaw:Math.atan2(n[2],n[0])+Math.PI,tilt:Math.acos(Math.min(1,n[1]))});
   if(source.supportAt)tube([source.supportAt,add(center,mul(n,-radius*.08))],Math.min(.0012,radius*.065),'#7d934b',2,SURFACE.STEM,{role:'Flower pedicel',endDirection:n});
   calyx(add(center,mul(n,-radius*.08)),mul(n,-1),radius*.42,5);
   if(legume){
    patch(add(center,mul(n,-radius*.05)),f.normal,n,radius*1.18,radius*1.65,color,{cup:.25,arch:.14,wrinkle:.012,role:'Standard petal'});
    for(const side of [-1,1]){
     const wing=patch(center,norm(add(mul(f.side,side*.75),mul(f.normal,-.20))),n,radius*.95,radius*.66,mixHex(color,'#ad79ab',.23),{cup:.35,twist:side*.20,role:'Wing petal'});
     patch(add(center,mul(n,radius*.08)),mul(f.normal,-1),n,radius*.85,radius*.62,mixHex(color,'#ba98be',.12),{shape:'keel',hand:side,cup:.62,fold:.35,role:'Keel petal'});
     if(species==='faba')patch(wing.at,wing.axis,n,radius*.28,radius*.32,'#403348',{shape:'pigment',parent:wing,role:'Wing blotch'});
    }
    if(detail)stamen(add(center,mul(f.normal,-radius*.28)),n,radius*.07,radius*.15,10);
   }else if(['potato','pepper','sesame','tobacco','perilla','coffee','olive'].includes(species)){
    const tubular=['sesame','tobacco','perilla'].includes(species),corolla=emit({type:'corolla',at:center,...f,length:radius*(tubular?1.40:.22),radius,tubeRadius:radius*(tubular?.19:.12),flare:tubular?3.2:1.1,lobes:species==='olive'?4:5,color,baseColor:species==='potato'?'#eee6c2':mixHex(color,'#f2e5be',.5),organ:9,surface:SURFACE.PETAL,wrinkle:.018,role:'Fused corolla',flower:species});
    if(species==='potato')stamen(add(center,mul(n,radius*.18)),n,radius*.20,radius*.65,5,'#d9b534',true);
    else stamen(add(center,mul(n,radius*(tubular?.75:.12))),n,radius*.20,radius*.34,species==='olive'?2:species==='sesame'||species==='perilla'?4:5);
   }else{
    const count=poppy?4:5;
    for(let k=0;k<count;k++){
     const a=k*Math.PI*2/count+q.angle,d=add(mul(f.side,Math.cos(a)),mul(f.normal,Math.sin(a)));
     patch(add(center,mul(n,radius*.03)),d,n,radius*(poppy?1.20:1.10),radius*(poppy?1.70:1.20),color,{baseColor:mallow?'#81364c':poppy?'#5b3853':species==='flax'?'#e2dfd2':color,cup:mallow?.52:poppy?.20:.18,arch:poppy?.10:0,wrinkle:poppy?.055:.012,twist:(flowerRandom()-.5)*.12,role:'Corolla petal',flower:species});
    }
    if(mallow){
     tube([center,add(center,mul(n,radius*.85))],radius*.055,'#ead4a0',9,SURFACE.PETAL,{role:'Staminal column'});
     stamen(add(center,mul(n,radius*.32)),n,radius*.11,radius*.40,detail?38:3,'#e6bd48');
     if(species==='cotton')for(let k=0;k<3;k++){const a=k*Math.PI*2/3,d=add(mul(f.side,Math.cos(a)),mul(f.normal,Math.sin(a)));patch(add(center,mul(n,-radius*.18)),d,mul(n,-1),radius*.80,radius*.65,'#728542',{shape:'bract',organ:2,surface:SURFACE.LEAF,cup:.4,role:'Laciniate epicalyx bract'});}
    }else stamen(center,n,radius*(poppy?.34:.17),radius*(poppy?.38:.28),poppy?64:species==='buckwheat'?8:5);
   }
   if(!poppy){
    const styleBase=legume?add(center,mul(f.normal,-radius*.28)):center,styleEnd=add(styleBase,mul(n,radius*(legume?.24:mallow?.95:.65))),free=species==='flax'||species==='buckwheat',count=mallow||species==='flax'?5:species==='buckwheat'?3:1;
    if(!free)tube([styleBase,styleEnd],radius*.025,'#b7bc6c',9,SURFACE.PETAL,{role:'Style'});
    for(let k=0;k<count;k++){const a=k*Math.PI*2/count,end=add(styleEnd,mul(add(mul(f.side,Math.cos(a)),mul(f.normal,Math.sin(a))),radius*(free?.12:.055)));if(free)tube([styleBase,end],radius*.018,'#b7bc6c',9,SURFACE.PETAL,{role:'Style'});ball(end,[radius*.045,radius*.035,radius*.045],mallow?'#a96551':'#bdc17c',9,{role:'Stigma'});}
   }
   if(poppy){
    const head=add(center,mul(n,radius*.28));ball(head,[radius*.25,radius*.09,radius*.25],'#91a57b',9,{yaw:Math.atan2(n[2],n[0])+Math.PI,tilt:Math.acos(Math.min(1,n[1])),role:'Stigmatic disc'});
    if(detail)for(let k=0;k<9;k++){const a=k*Math.PI*2/9; tube([head,add(head,add(mul(f.side,Math.cos(a)*radius*.24),mul(f.normal,Math.sin(a)*radius*.24)))],radius*.010,'#74875e',9,SURFACE.STEM,{role:'Stigmatic ray'});}
   }
   return ovary;
  }

  function pod(){
   const form=LEGUME_ORGANS[p.species]??LEGUME_ORGANS.bean;
   if(stage<.26&&source.organ!==5){flower(source.at,Math.min(.023,R*.9),p.species);return;}
   const depth=Math.min(source.size[2],source.size[0]*form.depth),parent=emit({...body,size:[source.size[0],source.size[1],depth],shape:'pod',surface:SURFACE.POD,seeds:form.seeds,bulge:form.bulge*(.4+.6*stage),curvature:form.curvature,beak:Math.min(.004,R*.12),inflated:form.inflated,color:stage>.77?mixHex(form.color,'#baa476',(stage-.77)/.23):form.color,role:'Seed-bearing pod',profile:p.species});
   for(const a of [0,Math.PI]){
    const points=Array.from({length:detail?65:9},(_,j)=>regionalBodyPoint(parent,j/(detail?64:8),a));
    tube(points,Math.min(.00026,R*.018),mixHex(parent.color,'#e0d199',.30),2,SURFACE.POD,{role:'Pod suture'});
   }
   const top=regionalBodyPoint(parent,1,0),bottom=regionalBodyPoint(parent,0,0);
   tube([source.supportAt||[source.at[0],source.at[1]+source.size[1]+.008,source.at[2]],top],.00065,parent.color,2,SURFACE.STEM,{role:'Pod pedicel'});
   calyx(top,norm(sub(top,bottom)),Math.min(.006,R*.23),5);
   tube([bottom,regionalFramePoint(parent,[parent.beak*1.5,-source.size[1]-.003,0])],.00030,parent.color,2,SURFACE.POD,{role:'Persistent style beak'});
   if(detail){
    for(let j=1;j<8;j++)for(const side of [-1,1]){
     const points=Array.from({length:13},(_,k)=>regionalBodyPoint(parent,clamp(j/9+(k/12-.5)*.055),side*(.10+k/12*(Math.PI-.20))));
     tube(points,.000055,mixHex(parent.color,'#b5c17d',.25),2,SURFACE.POD,{role:'Valve vascular trace'});
    }
    if(form.hair)hairs(parent,420,Math.min(p.species==='bean'?.00045:.0012,R*.055));
   }
  }

  function cotton(){
   if(stage<.25){flower(source.at,.035,'cotton');return;}
   const opened=stage>.60,opening=clamp((stage-.58)/.10),locks=3,scale=opened?1:Math.max(.45,.60+stage*.7);
   const parent={...body,size:source.size.map(v=>v*scale),surface:SURFACE.FRUIT,shape:'capsule',ribs:.075,ribCount:locks,color:opened?'#9b7950':'#8ba052',role:opened?'Opened boll':'Developing boll'};
   if(!opened){emit(parent);const base=regionalBodyPoint(parent,0,0);if(source.supportAt)tube([source.supportAt,base],.0018,'#7d934b',2,SURFACE.STEM,{role:'Boll pedicel'});calyx(base,[0,-1,0],.022,3);return;}
   siteRadius=R*1.75;
   const base=regionalFramePoint(parent,[0,-R*.75,0]);
   // G. barbadense: three seed-bearing locks, surrounded by recurved valves.
   for(let k=0;k<locks;k++){
    const a=k*Math.PI*2/locks+heading,radial=[Math.cos(a),0,Math.sin(a)],lockAt=add(source.at,mul(radial,source.size[0]*.55*opening)),expansion=.4+.6*opening;
    const lock=ball(lockAt,[source.size[0]*.66,source.size[1]*.82,source.size[2]*.66].map(v=>v*expansion),'#e3e0d2',2,{shape:'lint-lock',surface:SURFACE.LINT,yaw:a,proxyOnly:true,role:'Seed cotton lock',lock:k});
    const seedOrigins=[],seedSize=[.0025,.0038,.0022].map(v=>v*expansion);
    for(let j=0;j<8;j++){
     const angle=j*2.399963,at=lockAt.map((v,axis)=>v+lock.size[axis]*(axis===1?-.38+j/7*.42:Math.sin(angle+axis)*.27));seedOrigins.push(at);
     ball(at,seedSize,'#665846',2,{surface:SURFACE.POD,role:'Lint-bearing seed',lock:k});
    }
    patch(base,norm(add(mul(radial,.3+.62*opening),[0,.80-.42*opening,0])),[0,1,0],R*1.48,R*.78,'#9d7c53',{shape:'valve',surface:SURFACE.POD,organ:2,cup:-.34*opening,fold:.30,wrinkle:.022,baseColor:'#746044',role:'Recurved boll valve'});
    emit({type:'fibres',at:lockAt,size:lock.size,seedOrigins,seedSize,seed:q.seed+k*7831,mode:'lint',count:detail?3200:18,segments:detail?14:4,radius:detail?.000030:.000065,color:'#f0eddf',organ:2,surface:SURFACE.LINT,role:'Cotton lint fibres',lock:k});
   }
   if(source.supportAt)tube([source.supportAt,base],.0018,'#7d934b',2,SURFACE.STEM,{role:'Boll pedicel'});
   calyx(base,[0,-1,0],R*.75,3,'#8d8055');
  }

  function capsule(){
   if(stage<.27){flower(source.at,p.species==='okra'?.035:p.species==='sesame'?.014:.007,p.species);return;}
   const parent=emit({...body,shape:p.species==='jute'?'round':'capsule',ribs:p.species==='okra'?.13:.075,ribCount:p.species==='sesame'?4:5,surface:SURFACE.POD,color:stage>.8?'#ae9868':'#839a50',role:'Ribbed capsule'});
   const N=p.species==='sesame'?4:5;
   if(detail)for(let k=0;k<N;k++){const a=k*Math.PI*2/N; tube(Array.from({length:65},(_,j)=>regionalBodyPoint(parent,j/64,a)),.00010,'#a7b16d',2,SURFACE.POD,{role:'Capsule valve ridge'});}
   calyx(regionalBodyPoint(parent,0,0),[0,-1,0],Math.min(.012,R*.25),5);
   if(detail)hairs(parent,p.species==='okra'?450:180,p.species==='okra'?.0007:.00035);
  }

  function groundPod(){
   const form=LEGUME_ORGANS[p.species],parent=emit({...body,size:[size[0],size[1],Math.min(size[2],size[0]*.9)],shape:'pod',surface:SURFACE.POD,seeds:form.seeds,bulge:form.bulge,curvature:form.curvature,color:form.color,role:'Underground seed pod'});
   if(!detail)return;
   for(let j=1;j<12;j++){
    const points=Array.from({length:65},(_,k)=>regionalBodyPoint(parent,clamp(j/12+Math.sin(k/64*Math.PI*10+j)*.012),k/64*Math.PI*2));
    tube(points,.00010,'#c9b58e',5,SURFACE.POD,{role:'Reticulate shell ridge'});
   }
   for(let k=0;k<9;k++){
    const points=Array.from({length:65},(_,j)=>regionalBodyPoint(parent,.03+j/64*.94,k*Math.PI*2/9+Math.sin(j/64*31+k)*.05));
    tube(points,.00010,'#b9a27b',5,SURFACE.POD,{role:'Reticulate shell ridge'});
   }
  }

  function fruit(){
   if(stage<.23&&!['palm','banana'].includes(p.model)){flower(source.at,p.species==='pomegranate'?.03:p.species==='cacao'?.007:.014,p.species);return;}
   let parent={...body,surface:SURFACE.FRUIT,role:'Fruit body'};
   if(p.species==='pomegranate')parent={...parent,ribs:.025,ribCount:6};
   if(p.species==='coffee')parent={...parent,size:[size[0]*.80,size[1],size[2]*.80],ribs:.035,ribCount:2};
   if(p.species==='olive')parent={...parent,size:[size[0]*.75,size[1]*1.25,size[2]*.75]};
   if(p.species==='date')parent={...parent,size:[size[0]*.70,size[1]*1.15,size[2]*.70],ribs:stage>.8?.025:0,ribCount:12};
   if(p.model==='banana')parent={...parent,ribs:.025,ribCount:5};
   emit(parent);
   const top=regionalBodyPoint(parent,1,0),bottom=regionalBodyPoint(parent,0,0),n=norm(sub(top,bottom));
   if(source.supportAt){const mid=source.supportAt.map((v,k)=>(v+top[k])*.5+(k===1?R*.20:0));tube([source.supportAt,mid,top],Math.min(.002,R*.07),'#788c46',2,SURFACE.STEM,{role:'Fruit pedicel'});}
   if(p.species==='pomegranate'){
    calyx(top,n,R*.52,6,'#aa6742');
    if(detail)ball(add(top,mul(n,R*.045)),[R*.15,R*.05,R*.15],'#614b36',2,{surface:SURFACE.POD,role:'Calyx throat'});
   }else calyx(p.model==='banana'?bottom:top,p.model==='banana'?mul(n,-1):n,Math.min(.009,R*.23),p.species==='date'||p.species==='oilpalm'?3:5,p.model==='banana'?'#66533a':'#718347');
   if(detail){
    if(p.species==='coffee')tube(Array.from({length:49},(_,j)=>regionalBodyPoint(parent,.08+j/48*.84,heading)),.00011,'#774738',2,SURFACE.FRUIT,{role:'Cherry longitudinal crease'});
    if(p.species==='coconut'){
     for(let k=0;k<3;k++){const a=k*Math.PI*2/3,at=regionalBodyPoint(parent,.90,a);ball(at,[R*.065,R*.025,R*.065],'#584a32',2,{surface:SURFACE.ROOT,role:'Germination pore'});}
     hairs(parent,650,.002,'husk');
    }
    if(p.species==='cacao')for(let k=0;k<10;k++)tube(Array.from({length:81},(_,j)=>regionalBodyPoint(parent,.02+j/80*.96,k*Math.PI/5)),.00018,mixHex(parent.color,'#e4be76',.25),2,SURFACE.FRUIT,{role:'Cacao longitudinal ridge'});
    if(p.model==='fruit'||p.species==='date')for(let k=0;k<28;k++){const at=regionalBodyPoint(parent,.1+r()*.8,r()*Math.PI*2);ball(at,[.00010,.00013,.00010],mixHex(parent.color,'#d9c796',.20),2,{role:'Cuticular lenticel'});}
   }
  }

  function grain(){
   const parent=emit({...body,shape:'grain',crease:.13,role:'Caryopsis and hull',surface:SURFACE.GRAIN});
   const n=norm(sub(regionalBodyPoint(parent,1,0),regionalBodyPoint(parent,0,0))),f=frame(n),base=regionalBodyPoint(parent,0,0);
   if(source.supportAt)tube([source.supportAt,base],Math.min(.0012,size[0]*.18),parent.color,2,SURFACE.STEM,{role:'Spikelet attachment'});
   if(!detail)return;
   for(const side of [-1,1])patch(add(base,mul(f.side,side*size[0]*.10)),n,mul(f.side,side),size[1]*1.9,size[0]*1.50,mixHex(parent.color,'#c7b180',.20),{surface:SURFACE.GRAIN,organ:2,shape:'glume',cup:.08,fold:.24,role:side===1?'Lemma':'Palea'});
   if(stage<.28)for(let k=0;k<3;k++){
    const a=k*Math.PI*2/3,base=regionalBodyPoint(parent,.55,a),tip=add(base,[Math.cos(a)*.004,-.006,Math.sin(a)*.004]);tube([base,tip],.00007,'#d2c7a1',2,SURFACE.GRAIN,{role:'Exserted filament'});ball(tip,[.0005,.0017,.0004],'#ba9a42',2,{surface:SURFACE.GRAIN,role:'Cereal anther'});
   }
  }

  // Connect source supports to a point inside the emitted body, not to an
  // assumed pole of an unrotated proxy. Overlap avoids precision seams.
  if(source.supportAt&&source.type==='ball'&&['capsule','cluster','flax','poppy','potato'].includes(p.model))tube([source.supportAt,source.at],Math.min(.0015,R*.10),'#7c9050',2,SURFACE.STEM,{role:'Reproductive attachment'});
  if(source.type==='flower'){
   if(['quinoa','buckwheat','perilla'].includes(p.species)){
    const total=p.species==='quinoa'?28:9,count=detail?total:1,cluster=source.radius??R;
    for(let k=0;k<count;k++){
     const sample=detail?k:Math.floor((k+.5)*total/count),a=sample*2.399963,t=(sample+.5)/total,z=1-2*t,spread=cluster*Math.sqrt(1-z*z),at=add(source.at,[Math.cos(a)*spread,z*cluster*.65,Math.sin(a)*spread]);
     flower(at,cluster*(p.species==='quinoa'?.19:.35),p.species,norm([Math.cos(a)*.65,.7,Math.sin(a)*.65]));
    }
   }else flower(source.at,source.radius??R,p.species);
  }else if(p.model==='cotton')cotton();
  else if(p.model==='legume')pod();
  else if(p.model==='groundlegume')groundPod();
  else if(p.model==='capsule')capsule();
  else if(source.shape==='grain')grain();
  else if(p.species==='poppy'){
   const parent=emit({...body,shape:'capsule',ribs:.03,ribCount:9,role:'Poppy capsule'}),top=regionalBodyPoint(parent,1,0);
   ball(top,[R*.80,R*.07,R*.80],'#a49d79',2,{surface:SURFACE.POD,role:'Persistent stigmatic disc'});
   for(let k=0;k<9;k++){const a=k*Math.PI*2/9,edge=add(top,[Math.cos(a)*R*.78,0,Math.sin(a)*R*.78]);tube([add(top,[0,R*.04,0]),edge],R*.012,'#807a58',2,SURFACE.POD,{role:'Stigmatic ray'});if(detail)ball(add(edge,[0,-R*.10,0]),[R*.045,R*.022,R*.045],'#635e40',2,{surface:SURFACE.POD,role:'Substigmatic pore'});}
  }else if(p.species==='flax'||p.species==='tobacco'){
   const parent=emit({...body,shape:'capsule',ribs:.055,ribCount:p.species==='flax'?5:2,role:p.species==='flax'?'Ten-chamber flax capsule':'Tobacco capsule',surface:SURFACE.POD});calyx(regionalBodyPoint(parent,0,0),[0,-1,0],R*.65,5);
  }else if(['quinoa','buckwheat','perilla'].includes(p.species)){
   const total=32,count=detail?total:5;
   for(let k=0;k<count;k++){
    const sample=detail?k:Math.floor((k+.5)*total/count),a=sample*2.399963,z=1-2*(sample+.5)/total,spread=R*.80*Math.sqrt(1-z*z),at=add(source.at,[Math.cos(a)*spread,z*R*.65,Math.sin(a)*spread]),parent=ball(at,[R*.18,R*.23,R*.16],p.species==='quinoa'?'#ab795a':'#a09165',2,{shape:'capsule',ribs:p.species==='buckwheat'?.18:.03,ribCount:p.species==='buckwheat'?3:4,surface:SURFACE.GRAIN,role:p.species==='buckwheat'?'Three-angled achene':p.species==='perilla'?'Nutlet':'Seed with persistent perianth'});
    tube([source.at,regionalBodyPoint(parent,0,0)],Math.min(.00045,R*.04),'#8f9769',2,SURFACE.STEM,{role:'Cluster pedicel'});
    if(detail)calyx(regionalBodyPoint(parent,0,0),[0,-1,0],R*.17,p.species==='perilla'?4:5,'#909359');
   }
  }else if(p.species==='potato'){
   const parent=emit({...body,color:'#789951',role:'Potato berry'});calyx(regionalBodyPoint(parent,1,0),[0,1,0],R*.7,5);
  }else fruit();
 }
 return out;
}

// Curved fibres are actual silhouette geometry, not stripes painted on a ball.
// Hair tips and cotton flyaways are sampled identically in both renderers.
export function regionalFibreCurve(o,index){
 const r=seeded(o.seed+index*104729),points=[],phase=r()*Math.PI*2,angle=r()*Math.PI*2,t0=.08+r()*.84;
 if(o.mode==='lint'){
  const z=2*r()-1,d=[Math.cos(angle)*Math.sqrt(1-z*z),z,Math.sin(angle)*Math.sqrt(1-z*z)],f=frame(d),loose=index%7===0,curl=.10+r()*.22,frequency=5+r()*9;
  for(let j=0;j<=o.segments;j++){
   const t=j/o.segments,radial=loose?.82+t*.35:.20+.79*Math.sin(t*Math.PI*.5),wave=Math.sin(t*frequency+phase)-Math.sin(phase),wave2=Math.cos(t*frequency*.73+phase)-Math.cos(phase);
   const root=o.seedOrigins?.[index%o.seedOrigins.length];
   points.push(o.at.map((v,k)=>v+o.size[k]*(d[k]*radial+f.side[k]*curl*wave*t+f.normal[k]*curl*wave2*t)+(root?(root[k]+d[k]*o.seedSize[k]-v-o.size[k]*d[k]*.20)*(1-t)**2:0)));
  }
 }else{
  const parent=o.body,base=regionalBodyPoint(parent,t0,angle),normal=norm(sub(base,parent.at)),f=frame(normal),L=o.length*(.55+r()*.90);
  for(let j=0;j<=o.segments;j++){
   const t=j/o.segments;
   if(o.mode==='husk'){const at=regionalBodyPoint(parent,clamp(t0+(t-.5)*.20),angle+.08*Math.sin(t*9+phase));points.push(add(at,mul(normal,.0003+Math.sin(Math.PI*t)*L)));}
   else points.push(add(base,add(mul(normal,L*t),mul(f.side,L*.30*Math.sin(t*Math.PI*.6)))));
  }
 }
 return points;
}

export function reproductivePoint(o,t,v){
 if(o.type==='patch')return regionalPatchPoint(o,t,v);
 if(o.type==='corolla')return regionalCorollaPoint(o,t,v);
 return regionalBodyPoint(o,t,v);
}
