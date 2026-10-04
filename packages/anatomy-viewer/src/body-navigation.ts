import * as THREE from 'three';
import type { CameraPose } from './scene-history';

export type NavigationAction = 'left'|'right'|'up'|'down'|'rotate-left'|'rotate-right'|'rotate-up'|'rotate-down'|'in'|'out'|'frame'|'scope'|'help'|'close';
export function navigationAction(key:string, shift=false, modified=false): NavigationAction|null {
 if(modified)return null;
 const arrows:Record<string,string>={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
 if(arrows[key])return `${shift?'rotate-':''}${arrows[key]}` as NavigationAction;
 return ({'+':'in','=':'in','-':'out',f:'frame',F:'frame',Home:'scope','?':'help',Escape:'close'} as Record<string,NavigationAction>)[key]??null;
}
/** Keyboard navigation uses the current target, including any preceding pan. */
export function navigateCamera(pose:CameraPose, action:NavigationAction):CameraPose {
 const position=new THREE.Vector3(...pose.position),target=new THREE.Vector3(...pose.target),offset=position.clone().sub(target);
 const distance=offset.length();
 if(!Number.isFinite(distance)||distance===0)return pose;
 if(action==='in'||action==='out'){
  offset.setLength(THREE.MathUtils.clamp(distance*(action==='in'?.8:1.25),.025,8));
  position.copy(target).add(offset);
 }else if(action.startsWith('rotate-')){
  const spherical=new THREE.Spherical().setFromVector3(offset);
  if(action==='rotate-left')spherical.theta-=.08;
  if(action==='rotate-right')spherical.theta+=.08;
  if(action==='rotate-up')spherical.phi-=.08;
  if(action==='rotate-down')spherical.phi+=.08;
  spherical.makeSafe();position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
 }else if(['left','right','up','down'].includes(action)){
  const right=new THREE.Vector3(0,1,0).cross(offset).normalize();
  const up=offset.clone().cross(right).normalize();
  const delta=(action==='left'||action==='right'?right:up).multiplyScalar(distance*.045*(action==='left'||action==='down'?-1:1));
  position.add(delta);target.add(delta);
 }
 return {position:position.toArray(),target:target.toArray()};
}

export type WheelNavigation = {deltaX:number;deltaY:number;deltaMode:number;ctrlKey:boolean;metaKey:boolean;shiftKey:boolean};
/** Wheel events cannot reliably identify hardware. Modifiers, not device guesses, select intent. */
export function wheelIntent(event:WheelNavigation):'pan'|'rotate'|'zoom' {
 return event.ctrlKey||event.metaKey?'zoom':event.shiftKey?'rotate':'pan';
}
/** Screen-plane movement preserves the current target and zoom anchor after arbitrary panning. */
export function navigateWheel(pose:CameraPose,event:WheelNavigation,width:number,height:number,x:number,y:number):CameraPose {
 if(![width,height,x,y,event.deltaX,event.deltaY,...pose.position,...pose.target].every(Number.isFinite)||width<=0||height<=0)return pose;
 const scale=event.deltaMode===1?16:event.deltaMode===2?height:1;
 const dx=THREE.MathUtils.clamp(event.deltaX*scale,-500,500),dy=THREE.MathUtils.clamp(event.deltaY*scale,-500,500);
 if(!dx&&!dy)return pose;
 const position=new THREE.Vector3(...pose.position),target=new THREE.Vector3(...pose.target),offset=position.clone().sub(target),distance=offset.length();
 if(distance<=0)return pose;
 const right=new THREE.Vector3(0,1,0).cross(offset).normalize(),up=offset.clone().cross(right).normalize();
 const halfHeight=distance*Math.tan(THREE.MathUtils.degToRad(36/2)),intent=wheelIntent(event);
 if(intent==='pan'){
  const delta=right.multiplyScalar(dx*2*halfHeight/height).add(up.multiplyScalar(-dy*2*halfHeight/height));position.add(delta);target.add(delta);
 }else if(intent==='rotate'){
  const spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta-=dx*.005;spherical.phi-=dy*.005;spherical.makeSafe();position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
 }else{
  const nextDistance=THREE.MathUtils.clamp(distance*Math.exp(dy*.002),.025,8),ratio=nextDistance/distance;
  const anchor=right.multiplyScalar((x/width*2-1)*halfHeight*width/height).add(up.multiplyScalar((1-y/height*2)*halfHeight));
  target.addScaledVector(anchor,1-ratio);position.copy(target).add(offset.multiplyScalar(ratio));
 }
 return {position:position.toArray(),target:target.toArray()};
}
