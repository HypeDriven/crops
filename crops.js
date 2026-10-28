/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
export const CROPS = {
 wheat:{name:'Winter wheat',latin:'Triticum aestivum',family:'POACEAE',habit:'Awned common wheat · winter habit',cereal:true,defaultDensity:2600,min:600,max:4800,step:200,row:.145,flex:1,fruit:'Ear',leaf:'Leaf & collar'},
 barley:{name:'Two-row barley',latin:'Hordeum vulgare',family:'POACEAE',habit:'Two-row, long-awned · winter habit',cereal:true,defaultDensity:2400,min:600,max:4800,step:200,row:.15,flex:1.15,fruit:'Spike',leaf:'Leaf & auricles'},
 maize:{name:'Maize',latin:'Zea mays',family:'POACEAE',habit:'Spring-sown grain maize · annual',defaultDensity:180,min:40,max:600,step:20,row:.75,flex:.24,fruit:'Ear & silk',leaf:'Leaf & sheath'},
 sunflower:{name:'Sunflower',latin:'Helianthus annuus',family:'ASTERACEAE',habit:'Single-headed oilseed form · annual',defaultDensity:140,min:40,max:480,step:20,row:.7,flex:.18,fruit:'Flower head',leaf:'Leaf & petiole'},
 soybean:{name:'Soybean',latin:'Glycine max',family:'FABACEAE',habit:'Indeterminate, trifoliate form · annual',defaultDensity:800,min:100,max:2000,step:100,row:.38,flex:.48,fruit:'Pods & flowers',leaf:'Compound leaf'}
};
export const profile=s=>CROPS[s.crop||'wheat'];
export const seeded=seed=>{let a=seed|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
export function mixHex(a,b,t){t=Math.max(0,Math.min(1,t));return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
export function cropDimensions(s){const p=profile(s),m=s.maturity,summer=s.season==='summer',residue=!p.cereal&&['autumn','winter'].includes(s.season);let h;if(p.cereal)h=summer?(s.crop==='barley'?.69:.77)+m*.13:s.season==='spring'?.28+m*.45:s.season==='autumn'?.045+m*.075:.055;else if(s.crop==='maize')h=summer?1.7+m*.5:s.season==='spring'?.12+m*.6:residue?(s.season==='winter'?.22:.42-m*.12):.2;else if(s.crop==='sunflower')h=summer?1.35+m*.4:s.season==='spring'?.1+m*.45:s.season==='winter'?.15:.3-m*.08;else h=summer?.58+m*.18:s.season==='spring'?.07+m*.26:s.season==='winter'?.09:.17-m*.04;return{h,ear:summer,reproductive:summer,residue,leaves:residue?0:p.cereal?4:s.crop==='maize'?12:s.crop==='sunflower'?10:7,extent:p.cereal?.16:s.crop==='maize'?.38:s.crop==='sunflower'?.24:.22};}
export function cropColors(s){const cereal=profile(s).cereal,ripe=cereal&&s.season==='summer'?Math.max(0,(s.maturity-.16)/.84):0,residue=cropDimensions(s).residue;let senescent=residue?1:(!cereal&&s.season==='summer'?Math.max(0,(s.maturity-.76)/.24)*.5:ripe);const cold=s.season==='winter';return{stem:mixHex(cold?'#63744e':'#628348','#ac915c',senescent),leaf:mixHex(cold?'#5c7050':'#4f7e3c','#a79454',senescent),ear:mixHex('#8f9d55','#ceb776',ripe),bract:mixHex('#718b43','#a48a4e',ripe),node:mixHex('#56723d','#8d7849',senescent),edge:mixHex('#365a2d','#8d713e',senescent),vein:mixHex('#9aac6d','#d9c794',senescent),flower:'#dcbf56',petal:'#edbd23',root:'#b39c76',pod:mixHex('#6d8744','#b19a6b',Math.max(0,(s.maturity-.65)/.35))};}
export function seasonalStudy(s){const p=profile(s),m=s.maturity;if(p.cereal)return{
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
export function inspection(s,part){const d=cropDimensions(s),h=d.h,c=s.crop||'wheat',p=profile(s);let target=[0,h*.46,0],span=Math.max(.2,h*1.5),title=p.cereal?'One crown. Many culms.':'A plant, in context.',desc=p.cereal?'Basal tillers share a crown. Leaves alternate at nodes, with sheaths enclosing the culm.':'The branching, leaf arrangement, and reproductive structures follow the selected crop.';
 if(part==='ear'){
  if(c==='wheat'){target=[.012,h+.058,0];span=.3;title='Anatomy of an ear.';desc='Alternating spikelets bear several florets, enclosed by glumes, lemmas and paleas.';}
  if(c==='barley'){target=[.012,h+.075,0];span=.39;title='Two rows. Long awns.';desc='One fertile central spikelet per triplet forms two grain rows. The lateral spikelets remain sterile in this two-row form.';}
  if(c==='maize'){target=[.09,h*.57+.10,.11];span=.46;title='A silk-bearing ear.';desc=s.cutaway?'The husk is peeled back to expose paired rows of kernels on the cob. The kernel arrangement is a representative 14-row ear.':'The female ear sits in a leaf axil. Husk leaves enclose the cob; silks emerge from its tip. Enable the cutaway to inspect kernels.';}
  if(c==='sunflower'){target=sunflowerHead(s).center;span=.40;title=s.maturity>.78?'From florets to achenes.':'A composite flower head.';desc='Yellow rays are individual florets. Hundreds of disk florets occupy a spiral pattern above overlapping green involucral bracts.';}
  if(c==='soybean'){target=[.016,h*.54-.024,.010];span=s.maturity<.3?.13:.15;title=s.maturity<.3?'Flowers at the leaf axils.':'Pods at the leaf axils.';desc=s.cutaway?'Opened pods reveal representative two- or three-seeded fruits. Nodules are modelled on the root system.':'Pendulous, gently curved pods have a continuous wall around two or three seeds, paired sutures, tapered tips and fine surface hairs. The seeds themselves are smooth.';}
 }else if(part==='tip'){const term=shootTermination(s);target=[s.crop==='soybean'?.014:0,h*(d.reproductive?1:.90),0];span=s.crop==='maize'?.50:profile(s).cereal?.26:.24;title=term==='tassel'?'A terminal male tassel.':term==='capitulum'?'The shoot ends in a head.':term==='terminal-spike'?'A terminal cereal spike.':term==='cut-stubble'?'A harvested stem.':term==='arrested-bud'?'The uppermost trifoliate.':'The youngest leaves.';desc=term==='arrested-bud'?'Stem extension has stopped. The final trifoliate remains immediately below a compact terminal bud; its leaflets are expanded rather than continually unfolding.':d.reproductive&&!['young-trifoliate','arrested-bud'].includes(term)?'The vegetative shoot has become a terminal inflorescence. New foliage is not added above the flowers.':'Young leaves near the apex are smaller, paler, less expanded and more folded than older leaves below them.';}else if(part==='flower'){target=[0,h+.12,0];span=.5;title='The male inflorescence.';desc='The terminal tassel branches into spikelet-bearing axes. Anthers are present near the silking stage; pollen grains are not individually simulated.';}
 else if(part==='leaf'){const fraction=c==='maize'?.64:c==='sunflower'?.57:c==='soybean'?.58:.71;target=[p.cereal?.05:.07,h*fraction+.025,0];span=c==='maize'?.58:c==='sunflower'?.38:c==='soybean'?.23:.29;title=c==='soybean'?'One leaf, three leaflets.':c==='sunflower'?'Veins, teeth, and hairs.':'A blade, in detail.';desc=c==='soybean'?'A larger terminal leaflet and two smaller, oblique lateral leaflets have rounded bases, entire margins and short petiolules. Fine hairs cover the matte surfaces, petiole and stem.':c==='sunflower'?'A petiole supports a broad, serrate, cordate blade with branching veins. Lower leaves are opposite; later leaves are alternate.':c==='maize'?'A broad parallel-veined blade joins a clasping sheath at the collar. Maize lacks the clasping auricles seen in barley.':c==='barley'?'Broad, smooth auricles clasp the culm. Longitudinal veins and a membranous ligule mark the blade–sheath junction.':'Parallel veins, a folded midrib, a membranous ligule, and paired hairy auricles.';}
 else if(part==='root'){target=[0,-.17,0];span=.72;title=c==='soybean'?'A nodulated taproot.':c==='sunflower'?'A branching taproot.':c==='maize'?'Crown roots and braces.':'An underground network.';desc=c==='soybean'?'Lateral roots branch from the taproot. Visible nodules represent symbiotic structures; their number is illustrative.':c==='sunflower'?'A dominant taproot gives rise to laterals and fine branches. Only the upper 45 cm are shown.':c==='maize'?'Nodal roots form a fibrous system. Above-ground brace roots descend from basal stalk nodes toward the soil.':'Seminal and crown roots branch into fine laterals. Only the upper 45 cm are shown.';}
 if(d.residue&&part==='root'){title='Root remnants after harvest.';desc='The upper root system is retained as dead residue. Fine-root persistence is illustrative; only the upper 45 cm are shown.';}if(d.residue&&part!=='root'){title='The remaining stubble.';desc='A harvested spring annual retains dead stems and root remnants; living leaves, flowers, and fruits are absent.';}
 return{target,span,title,desc};}
export function anatomyLabels(s,part){const h=cropDimensions(s).h,p=profile(s),c=s.crop||'wheat';if(cropDimensions(s).residue){if(part==='root')return [['Dead root collar',0,0,0],['Root remnant',.04,-.10,0],['Deep truncation',0,-.38,0]];return [['Cut stem',0,h,0],['Dead stem node',0,h*.36,0],['Root collar',0,0,0]];}if(part==='root')return c==='soybean'?[['Root crown',0,0,0],['Nodules on lateral roots',.035,-.09,0],['Taproot',0,-.3,0]]:c==='sunflower'?[['Root collar',0,0,0],['Lateral roots',.08,-.13,0],['Taproot',0,-.32,0]]:c==='maize'?[['Brace roots',.06,.045,.03],['Nodal root crown',.02,-.03,0],['Fine laterals',.08,-.27,0]]:[['Crown · basal tillers',.01,0,0],['Crown roots',.045,-.11,0],['Fine lateral roots',.08,-.27,0]];
 if(part==='tip'){const t=shootTermination(s);return [[t==='leaf-whorl'?'Emerging rolled blades':t==='young-trifoliate'?'Unfolding trifoliate':t==='young-simple-leaves'?'Young folded leaves':t==='arrested-bud'?'Compact terminal bud':'Terminal structure',0,h*(cropDimensions(s).reproductive?1:.90),0],[c==='soybean'?'Uppermost trifoliate':'Upper node',c==='soybean'?.014:0,h*(c==='soybean'?.997:.85),0]];}if(part==='ear'){if(c==='maize')return[[s.cutaway?'Kernel rows':'Husk leaves',.09,h*.57+.085,.035],['Silks',.14,h*.57+.20,.02],['Ear shank',.025,h*.57,0]];if(c==='sunflower')return[['Ray florets',.12,h+.055,.02],['Disk florets',.025,h+.02,.04],['Involucral bracts',.075,h-.07,0]];if(c==='soybean')return[[s.cutaway?'Seeds in opened pod':'Hairy pod & seed bulges',.045,h*.54,.02],['Petiole / leaf axil',.015,h*.58,0],['Pod seam',.07,h*.51,.02]];return[[c==='barley'?'Long lemma awns':'Awn · lemma extension',.015,h+(c==='barley'?.18:.14),0],[c==='barley'?'Fertile central spikelet':'Spikelet · glumes & florets',.015,h+.055,0],['Rachis · spike axis',.005,h+.01,0]];}
 if(part==='flower')return[['Tassel axis',0,h+.12,0],['Spikelets & anthers',.07,h+.18,0],['Peduncle',0,h+.01,0]];
 if(part==='leaf'){const data=inspection(s,part),y=data.target[1]-.025;return p.cereal?[['Parallel venation',.1,y+.055,0],[c==='barley'?'Clasping smooth auricles':'Ligule & auricles',.003,y,0],['Leaf sheath',0,y-.06,0]]:c==='maize'?[['Parallel venation',.18,y+.09,0],['Ligule · no auricles',0,y,0],['Clasping sheath',0,y-.06,0]]:c==='soybean'?[['Terminal leaflet',.14,y+.035,0],['Lateral leaflets',.08,y+.04,.04],['Petiole',.03,y+.01,0]]:[['Serrate margin',.15,y+.03,0],['Reticulate venation',.1,y+.025,0],['Petiole',.04,y+.015,0]];}
 return[[p.cereal?'Flag leaf':c==='soybean'?'Trifoliate leaf':'Leaf blade',.1,h*.65,0],[p.cereal?'Node & leaf sheath':'Stem node',.01,h*.36,0],['Root crown',0,0,0]];}
export function syncCropUI(s){const p=profile(s),stage=seasonalStudy(s);document.getElementById('species-latin').textContent=p.latin;document.getElementById('species-habit').textContent=p.habit;document.getElementById('species-family').textContent=p.family;document.getElementById('crop-intro').textContent=p.name+', shaped by the season.';document.querySelector('[data-focus="ear"]').textContent=p.fruit;document.querySelector('[data-focus="leaf"]').textContent=p.leaf;document.querySelector('[data-focus="flower"]').classList.toggle('hidden',s.crop!=='maize');document.getElementById('cutaway-label').classList.toggle('hidden',!['maize','soybean'].includes(s.crop)||s.season!=='summer');document.getElementById('isolate-label').classList.toggle('hidden',!p.cereal);for(const b of document.querySelectorAll('[data-season]')){const temp={...s,season:b.dataset.season};b.querySelector('small').textContent=seasonalStudy(temp)[0];}document.getElementById('season-kicker').textContent=s.inspect?'SPECIMEN STUDY / '+p.name.toUpperCase():s.season.toUpperCase()+' / '+stage[0].toUpperCase();document.getElementById('season-title').textContent=s.inspect?'Closer to nature.':stage[1];document.getElementById('season-description').textContent=s.inspect?stage[3]:stage[2];document.getElementById('current-crop-note').textContent=p.name+' — '+p.latin+'. '+stage[3]+'. '+(p.cereal?'Autumn-sown winter form.':'Spring-sown annual; autumn and winter show post-harvest residue.');return stage;}
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
 const r=seeded(seed+rank*1301),jitter=.96+r()*.08,size=envelope*expansion*jitter;
 const base=cropColors(s),leaf=mixHex(base.leaf,'#b4b96c',emerging?.20:0),color=mixHex(leaf,'#a28d4a',senescence*.72);
 return{rank,relativeAge:age,expansion,size,widthFactor:Math.sqrt(expansion)*envelope,fold:emerging?1-expansion:0,droop:.16+age*.35+senescence*.22,color,senescence,emerging};
}
export function sunflowerHead(s){const seed=s.plantSeed??s.seed??1847,r=seeded(seed+3841),v=Math.min(1.6,(s.variation??.24)/.24),m=s.maturity,h=cropDimensions(s).h,bud=m<.12,post=m>.76;
 const size=Math.exp(boundedNormal(r)*.045*v),tilt=Math.max(-1.45,Math.min(.8,(bud?.62:.28-(m-.12)*1.12)-Math.max(0,m-.72)*2.3+boundedNormal(r)*.11*v));
 const yaw=s.headYaw??boundedNormal(r)*.12*v,roll=boundedNormal(r)*.045*v,radius=(bud?.028+m*.24:.088+m*.035)*size;
 const rayCount=Math.max(32,Math.min(46,Math.round(38+boundedNormal(r)*2.4))),rayLength=(.040+Math.min(m,.6)*.012)*size;
 return{seed,center:[.012*Math.sin(h*2)+Math.sin(yaw)*.055,h-Math.max(0,m-.70)*.20,.055+Math.max(0,m-.70)*.16],tilt,yaw,roll,radius,rayLength,rayCount,rayWidth:Math.PI*2*(radius+rayLength*.5)/rayCount*1.20,
  diskCount:Math.round((1600+boundedNormal(r)*120)*size*size),bud,post,flowerFront:Math.sqrt(Math.max(0,1-Math.max(0,m-.12)/.64)),wilt:Math.max(0,(m-.72)/.28)};
}
export function maizeEar(s,secondary=false){const h=cropDimensions(s).h,f=secondary?.45:1;return{base:[secondary?-.048:.055,h*(secondary?.44:.57),secondary?.025:.065],direction:[secondary?-.28:.32,.87,.39],length:(.17+s.maturity*.075)*f,radius:(.026+s.maturity*.013)*f,rows:14,kernels:32,scale:f};}
export function shootTermination(s){const d=cropDimensions(s);if(d.residue)return 'cut-stubble';if(d.reproductive)return s.crop==='soybean'&&s.maturity<.62?'young-trifoliate':s.crop==='sunflower'?'capitulum':s.crop==='maize'?'tassel':s.crop==='soybean'?'arrested-bud':'terminal-spike';return profile(s).cereal||s.crop==='maize'?'leaf-whorl':s.crop==='soybean'?'young-trifoliate':'young-simple-leaves';}

// Upper soybean internodes shorten toward the apex. The final trifoliate remains
// attached beside the terminal bud after extension stops; it does not disappear.
// Both renderers use physical axis length so branches cannot end in bare poles.
export function soybeanAxisNodes(s,length,count,seed=0){
 const r=seeded(seed),gap=Math.min(length*.018,.0012+r()*.0010),last=1-gap/length;
 return Array.from({length:count},(_,rank)=>{
  const u=count>1?rank/(count-1):1,t=.16+(last-.16)*(1-Math.pow(1-u,1.45));
  const dev=leafDevelopment(s,rank,count,seed),uppermost=rank===count-1;
  if(uppermost&&!dev.emerging)dev.size*=.72;
  return {t,uppermost,dev:{...dev,petioleFactor:uppermost?.36:.65,elevation:uppermost&&dev.emerging?.8:0}};
 });
}

// Shape coordinates are in metres; shared by mesh and portable renderers.
export function soybeanLeafSurface(t,v,L,W,dev={}){
 const shape=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*Math.pow(t,.78)),.82);
 const asym=dev.oblique||0,side=v*W*.5*shape*(1+asym*v*(1-t));
 const fold=dev.fold||0,arch=L*(.085*Math.sin(Math.PI*t)-(.05+(dev.relativeAge||0)*.07)*t*t);
 return [L*t,arch+Math.abs(v)*W*shape*(.035+fold*.48)+L*t*Math.sin(dev.elevation||0),side*(1-fold*.60)];
}
export function soybeanPodShape(s,seeds=3,seed=0){
 const r=seeded(seed),fill=Math.max(.08,Math.min(1,(s.maturity-.27)/.35));
 const length=(seeds===2?.041:.054)*( .96+r()*.08),width=.0105+fill*.002,depth=.003+fill*.005;
 return {seeds,length,width,depth,fill,centers:Array.from({length:seeds},(_,i)=>(i+.65)/(seeds+.3))};
}
export function soybeanPodSurface(t,a,p){
 const envelope=t<=0||t>=1?0:Math.pow(Math.sin(Math.PI*t),.40);
 const bulge=.94+.06*Math.cos((t*p.seeds-.55)*Math.PI*2);
 return [Math.cos(a)*p.width*.5*envelope*bulge,p.length*t,Math.sin(a)*p.depth*.5*envelope*bulge+p.length*.065*Math.sin(Math.PI*t)];
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
  azimuth:s.crop==='sunflower'?boundedNormal(r)*(42.8*Math.PI/180)*Math.min(1.6,a/.24):r()*Math.PI*2};
}
export function sunflowerDiskLayout(f,detail=true){
 const count=detail?f.diskCount:180,r=seeded(f.seed+902),cell=f.radius/Math.sqrt(count);
 return Array.from({length:count},(_,k)=>{const a=k*2.399963229728653,R=f.radius*Math.sqrt((k+.5)/count)*.993;
  const x=Math.cos(a)*R+(r()-.5)*cell*.07,y=Math.sin(a)*R+(r()-.5)*cell*.07,fraction=R/f.radius;
  return {x,y,fraction,angle:a,size:cell*(.94+r()*.09),phase:f.post?'seed':fraction<f.flowerFront-.055?'bud':fraction>f.flowerFront+.055?'spent':'flower'};
 });
}
