/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
import { profile, cropDimensions, cropColors, seeded, leafDevelopment, sunflowerHead, maizeEar, shootTermination, mixHex, soybeanAxisNodes, soybeanLeafSurface, soybeanPodShape, soybeanPodSurface, sunflowerDiskLayout, fieldPlantTraits, organVariation, foliageVariation, axisNodeFractions, soybeanBranches, cerealSpike, sunflowerRays, maizeKernel } from './crops.js';
import { regionalPlant } from './regional-plants.js';
import { regionalFibreCurve } from './reproductive-organs.js';
import { SURFACE, regionalLeafPoint, regionalBodyPoint, regionalPatchPoint,regionalCorollaPoint,portablePoint } from './crop-surfaces.js';
const stroke=(c,pts,color,width)=>{c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.strokeStyle=color;c.lineWidth=Math.max(.18,width);c.stroke();};
function oval(c,x,y,rx,ry,color,angle=0){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),angle,0,Math.PI*2);c.fillStyle=color;c.fill();}
function leaf(c,x,y,L,W,angle,p,detail,serrate=false,grass=false,dev={}){W*=dev.aspectRatio??1;angle+=(dev.angle||0)+(dev.pitch||0);c.save();c.translate(x,y);c.rotate(angle);const seg=detail?42:14,left=[],right=[];for(let i=0;i<=seg;i++){let t=i/seg,w=(i===0||i===seg)?0:W*.5*Math.pow(Math.sin(Math.PI*Math.pow(t,serrate?.55:.85)),.72)*(1-(dev.fold||0)*.65);if(serrate)w*=1+.035*Math.cos(t*Math.PI*32);let cy=-L*(.20+(dev.curl||0)*.30)*Math.sin(t*Math.PI)+L*.10*t*t;let notch=serrate?.07*L*Math.pow(1-t,10):0;left.push([t*L-notch,cy-w]);right.push([t*L-notch,cy+w*(1+(dev.asymmetry||0))]);}c.beginPath();c.moveTo(...left[0]);for(const a of left)c.lineTo(...a);for(const a of right.reverse())c.lineTo(...a);c.closePath();let g=c.createLinearGradient(0,-W*.5,0,W*.5);g.addColorStop(0,p.edge);g.addColorStop(.42,p.leaf);g.addColorStop(.53,p.vein);g.addColorStop(1,p.leaf);c.fillStyle=g;c.fill();c.strokeStyle=p.edge;c.lineWidth=Math.max(.25,W*.012);c.stroke();if(detail){c.save();c.clip();stroke(c,[[0,0],[L*.4,-L*.17],[L,.01*L]],p.vein,W*(grass?.035:.008));if(serrate)for(let sign of[-1,1])stroke(c,[[0,0],[L*.2,-L*.12+sign*W*.22],[L*.5,-L*.17+sign*W*.32]],p.vein,W*.006);for(let i=1;i<9;i++){let t=i/10,x=t*L,cy=-L*.20*Math.sin(t*Math.PI)+L*.10*t*t,ww=W*.43*Math.sin(t*Math.PI);if(grass){c.beginPath();c.moveTo(0,(i-5)*W*.075);c.quadraticCurveTo(L*.5,-L*.19+(i-5)*W*.07,L,.01*L);c.strokeStyle=p.vein;c.globalAlpha=.4;c.lineWidth=W*.009;c.stroke();}else for(let sign of[-1,1]){stroke(c,[[x,cy],[x+L*.04,cy+sign*ww*.5],[x+L*.11,cy+sign*ww]],p.vein,W*.004);for(let k=1;k<3;k++)stroke(c,[[x+L*.04,cy+sign*ww*k/3],[x+L*.09,cy+sign*ww*(k+.4)/3]],p.edge,W*.0018);}}c.restore();}c.restore();}
function barley(c,s,scale,r,detail){let d=cropDimensions(s),p=cropColors(s),H=d.h*scale,nodes=axisNodeFractions(s,[.16,.34,.54,.71]);stroke(c,[[0,0],[.004*scale,-H*.5],[.018*scale,-H*(d.ear?1:.84)]],p.stem,.0036*organVariation(s,'stem').width*scale);for(let i=0;i<4;i++){let t=nodes[i],side=i%2?-1:1,yy=-H*t,dev=leafDevelopment(s,i,4,Math.floor(r()*100000)),L=(d.ear?.26:Math.min(.23,d.h*1.2))*dev.size*scale;c.save();c.translate(.018*t*t*scale,yy);c.scale(side,1);leaf(c,0,0,L,.012*scale*dev.widthFactor,-.16-dev.fold*.4,{...p,leaf:dev.color},detail,false,true,dev);c.restore();oval(c,.018*t*t*scale,yy,.0027*scale,.0014*scale,p.node);if(detail)for(let side of[-1,1]){c.beginPath();c.ellipse(.018*t*t*scale+side*.001*scale,yy,.0045*scale,.0014*scale,0,0,Math.PI);c.strokeStyle=p.leaf;c.lineWidth=.0005*scale;c.stroke();}}
if(!d.ear)drawLeafWhorl(c,s,scale,p);if(d.ear){const spike=cerealSpike(s);stroke(c,[[.018*scale,-H],...spike.nodes.map(t=>[(.018+.025*t*t)*scale,-H-(spike.length*t-.012*t*t)*scale])],p.stem,.0018*scale);for(let j=0;j<spike.nodes.length;j++){const q=organVariation(s,'spikelet',j),awn=organVariation(s,'awn',j);let t=spike.nodes[j],side=j%2?1:-1,x=(.018+.025*t*t+side*.004)*scale,y=-H-(spike.length*t-.012*t*t)*scale;stroke(c,[[(.018+.025*t*t)*scale,y],[x,y]],p.bract,.0008*scale);oval(c,x,y-.005*scale,.0027*scale*q.width*spike.width,.0055*scale*q.length,p.ear,-side*.2);stroke(c,[[x,y],[x+side*.003*scale,y-.009*scale],[x+side*.026*awn.length*scale,y-(.01+.10*awn.length)*scale]],p.vein,.00018*scale);if(detail)for(let z of[-1,1]){oval(c,x+z*.003*scale,y,.0009*scale,.0035*scale,p.bract);stroke(c,[[x-.001*scale,y],[x,y-.01*scale]],p.edge,.00012*scale);}}}}
export function drawLeafWhorl(c,s,scale,p){const H=cropDimensions(s).h*scale,L=Math.min(s.crop==='maize'?.24:.16,cropDimensions(s).h*.48)*scale;let previous=Infinity;for(let k=0;k<3;k++){const q=organVariation(s,'whorl-leaf',k);let l=Math.min(previous*.82,L*(1-k*.24)*q.length),side=k%2?-1:1,y=-H*.84;previous=l;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(side*l*.08,y-l*.40,side*l*.14,y-l*.80,side*l*.18,y-l);c.bezierCurveTo(side*l*.11,y-l*.6,-side*l*.025,y-l*.30,0,y);c.fillStyle=mixHex(p.leaf,'#b4bd7e',.2);c.fill();stroke(c,[[0,y],[side*l*.10,y-l*.5],[side*l*.18,y-l]],p.vein,scale*.00025);}}
function maize(c,s,scale,r,detail){const d=cropDimensions(s),p=cropColors(s),H=d.h*scale,top=d.reproductive?H:H*.84;stroke(c,[[0,0],[.008*scale,-top*.55],[.018*scale,-top]],p.stem,.025*organVariation(s,'stem').width*scale);const n=d.residue?3:s.season==='spring'?6:15,nodes=axisNodeFractions(s,Array.from({length:n},(_,i)=>.07+i/(n-1)*(d.reproductive?.84:.74)));for(let i=0;i<n;i++){let t=nodes[i],dev=leafDevelopment(s,i,n,Math.floor(r()*100000)),x=.018*t*t*scale,y=-H*t;oval(c,x,y,.014*scale,.003*scale,p.node);if(d.residue)continue;const L=Math.min(.87,d.h*.95)*dev.size*scale,local={...p,leaf:dev.color};c.save();c.translate(x,y);c.scale(i%2?-1:1,1);leaf(c,0,0,L,Math.min(.085,d.h*.09)*dev.widthFactor*scale,-.17+dev.fold*-.6,local,detail,false,true,dev);c.restore();}
if(!d.reproductive&&!d.residue)drawLeafWhorl(c,s,scale,p);
if(d.reproductive){
for(let k=0;k<9;k++){const tq=organVariation(s,'tassel-branch',k);let side=k%2?-1:1,x=.018*scale,y=-H-(.02+k*.014)*scale,end=[x+side*(.16-k*.009)*tq.width*scale,y-.13*tq.length*scale];stroke(c,[[x,y],end],p.bract,.0016*scale);for(let j=1;j<11;j++){let t=j/12,xx=x+(end[0]-x)*t,yy=y+(end[1]-y)*t;oval(c,xx,yy,.0011*scale,.0035*scale,p.ear,-side*.3);if(detail&&s.maturity<.27)oval(c,xx+.001*scale,yy+.002*scale,.0005*scale,.0018*scale,'#b7a45d');}}
stroke(c,[[.018*scale,-H],[.020*scale,-H-.23*scale]],p.bract,.0013*scale);stroke(c,[[.02*scale,-H-.23*scale],[.024*scale,-H-.27*scale]],p.bract,.0003*scale);
function ear(secondary){const e=maizeEar(s,secondary),bx=e.base[0]*scale,by=-e.base[1]*scale,L=e.length*scale,R=e.radius*scale,cut=detail&&s.cutaway&&!secondary;stroke(c,[[.004*scale,by],[bx,by]],p.stem,.010*scale*e.scale);c.save();c.translate(bx,by);c.rotate((secondary?-.32:.37)+Math.atan2(e.direction[0],e.direction[1])-(secondary?Math.atan2(-.28,.87):Math.atan2(.32,.87)));const outline=()=>{c.beginPath();c.moveTo(0,.008*scale);c.bezierCurveTo(-R*1.18,-L*.12,-R*1.36,-L*.63,-R*.34,-L*.94);c.quadraticCurveTo(0,-L*1.16,R*.24,-L*1.03);c.bezierCurveTo(R*.8,-L*.70,R*1.03,-L*.2,0,.008*scale);c.closePath();};outline();let g=c.createLinearGradient(-R,0,R,0);g.addColorStop(0,p.edge);g.addColorStop(.38,mixHex(p.leaf,'#a1b36d',.25));g.addColorStop(.65,p.leaf);g.addColorStop(1,p.edge);c.fillStyle=g;c.fill();
if(cut){c.save();outline();c.clip();for(let row=0;row<8;row++)for(let j=0;j<e.kernels;j++){const kernel=maizeKernel(s,row,j,e);let t=kernel.t,xx=(row-3.5)*R*.19*Math.pow(Math.sin(t*Math.PI),.32),yy=-L*t,kw=R*.13*kernel.width,kh=L/e.kernels*.44*kernel.length;let gradient=c.createLinearGradient(xx-kw,yy-kh,xx+kw,yy+kh);gradient.addColorStop(0,'#f0d277');gradient.addColorStop(.45,s.maturity<.28?'#e6d9a0':'#dfb846');gradient.addColorStop(1,'#b88d30');c.beginPath();c.moveTo(xx-kw*.68,yy-kh);c.quadraticCurveTo(xx+kw*.75,yy-kh*1.1,xx+kw,yy);c.lineTo(xx+kw*.72,yy+kh);c.quadraticCurveTo(xx-kw*.8,yy+kh*.98,xx-kw,yy);c.closePath();c.fillStyle=gradient;c.fill();c.strokeStyle='#ac853733';c.lineWidth=.0003*scale;c.stroke();if(s.maturity>.7)stroke(c,[[xx-kw*.3,yy],[xx+kw*.35,yy]],'#ae843d',.0004*scale);}c.restore();for(let side of[-1,1]){c.save();c.scale(side,1);leaf(c,R*.40,-L*.12,L*.47,R*.85,1.4,p,detail,false,true);c.restore();}}
else{c.save();outline();c.clip();for(let k=-8;k<=8;k++){c.beginPath();c.moveTo(k*R*.10,.004*scale);c.bezierCurveTo(k*R*.15,-L*.30,k*R*.11,-L*.75,0,-L*1.08);c.strokeStyle=k%3?p.edge:p.vein;c.globalAlpha=k%3?.20:.35;c.lineWidth=.0004*scale;c.stroke();}c.restore();}
for(let k=0;k<(detail?90:12);k++){let a=r()*Math.PI*2,len=(.04+r()*.045)*scale*e.scale;c.beginPath();c.moveTo(0,-L*1.075);c.quadraticCurveTo(Math.cos(a)*len*.35,-L*1.075-len*.40,Math.cos(a)*len*.65,-L*1.075+len*(.3+Math.sin(a)*.3));c.strokeStyle=s.maturity<.25?'#c9c697':s.maturity<.55?'#b39768':'#74533d';c.lineWidth=Math.max(.16,.00013*scale);c.stroke();}c.restore();}
ear(false);if(s.maturity>.3)ear(true);}
if(H>.8*scale&&!d.residue)for(let i=0;i<8;i++){let xx=Math.cos(i/8*Math.PI*2)*.12*scale;stroke(c,[[0,-.06*scale],[xx*.5,-.04*scale],[xx,0]],p.node,.004*scale);}}
function sunflowerDiskUnit2D(c,u,scale,f,detail){
 const x=u.x*scale,y=u.y*scale,R=u.size*scale,phase=u.phase;
 c.save();c.translate(x,y);c.rotate(u.angle+.18);c.scale(u.width,u.length);
 // Imbricate paleae fill the spaces between tightly packed spiral units.
 c.beginPath();c.moveTo(-R*.75,R*.85);c.quadraticCurveTo(-R*.25,-R*1.15,R*.12,-R*1.23);c.lineTo(R*.55,R*.65);c.closePath();c.fillStyle=phase==='bud'?'#817b3d':'#947b44';c.fill();
 if(phase==='seed'){
  c.beginPath();c.moveTo(0,-R*1.05);c.bezierCurveTo(R*.65,-R*.8,R*.78,R*.45,0,R*1.04);c.bezierCurveTo(-R*.76,R*.45,-R*.64,-R*.8,0,-R*1.05);c.closePath();const g=c.createLinearGradient(-R,0,R,0);g.addColorStop(0,'#a08a62');g.addColorStop(.18,'#544430');g.addColorStop(.65,'#403626');g.addColorStop(1,'#82704d');c.fillStyle=g;c.fill();if(detail)stroke(c,[[0,-R*.86],[R*.12,0],[0,R*.85]],'#a5916a',R*.08);
 }else if(phase==='bud'){
  oval(c,0,0,R*.88,R*.94,'#747339');for(let j=0;j<5;j++){const a=j/5*Math.PI*2;stroke(c,[[Math.cos(a)*R*.75,Math.sin(a)*R*.75],[0,-R*.10]],'#a3984d',R*.10);}oval(c,0,-R*.12,R*.18,R*.23,'#ada05b');
 }else{
  const flower=phase==='flower';oval(c,0,0,R*.92,R*.92,flower?'#9c762a':'#5a402b');
  for(let j=0;j<5;j++){const a=j/5*Math.PI*2;c.save();c.rotate(a);c.beginPath();c.moveTo(-R*.21,R*.12);c.quadraticCurveTo(-R*.48,-R*.72,0,-R*.98);c.quadraticCurveTo(R*.48,-R*.72,R*.21,R*.12);c.closePath();c.fillStyle=flower?'#d0a13d':'#805b35';c.fill();c.restore();}
  oval(c,0,0,R*.30,R*.36,flower?'#79502a':'#423326');if(flower&&detail){stroke(c,[[0,R*.2],[0,-R*.37],[-R*.21,-R*.54]],'#e0c674',R*.13);stroke(c,[[0,-R*.32],[R*.22,-R*.52]],'#e0c674',R*.12);}
 }
 c.restore();
}
function sunflower(c,s,scale,r,detail){const d=cropDimensions(s),p=cropColors(s),H=d.h*scale,f=sunflowerHead(s),cy=-f.center[1]*scale,cx=f.center[0]*scale,top=d.reproductive?-cy:H*.87;stroke(c,[[0,0],[.006*scale,-top*.60],[cx,-top*.86],[cx,d.reproductive?cy:-top]],p.stem,.017*organVariation(s,'stem').width*scale);if(d.residue)return;const n=d.reproductive?12:7,nodes=axisNodeFractions(s,Array.from({length:n},(_,i)=>.10+i/(n-1)*(d.reproductive?.70:.72)));for(let i=0;i<n;i++){let t=nodes[i],dev=leafDevelopment(s,i,n,Math.floor(r()*100000)),L=Math.min(.29,d.h*.72)*dev.size*scale,local={...p,leaf:dev.color};const leafSize=L;for(let [sideIndex,side] of(i<3?[-1,1]:[i%2?-1:1]).entries()){const pair=organVariation(s,'paired-leaf',i*2+sideIndex),L=leafSize*(1+(pair.length-1)*.5);let bx=.012*Math.sin(d.h*t*2)*scale,by=-H*t,end=[bx+side*L*(dev.petioleFactor??.65),by-L*.11];stroke(c,[[bx,by],end],p.stem,.0035*scale*(.5+dev.size));c.save();c.translate(...end);c.scale(side,1);leaf(c,0,0,L,L*.78*(1+(pair.width-1)*.5),-.12-dev.fold*.3,local,detail,true,false,dev);c.restore();}}
if(!d.reproductive){for(let k=0;k<3;k++){c.save();c.translate(cx,-H*.87);c.scale(k%2?-1:1,1);leaf(c,0,0,Math.min(.095,d.h*.25)*(1-k*.2)*scale,Math.min(.095,d.h*.25)*.65*scale,-.7-k*.13,{...p,leaf:mixHex(p.leaf,'#b7bf7f',.25)},detail,true,false,{fold:.8});c.restore();}return;}
c.save();c.translate(cx,cy);c.rotate(f.roll);c.scale(Math.max(.16,Math.abs(Math.cos(f.yaw))),Math.max(.16,Math.cos(f.tilt)));const R=f.radius*scale,irregular=a=>1+.005*Math.sin(a*7)+.003*Math.cos(a*13);
// Multiple imbricate rows of green phyllaries, ending in acute, hairy tips.
for(let layer=0;layer<3;layer++)for(let k=0;k<16;k++){let a=k/16*Math.PI*2+layer*.19,q=organVariation({plantSeed:f.seed,variation:f.variation},'bract',Math.round(a*10000),layer),L=(.020+layer*.006)*q.length*scale,W=(.012+layer*.003)*q.width*scale;c.save();c.rotate(a);leaf(c,R*(.70+layer*.10),0,L,W,0,p,detail,false,false);c.restore();}
if(f.bud||Math.cos(f.yaw)<0){const g=c.createRadialGradient(-R*.3,-R*.35,0,0,0,R);g.addColorStop(0,'#92a351');g.addColorStop(1,'#4f6b32');oval(c,0,0,R,R,g);c.restore();return;}
// All rays persist; their corollas curl and lose colour after anthesis.
for(const ray of sunflowerRays(f)){if(!ray.retained)continue;let a=ray.angle,L=ray.length*scale,W=f.rayWidth*.74*ray.width*(1-f.wilt*.65)*scale;c.save();c.rotate(a+ray.roll*.18);c.beginPath();c.moveTo(R*.93,-W*.40);c.bezierCurveTo(R+L*.16,-W*(.6+ray.curl),R+L*.72,-W*(1.1+ray.curl),R+L*.96,-W*.12);for(let tooth=0;tooth<13;tooth++){let t=tooth/12;let xx=R+L+Math.cos(t*Math.PI*6)*.0010*scale,yy=(t-.5)*W*.24;c.lineTo(xx,yy);}c.bezierCurveTo(R+L*.70,W*1.1,R+L*.17,W*.6,R*.93,W*.40);c.closePath();let g=c.createLinearGradient(R,-W,R+L,W);g.addColorStop(0,mixHex('#bd8b19','#8c7242',f.wilt*.7));g.addColorStop(.35,mixHex('#e5b92a','#a38a4d',f.wilt*.72));g.addColorStop(1,mixHex('#edc637','#9d8754',f.wilt*.7));c.fillStyle=g;c.fill();for(let v=-2;v<=2;v++)stroke(c,[[R,v*.0015*scale],[R+L*.5,v*.002*scale],[R+L*.96,v*.001*scale]],'#b38b2c55',.00018*scale);c.restore();}
let disk=c.createRadialGradient(-R*.30,-R*.30,0,0,0,R);disk.addColorStop(0,'#785a37');disk.addColorStop(.7,'#59412b');disk.addColorStop(1,'#44321f');oval(c,0,0,R,R,disk);for(const unit of sunflowerDiskLayout(f,detail))sunflowerDiskUnit2D(c,unit,scale,f,detail);c.restore();}

function canvasHair(c,x,y,nx,ny,L,scale,color,r,alpha=.55){c.save();c.globalAlpha*=alpha;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+nx*L*.5,y+ny*L*.5,x+nx*L+(r()-.5)*L*.25,y+ny*L+(r()-.5)*L*.2);c.strokeStyle=color;c.lineWidth=Math.max(.12,.000065*scale);c.stroke();c.restore();}
function soybeanLeaflet2D(c,L,W,angle,p,detail,dev,r,scale){
 const leafq=foliageVariation({plantSeed:dev.seed??44,variation:dev.variation},'leaflet',dev.leafletIndex??0);dev={...dev,pitch:(dev.pitch||0)+leafq.pitch*.45,roll:(dev.roll||0)+leafq.roll*.6,twist:leafq.twist,sweep:leafq.sweep};L*=1+(leafq.length-1)*.55;W*=(dev.aspectRatio??1)*(1+(leafq.width-1)*.55);angle+=(dev.angle||0)+leafq.angle*.35;c.save();c.rotate(angle);const pt=(t,v)=>{const q=soybeanLeafSurface(t,v,L,W,dev);return[q[0],q[2]-q[1]*.4];},N=detail?40:16;
 c.beginPath();c.moveTo(...pt(0,0));for(let i=1;i<=N;i++)c.lineTo(...pt(i/N,-1));for(let i=N;i>=0;i--)c.lineTo(...pt(i/N,1));c.closePath();
 const fill=c.createLinearGradient(0,-W*.5,0,W*.5);fill.addColorStop(0,mixHex(p.leaf,'#314c2c',.13));fill.addColorStop(.38,mixHex(p.leaf,'#a1b57b',.10));fill.addColorStop(.65,p.leaf);fill.addColorStop(1,mixHex(p.leaf,'#3d542f',.18));c.fillStyle=fill;c.fill();c.lineWidth=Math.max(.15,.00008*scale);c.strokeStyle=mixHex(p.leaf,p.edge,.45);c.stroke();
 if(detail){c.save();c.clip();const vein=mixHex(p.leaf,'#afbe87',.36);let pts=[];for(let j=0;j<=20;j++)pts.push(pt(j/20,0));stroke(c,pts,vein,.00017*scale);
 for(let k=1;k<=7;k++)for(const sign of [-1,1]){const t=.08+k*.095,curve=[];for(let j=0;j<=8;j++){const u=j/8;curve.push(pt(t+u*.13,sign*u*.92));}stroke(c,curve,vein,.000055*scale);for(let twig=2;twig<=5;twig++){const u=twig/7;stroke(c,[pt(t+u*.13,sign*u*.92),pt(t+u*.13+.05,sign*(u*.92+.07))],mixHex(p.leaf,vein,.65),.000025*scale);}}
 for(let i=0;i<150;i++){const t=.02+r()*.96,v=(r()-.5)*1.95,[x,y]=pt(t,v);canvasHair(c,x,y,.4,-.9,(.00028+r()*.00040)*scale,scale,'#d1d4b5',r,.30);}
 c.restore();for(let i=0;i<45;i++){const sign=i%2?1:-1,t=.03+r()*.94,[x,y]=pt(t,sign);canvasHair(c,x,y,.25,sign,(.00035+r()*.0004)*scale,scale,'#ced1b2',r,.65);}}
 c.restore();
}
function soybeanPod2D(c,s,x,y,side,p,scale,r,detail,podId=0){
 r=seeded(podId^(s.plantSeed??s.seed??1847));const seeds=r()<.30?2:3,shape=soybeanPodShape(s,seeds,Math.floor(r()*1e6)),top=[x+side*.008*scale,y+.007*scale];stroke(c,[[x,y],top],p.stem,.001*scale);r=seeded(Math.round((shape.length+x/scale+y/scale)*1e6));
 c.save();c.translate(...top);c.rotate(-side*.18);const xy=(t,sign)=>{const q=soybeanPodSurface(t,sign<0?Math.PI:0,shape);return[(q[0]+shape.length*.055*Math.sin(Math.PI*t))*scale,q[1]*scale];};
 const outline=()=>{c.beginPath();c.moveTo(0,0);for(let k=1;k<=42;k++)c.lineTo(...xy(k/42,-1));for(let k=42;k>=0;k--)c.lineTo(...xy(k/42,1));c.closePath();};outline();const W=shape.width*scale,L=shape.length*scale,g=c.createLinearGradient(-W*.5,0,W*.5,0);g.addColorStop(0,mixHex(p.pod,'#394e29',.35));g.addColorStop(.25,mixHex(p.pod,'#b4bd8a',.16));g.addColorStop(.60,p.pod);g.addColorStop(1,mixHex(p.pod,'#43552f',.35));c.fillStyle=g;c.fill();
 c.save();outline();c.clip();for(const t of shape.centers){const shade=c.createRadialGradient(-W*.12,L*t,0,0,L*t,W*.7);shade.addColorStop(0,mixHex(p.pod,'#afba7d',.12));shade.addColorStop(1,mixHex(p.pod,'#5d7338',.08));oval(c,0,L*t,W*.60,L/seeds*.47,shade);}
 if(detail&&s.cutaway){c.fillStyle=mixHex(p.pod,'#84995c',.55);c.fillRect(-W*.42,L*.08,W*.84,L*.83);for(const [index,t] of shape.centers.entries()){const seedSize=shape.seedSizes[index],seedColor=s.maturity>.78?'#d3c180':'#abc47e',sg=c.createRadialGradient(-W*.08,L*t-W*.12,0,0,L*t,W*.48);sg.addColorStop(0,mixHex(seedColor,'#dbe4af',.4));sg.addColorStop(1,mixHex(seedColor,'#5f7e3c',.4));oval(c,0,L*t,Math.min(.0037,shape.width*.30)*seedSize.width*scale,Math.min(.0049,shape.length/shape.seeds*.32)*seedSize.length*scale,sg);oval(c,.0015*scale,L*t,.0005*scale,.0012*scale,'#7b6942');}}
 c.restore();for(const sign of [-1,1]){const pts=[];for(let k=0;k<=30;k++)pts.push(xy(k/30,sign));stroke(c,pts,mixHex(p.pod,'#c5c69a',.27),.00016*scale);}
 stroke(c,[[0,L],[side*.0008*scale,L+.0015*scale],[side*.0012*scale,L+.0028*scale]],p.pod,.0004*scale);
 if(detail){const hair=s.maturity>.78?'#bfb28d':'#dedcc2';for(let k=0;k<210;k++){const t=.02+r()*.95,a=r()*Math.PI*2,q=soybeanPodSurface(t,a,shape),xx=(q[0]+shape.length*.055*Math.sin(Math.PI*t))*scale,yy=q[1]*scale;if(s.cutaway&&Math.abs(q[0])<shape.width*.33&&t>.08&&t<.90)continue;canvasHair(c,xx,yy,Math.cos(a)*.65,-.4,(.00045+r()*.0005)*scale,scale,hair,r,.64);}for(let k=0;k<70;k++){const t=.02+r()*.96,sign=k%2?1:-1,[xx,yy]=xy(t,sign);canvasHair(c,xx,yy,sign,-.2,(.00045+r()*.0005)*scale,scale,hair,r,.80);}}
 c.restore();
}
function soybean(c,s,scale,r,detail){const d=cropDimensions(s),p=cropColors(s),H=d.h*scale,stemWidth=organVariation(s,'stem').width;stroke(c,[[0,0],[.008*scale,-H*.45]],p.stem,.007*stemWidth*scale);stroke(c,[[.008*scale,-H*.45],[.013*scale,-H*.88]],p.stem,.004*stemWidth*scale);stroke(c,[[.013*scale,-H*.88],[.014*scale,-H]],p.stem,.0012*stemWidth*scale);if(d.residue){for(let k=0;k<4;k++)stroke(c,[[0,-H*k/5],[(k%2?1:-1)*.045*scale,-H*(k/5+.08)]],p.stem,.002*scale);return;}if(s.season==='spring'&&s.maturity<.25){for(let side of[-1,1]){c.save();c.scale(side,1);leaf(c,0,-H*.35,H*.65,H*.32,-.2,p,detail);leaf(c,side*.014*scale,-H+.0015*scale,H*.24,H*.09,-.85,p,detail,false,false,{fold:.8});c.restore();}oval(c,.014*scale,-H,.0009*scale,.0015*scale,p.node);return;}
function trifol(x,y,side,L,dev={}){const leafR=seeded(Math.round((x/scale+y/scale)*1e6)),local={...p,leaf:dev.color||p.leaf},tx=x+side*L*(dev.petioleFactor??.65),ty=y-L*.16;stroke(c,[[x,y],[tx,ty]],p.stem,Math.min(.0017*scale,L*.027));c.save();c.translate(tx,ty);c.scale(side,1);stroke(c,[[0,0],[L*.16,0]],p.stem,.0007*scale);c.save();c.translate(L*.16,0);soybeanLeaflet2D(c,L,L*.63,-.10-(dev.elevation||0)*.65,local,detail,dev,leafR,scale);c.restore();for(const sign of [-1,1]){c.save();c.translate(0,sign*.002*scale);soybeanLeaflet2D(c,L*.84,L*.55,sign*1.02-(dev.elevation||0)*.65,local,detail,{...dev,leafletIndex:sign+2,oblique:sign*.20+(dev.asymmetry||0)},leafR,scale);c.restore();}c.restore();if(detail)for(let k=0;k<30;k++){const t=leafR();canvasHair(c,x+(tx-x)*t,y+(ty-y)*t,k%2?1:-1,-.6,(.0004+leafR()*.0005)*scale,scale,'#c7ccab',leafR,.5);}}
function pod(x,y,side,id){soybeanPod2D(c,s,x,y,side,p,scale,r,detail,id);}
let n=s.season==='summer'?7:3,nodes=soybeanAxisNodes(s,d.h,n,Math.floor(r()*100000));for(let i=0;i<n;i++){let {t,dev}=nodes[i],side=i%2?-1:1,x=.014*t*scale,y=-H*t,L=Math.min(.11,d.h*.40)*dev.size*scale;trifol(x,y,side,L,dev);if(s.season==='summer'&&i>0&&i<n-1){if(s.maturity<.3){for(let k=0;k<3;k++){const flower=organVariation(s,'flower',k,dev.seed);oval(c,x+side*(.012+k*.003)*scale,y+k*.004*scale,.003*flower.width*scale,.004*flower.length*scale,'#b38cac');oval(c,x+side*(.012+k*.003)*scale,y+(k*.004+.003)*scale,.002*flower.width*scale,.002*flower.length*scale,'#d7b4d2');}}else for(let k=0;k<2;k++)pod(x,y,side*(k?-.7:1),dev.seed+k*37);}}
if(s.season==='summer')for(const branch of soybeanBranches(s)){const projection=p=>(p[0]+p[2]*.45)*scale,side=Math.cos(branch.angle)>=0?1:-1,x=projection(branch.end),y=-branch.end[1]*scale,sx=projection(branch.start),sy=-branch.start[1]*scale;stroke(c,[[sx,sy],[sx+(x-sx)*.7,sy+(y-sy)*.7]],p.stem,branch.radius*1.25*scale);stroke(c,[[sx+(x-sx)*.7,sy+(y-sy)*.7],[x,y]],p.stem,branch.radius*.42*scale);const length=Math.hypot(...branch.end.map((v,i)=>v-branch.start[i])),branchNodes=soybeanAxisNodes(s,length,4,branch.nodeSeed);for(let k=0;k<branchNodes.length;k++){const {t,dev}=branchNodes[k],xx=sx+(x-sx)*t,yy=sy+(y-sy)*t;trifol(xx,yy,side,.080*scale*dev.size,dev);if(s.maturity>.3&&k<branchNodes.length-1)pod(xx,yy,side,dev.seed);}oval(c,x,y,.00065*scale,.0011*scale,p.node);if(detail)for(let k=0;k<100;k++){const t=r(),xx=sx+(x-sx)*t,yy=sy+(y-sy)*t,sign=k%2?1:-1;canvasHair(c,xx+sign*branch.radius*.5*scale,yy,sign,-.3,(.0004+r()*.0006)*scale,scale,'#c6caaa',r,.6);}}oval(c,.014*scale,-H,.00065*scale,.0011*scale,p.node);if(detail)for(let k=0;k<330;k++){const t=r(),sign=k%2?1:-1,xx=.014*t*scale+sign*(.0035-.003*t)*stemWidth*scale;canvasHair(c,xx,-H*t,sign,-.3,(.0004+r()*.0006)*scale,scale,'#c6caaa',r,.6);}}

function drawRegional(c,s,x,y,scale,seed,detail,roots=false,sway=0,rotation=0){
 const project=p=>portablePoint(p,scale);
 c.save();c.translate(x,y);c.rotate(rotation);c.transform(1,0,-sway/Math.max(1,cropDimensions(s).h*scale),1,0,0);
 const organs=regionalPlant(s,seed,detail,roots);
 for(const source of organs){
  const o=detail&&source.proxyOnly?{...source,size:source.size.map(v=>v*.65),shape:'round',lintCore:true}:source;
  if(!detail&&o.type==='ball'&&o.surface===SURFACE.GRAIN&&o.sample%3)continue;
  if(o.type==='tube'){
   const pts=o.points.map(project);
   for(let i=1;i<pts.length;i++){
    const steps=4;
    for(let j=0;j<steps;j++){
     const point=t=>pts[i-1].map((v,k)=>v+(pts[i][k]-v)*t),t=(j+.5)/steps;
     stroke(c,[point(j/steps),point((j+1)/steps)],o.color,(o.radii[i-1]*(1-t)+o.radii[i]*t)*2*scale);
    }
   }
   if(detail&&[SURFACE.BARK,SURFACE.PALM].includes(o.surface))stroke(c,pts,mixHex(o.color,'#c3b28b',.3),o.radii[0]*.28*scale);
  }else if(o.type==='ball'){
   const N=detail?24:10,points=[],a=Math.atan(.35);
   for(let i=0;i<=N;i++)points.push(project(regionalBodyPoint(o,i/N,a)));
   for(let i=N;i>=0;i--)points.push(project(regionalBodyPoint(o,i/N,a+Math.PI)));
   c.beginPath();c.moveTo(...points[0]);for(const p of points)c.lineTo(...p);c.closePath();
   const [xx,yy]=project(o.at),width=Math.max(.1,o.size[0]*scale),g=c.createLinearGradient(xx-width,yy,xx+width,yy);
   g.addColorStop(0,mixHex(o.color,'#4b482c',.28));g.addColorStop(.4,mixHex(o.color,'#fff4d3',.13));g.addColorStop(1,mixHex(o.color,'#3d432b',.32));c.fillStyle=g;
   if(o.lintCore){const soft=c.createRadialGradient(xx,yy,0,xx,yy,Math.max(...o.size)*scale);soft.addColorStop(0,'rgba(235,232,218,1)');soft.addColorStop(.55,'rgba(235,232,218,1)');soft.addColorStop(.85,'rgba(235,232,218,.45)');soft.addColorStop(1,'rgba(235,232,218,0)');c.fillStyle=soft;}
   c.fill();
   if(detail&&o.ribs)for(let k=0;k<o.ribCount;k++){const pts=[];for(let j=1;j<20;j++)pts.push(project(regionalBodyPoint(o,j/20,k/o.ribCount*Math.PI*2)));stroke(c,pts,mixHex(o.color,'#665532',.3),Math.max(.25,scale*.00035));}
  }else if(o.type==='fibres'){
   const stride=Math.max(1,Math.floor(o.count/(detail?(o.mode==='lint'?1800:800):24)));
   for(let i=0;i<o.count;i+=stride){const points=regionalFibreCurve(o,i).map(project);stroke(c,points,i%4?o.color:mixHex(o.color,'#a9a897',.22),Math.max(detail?.22:.18,o.radius*2*scale));}
  }else if(o.type==='patch'||o.type==='corolla'){
   const corolla=o.type==='corolla',rows=detail?28:6,columns=detail?(corolla?40:10):corolla?12:2,point=corolla?regionalCorollaPoint:regionalPatchPoint;
   for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
    const param=k=>corolla?k/columns*Math.PI*2:k/columns*2-1,pts=[point(o,i/rows,param(j)),point(o,(i+1)/rows,param(j)),point(o,(i+1)/rows,param(j+1)),point(o,i/rows,param(j+1))].map(project),t=(i+.5)/rows;
    c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=mixHex(o.baseColor||o.color,o.color,Math.min(1,t*3));c.fill();
   }
   if(detail&&!corolla)for(const v of [-.66,-.33,0,.33,.66])stroke(c,Array.from({length:22},(_,i)=>project(regionalPatchPoint(o,.05+i/21*.89,v*(.3+.7*i/21)))),mixHex(o.color,o.baseColor||'#eee4c7',.25),.24);
  }else{
   const N=detail?(o.shape==='serrate'?64:42):12;
   const [xx,yy]=project(o.at),g=c.createLinearGradient(xx-o.width*scale*.5,yy,xx+o.width*scale*.5,yy-o.length*scale*.1);
   g.addColorStop(0,mixHex(o.color,'#2f4c29',.3));g.addColorStop(.52,mixHex(o.color,'#c1ce96',.18));g.addColorStop(1,o.color);c.fillStyle=g;
   // Union projected triangles with a consistent winding. A folded blade can
   // overlap itself in projection; a single outer contour would leave holes.
   const bands=detail?4:2;
   const grid=Array.from({length:N+1},(_,i)=>Array.from({length:bands+1},(_,j)=>project(regionalLeafPoint(o,i/N,j/bands*2-1))));
   const triangle=(a,b,d)=>{if((b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0])<0)[b,d]=[d,b];c.moveTo(...a);c.lineTo(...b);c.lineTo(...d);c.closePath();};
   c.beginPath();
   for(let i=0;i<N;i++)for(let j=0;j<bands;j++){
    triangle(grid[i][j],grid[i+1][j],grid[i][j+1]);triangle(grid[i][j+1],grid[i+1][j],grid[i+1][j+1]);
   }
   c.fill();
   if(detail){
    const pts=[];for(let j=0;j<=24;j++)pts.push(project(regionalLeafPoint(o,j/24,0)));
    stroke(c,pts,mixHex(o.color,'#bccb90',.42),Math.max(.35,o.width*.012*scale));
    for(let k=1;k<=8;k++)for(let side of [-1,1]){
     const pts=[];for(let j=0;j<=7;j++){const u=j/7;pts.push(project(regionalLeafPoint(o,Math.min(.99,k/10+u*.11),side*u*.93)));}
     stroke(c,pts,mixHex(o.color,'#a9bb7e',.28),Math.max(.22,o.width*.003*scale));
    }
   }
  }
 }
 c.restore();
}
export function drawCrop(c,s,x,y,scale,seed,detail=true,sway=0,rotation=0){
 if(profile(s).region){const model=profile(s).model;if(['barley','maize','sunflower','soybean'].includes(model))return drawCrop(c,{...s,crop:model},x,y,scale,seed,detail,sway,rotation);return drawRegional(c,s,x,y,scale,seed,detail,false,sway,rotation);}
const r=seeded(seed);s={...s,plantSeed:seed};c.save();c.translate(x,y);c.rotate(rotation);c.transform(1,0,-sway/Math.max(1,cropDimensions(s).h*scale),1,0,0);if(s.crop==='barley')barley(c,s,scale,r,detail);else if(s.crop==='maize')maize(c,s,scale,r,detail);else if(s.crop==='sunflower')sunflower(c,s,scale,r,detail);else soybean(c,s,scale,r,detail);c.restore();}
export function drawTaproots(c,s,x,y,scale){if(profile(s).region){const model=profile(s).model;if(['barley','maize','sunflower','soybean'].includes(model))return drawTaproots(c,{...s,crop:model},x,y,scale);return drawRegional(c,s,x,y,scale,s.seed,true,true);}const r=seeded(s.seed+978),depth=s.season==='spring'?.2:.44,p=cropColors(s),d=cropDimensions(s);c.save();c.translate(x,y);const trunk=[];for(let i=0;i<21;i++){let t=i/20;trunk.push([Math.sin(t*7)*.008*scale,depth*t*scale]);}stroke(c,trunk,p.root,(s.crop==='sunflower'?.008:.005)*organVariation(s,'root-collar').width*scale);for(let i=2;i<19;i++){const rootq=organVariation(s,'root',i);let t=i/20,a=r()<.5?-1:1,L=(.04+r()*.12)*rootq.length*scale,start=trunk[i],end=[start[0]+a*L,start[1]+L*.45];stroke(c,[start,[start[0]+a*L*.5,start[1]+L*.1],end],p.root,.0009*scale);for(let j=1;j<5;j++){let xx=start[0]+a*L*j/5,yy=start[1]+L*.45*j/5;stroke(c,[[xx,yy],[xx+a*.014*scale,yy+.02*scale]],p.root,.0002*scale);if(s.crop==='soybean'&&!d.residue&&i<12&&j<3){const nodule=organVariation(s,'nodule',i*4+j);oval(c,xx,yy,.0024*nodule.width*scale,.0028*nodule.length*scale,'#a29873');}}}c.restore();}
