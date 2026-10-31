// Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
// PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
// Requires Playwright, Chrome and a running local server (just up).
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const artifacts=process.env.ARTIFACT_DIR||path.join(os.tmpdir(),'crops-reproductive-previews');fs.mkdirSync(artifacts,{recursive:true});
(async()=>{const portable=process.argv.includes('--portable'),b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-gpu-watchdog',...(portable?['--disable-webgl']:['--use-angle=swiftshader','--enable-unsafe-swiftshader'])]});try{
const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/Shader Error|GL_INVALID|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});await p.route('https://fonts.**',r=>r.abort());
await p.goto(process.env.CROPS_URL||'http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.starHermitCrops||window.starHermitCropsPortable,null,{timeout:60000});
await p.selectOption('#crop-region','all');await p.locator('#pause').click();await p.locator('#inspect').click();
const cases=process.argv.includes('--flowers')?[['r02-faba',14],['r05-potato',45],['r03-poppy',45]]:process.argv.includes('--cotton-only')?[['r13-cotton',85]]:process.argv.includes('--short')?[['r13-cotton',85],['r24-bean',65],['r13-cotton',12]]:[['r13-cotton',85],['r24-bean',65],['r06-chickpea',65],['r02-faba',14],['r13-cotton',12],['r03-poppy',45],['r05-potato',45],['r10-sesame',15],['r20-foxtail',65],['r24-cacao',85]];
for(const [crop,maturity]of cases){
 await p.selectOption('#crop-type',crop);await p.locator('#maturity').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},maturity);await p.waitForTimeout(700);
 await p.locator('[data-focus="ear"]').click();if(!portable)await p.evaluate(()=>{const a=window.starHermitCrops;a.focus('ear',false);a.renderer.render(a.scene,a.camera);});await p.waitForTimeout(600);
 await p.screenshot({path:path.join(artifacts,`${portable?'canvas':'webgl'}-${crop}-${maturity}.png`)});
 assert.deepEqual(errors,[]);console.log((portable?'Canvas':'WebGL')+' reproductive close-up: '+crop+' / '+maturity);
}
await p.goto('file://'+path.resolve(__dirname,'../standalone/StarHermit-Crops.html'),{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.starHermitCrops||window.starHermitCropsPortable,null,{timeout:60000});await p.selectOption('#crop-region','13');await p.selectOption('#crop-type','r13-cotton');await p.locator('#inspect').click();assert.deepEqual(errors,[]);console.log('Standalone reproductive module imports and renderer passed. Previews: '+artifacts);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
