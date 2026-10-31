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
export function regionalLeafLocal(o,t,v){
 const dev=o.development||{},shape=o.shape||'ovate',L=o.length,W=o.width;
 let envelope=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*Math.pow(t,shape==='cordate'||shape==='peltate'?.62:.88)),shape==='grass'?.84:.72);
 if(shape==='lobed')envelope*=.73+.27*Math.cos(t*Math.PI*10);
 if(shape==='serrate')envelope*=1+.045*Math.sin(t*Math.PI*36);
 if(shape==='ruffled')envelope*=1+.08*Math.sin(t*Math.PI*18);
 const lateral=v*W*.5*envelope*(1+(dev.asymmetry||0)*v),offset=shape==='peltate'?.21:0;
 const droop=dev.droop??(.08+(dev.relativeAge||0)*.10);
 let axial=L*(t-offset),rise=L*(.14*Math.sin(Math.PI*t)-droop*t*t+(dev.pitch||0)*t);
 if(shape==='peltate')rise-=L*(.14*Math.sin(Math.PI*offset)-droop*offset*offset+(dev.pitch||0)*offset);
 if(shape==='cordate')axial-=L*.12*Math.pow(1-t,8)*Math.pow(Math.abs(v),1.3);
 rise+=Math.abs(v)*W*(.025+(dev.fold||0)*.32)*envelope+(dev.twist||0)*lateral*t;
 if(shape==='ruffled')rise+=Math.pow(Math.abs(v),3)*W*.08*Math.sin(t*Math.PI*22);
 if(shape==='banana')rise+=Math.pow(Math.abs(v),2)*W*.045*Math.sin(t*Math.PI*12);
 // Rotate the whole surface, including its veins and peltate insertion, in a
 // local frame. Young blades stand up; older blades spread and droop.
 const roll=dev.roll||0,elevation=dev.elevation||0,y=rise*Math.cos(roll)-lateral*Math.sin(roll),z=rise*Math.sin(roll)+lateral*Math.cos(roll);
 return [axial*Math.cos(elevation)-y*Math.sin(elevation),axial*Math.sin(elevation)+y*Math.cos(elevation),z];
}
export function regionalLeafPoint(o,t,v){const [x,y,z]=regionalLeafLocal(o,t,v),a=o.angle;return[o.at[0]+Math.cos(a)*x-Math.sin(a)*z,o.at[1]+y,o.at[2]+Math.sin(a)*x+Math.cos(a)*z];}
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
 return regionalFramePoint(o,[localX,y,localZ]);
}

// Organ-local attachment coordinates: stalks, calyces and sutures use the same
// rigid frame as their fruit, including its yaw, droop and axial roll.
export function regionalFramePoint(o,[localX,y,localZ]){
 const tilt=o.tilt||0,yaw=o.yaw||0,roll=o.roll||0,ry0=y*Math.cos(roll)-localZ*Math.sin(roll),rz0=y*Math.sin(roll)+localZ*Math.cos(roll);
 const tx=localX*Math.cos(tilt)-ry0*Math.sin(tilt),ty=localX*Math.sin(tilt)+ry0*Math.cos(tilt);
 return [o.at[0]+Math.cos(yaw)*tx-Math.sin(yaw)*rz0,o.at[1]+ty,o.at[2]+Math.sin(yaw)*tx+Math.cos(yaw)*rz0];
}

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
 return o.at.map((p,k)=>p+o.axis[k]*x+o.normal[k]*y+o.side[k]*z);
}

export function regionalCorollaPoint(o,t,a){
 const lobes=(.72+.28*Math.cos(a*(o.lobes||5))),mouth=(o.tubeRadius+(o.radius-o.tubeRadius)*Math.pow(t,o.flare??2.7))*(1-Math.pow(t,12)*(1-lobes));
 const ripple=(o.wrinkle||0)*Math.sin(a*27+t*35)*Math.pow(t,3),r=mouth*(1+ripple),height=o.length*t+(o.radius*.16*Math.cos(a*(o.lobes||5)))*Math.pow(t,8);
 return o.at.map((p,k)=>p+o.axis[k]*height+o.side[k]*Math.cos(a)*r+o.normal[k]*Math.sin(a)*r);
}

export function portablePoint(p,scale=1){return [(p[0]+p[2]*.35)*scale,(-p[1]+p[2]*.12)*scale];}
