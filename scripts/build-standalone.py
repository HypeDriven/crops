#!/usr/bin/env python3
"""Build StarHermit Crops as a self-contained HTML file; standard library only."""
# Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
# PolyForm Noncommercial 1.0.0 with additional permission; see ../LICENSE.
# https://polyformproject.org/licenses/noncommercial/1.0.0
from pathlib import Path
import base64
import json
import re

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'style.css').read_text(encoding='utf-8')
css = re.sub(r"@import url\([^;]+;", '', css, count=1)
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
sources = {
    key: base64.b64encode((ROOT / path).read_bytes()).decode('ascii')
    for key, path in {
        'three': 'vendor/three.module.js',
        'data': 'crops.js',
        'orbit': 'vendor/OrbitControls.js',
        'model': 'crop-model.js',
        'canvas': 'crop-canvas.js',
        'fallback': 'fallback.js',
        'app': 'app.js',
    }.items()
}
bootstrap = '''<script>
(async function(){
const data=PAYLOAD;
const decode=x=>new TextDecoder().decode(Uint8Array.from(atob(x),c=>c.charCodeAt(0)));
const moduleURL=x=>URL.createObjectURL(new Blob([x],{type:'text/javascript'}));
const three=moduleURL(decode(data.three));
const cropdata=moduleURL(decode(data.data));
const orbit=moduleURL(decode(data.orbit).replace("'./three.module.js'",JSON.stringify(three)));
const model=moduleURL(decode(data.model).replace("'./vendor/three.module.js'",JSON.stringify(three)).replace("'./crops.js'",JSON.stringify(cropdata)));
const canvas=moduleURL(decode(data.canvas).replace("'./crops.js'",JSON.stringify(cropdata)));
const fallback=moduleURL(decode(data.fallback).replace("'./crops.js'",JSON.stringify(cropdata)).replace("'./crop-canvas.js'",JSON.stringify(canvas)));
const app=decode(data.app).replace("'./vendor/three.module.js'",JSON.stringify(three)).replace("'./vendor/OrbitControls.js'",JSON.stringify(orbit)).replace("'./crops.js'",JSON.stringify(cropdata)).replace("'./crop-model.js'",JSON.stringify(model)).replace('"./fallback.js"',JSON.stringify(fallback));
await import(moduleURL(app));
})().catch(e=>{document.getElementById('loading').innerHTML='<h2>Open this file in Chrome, Edge, Firefox or Safari</h2><p>The previewer may not support interactive HTML. Download the file and open it in your browser.</p>';console.error(e);});
</script>'''
html = html.replace('<script type="module" src="app.js"></script>', bootstrap.replace('PAYLOAD', json.dumps(sources, separators=(',', ':'))))
licenses = '\n<!--\nFIRST-PARTY LICENSE\n' + (ROOT / 'LICENSE').read_text(encoding='utf-8')
licenses += '\nTHIRD-PARTY LICENSE: THREE.JS / ORBITCONTROLS\n'
licenses += (ROOT / 'licenses/three.js-MIT.txt').read_text(encoding='utf-8') + '\n-->\n'
# Preserve the HTML doctype as the first declaration.
html = html.replace('<!doctype html>', '<!doctype html>' + licenses, 1)
assert 'src="app.js"' not in html and 'href="style.css"' not in html
assert 'https://fonts.googleapis.com' not in html
out = ROOT / 'standalone/StarHermit-Crops.html'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'{out} ({out.stat().st_size:,} bytes)')
