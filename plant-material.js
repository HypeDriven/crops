/* StarHermit Crops
Required Notice: Copyright 2026 Hype Driven Development Inc. (https://hypedriven.com)
PolyForm Noncommercial 1.0.0 with additional permission; see LICENSE.
*/
import * as THREE from './vendor/three.module.js';
import {SURFACE} from './crop-surfaces.js';

// Procedural patterns fade at subpixel frequencies. No image textures or network
// resources are required. UVs follow each organ rather than the entire plant.
const surfaceShader=`
varying float vCropSurface;
varying vec2 vCropUv;
varying vec3 vCropPosition;
uniform float uSurfaceDetail;
float cropHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float cropNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(cropHash(i),cropHash(i+vec2(1.,0.)),f.x),mix(cropHash(i+vec2(0.,1.)),cropHash(i+vec2(1.,1.)),f.x),f.y);}
float cropRidge(float phase,float sharpness){float fade=1.0-smoothstep(.6,3.0,fwidth(phase));return pow(.5+.5*cos(phase),sharpness)*fade;}
vec3 cropSurface(vec2 uv,float kind){
 float noise=cropNoise(uv*vec2(85.,170.));
 float tone=.97+.05*noise,height=0.,rough=.82;
 if(abs(kind-${SURFACE.GRASS}.)<.1){
  float vein=cropRidge(uv.x*125.66,14.),rib=exp(-abs(uv.x-.5)*95.);
  tone=.91+.07*vein+.12*rib+.04*noise;height=.00007*(vein+rib*1.8);rough=.69;
 }else if(abs(kind-${SURFACE.LEAF}.)<.1||abs(kind-${SURFACE.WAXY}.)<.1){
  float mid=exp(-abs(uv.x-.5)*100.);
  float branches=cropRidge((uv.y-abs(uv.x-.5)*.55)*62.83,20.);
  float network=cropRidge((uv.y+abs(uv.x-.5)*1.2)*150.8,22.)*branches;
  tone=.92+.10*mid+.045*branches+.035*noise;height=.00010*mid+.000035*branches+.000012*network;
  rough=kind>${SURFACE.WAXY-.1}?.55:.72;
 }else if(abs(kind-${SURFACE.GRAIN}.)<.1){
  float groove=cropRidge(uv.x*6.283,16.);tone=.94-.10*groove+.075*noise;height=-.00008*groove+.000012*noise;rough=.74;
 }else if(abs(kind-${SURFACE.POD}.)<.1){
  float seam=cropRidge(uv.x*12.566,32.);tone=.91+.10*noise-.10*seam;height=.00007*seam+.00002*noise;rough=.77;
 }else if(abs(kind-${SURFACE.BARK}.)<.1||abs(kind-${SURFACE.PALM}.)<.1){
  float furrow=cropRidge(uv.x*100.53+cropNoise(uv*vec2(9.,24.))*3.,5.);
  float rings=cropRidge(uv.y*175.93+sin(uv.x*25.13)*.6,16.);
  float scar=kind>${SURFACE.PALM-.1}?rings:furrow;
  tone=.80+.17*noise+.18*scar;height=.0007*scar+.00015*noise;rough=.96;
 }else if(abs(kind-${SURFACE.ROOT}.)<.1){
  float pore=cropRidge(uv.x*119.38+uv.y*78.,20.)*cropRidge(uv.y*188.5,18.);
  tone=.91+.10*noise-.10*pore;height=.000025*noise-.00008*pore;rough=.95;
 }else if(abs(kind-${SURFACE.FRUIT}.)<.1){
  float pores=cropNoise(uv*vec2(190.,240.));tone=.94+.06*noise;height=.000025*pores;rough=.38;
 }else if(abs(kind-${SURFACE.PETAL}.)<.1){
  float folds=cropRidge(uv.x*37.7,4.);tone=.96+.04*folds;height=.000012*folds;rough=.65;
 }else if(abs(kind-${SURFACE.LINT}.)<.1){
  // Cotton's silhouette is geometric fibrework. Fine isotropic relief avoids
  // turning its underlying lock into a grooved or corrugated solid blob.
  float fiber=cropNoise(uv*vec2(370.,510.));tone=.97+.03*noise;height=.0000015*(fiber-.5);rough=.99;
 }else{
  float fiber=cropRidge(uv.x*100.53,9.);tone=.94+.06*fiber;height=.000025*fiber;rough=.85;
 }
 return vec3(tone,height,rough);
}
vec3 cropBump(vec3 n,float height,float faceSign){
 vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition),r1=cross(sy,n),r2=cross(n,sx);
 float det=dot(sx,r1)*faceSign;
 vec3 gradient=sign(det)*(dFdx(height)*r1+dFdy(height)*r2);
 return normalize(max(abs(det),1e-10)*n-gradient);
}
`;
const windDeclarations=`
uniform float uTime;uniform float uWind;uniform float uFlex;uniform float uLeafFlutter;uniform vec2 uDirection;
float cropWave(){vec3 origin=vec3(0.);
#ifdef USE_INSTANCING
origin=instanceMatrix[3].xyz;
#endif
float phase=dot(origin.xz,uDirection)*1.35;
return sin(uTime*1.4-phase)*.62+sin(uTime*.73-phase*.47)*.32+sin(uTime*2.5-phase*2.1)*.12;}
`;
export function createPlantMaterial(uniforms,{roots=false}={}){
 const material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.8,metalness:0});
 material.name=roots?'Procedural root surfaces':'Procedural crop surfaces';
 material.customProgramCacheKey=()=>roots?'crop-surfaces-root-v2':'crop-surfaces-wind-v3';
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute float organ;attribute float surface;attribute float leafMotion;
varying float vCropSurface;varying vec2 vCropUv;varying vec3 vCropPosition;
${roots?'':windDeclarations}`);
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
vCropSurface=surface;vCropUv=uv;vCropPosition=position;
${roots?'':`float h=max(position.y,0.);float wave=cropWave();float bend=wave*uWind*.021*uFlex*h*h;
transformed.xz+=uDirection*bend;transformed.y-=abs(bend)*h*.10;
if(surface==${SURFACE.GRASS}.||surface==${SURFACE.LEAF}.||surface==${SURFACE.WAXY}.){
 float flutter=sin(uTime*3.4+dot(position.xz,uDirection)*3.)*uWind*.0006*leafMotion*uLeafFlutter;
 transformed.y+=flutter;transformed.xz+=vec2(-uDirection.y,uDirection.x)*flutter;}`}`);
  if(!roots)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
float slope=2.*cropWave()*uWind*.021*uFlex*max(position.y,0.);
objectNormal=normalize(vec3(objectNormal.x,objectNormal.y-dot(objectNormal.xz,uDirection)*slope,objectNormal.z));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+surfaceShader);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 cropSample=cropSurface(vCropUv,vCropSurface);diffuseColor.rgb*=cropSample.x;`);
  shader.fragmentShader=shader.fragmentShader.replace('vec3 cropSample=cropSurface',`
// A stochastic, soft inner density sits beneath discrete lint strands. Its
// fading edge avoids an opaque ellipsoid contour inside the fibre coat.
#ifndef FLAT_SHADED
if(abs(vCropSurface-${SURFACE.LINT}.)<.1&&vCropUv.x>1.5){
 float facing=abs(dot(normalize(vNormal),normalize(vViewPosition)));
 float density=smoothstep(.02,.70,facing);
 if(cropHash(gl_FragCoord.xy)>density)discard;
}
#endif
vec3 cropSample=cropSurface`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
roughnessFactor=clamp(cropSample.z,.3,.99);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
if(uSurfaceDetail>.6)normal=cropBump(normal,cropSample.y*uSurfaceDetail,faceDirection);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
// Wrapped skylight keeps thin leaf undersides readable without an environment map.
if(abs(vCropSurface-${SURFACE.GRASS}.)<.1||abs(vCropSurface-${SURFACE.LEAF}.)<.1||abs(vCropSurface-${SURFACE.WAXY}.)<.1)outgoingLight=max(outgoingLight,diffuseColor.rgb*.28);
if(abs(vCropSurface-${SURFACE.LINT}.)<.1)outgoingLight=max(outgoingLight,diffuseColor.rgb*.48);
#include <opaque_fragment>`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
#if NUM_DIR_LIGHTS > 0
if(abs(vCropSurface-${SURFACE.GRASS}.)<.1||abs(vCropSurface-${SURFACE.LEAF}.)<.1||abs(vCropSurface-${SURFACE.WAXY}.)<.1||abs(vCropSurface-${SURFACE.PETAL}.)<.1){
 float forwardScatter=pow(max(dot(-directionalLights[0].direction,normalize(vViewPosition)),0.),3.);
 float transmission=(.065+.13*forwardScatter)*(1.-.35*exp(-abs(vCropUv.x-.5)*70.));
 reflectedLight.directDiffuse+=diffuseColor.rgb*directionalLights[0].color*transmission;
}
#endif`);
 };
 return material;
}
