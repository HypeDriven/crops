// Generate a reproducible contact sheet from every actual procedural species.
// PLAYWRIGHT_MODULE/CHROME_PATH/REVIEW_URL/REVIEW_DIR override local tooling.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const tree=process.argv.includes('--trees'),dir=process.env.REVIEW_DIR||path.resolve('references/procedural-review');fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-watchdog']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:1200}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.REVIEW_URL||(tree?'http://127.0.0.1:8080':'http://127.0.0.1:8000'))+'/LICENSE.txt');
 const ids=await page.evaluate(async tree=>{
 document.body.innerHTML='<main id="review"></main>';document.head.innerHTML='<style>body{margin:0;background:#e5e7df;font:14px sans-serif}main{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}article{background:#f3f3ef;overflow:hidden}h3{margin:6px;font-size:13px}img{display:block;width:100%}</style>';
 const root='/';
 if(tree){const botany=await import(root+'botany.mjs'),software=await import(root+'software-study.mjs'),regional=await import(root+'regional-species.mjs');window.review={...botany,...software,...regional};return Object.keys(botany.SPECIES);}
 const THREE=await import(root+'vendor/three.module.js'),model=await import(root+'crop-model.js'),crops=await import(root+'crops.js'),material=await import(root+'plant-material.js');window.review={THREE,...model,...crops,...material};return Object.keys(crops.CROPS);
 },tree);
 const report=[];
 for(let start=0;start<ids.length;start+=16){
 await page.evaluate(()=>document.querySelector('#review').replaceChildren());
 for(const type of ids.slice(start,start+16)){
 const stats=await page.evaluate(({type,tree})=>{
 const a=window.review,w=312,h=250,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 let title,picture,stats;
 if(tree){
  const sp=a.SPECIES[type],cfg={...a.REGIONAL_PRESETS[type],type,view:'shoot',shootStage:'set',seed:2847,height:6,spread:1,leafSize:sp.length,levels:2,shoots:2,density:25,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,wind:0,gust:0,direction:0};
  const specimen=a.buildSpecimen(cfg,{preview:false,detail:'far'}),center=specimen.bounds.min.map((v,i)=>(v+specimen.bounds.max[i])/2),span=Math.max(...specimen.bounds.max.map((v,i)=>v-specimen.bounds.min[i])),scale=1.75/span;
  // Tilt the view slightly so different leaf normals and curvature are visible.
  const angle=.36,c=Math.cos(angle),s=Math.sin(angle),vp=new Float32Array([scale*c,0,scale*s*.3,0,-scale*s*.16,scale*.95,0,0,-scale*s,0,scale*c*.3,0,-scale*(center[0]*c-center[1]*s*.16-center[2]*s),-scale*center[1]*.95,-scale*(center[0]*s+center[2]*c)*.3,1]);
  const render=a.createSoftwareStudy();render.upload(specimen.vertices,{...cfg,widthRatio:sp.width});const frame=render.render({vp,eye:[center[0]+span*.5,center[1]+span*.3,center[2]+span*3],sun:[.6,.8,1],cfg,time:0,width:w,height:h});canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(frame.data),w,h),0,0);
  title=sp.name||type;stats={type,blades:specimen.stats.bladePoses.length,vertices:specimen.vertices.length/14};
 }else{
  const T=a.THREE,cfg={crop:type,seed:1847,season:'summer',maturity:.65,variation:.24},geometry=a.createPlantGeometry(cfg,1847,false),scene=new T.Scene();scene.background=new T.Color('#e5e7df');scene.add(new T.HemisphereLight(0xe8efdc,0x4a432e,2.15));const light=new T.DirectionalLight(0xffe8c4,3.1);light.position.set(2,4,5);scene.add(light);
  const uniforms={uSurfaceDetail:{value:1},uLeafFlutter:{value:0},uFlex:{value:0},uTime:{value:0},uWind:{value:0},uDirection:{value:new T.Vector2(.7,.7)}},mat=a.createPlantMaterial(uniforms),mesh=new T.Mesh(geometry,mat);scene.add(mesh);
  geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new T.Vector3()),size=geometry.boundingBox.getSize(new T.Vector3()),span=Math.max(size.y,size.x*h/w,size.z*h/w)*1.2,camera=new T.OrthographicCamera(-span*w/h/2,span*w/h/2,span/2,-span/2,.001,100);camera.position.copy(center).add(new T.Vector3(1,.24,1.8).multiplyScalar(Math.max(1,span)*2));camera.lookAt(center);
  const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(w,h);renderer.render(scene,camera);title=a.CROPS[type].name;stats={type,vertices:geometry.attributes.position.count};
  picture=canvas.toDataURL();geometry.dispose();mat.dispose();renderer.dispose();renderer.forceContextLoss();
 }
 picture??=canvas.toDataURL();const article=document.createElement('article'),label=document.createElement('h3'),image=document.createElement('img');label.textContent=title+' · '+type;image.src=picture;article.append(label,image);document.querySelector('#review').append(article);return stats;
 },{type,tree});report.push(stats);
 }
 const file=path.join(dir,'collection-'+String(start/16+1).padStart(2,'0')+'.png');await page.screenshot({path:file,fullPage:true});console.log(file);
 }
 if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify(report,null,2));console.log('Rendered '+ids.length+' procedural species without browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
