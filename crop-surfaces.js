/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
export const SURFACE=Object.freeze({STEM:0,GRASS:1,LEAF:2,GRAIN:3,POD:4,BARK:5,ROOT:6,FRUIT:7,PETAL:8,LINT:9,PALM:10,WAXY:11});
export function organSurface(organ){return organ===1?SURFACE.GRASS:organ===6?SURFACE.LEAF:organ===2||organ===8?SURFACE.GRAIN:organ===5||organ===10?SURFACE.ROOT:organ===9||organ===7?SURFACE.PETAL:SURFACE.STEM;}
export function leafShape(p){
 if(p.model==='taro')return 'peltate';
 if(p.model==='banana')return 'banana';
 if(p.model==='vine')return 'cordate';
 if(['cotton','okra','daikon'].includes(p.species))return 'lobed';
 if(['kale','beet','swede','turnip'].includes(p.species))return 'ruffled';
 if(p.species==='perilla'||p.species==='tea')return 'serrate';
 return p.cereal||p.model==='cane'||p.model==='palm'?'grass':'ovate';
}
// Shared leaf coordinates (metres): blades, silhouette and vein positions agree
// across both renderers. Detail changes sampling, never organ dimensions.
const leafFrames=new WeakMap(),bodyFrames=new WeakMap();
function leafFrame(o,dev){const roll=dev.roll||0,elevation=dev.elevation||0,angle=o.angle;let f=leafFrames.get(o);if(!f||f.roll!==roll||f.elevation!==elevation||f.angle!==angle){f={roll,elevation,angle,cosRoll:Math.cos(roll),sinRoll:Math.sin(roll),cosElevation:Math.cos(elevation),sinElevation:Math.sin(elevation),cosAngle:Math.cos(angle),sinAngle:Math.sin(angle)};leafFrames.set(o,f);}return f;}
export function regionalLeafLocal(o,t,v,frame=null){
 const dev=o.development||{},shape=o.shape||'ovate',L=o.length,W=o.width;
 let envelope=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*Math.pow(t,shape==='cordate'||shape==='peltate'?.62:.88)),shape==='grass'?.84:.72);
 if(shape==='lobed')envelope*=.73+.27*Math.cos(t*Math.PI*10);
 if(shape==='serrate')envelope*=1+.045*Math.sin(t*Math.PI*36);
 if(shape==='ruffled')envelope*=1+.08*Math.sin(t*Math.PI*18);
 const lateral=v*W*.5*envelope*(1+(dev.asymmetry||0)*v),offset=shape==='peltate'?.21:0;
 const droop=dev.droop??(.08+(dev.relativeAge||0)*.10);
 let axial=L*(t-offset),rise=L*((dev.camber??.14)*Math.sin(Math.PI*t)-droop*t*t+(dev.pitch||0)*t);
 if(shape==='peltate')rise-=L*((dev.camber??.14)*Math.sin(Math.PI*offset)-droop*offset*offset+(dev.pitch||0)*offset);
 if(shape==='cordate')axial-=L*.12*Math.pow(1-t,8)*Math.pow(Math.abs(v),1.3);
 rise+=Math.abs(v)*W*(.025+(dev.fold||0)*.32)*envelope+(dev.twist||0)*lateral*t;
 if(shape==='ruffled')rise+=Math.pow(Math.abs(v),3)*W*.08*Math.sin(t*Math.PI*22);
 if(shape==='banana')rise+=Math.pow(Math.abs(v),2)*W*.045*Math.sin(t*Math.PI*12);
 // Rotate the whole surface, including its veins and peltate insertion, in a
 // local frame. Young blades stand up; older blades spread and droop.
 const f=frame||leafFrame(o,dev),y=rise*f.cosRoll-lateral*f.sinRoll,z=rise*f.sinRoll+lateral*f.cosRoll+L*(dev.sweep||0)*(t-offset)**2;
 return [axial*f.cosElevation-y*f.sinElevation,axial*f.sinElevation+y*f.cosElevation,z];
}
export function regionalLeafPoint(o,t,v){const f=leafFrame(o,o.development||{}),[x,y,z]=regionalLeafLocal(o,t,v,f);return[o.at[0]+f.cosAngle*x-f.sinAngle*z,o.at[1]+y,o.at[2]+f.sinAngle*x+f.cosAngle*z];}
export function regionalBodyPoint(o,t,a){
 const [rx,ry,rz]=o.size,shape=o.shape||'round';let envelope=t<=0||t>=1?0:Math.sin(Math.PI*t),y=shape==='round'?-Math.cos(Math.PI*t)*ry:(2*t-1)*ry,x=0;
 if(shape==='pod'){envelope=Math.pow(Math.max(0,envelope),o.inflated?.55:.34)*(1+(o.bulge??.10)*Math.cos((t*(o.seeds||3)-.45)*Math.PI*2));x=ry*(o.curvature??.13)*Math.sin(Math.PI*t)+(o.beak||0)*Math.pow(1-t,12);}
 if(shape==='grain'){envelope=Math.pow(Math.max(0,envelope),.72)*(1-.16*t);envelope*=1-(o.crease??0)*Math.exp(-Math.pow(Math.sin(a*.5)/.12,2));}
 if(shape==='pepper')envelope=Math.pow(Math.max(0,envelope),.42)*(1-.24*t);
 if(shape==='banana'){envelope=Math.pow(Math.max(0,envelope),.55);x=ry*.65*Math.sin(Math.PI*t);}
 if(shape==='capsule')envelope=Math.pow(Math.max(0,envelope),.48)*(1-.16*t);
 if(shape==='lint-lock')envelope=Math.pow(Math.max(0,envelope),.58)*(1+.07*Math.sin(t*23+Math.cos(a*3)*2)+.035*Math.cos(a*7+t*31));
 const ridge=1+(o.ribs||0)*Math.cos(a*(o.ribCount||6));
 const localX=x+Math.cos(a)*rx*envelope*ridge,localZ=Math.sin(a)*rz*envelope*ridge;
 return regionalFrameXYZ(o,localX,y,localZ);
}

// Organ-local attachment coordinates: stalks, calyces and sutures use the same
// rigid frame as their fruit, including its yaw, droop and axial roll.
function regionalFrameXYZ(o,localX,y,localZ){const tilt=o.tilt||0,yaw=o.yaw||0,roll=o.roll||0;let f=bodyFrames.get(o);if(!f||f.tilt!==tilt||f.yaw!==yaw||f.roll!==roll){f={tilt,yaw,roll,cosTilt:Math.cos(tilt),sinTilt:Math.sin(tilt),cosYaw:Math.cos(yaw),sinYaw:Math.sin(yaw),cosRoll:Math.cos(roll),sinRoll:Math.sin(roll)};bodyFrames.set(o,f);}const ry0=y*f.cosRoll-localZ*f.sinRoll,rz0=y*f.sinRoll+localZ*f.cosRoll,tx=localX*f.cosTilt-ry0*f.sinTilt,ty=localX*f.sinTilt+ry0*f.cosTilt;return[o.at[0]+f.cosYaw*tx-f.sinYaw*rz0,o.at[1]+ty,o.at[2]+f.sinYaw*tx+f.cosYaw*rz0];}
export function regionalFramePoint(o,[localX,y,localZ]){return regionalFrameXYZ(o,localX,y,localZ);}

// Thin parametric tissues rather than closed ellipsoids. The same points are
// sampled by WebGL meshes, Canvas triangles, veins and inspection bounds.
export function regionalPatchPoint(o,t,v){
 if(o.shape==='pigment')return regionalPatchPoint(o.parent,.32+t*.40,v*.58*Math.sin(Math.PI*t)).map((p,k)=>p+o.normal[k]*.00004);
 const envelope=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*Math.pow(t,o.shape==='bract'?.72:.87)),o.shape==='valve'?.60:.62);
 const lobes=o.shape==='bract'?1+.17*Math.sin(t*Math.PI*18):1;
 const x=o.length*t,z=o.width*.5*(o.shape==='keel'?o.hand*(v+1)*.5:v)*envelope*lobes;
 const fold=o.shape==='keel'?Math.pow((v+1)*.5,2):Math.abs(v);
 const y=o.length*((o.cup??.20)*t*t+(o.arch||0)*Math.sin(Math.PI*t))+(o.fold??.12)*fold*o.width*envelope+
  (o.wrinkle||0)*o.width*Math.sin(t*47+v*3)*Math.pow(Math.abs(v),1.6)*envelope+(o.twist||0)*z*t;
 return [o.at[0]+o.axis[0]*x+o.normal[0]*y+o.side[0]*z,o.at[1]+o.axis[1]*x+o.normal[1]*y+o.side[1]*z,o.at[2]+o.axis[2]*x+o.normal[2]*y+o.side[2]*z];
}

export function regionalCorollaPoint(o,t,a){
 const lobes=(.72+.28*Math.cos(a*(o.lobes||5))),mouth=(o.tubeRadius+(o.radius-o.tubeRadius)*Math.pow(t,o.flare??2.7))*(1-Math.pow(t,12)*(1-lobes));
 const ripple=(o.wrinkle||0)*Math.sin(a*27+t*35)*Math.pow(t,3),r=mouth*(1+ripple),height=o.length*t+(o.radius*.16*Math.cos(a*(o.lobes||5)))*Math.pow(t,8),ca=Math.cos(a),sa=Math.sin(a);
 return [o.at[0]+o.axis[0]*height+o.side[0]*ca*r+o.normal[0]*sa*r,o.at[1]+o.axis[1]*height+o.side[1]*ca*r+o.normal[1]*sa*r,o.at[2]+o.axis[2]*height+o.side[2]*ca*r+o.normal[2]*sa*r];
}

// Smooth support paths preserve every supplied attachment knot. Sampling is
// fixed in biological layout space, independent of mesh/Canvas detail.
export function stalkPoint(points,t){
 const f=Math.max(0,Math.min(1,t))*(points.length-1),i=Math.min(points.length-2,Math.floor(f));
 return points[i].map((v,k)=>v+(points[i+1][k]-v)*(f-i));
}
export function stalkCurve(points,{startDirection,endDirection,steps=6}={}){
 if(points.length<2)return points.map(p=>[...p]);
 const sub=(a,b)=>a.map((v,k)=>v-b[k]),length=a=>Math.hypot(...a),unit=a=>{const L=length(a)||1;return a.map(v=>v/L);};
 const tangent=i=>{
  if(i===0&&startDirection)return unit(startDirection);
  if(i===points.length-1&&endDirection)return unit(endDirection);
  if(i===0){const d=sub(points[1],points[0]),L=length(d);return unit([d[0],d[1]+L*.60,d[2]]);}
  if(i===points.length-1){const d=sub(points[i],points[i-1]),L=length(d);return unit([d[0],d[1]-L*.20,d[2]]);}
  const a=unit(sub(points[i],points[i-1])),b=unit(sub(points[i+1],points[i]));return unit(a.map((v,k)=>v+b[k]));
 };
 if(points.every(p=>length(sub(p,points[0]))<1e-12))return points.map(p=>[...p]);
 const out=[[...points[0]]];
 for(let i=0;i<points.length-1;i++){
  const a=points[i],b=points[i+1],L=length(sub(b,a)),u=tangent(i),v=tangent(i+1);
  for(let j=1;j<=steps;j++){
   if(j===steps){out.push([...b]);continue;}
   const t=j/steps,t2=t*t,t3=t2*t;
   out.push(a.map((p,k)=>(2*t3-3*t2+1)*p+(-2*t3+3*t2)*b[k]+(t3-2*t2+t)*u[k]*L*.72+(t3-t2)*v[k]*L*.72));
  }
 }
 return out;
}

export function portablePoint(p,scale=1){return [(p[0]+p[2]*.35)*scale,(-p[1]+p[2]*.12)*scale];}
