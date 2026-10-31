/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
import { REGIONAL_CROPS, REGIONS, regionalDimensions } from './regional-crops.js';
export { populateCropSelect } from './regional-crops.js';
export const CROPS = {
 wheat:{name:'Winter wheat',latin:'Triticum aestivum',family:'POACEAE',habit:'Awned common wheat · winter habit',cereal:true,defaultDensity:2600,min:600,max:4800,step:200,row:.145,flex:1,fruit:'Ear',leaf:'Leaf & collar'},
 barley:{name:'Two-row barley',latin:'Hordeum vulgare',family:'POACEAE',habit:'Two-row, long-awned · winter habit',cereal:true,defaultDensity:2400,min:600,max:4800,step:200,row:.15,flex:1.15,fruit:'Spike',leaf:'Leaf & auricles'},
 maize:{name:'Maize',latin:'Zea mays',family:'POACEAE',habit:'Spring-sown grain maize · annual',defaultDensity:180,min:40,max:600,step:20,row:.75,flex:.24,fruit:'Ear & silk',leaf:'Leaf & sheath'},
 sunflower:{name:'Sunflower',latin:'Helianthus annuus',family:'ASTERACEAE',habit:'Single-headed oilseed form · annual',defaultDensity:140,min:40,max:480,step:20,row:.7,flex:.18,fruit:'Flower head',leaf:'Leaf & petiole'},
 soybean:{name:'Soybean',latin:'Glycine max',family:'FABACEAE',habit:'Indeterminate, trifoliate form · annual',defaultDensity:800,min:100,max:2000,step:100,row:.38,flex:.48,fruit:'Pods & flowers',leaf:'Compound leaf'}
};
Object.assign(CROPS,Object.fromEntries(REGIONAL_CROPS.map(p=>[p.id,p])));
export const profile=s=>CROPS[s.crop||'wheat'];
export const seeded=seed=>{let a=seed|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
export function mixHex(a,b,t){t=Math.max(0,Math.min(1,t));const ai=parseInt(a.slice(1),16),bi=parseInt(b.slice(1),16),r=Math.round((ai>>16)*(1-t)+(bi>>16)*t),g=Math.round(((ai>>8)&255)*(1-t)+((bi>>8)&255)*t),blue=Math.round((ai&255)*(1-t)+(bi&255)*t);return '#'+((r<<16)|(g<<8)|blue).toString(16).padStart(6,'0');}
export function cropDimensions(s){const selected=profile(s);if(selected.region&&['barley','maize','sunflower','soybean'].includes(selected.model))return cropDimensions({...s,crop:selected.model});if(selected.region)return regionalDimensions(selected,s);const p=selected,m=s.maturity,summer=s.season==='summer',residue=!p.cereal&&['autumn','winter'].includes(s.season);let h;if(p.cereal)h=summer?(s.crop==='barley'?.69:.77)+m*.13:s.season==='spring'?.28+m*.45:s.season==='autumn'?.045+m*.075:.055;else if(s.crop==='maize')h=summer?1.7+m*.5:s.season==='spring'?.12+m*.6:residue?(s.season==='winter'?.22:.42-m*.12):.2;else if(s.crop==='sunflower')h=summer?1.35+m*.4:s.season==='spring'?.1+m*.45:s.season==='winter'?.15:.3-m*.08;else h=summer?.58+m*.18:s.season==='spring'?.07+m*.26:s.season==='winter'?.09:.17-m*.04;return{h,ear:summer,reproductive:summer,residue,leaves:residue?0:p.cereal?4:s.crop==='maize'?12:s.crop==='sunflower'?10:7,extent:p.cereal?.16:s.crop==='maize'?.38:s.crop==='sunflower'?.24:.22};}
export function cropColors(s,d=cropDimensions(s)){const cereal=profile(s).cereal,ripe=cereal&&s.season==='summer'?Math.max(0,(s.maturity-.16)/.84):0,residue=d.residue;let senescent=residue?1:(!cereal&&s.season==='summer'?Math.max(0,(s.maturity-.76)/.24)*.5:ripe);const cold=s.season==='winter';return{stem:mixHex(cold?'#63744e':'#628348','#ac915c',senescent),leaf:mixHex(cold?'#5c7050':'#4f7e3c','#a79454',senescent),ear:mixHex('#8f9d55','#ceb776',ripe),bract:mixHex('#718b43','#a48a4e',ripe),node:mixHex('#56723d','#8d7849',senescent),edge:mixHex('#365a2d','#8d713e',senescent),vein:mixHex('#9aac6d','#d9c794',senescent),flower:'#dcbf56',petal:'#edbd23',root:'#b39c76',pod:mixHex('#6d8744','#b19a6b',Math.max(0,(s.maturity-.65)/.35))};}
export function seasonalStudy(s){if(profile(s).region)return regionalSeason(s);const p=profile(s),m=s.maturity;if(p.cereal)return{
 spring:['Stem extension','The green awakening.','Jointed culms extend. New leaves unfurl.','Zadoks 30–39 · jointing and flag leaf'],
 summer:['Grain filling',s.crop==='barley'?'A sea of long awns.':'The golden hour.',s.crop==='barley'?'Two fertile rows, slender bracts, and long lemma awns.':'An intricate canopy. A thousand small movements.','Zadoks 71–92 · grain filling to ripe'],
 autumn:['Establishment','Where a field begins.','Autumn-sown seedlings establish basal tillers.','Zadoks 12–23 · establishment and tillering'],
 winter:['Dormancy','Life beneath the quiet.','A short vegetative crown persists through winter.','Vegetative dormancy · no reproductive spike']
}[s.season];return{
 spring:['Establishment','The first true leaves.',s.crop==='soybean'?'Cotyledons, unifoliate leaves, then the first trifoliates.':'Spring-sown seedlings develop leaves and roots.','Vegetative establishment · spring-sown annual'],
 summer:[s.crop==='sunflower'?'Flowering & seed':s.crop==='soybean'?'Flowering & pods':'Tassel & ear',s.crop==='sunflower'?'A thousand small flowers.':s.crop==='soybean'?'A canopy of threes.':'Silk, pollen, and grain.',s.crop==='sunflower'?'Ray florets frame a spiralling disk of tubular florets.':s.crop==='soybean'?'Trifoliate leaves shelter axillary flowers and seed pods.':'A male tassel above. A female, silk-bearing ear below.',s.crop==='sunflower'?(m>.78?'R6–R9 · seed filling and head senescence':'R5 · flowering progresses across the disk'):s.crop==='soybean'?(m<.3?'R1–R2 · flowering':m<.7?'R3–R6 · pod and seed development':'R7–R8 · maturation'):(m<.3?'VT–R1 · tasseling and silking':'R2–R5 · kernel filling')],
 autumn:['Harvest residue','After the harvest.','Cut stems and retained root remnants mark the harvested stand.','Post-harvest residue · living foliage removed'],
 winter:['Dead residue','The field at rest.','Weathered stubble persists. This annual does not overwinter alive.','Dead residue · no living dormant crop']
}[s.season];}
export function inspection(s,part){if(profile(s).region)return regionalInspection(s,part);const d=cropDimensions(s),h=d.h,c=s.crop||'wheat',p=profile(s);let target=[0,h*.46,0],span=Math.max(.2,h*1.5),title=p.cereal?'One crown. Many culms.':'A plant, in context.',desc=p.cereal?'Basal tillers share a crown. Leaves alternate at nodes, with sheaths enclosing the culm.':'The branching, leaf arrangement, and reproductive structures follow the selected crop.';
 if(part==='ear'){
  if(c==='wheat'){target=[.012,h+.058,0];span=.3;title='Anatomy of an ear.';desc='Alternating spikelets bear several florets, enclosed by glumes, lemmas and paleas.';}
  if(c==='barley'){target=[.012,h+.075,0];span=.39;title='Two rows. Long awns.';desc='One fertile central spikelet per triplet forms two grain rows. The lateral spikelets remain sterile in this two-row form.';}
  if(c==='maize'){const ear=maizeEar(s);target=[ear.base[0]+.035,ear.base[1]+ear.length*.45,ear.base[2]+.04];span=Math.max(.38,ear.length*2.05);title='A silk-bearing ear.';desc=s.cutaway?'The husk is peeled back to expose paired rows of kernels on the cob. The kernel arrangement is a representative 14-row ear.':'The female ear sits in a leaf axil. Husk leaves enclose the cob; silks emerge from its tip. Enable the cutaway to inspect kernels.';}
  if(c==='sunflower'){const head=sunflowerHead(s);target=head.center;span=2.3*(head.radius+head.rayLength*1.15);title=s.maturity>.78?'From florets to achenes.':'A composite flower head.';desc='Yellow rays are individual florets. Hundreds of disk florets occupy a spiral pattern above overlapping green involucral bracts.';}
  if(c==='soybean'){const node=soybeanStudyNode(s);target=[node.position[0]+.008,node.position[1]-.027,0];span=s.maturity<.3?.13:.17;title=s.maturity<.3?'Flowers at the leaf axils.':'Pods at the leaf axils.';desc=s.cutaway?'Opened pods reveal representative two- or three-seeded fruits. Nodules are modelled on the root system.':'Pendulous, gently curved pods have a continuous wall around two or three seeds, paired sutures, tapered tips and fine surface hairs. The seeds themselves are smooth.';}
 }else if(part==='tip'){const term=shootTermination(s);target=[s.crop==='soybean'?.014:0,h*(d.reproductive?1:.90),0];span=s.crop==='maize'?.50:profile(s).cereal?.26:.24;title=term==='tassel'?'A terminal male tassel.':term==='capitulum'?'The shoot ends in a head.':term==='terminal-spike'?'A terminal cereal spike.':term==='cut-stubble'?'A harvested stem.':term==='arrested-bud'?'The uppermost trifoliate.':'The youngest leaves.';desc=term==='arrested-bud'?'Stem extension has stopped. The final trifoliate remains immediately below a compact terminal bud; its leaflets are expanded rather than continually unfolding.':d.reproductive&&!['young-trifoliate','arrested-bud'].includes(term)?'The vegetative shoot has become a terminal inflorescence. New foliage is not added above the flowers.':'Young leaves near the apex are smaller, paler, less expanded and more folded than older leaves below them.';}else if(part==='flower'){target=[0,h+.12,0];span=.5;title='The male inflorescence.';desc='The terminal tassel branches into spikelet-bearing axes. Anthers are present near the silking stage; pollen grains are not individually simulated.';}
 else if(part==='leaf'){const fraction=c==='maize'?.64:c==='sunflower'?.57:c==='soybean'?.58:.71;target=[p.cereal?.05:.07,h*fraction+.025,0];span=c==='maize'?.58:c==='sunflower'?.38:c==='soybean'?.23:.29;title=c==='soybean'?'One leaf, three leaflets.':c==='sunflower'?'Veins, teeth, and hairs.':'A blade, in detail.';desc=c==='soybean'?'A larger terminal leaflet and two smaller, oblique lateral leaflets have rounded bases, entire margins and short petiolules. Fine hairs cover the matte surfaces, petiole and stem.':c==='sunflower'?'A petiole supports a broad, serrate, cordate blade with branching veins. Lower leaves are opposite; later leaves are alternate.':c==='maize'?'A broad parallel-veined blade joins a clasping sheath at the collar. Maize lacks the clasping auricles seen in barley.':c==='barley'?'Broad, smooth auricles clasp the culm. Longitudinal veins and a membranous ligule mark the blade–sheath junction.':'Parallel veins, a folded midrib, a membranous ligule, and paired hairy auricles.';}
 else if(part==='root'){target=[0,-.17,0];span=.72;title=c==='soybean'?'A nodulated taproot.':c==='sunflower'?'A branching taproot.':c==='maize'?'Crown roots and braces.':'An underground network.';desc=c==='soybean'?'Lateral roots branch from the taproot. Visible nodules represent symbiotic structures; their number is illustrative.':c==='sunflower'?'A dominant taproot gives rise to laterals and fine branches. Only the upper 45 cm are shown.':c==='maize'?'Nodal roots form a fibrous system. Above-ground brace roots descend from basal stalk nodes toward the soil.':'Seminal and crown roots branch into fine laterals. Only the upper 45 cm are shown.';}
 if(d.residue&&part==='root'){title='Root remnants after harvest.';desc='The upper root system is retained as dead residue. Fine-root persistence is illustrative; only the upper 45 cm are shown.';}if(d.residue&&part!=='root'){title='The remaining stubble.';desc='A harvested spring annual retains dead stems and root remnants; living leaves, flowers, and fruits are absent.';}
 return{target,span,title,desc};}
export function anatomyLabels(s,part){if(profile(s).region)return regionalLabels(s,part);const h=cropDimensions(s).h,p=profile(s),c=s.crop||'wheat';if(cropDimensions(s).residue){if(part==='root')return [['Dead root collar',0,0,0],['Root remnant',.04,-.10,0],['Deep truncation',0,-.38,0]];return [['Cut stem',0,h,0],['Dead stem node',0,h*.36,0],['Root collar',0,0,0]];}if(part==='root')return c==='soybean'?[['Root crown',0,0,0],['Nodules on lateral roots',.035,-.09,0],['Taproot',0,-.3,0]]:c==='sunflower'?[['Root collar',0,0,0],['Lateral roots',.08,-.13,0],['Taproot',0,-.32,0]]:c==='maize'?[['Brace roots',.06,.045,.03],['Nodal root crown',.02,-.03,0],['Fine laterals',.08,-.27,0]]:[['Crown · basal tillers',.01,0,0],['Crown roots',.045,-.11,0],['Fine lateral roots',.08,-.27,0]];
 if(part==='tip'){const t=shootTermination(s);return [[t==='leaf-whorl'?'Emerging rolled blades':t==='young-trifoliate'?'Unfolding trifoliate':t==='young-simple-leaves'?'Young folded leaves':t==='arrested-bud'?'Compact terminal bud':'Terminal structure',0,h*(cropDimensions(s).reproductive?1:.90),0],[c==='soybean'?'Uppermost trifoliate':'Upper node',c==='soybean'?.014:0,h*(c==='soybean'?.997:.85),0]];}if(part==='ear'){if(c==='maize'){const ear=maizeEar(s),[x,y,z]=ear.base;return[[s.cutaway?'Kernel rows':'Husk leaves',x+.035,y+ear.length*.45,z],['Silks',x+.08,y+ear.length,z+.04],['Ear shank',x,y,z]];}if(c==='sunflower')return[['Ray florets',.12,h+.055,.02],['Disk florets',.025,h+.02,.04],['Involucral bracts',.075,h-.07,0]];if(c==='soybean'){const [x,y,z]=soybeanStudyNode(s).position;return[[s.cutaway?'Seeds in opened pod':'Hairy pod & seed bulges',x+.012,y-.028,z],['Petiole / leaf axil',x,y,z],['Pod seam',x+.02,y-.048,z]];}return[[c==='barley'?'Long lemma awns':'Awn · lemma extension',.015,h+(c==='barley'?.18:.14),0],[c==='barley'?'Fertile central spikelet':'Spikelet · glumes & florets',.015,h+.055,0],['Rachis · spike axis',.005,h+.01,0]];}
 if(part==='flower')return[['Tassel axis',0,h+.12,0],['Spikelets & anthers',.07,h+.18,0],['Peduncle',0,h+.01,0]];
 if(part==='leaf'){const data=inspection(s,part),y=data.target[1]-.025;return p.cereal?[['Parallel venation',.1,y+.055,0],[c==='barley'?'Clasping smooth auricles':'Ligule & auricles',.003,y,0],['Leaf sheath',0,y-.06,0]]:c==='maize'?[['Parallel venation',.18,y+.09,0],['Ligule · no auricles',0,y,0],['Clasping sheath',0,y-.06,0]]:c==='soybean'?[['Terminal leaflet',.14,y+.035,0],['Lateral leaflets',.08,y+.04,.04],['Petiole',.03,y+.01,0]]:[['Serrate margin',.15,y+.03,0],['Reticulate venation',.1,y+.025,0],['Petiole',.04,y+.015,0]];}
 return[[p.cereal?'Flag leaf':c==='soybean'?'Trifoliate leaf':'Leaf blade',.1,h*.65,0],[p.cereal?'Node & leaf sheath':'Stem node',.01,h*.36,0],['Root crown',0,0,0]];}
export function syncCropUI(s){const p=profile(s),stage=seasonalStudy(s);document.getElementById('species-latin').textContent=p.latin;document.getElementById('species-habit').textContent=p.habit;document.getElementById('species-family').textContent=p.family;document.getElementById('crop-intro').textContent=p.name+', shaped by the season.';document.querySelector('[data-focus="ear"]').textContent=p.fruit;document.querySelector('[data-focus="leaf"]').textContent=p.leaf;document.querySelector('[data-focus="flower"]').classList.toggle('hidden',(p.model||s.crop)!=='maize');document.getElementById('cutaway-label').classList.toggle('hidden',!['maize','soybean'].includes(p.model||s.crop)||s.season!=='summer');document.getElementById('isolate-label').classList.toggle('hidden',!p.cereal);for(const b of document.querySelectorAll('[data-season]')){const temp={...s,season:b.dataset.season};b.querySelector('small').textContent=seasonalStudy(temp)[0];}document.getElementById('season-kicker').textContent=s.inspect?'SPECIMEN STUDY / '+p.name.toUpperCase():s.season.toUpperCase()+' / '+stage[0].toUpperCase();document.getElementById('season-title').textContent=s.inspect?'Closer to nature.':stage[1];document.getElementById('season-description').textContent=s.inspect?stage[3]:stage[2];document.getElementById('current-crop-note').textContent=p.name+' — '+p.latin+'. '+stage[3]+'. '+(p.region?REGIONS[p.region-1].name+' · '+p.note+'. Seasonal scenes are illustrative phases, not a local planting calendar.':p.cereal?'Autumn-sown winter form.':'Spring-sown annual; autumn and winter show post-harvest residue.');return stage;}
export function configureDensity(s,remembered){const p=profile(s),el=document.getElementById('density');el.min=p.min;el.max=p.max;el.step=p.step;s.density=remembered??p.defaultDensity;el.value=s.density;}

export function densityName(s){return s.density<profile(s).defaultDensity*.65?'Open':s.density<profile(s).defaultDensity*1.35?'Balanced':'Dense';}

// Relative developmental age follows node rank; middle leaves can be largest.
export function leafDevelopment(s,rank,count,seed=0){
 const u=count>1?rank/(count-1):1,age=1-u,c=s.crop||'wheat',d=cropDimensions(s);
 const vegetative=!d.reproductive&&!d.residue,indeterminate=c==='soybean'&&s.season==='summer'&&s.maturity<.62;
 const emerging=(vegetative||indeterminate)&&u>.77;
 const expansion=emerging?(u>.98?.23:.60):1;
 const envelope=c==='maize'?.48+.52*Math.sin(Math.PI*(u*.88+.06)):c==='sunflower'?.48+.52*Math.sin(Math.PI*(u*.86+.09)):c==='soybean'?.64+.36*Math.sin(Math.PI*(u*.83+.10)):.72+.28*Math.sin(Math.PI*(u*.73+.13));
 const senescence=d.residue?1:s.season==='summer'?Math.max(0,(s.maturity-(.54+.34*u))/.46)*Math.pow(age,.7):0;
 const q=foliageVariation({...s,plantSeed:s.plantSeed??s.seed??seed},'leaf',rank,s.axisId??0),size=envelope*expansion*q.length;
 const base=cropColors(s,d),leaf=mixHex(base.leaf,'#b4b96c',emerging?.20:0),color=mixHex(mixHex(leaf,q.shade>0?'#abc17e':'#304f2b',Math.abs(q.shade)), '#a28d4a',senescence*.72);
 return{rank,relativeAge:age,expansion,size,widthFactor:Math.sqrt(expansion)*envelope*q.width,aspectRatio:q.width/q.length,fold:emerging?1-expansion:Math.max(0,q.curl*.25),droop:.16+age*.35+senescence*.22+q.pitch,angle:q.angle,pitch:q.pitch*1.8,twist:q.twist,roll:q.roll,camber:q.camber,sweep:q.sweep,curl:q.curl,asymmetry:q.asymmetry,petioleFactor:.65*q.petiole,seed:q.seed,variation:s.variation??.24,color,senescence,emerging};
}
export function sunflowerHead(s){const seed=s.plantSeed??s.seed??1847,r=seeded(seed+3841),v=Math.min(1.6,(s.variation??.24)/.24),m=s.maturity,h=cropDimensions(s).h,bud=m<.12,post=m>.76;
 const size=Math.exp(boundedNormal(r)*.045*v),tilt=Math.max(-1.45,Math.min(.8,(bud?.62:.28-(m-.12)*1.12)-Math.max(0,m-.72)*2.3+boundedNormal(r)*.11*v));
 const yaw=s.headYaw??boundedNormal(r)*.12*v,roll=boundedNormal(r)*.045*v,radius=(bud?.028+m*.24:.088+m*.035)*size;
 const rayCount=Math.max(32,Math.min(46,Math.round(38+boundedNormal(r)*2.4))),rayLength=(.040+Math.min(m,.6)*.012)*size;
 return{seed,variation:s.variation??.24,center:[.012*Math.sin(h*2)+Math.sin(yaw)*.055,h-Math.max(0,m-.70)*.20,.055+Math.max(0,m-.70)*.16],tilt,yaw,roll,radius,rayLength,rayCount,rayWidth:Math.PI*2*(radius+rayLength*.5)/rayCount*1.20,
  diskCount:Math.round((1600+boundedNormal(r)*120)*size*size),bud,post,flowerFront:Math.sqrt(Math.max(0,1-Math.max(0,m-.12)/.64)),wilt:Math.max(0,(m-.72)/.28)};
}
export function maizeEar(s,secondary=false){const h=cropDimensions(s).h,f=secondary?.45:1,q=organVariation(s,'ear',secondary?1:0),nodes=axisNodeFractions(s,Array.from({length:15},(_,i)=>.07+i/14*.84));return{base:[secondary?-.048:.055,h*nodes[secondary?6:8],secondary?.025:.065],direction:[(secondary?-.28:.32)+q.angle,.87, .39+q.pitch],length:(.17+s.maturity*.075)*f*q.length,radius:(.026+s.maturity*.013)*f*q.width,rows:14,kernels:32,scale:f};}
export function shootTermination(s){const d=cropDimensions(s);if(profile(s).region){const p=profile(s);if(['barley','maize','sunflower','soybean'].includes(p.model))return shootTermination({...s,crop:p.model});if(d.residue)return 'cut-stubble';if(d.dormant&&!p.cereal)return 'dormant-bud';if(d.reproductive&&['spike','dense','panicle','finger','cluster','flax','poppy','potato','banana'].includes(p.model))return 'terminal-inflorescence';if(['palm','banana'].includes(p.model))return 'spear';if(['rosette','taro'].includes(p.model))return 'rosette-heart';return p.cereal||p.model==='cane'?'leaf-whorl':'young-simple-leaves';}if(d.residue)return 'cut-stubble';if(d.reproductive)return s.crop==='soybean'&&s.maturity<.62?'young-trifoliate':s.crop==='sunflower'?'capitulum':s.crop==='maize'?'tassel':s.crop==='soybean'?'arrested-bud':'terminal-spike';return profile(s).cereal||s.crop==='maize'?'leaf-whorl':s.crop==='soybean'?'young-trifoliate':'young-simple-leaves';}

// Upper soybean internodes shorten toward the apex. The final trifoliate remains
// attached beside the terminal bud after extension stops; it does not disappear.
// Both renderers use physical axis length so branches cannot end in bare poles.
export function soybeanAxisNodes(s,length,count,seed=0){
 const r=seeded(seed),gap=Math.min(length*.018,.0012+r()*.0010),last=1-gap/length;
 const nominal=Array.from({length:count},(_,rank)=>{const u=count>1?rank/(count-1):1;return .16+(last-.16)*(1-Math.pow(1-u,1.45));}),fractions=axisNodeFractions(s,nominal,seed,true);
 return fractions.map((t,rank)=>{
  const dev=leafDevelopment({...s,axisId:seed},rank,count,seed),uppermost=rank===count-1;
  if(uppermost&&!dev.emerging)dev.size*=.72;
  return {t,uppermost,dev:{...dev,petioleFactor:dev.petioleFactor*(uppermost?.36/.65:1),elevation:uppermost&&dev.emerging?.8:0}};
 });
}

// Shape coordinates are in metres; shared by mesh and portable renderers.
const soybeanSurfaceFrames=new WeakMap();
function soybeanSurfaceFrame(dev){const roll=dev.roll||0,elevation=dev.elevation||0;let f=soybeanSurfaceFrames.get(dev);if(!f||f.roll!==roll||f.elevation!==elevation){f={roll,elevation,cosRoll:Math.cos(roll),sinRoll:Math.sin(roll),sinElevation:Math.sin(elevation)};soybeanSurfaceFrames.set(dev,f);}return f;}
export function soybeanLeafSurface(t,v,L,W,dev={}){
 const shape=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*Math.pow(t,.78)),.82);
 const asym=dev.oblique||dev.asymmetry||0,side=v*W*.5*shape*(1+asym*v*(1-t));
 const fold=dev.fold||0,arch=L*((.085+(dev.curl||0)*.20)*Math.sin(Math.PI*t)-(.05+(dev.relativeAge||0)*.07)*t*t)+(dev.twist||0)*side*t,f=soybeanSurfaceFrame(dev);
 const y=arch+Math.abs(v)*W*shape*(.035+fold*.48)+L*t*(f.sinElevation+(dev.pitch||0)),z=side*(1-fold*.60)+L*(dev.sweep||0)*t*t;
 return [L*t,y*f.cosRoll-z*f.sinRoll,y*f.sinRoll+z*f.cosRoll];
}
export function soybeanPodShape(s,seeds=3,seed=0){
 const r=seeded(seed),fill=Math.max(.08,Math.min(1,(s.maturity-.27)/.35));
 const q=organVariation(s,'pod',seed),length=(seeds===2?.041:.054)*q.length,width=(.0105+fill*.002)*q.width,depth=Math.min(width*.80,(.003+fill*.005)*q.depth);
 return {seeds,length,width,depth,fill,curvature:.065+q.curl*.24,bulge:.06*q.depth,seedSizes:Array.from({length:seeds},(_,i)=>{const q=organVariation(s,'seed',i,seed);return{length:1+(q.length-1)*.3,width:1+(q.width-1)*.3,depth:1+(q.depth-1)*.3};}),centers:Array.from({length:seeds},(_,i)=>(i+.65)/(seeds+.3))};
}
export function soybeanPodSurface(t,a,p){
 const envelope=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*t),.40);
 const bulge=1-p.bulge+p.bulge*Math.cos((t*p.seeds-.55)*Math.PI*2);
 return [Math.cos(a)*p.width*.5*envelope*bulge,p.length*t,Math.sin(a)*p.depth*.5*envelope*bulge+p.length*p.curvature*Math.sin(Math.PI*t)];
}
// Normal variates are bounded at 2.5 SD to avoid malformed outliers. Size,
// breadth and extension share a vigour term; ranks and season remain coherent.
export function boundedNormal(r){let u=Math.max(1e-9,r()),v=r();return Math.max(-2.5,Math.min(2.5,Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)));}
export function fieldPlantTraits(s,seed){
 const r=seeded(seed+9271),a=Math.max(0,Math.min(1,s.variation??.24)),vigour=boundedNormal(r),n=boundedNormal(r);
 return {height:Math.exp(vigour*a*.18),breadth:Math.exp((vigour*.65+n*.35)*a*.17),lean:boundedNormal(r)*a*.075,
  stage:Math.max(0,Math.min(1,s.maturity+boundedNormal(r)*a*.055)),
  // Takacs et al. 2022: pooled sunflower azimuth SD 42.8 degrees (14 stands).
  // Default variation uses that spread; the control can narrow or widen it.
  azimuth:(profile(s).model||s.crop)==='sunflower'?boundedNormal(r)*(42.8*Math.PI/180)*Math.min(1.6,a/.24):r()*Math.PI*2};
}
export function sunflowerDiskLayout(f,detail=true){
 const count=detail?f.diskCount:180,r=seeded(f.seed+902),cell=f.radius/Math.sqrt(count),s={plantSeed:f.seed,variation:f.variation};
 return Array.from({length:count},(_,k)=>{const a=k*2.399963229728653,R=f.radius*Math.sqrt((k+.5)/count)*.993;
  const x=Math.cos(a)*R+(r()-.5)*cell*.07,y=Math.sin(a)*R+(r()-.5)*cell*.07,fraction=R/f.radius;
  const q=organVariation(s,'disk-floret',k),front=f.flowerFront+.010*Math.sin(a*3)+q.pitch*.035;return {x,y,fraction,angle:a,size:cell*Math.max(.87,Math.min(1.06,q.width)),height:q.depth,length:1+(q.length-1)*.20,width:1+(q.width-1)*.20,phase:f.post?'seed':fraction<front-.055?'bud':fraction>front+.055?'spent':'flower'};
 });
}

// Independent random streams are keyed by biological identity, never triangle
// count or drawing order. The same organ therefore survives LOD/renderer changes.
const organCache=new Map(),vigourCache=new Map();
function identityHash(x){const text=String(x);let h=2166136261;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);h=Math.imul(h^c,16777619);if(c>=0xd800&&c<=0xdbff&&i+1<text.length){const next=text.charCodeAt(i+1);if(next>=0xdc00&&next<=0xdfff)i++;}}return h>>>0;}
export function organVariation(s,kind,index=0,axis=0){
 const plantSeed=s.plantSeed??s.seed??1847,a=Math.min(2,Math.max(0,(s.variation??.24)/.24)),identityKey=`${plantSeed}/${axis}/${kind}/${index}`,cacheable=kind==='stem'||typeof kind==='string'&&(kind.endsWith('/plant-phase')||kind.endsWith('/shoot-posture')),cached=cacheable&&organCache.get(identityKey);
 if(cached&&cached.strength===a)return{...cached};
 const parentKey=`${plantSeed}/${axis}`;let parent=vigourCache.get(parentKey);if(parent===undefined){parent=boundedNormal(seeded(identityHash(parentKey+'/vigour')));if(vigourCache.size>=4096)vigourCache.clear();vigourCache.set(parentKey,parent);}
 const identity=identityHash(identityKey),r=seeded(identity),local=boundedNormal(r),widthNoise=boundedNormal(r);
 const positive=(x,lo=.68,hi=1.42)=>Math.max(lo,Math.min(hi,Math.exp(x*a))),result={seed:identity,strength:a,length:positive(parent*.035+local*.115),width:positive(parent*.030+local*.055+widthNoise*.105),depth:positive(local*.04+boundedNormal(r)*.075),
  petiole:positive(parent*.025+local*.05+boundedNormal(r)*.11),angle:boundedNormal(r)*a*.11,pitch:boundedNormal(r)*a*.075,
  curl:boundedNormal(r)*a*.07,twist:boundedNormal(r)*a*.12,asymmetry:boundedNormal(r)*a*.09,
  spacing:positive(parent*.025+boundedNormal(r)*.15),shade:boundedNormal(r)*a*.035,density:positive(boundedNormal(r)*.12),taper:positive(boundedNormal(r)*.09)};
 if(cacheable){if(organCache.size>=2048)organCache.clear();organCache.set(identityKey,result);return{...result};}return result;
}
// A shoot has a coherent posture, but each blade has its own residual pose and
// continuous shape. Bounds are illustrative, not cultivar measurements.
export function foliageVariation(s,kind,index=0,axis=0){
 const q=organVariation(s,`${s.crop??'crop'}/${kind}`,index,axis),parent=organVariation(s,`${s.crop??'crop'}/shoot-posture`,axis),r=seeded(q.seed+713),n=()=>boundedNormal(r),a=q.strength;
 return {...q,angle:q.angle+parent.angle*.75+n()*a*.10,
  pitch:parent.pitch*1.4+n()*a*.16,roll:parent.twist+n()*a*.25,
  twist:parent.twist*.45+n()*a*.20,curl:n()*a*.12,
  camber:.14+n()*a*.055,sweep:n()*a*.085,
  asymmetry:q.asymmetry+n()*a*.045};
}
export function axisNodeFractions(s,fractions,axis=0,shortenTip=false){
 if(fractions.length<3)return [...fractions];
 const count=fractions.length,last=count-1,lengths=new Array(last);let total=0;
 for(let i=0;i<last;i++){const length=(fractions[i+1]-fractions[i])*organVariation(s,'internode',i,axis).spacing;lengths[i]=length;total+=length;}
 if(shortenTip){const shortened=Math.min(lengths[last-1],lengths[last-2]*.80);total+=shortened-lengths[last-1];lengths[last-1]=shortened;}
 const scale=(fractions[last]-fractions[0])/total,result=[fractions[0]];let current=fractions[0];
 for(const length of lengths){current+=length*scale;result.push(current);}result[last]=fractions[last];return result;
}
export function soybeanBranches(s){const h=cropDimensions(s).h;
 return Array.from({length:3},(_,i)=>{const q=organVariation(s,'branch',i),angle=i*2.39996+.8+q.angle,startY=h*(.17+q.pitch*.10),height=h*Math.max(.43,Math.min(.73,(.56+i*.035)*q.length)),spread=.13*q.width;
  return {angle,start:[.014*startY/h,startY,0],end:[Math.cos(angle)*spread,height,Math.sin(angle)*spread],radius:.0024*q.depth,axis:i+1,nodeSeed:i*113+59};});
}
export function cerealSpike(s){const q=organVariation(s,'spike'),barley=s.crop==='barley',count=barley?22:19;
 return {length:(barley?.095:.105)*q.length,width:q.width,nodes:axisNodeFractions(s,Array.from({length:count},(_,i)=>i/(count-1)),'spike')};
}
// Shared wheat spike anatomy. Every floret starts on an emitted rachilla;
// renderer detail only changes surface sampling, never these attachments.
export function wheatSpikeLayout(s){
 const spike=cerealSpike(s),r=seeded(s.plantSeed??s.seed??1847),rotation=r()*Math.PI*2,lean=(r()-.5)*.075,h=cropDimensions(s).h,
  origin=[lean,h,Math.sin(rotation)*.018],rachis=Array.from({length:6},(_,i)=>{const t=i/5;return[.009*t*t,spike.length*t,0];}),
  at=t=>{const f=t*(rachis.length-1),i=Math.min(rachis.length-2,Math.floor(f));return rachis[i].map((v,k)=>v+(rachis[i+1][k]-v)*(f-i));},
  add=(a,b)=>a.map((v,k)=>v+b[k]);
 const spikelets=spike.nodes.map((t,j)=>{
  const q=organVariation(s,'spikelet',j),side=j%2?1:-1,taper=(.32+.68*Math.pow(Math.sin(Math.PI*(t*.94+.025)),.55))*q.width*spike.width,joint=at(t),base=add(joint,[side*.0012,.0005,0]),tip=add(base,[side*.002,.003,0]);
  const glumes=Array.from({length:2},(_,k)=>({base:add(base,[side*.0003,-.0003,(k-.5)*.0032]),width:.0030*taper,length:.014*taper,depth:.0022,angle:side*.6}));
  const florets=Array.from({length:3},(_,f)=>{
   const node=base.map((v,k)=>v+(tip[k]-v)*f/2),attachment=add(node,[side*.0012,.0003,(f-1)*.0024]),length=(.0136-f*.0008)*taper*q.length,awnLength=.028*organVariation(s,'awn',j*3+f).length*taper*(f===0?1:.9);
   return{node,base:attachment,width:.0024*taper,length,depth:.002,angle:side*.75,awnLength,
    awnStart:add(attachment,[side*length*.12,length*.9,0]),awnTipOffset:[side*awnLength*.33,awnLength,(f-1)*awnLength*.12]};
  });
  return{joint,base,rachilla:[joint,base,tip],side,taper,glumes,florets};
 });
 return{...spike,origin,rachis,spikelets};
}
export function sunflowerRays(f){
 const s={plantSeed:f.seed,variation:f.variation},nominal=Array.from({length:f.rayCount+1},(_,i)=>i/f.rayCount),nodes=axisNodeFractions({...s,variation:(f.variation??.24)*.30},nominal,'ray-circle');
 return Array.from({length:f.rayCount},(_,i)=>{const q=organVariation(s,'ray',i),r=seeded(q.seed+91);
  return {angle:nodes[i]*Math.PI*2,length:f.rayLength*q.length*(1-f.wilt*.65),width:Math.max(q.width,.90,Math.max(nodes[i+1]-nodes[i],i?nodes[i]-nodes[i-1]:nodes.at(-1)-nodes.at(-2))*f.rayCount*.94),curl:q.curl,roll:q.twist,retained:r()>=f.wilt*.88};});
}
export function maizeKernel(s,row,index,ear=maizeEar(s)){
 const q=organVariation(s,'kernel',index,row),a=Math.min(1,q.strength);
 return {t:(index+.65+q.pitch*a)/(ear.kernels+1.3),angle:row/ear.rows*Math.PI*2+q.angle*.12,
  length:1+(q.length-1)*.35,width:1+(q.width-1)*.30,depth:1+(q.depth-1)*.25,shade:q.shade};
}

export function soybeanStudyNode(s,rank=2){
 const h=cropDimensions(s).h,n=s.season==='summer'?7:3,seed=s.plantSeed??s.seed??1847,nodeSeed=Math.floor(seeded(seed)()*100000),i=Math.min(rank,n-1),node=soybeanAxisNodes(s,h,n,nodeSeed)[i];
 return {...node,position:[.014*node.t,h*node.t,0],angle:i*2.39996};
}

function regionalSeason(s){
 const p=profile(s),d=cropDimensions(s),region=REGIONS[p.region-1];
 if(d.residue)return [s.season==='winter'?'Dead residue':'Harvest residue','After the harvest.','Cut stems mark the harvested plot.','Illustrative post-harvest phase · no living foliage'];
 if(d.dormant)return ['Dormancy','A season of rest.','Growth slows; winter cereals retain a low crown and deciduous trees shed their foliage.','Illustrative dormant phase'];
 if(s.season==='summer')return [p.life==='leaf'?'Leaf harvest':p.life==='root'?'Storage-organ growth':'Flowering & harvest',p.name+' in season.',p.note+'. '+p.fruit+' form the selected study.',region.name+' · '+p.fruit];
 if(['evergreen','perennial','deciduous'].includes(p.life))return [s.season==='spring'?'New growth':'Established plant','A perennial rhythm.','An established specimen retains its structural framework.','Illustrative perennial phase · local seasons vary'];
 return [s.season==='autumn'?'Establishment':'Vegetative growth','New growth takes shape.',p.note+'. Leaves and roots establish before harvest.','Illustrative growth phase · local sowing dates vary'];
}
function regionalInspection(s,part){
 const p=profile(s),d=cropDimensions(s),h=d.h;
 if(['barley','maize','sunflower','soybean'].includes(p.model)){
  const view=inspection({...s,crop:p.model},part);if(part==='whole')view.span=Math.max(view.span,h*2.1);return {...view,desc:p.note+'. '+view.desc};
 }
 let target=[0,h*.5,0],span=Math.max(.3,h*(['palm','banana','taro','tree'].includes(p.model)?2.2:1.85)),title=p.name,desc=p.note+'. This regional form uses a simplified procedural model.';
 if(part==='root'){target=[0,-.16,0];span=.72;title=p.life==='root'?(p.model==='groundlegume'?'Underground pods':p.model==='taro'?'Corm & roots':'Storage organs & roots'):'Roots below the surface';desc='Upper roots shown to about 45 cm.'+(p.life==='root'?' Storage organs are included in this view.':'');}
 else if(part==='leaf'){target=[0,h*.65,0];span=Math.max(.22,d.extent*2);title=p.leaf;desc=p.cereal?'Parallel-veined blades emerge from sheathing leaf bases.':'A representative leaf arrangement and blade shape for this crop form.';}
 else if(part==='ear'||part==='flower'){target=[0,h*(p.model==='tree'?.65:p.model==='palm'?.94:1),0];span=Math.max(.3,d.extent*2);title=p.fruit;desc=p.life==='root'?'The harvested storage organs grow below ground. Select Roots to inspect them.':p.note+'. Reproductive structures are simplified, with illustrative organ counts.';}
 else if(part==='tip'){target=[0,h,0];span=Math.max(.25,d.extent*1.3);title='Shoot tip';desc='The upper shoot and its seasonal structures.';}
 if(d.residue&&part!=='root'){target=[0,h*.5,0];span=Math.max(.25,h*1.6);title='Harvest residue';desc='Cut stems remain after harvest; living foliage and reproductive structures are absent.';}
 return {target,span,title,desc};
}
function regionalLabels(s,part){
 const p=profile(s),d=cropDimensions(s),h=d.h;
 if(['barley','maize','sunflower','soybean'].includes(p.model))return anatomyLabels({...s,crop:p.model},part);
 if(part==='root')return [[p.life==='root'?'Storage organs':'Root crown',0,-.07,0],['Lateral roots',.07,-.18,0],['Depth limit',0,-.43,0]];
 if(d.residue)return [['Cut stem',0,h,0],['Root collar',0,0,0]];
 if(part==='leaf')return [['Leaf blade',d.extent*.35,h*.68,0],['Leaf attachment',0,h*.60,0]];
 if(part==='ear'||part==='flower')return [[p.fruit,0,h,0],['Supporting axis',0,h*.82,0]];
 return [['Shoot tip',0,h,0],['Stem',0,h*.4,0],['Root collar',0,0,0]];
}
