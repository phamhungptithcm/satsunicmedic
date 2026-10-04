"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { sceneSections, sectionPlanes } from "./body-sections";
import { loadAnatomyChunk, disposeAnatomyModel as disposeModel } from "./anatomy-model-loader";
import { requiredChunks, sceneSourceIds, sceneBounds, selectionBounds, selectionIds, visibleSource, type BodyCatalog, type BodyScene, type CameraPose } from "./scene-history";

import { navigationAction, navigateCamera, navigateWheel } from "./body-navigation";

type Props = { catalog: BodyCatalog; scene: BodyScene; active: boolean; interacting?: boolean; retry: number; label: string;
 retainedChunks?:readonly string[]; mode?:'rotate'|'pan'; onInspect?:(id:string)=>void; onNearby?:(id:string)=>void; onFrame?:(selected:boolean)=>void; onHelp?:()=>void; onCloseHelp?:()=>void;
 onSelect: (id:string)=>void; onCamera: (pose:CameraPose, gesture:boolean)=>void;
 onProgress?:(progress:{loaded:number;total:number})=>void;
 onStatus:(status:'loading'|'ready'|'error')=>void; onChunks:(status:'loading'|'ready'|'error')=>void };

export default function FullBodyCanvas(props:Props) {
 const host=useRef<HTMLDivElement>(null), label=useRef<HTMLDivElement>(null), current=useRef(props), update=useRef<(()=>void)|null>(null);
 useEffect(()=>{
  const before=current.current;current.current=props;
  // Progress-only parent renders must not traverse every mesh again.
  if(before.scene!==props.scene||before.active!==props.active||before.retry!==props.retry||before.mode!==props.mode||before.interacting!==props.interacting||before.label!==props.label||JSON.stringify(before.retainedChunks)!==JSON.stringify(props.retainedChunks))update.current?.();
 },[props]);
 const [card,setCard]=useState<string|null>(null);
 const cardTarget=useRef<string|null>(null);
 const dismiss=()=>{cardTarget.current=null;setCard(null);};
 const catalog=props.catalog;
 useEffect(()=>{
  const container=host.current;if(!container)return;
  const lifecycle=new AbortController();let renderFrame=0,progressFrame=0;const downloaded=new Map<string,number>();let stopped=false, frame=0, dampingFrame=0, updatingControls=false, pendingGesture=false, lastDampingTime=0, settleDeadline=0, retry=current.current.retry;
  const narrow=matchMedia('(pointer:coarse)'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let wheelTimer:ReturnType<typeof setTimeout>|undefined;
  const finishWheel=()=>{if(wheelTimer!==undefined){clearTimeout(wheelTimer);wheelTimer=undefined;if(!stopped&&current.current.active&&controls){syncInput();current.current.onCamera(pose(),true);}}};
  const cancelWheel=()=>{clearTimeout(wheelTimer);wheelTimer=undefined;};
  const models=new Map<string,THREE.Group>(), pending=new Map<string,AbortController>(), failed=new Set<string>();
  const closeCard=()=>{if(cardTarget.current){cardTarget.current=null;setCard(null);}};
  const scene=new THREE.Scene();let renderer:THREE.WebGLRenderer|undefined,controls:OrbitControls|undefined,observer:ResizeObserver|undefined;
  const camera=new THREE.PerspectiveCamera(36,1,.003,30);const outline=new THREE.Group();scene.add(outline);
  let previous=current.current.scene, selectedKey='', scripted=false, hasSized=false;
  const syncInput=()=>{if(stopped||!controls||!renderer)return;controls.enabled=current.current.active&&(!narrow.matches||!!current.current.interacting);controls.enableDamping=!reducedMotion.matches&&!scripted;renderer.domElement.style.touchAction=controls.enabled?'none':'pan-y pinch-zoom';controls.mouseButtons.LEFT=current.current.mode==='pan'?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=THREE.MOUSE.ROTATE;controls.touches.ONE=current.current.mode==='pan'?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE;renderer.domElement.style.cursor=controls.enabled?(current.current.mode==='pan'?'move':'grab'):'auto';renderer.domElement.setAttribute('aria-label',controls.enabled?'Mô hình giải phẫu tương tác; phím mũi tên di chuyển, Shift và mũi tên xoay, F căn lựa chọn, Home căn vùng':'Mô hình giải phẫu; vuốt để cuộn trang, dùng nút Tương tác để điều khiển');};
  const settle=()=>{
   if(stopped||!current.current.active||scripted||dampingFrame)return;
   dampingFrame=requestAnimationFrame(now=>{
    dampingFrame=0;if(stopped||!current.current.active||scripted)return;
    const finish=pendingGesture&&now>=settleDeadline;
    controls!.dampingFactor=1-Math.exp(-Math.max(1,now-lastDampingTime)/65);lastDampingTime=now;
    if(finish)controls!.enableDamping=false;
    updatingControls=true;const changed=controls!.update();updatingControls=false;
    if(!finish&&changed&&controls!.enableDamping)settle();
    else if(pendingGesture){pendingGesture=false;syncInput();current.current.onCamera(pose(),true);}
   });
  };
  const clearOutline=()=>{for(const obj of [...outline.children]){outline.remove(obj);if(obj instanceof THREE.LineSegments){obj.geometry.dispose();(obj.material as THREE.Material).dispose();}}};
  const pose=():CameraPose=>({position:camera.position.toArray(),target:controls!.target.toArray()});
  const draw=()=>{if(stopped||!current.current.active)return;renderer?.render(scene,camera);
   if(label.current){const s=current.current.scene;label.current.hidden=(!s.labels&&!cardTarget.current)||!s.selected||(!s.inside&&s.selected!=='FJ2810')||!selectionIds(catalog,s.selected).some(id=>visibleSource(id,s)&&(id==='FJ2810'||sceneSourceIds(catalog,s).includes(id))&&models.has(catalog.structures[id]!.chunk));
    if(!label.current.hidden){const bounds=selectionBounds(catalog,s.selected!);const center=new THREE.Vector3(...bounds[0]).add(new THREE.Vector3(...bounds[1])).multiplyScalar(.5);center.project(camera);label.current.hidden=center.z>1||center.z< -1||Math.abs(center.x)>1||Math.abs(center.y)>1;
     const width=label.current.offsetWidth,height=label.current.offsetHeight,topInset=100;
     label.current.style.left=`${THREE.MathUtils.clamp((center.x+1)*.5*container.clientWidth+18,8,Math.max(8,container.clientWidth-width-8))}px`;
     label.current.style.top=`${THREE.MathUtils.clamp((1-center.y)*.5*container.clientHeight-height-16,topInset,Math.max(topInset,container.clientHeight-height-110))}px`;
    }
    if(label.current.hidden&&cardTarget.current)closeCard();
   }};
  const render=()=>{if(stopped||renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;draw();});};
  const progress=()=>{if(stopped||progressFrame)return;progressFrame=requestAnimationFrame(()=>{progressFrame=0;if(stopped)return;const keys=[...new Set(['skin',...requiredChunks(catalog,current.current.scene)])];let loaded=0,total=0;for(const key of keys){const bytes=catalog.assets[key]!.byteLength;total+=bytes;loaded+=models.has(key)?bytes:Math.min(bytes,downloaded.get(key)??0);}current.current.onProgress?.({loaded,total});});};
  const read=async(key:string,signal:AbortSignal)=>{
   const model=await loadAnatomyChunk(catalog,key,signal,(loaded)=>{downloaded.set(key,loaded);progress();});
   if(stopped){disposeModel(model);throw Error('Cancelled');}
   return model;
  };
  const move=(destination:CameraPose,smooth=true)=>{
   cancelWheel();
   cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;pendingGesture=false;scripted=true;
   controls!.enableDamping=false;controls!.update();
   const start=camera.position.clone(),target=controls!.target.clone(),time=performance.now();
   const step=(now:number)=>{if(stopped||!current.current.active)return;const t=!smooth||reducedMotion.matches?1:Math.min(1,(now-time)/380),ease=1-(1-t)**3;
    camera.position.lerpVectors(start,new THREE.Vector3(...destination.position),ease);controls!.target.lerpVectors(target,new THREE.Vector3(...destination.target),ease);if(!controls!.update())render();
    if(t<1)frame=requestAnimationFrame(step);else{scripted=false;syncInput();current.current.onCamera(pose(),false);}};
   frame=requestAnimationFrame(step);
  };
  const fit=(smooth=true)=>{const s=current.current.scene,b=sceneBounds(catalog,s),box=new THREE.Box3(new THREE.Vector3(...b[0]),new THREE.Vector3(...b[1])),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   const tangent=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),topPadding=100,bottomPadding=110;
   const usableHeight=Math.max(180,container.clientHeight-topPadding-bottomPadding);
   const framing=Math.max(s.focus==='all'?1.48:1.38,container.clientHeight/usableHeight);
   const distance=Math.max(.08,Math.max(size.y/tangent,size.x/camera.aspect/tangent)*framing+size.z/2);
   center.y+=(topPadding-bottomPadding)*tangent*distance/(2*container.clientHeight);
   const direction={front:[0,0,1],back:[0,0,-1],left:[1,0,0],right:[-1,0,0]}[s.view];
   move({position:center.clone().add(new THREE.Vector3(...direction).multiplyScalar(distance)).toArray(),target:center.toArray()},smooth);
  };
  const apply=()=>{
   progress();
   const s=current.current.scene,visible=new Set(sceneSourceIds(catalog,s)),selected=new Set(selectionIds(catalog,s.selected));
   const wanted=requiredChunks(catalog,s);const ready=wanted.every(k=>models.has(k));
   // Keep the surface while the first interior chunk is loading or failed.
   const anyInterior=[...visible].some(id=>models.has(catalog.structures[id]!.chunk));
   const b=selectionBounds(catalog,s.region);const planes=sectionPlanes(b,sceneSections(s)).map(p=>new THREE.Plane(new THREE.Vector3(...p.normal),p.constant));
   for(const [key,model]of models)model.traverse(obj=>{if(!(obj instanceof THREE.Mesh))return;const id=obj.userData.sourceId as string;
    obj.visible=key==='skin'?visibleSource(id,s)&&(!s.inside||s.skinOpacity>0||!anyInterior):visible.has(id);
    for(const material of Array.isArray(obj.material)?obj.material:[obj.material]){const opacity=key==='skin'?(!s.inside||!anyInterior?1:s.skinOpacity)*(s.opacity[id]??1):(s.opacity[id]??catalog.structures[id]!.defaultOpacity);const clipping=key==='skin'?[]:planes;const recompile=material.transparent!==(opacity<1)||(material.clippingPlanes?.length??0)!==clipping.length;material.opacity=opacity;material.transparent=opacity<1;material.depthWrite=opacity>=1;material.clippingPlanes=clipping;if(recompile)material.needsUpdate=true;}
   });
   const signature=JSON.stringify([s.selected,s.inside,s.hidden,s.isolate,s.opacity,s.region,[...models.keys()].filter(key=>catalog.assets[key]!.sourceIds.some(id=>selected.has(id)))]);
   if(signature!==selectedKey){selectedKey=signature;clearOutline();for(const model of models.values())model.traverse(obj=>{if(!(obj instanceof THREE.Mesh)||!obj.visible||!selected.has(obj.userData.sourceId as string))return;
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(obj.geometry,35),new THREE.LineBasicMaterial({color:'#e8f0ff',transparent:true,opacity:.75,clippingPlanes:planes,depthTest:true}));edges.matrix.copy(obj.matrixWorld);edges.matrixAutoUpdate=false;outline.add(edges);});}
   // Moving a plane changes uniforms, not edge geometry. Reuse the selection outline.
   for(const edge of outline.children){const material=(edge as THREE.LineSegments).material as THREE.LineBasicMaterial;const recompile=(material.clippingPlanes?.length??0)!==planes.length;material.clippingPlanes=planes;if(recompile)material.needsUpdate=true;}
   if(s.inside)current.current.onChunks(wanted.some(k=>failed.has(k))?'error':ready?'ready':'loading');
   render();
  };
  const reconcile=()=>{
   const wanted=new Set(requiredChunks(catalog,current.current.scene));
   // Keep only the active scope and the single return view; never prefetch retained keys.
   const retained=new Set(current.current.retainedChunks??[]);
   for(const [key,model] of models)if(key!=='skin'&&!wanted.has(key)&&!retained.has(key)){scene.remove(model);disposeModel(model);models.delete(key);downloaded.delete(key);}
   for(const [key,request]of pending)if(!wanted.has(key)&&!retained.has(key)&&key!=='skin'){request.abort();pending.delete(key);downloaded.delete(key);}
   // Two bounded downloads/decode jobs at a time. Error is latched until explicit retry.
   for(const key of wanted){if(pending.size>=2)break;if(models.has(key)||pending.has(key)||failed.has(key))continue;
    const request=new AbortController();pending.set(key,request);const timer=setTimeout(()=>request.abort(),45000);
    void read(key,request.signal).then(model=>{if(stopped||(!requiredChunks(catalog,current.current.scene).includes(key)&&!current.current.retainedChunks?.includes(key))){disposeModel(model);return;}models.set(key,model);scene.add(model);}).catch(()=>{if(!stopped&&pending.get(key)===request)failed.add(key);}).finally(()=>{clearTimeout(timer);if(pending.get(key)===request)pending.delete(key);if(!stopped){reconcile();}});
   }
   apply();
  };
  current.current.onStatus('loading');
  const skinRequest=new AbortController();pending.set('skin',skinRequest);const skinTimer=setTimeout(()=>skinRequest.abort(),45000);
  void read('skin',skinRequest.signal).then(model=>{
   clearTimeout(skinTimer);pending.delete('skin');models.set('skin',model);scene.add(model);
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.localClippingEnabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
   const canvas=renderer.domElement;canvas.style.touchAction='none';canvas.style.cursor='grab';canvas.tabIndex=0;canvas.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown + - F Home Escape');canvas.setAttribute('aria-label','Mô hình giải phẫu tương tác; phím mũi tên di chuyển, Shift và mũi tên xoay, F căn lựa chọn, Home căn vùng');container.append(canvas);
   scene.add(new THREE.HemisphereLight('#edf3ff','#39414a',1.65));const key=new THREE.DirectionalLight('#fff0dd',2.6);key.position.set(-2,3,4);scene.add(key);const rim=new THREE.DirectionalLight('#c6ddff',2);rim.position.set(2,2,-3);scene.add(rim);const fill=new THREE.DirectionalLight('#fff1ea',.75);fill.position.set(2,0,3);scene.add(fill);
   canvas.addEventListener('wheel',e=>{
    // Leave ordinary page scrolling alone until the model owns focus.
    e.stopImmediatePropagation();
    if(!controls?.enabled||(!e.ctrlKey&&!e.metaKey&&document.activeElement!==canvas))return;
    if(!e.deltaX&&!e.deltaY)return;
    e.preventDefault();canvas.focus({preventScroll:true});closeCard();
    cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;pendingGesture=false;scripted=false;
    controls.enableDamping=false;updatingControls=true;controls.update();updatingControls=false;
    const rect=canvas.getBoundingClientRect(),next=navigateWheel(pose(),e,rect.width,rect.height,e.clientX-rect.left,e.clientY-rect.top);
    camera.position.fromArray(next.position);controls.target.fromArray(next.target);updatingControls=true;const changed=controls.update();updatingControls=false;if(!changed)render();
    clearTimeout(wheelTimer);wheelTimer=setTimeout(finishWheel,180);
   },{capture:true,passive:false,signal:lifecycle.signal});
   canvas.addEventListener('pointerdown',finishWheel,{capture:true,signal:lifecycle.signal});
   controls=new OrbitControls(camera,canvas);controls.zoomToCursor=true;controls.screenSpacePanning=true;controls.minDistance=.025;controls.maxDistance=8;controls.dampingFactor=.16;syncInput();
   controls.addEventListener('change',()=>{render();if(!updatingControls&&!scripted)settle();});
   controls.addEventListener('start',()=>{closeCard();cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;pendingGesture=false;scripted=false;lastDampingTime=performance.now();controls!.dampingFactor=.16;syncInput();});
   controls.addEventListener('end',()=>{if(!scripted){pendingGesture=true;settleDeadline=performance.now()+300;settle();}});
   const preferenceChanged=()=>{if(stopped)return;syncInput();if(!scripted){controls!.update();render();}};
   narrow.addEventListener('change',preferenceChanged,{signal:lifecycle.signal});reducedMotion.addEventListener('change',preferenceChanged,{signal:lifecycle.signal});
   observer=new ResizeObserver(()=>{if(stopped||!current.current.active||!container.clientWidth||!container.clientHeight)return;renderer!.setSize(container.clientWidth,container.clientHeight);const oldAspect=camera.aspect;camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();if(hasSized&&camera.aspect<oldAspect){cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;pendingGesture=false;scripted=false;syncInput();const offset=camera.position.clone().sub(controls!.target);offset.multiplyScalar(oldAspect/camera.aspect);camera.position.copy(controls!.target).add(offset);controls!.update();current.current.onCamera(pose(),false);}if(!hasSized){hasSized=true;if(current.current.scene.camera)move(current.current.scene.camera,false);else fit(false);}else render();});observer.observe(container);
   let keyGesture=false;
   const finishKeys=()=>{if(keyGesture){keyGesture=false;current.current.onCamera(pose(),true);}};
   canvas.addEventListener('keydown',e=>{
    if(e.target!==canvas||!controls!.enabled||e.altKey)return;
    const action=navigationAction(e.key,e.shiftKey,e.ctrlKey||e.metaKey);if(!action)return;
    e.preventDefault();finishWheel();closeCard();
    if(action==='close'){current.current.onCloseHelp?.();canvas.blur();return;}
    if(action==='help'){current.current.onHelp?.();return;}
    if(action==='frame'||action==='scope'){finishKeys();current.current.onFrame?.(action==='frame');return;}
    cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;pendingGesture=false;scripted=false;
    controls!.enableDamping=false;controls!.update();
    const next=navigateCamera(pose(),action);keyGesture=true;
    camera.position.fromArray(next.position);controls!.target.fromArray(next.target);updatingControls=true;const changed=controls!.update();updatingControls=false;if(!changed)render();
   },{signal:lifecycle.signal});
   canvas.addEventListener('keyup',finishKeys,{signal:lifecycle.signal});
   canvas.addEventListener('blur',()=>{finishKeys();finishWheel();syncInput();},{signal:lifecycle.signal});
   document.addEventListener('pointerdown',e=>{if(label.current&&!label.current.contains(e.target as Node))closeCard();},{signal:lifecycle.signal});
   let down:{x:number;y:number;id:number}|null=null;const raycaster=new THREE.Raycaster();
   canvas.addEventListener('pointerdown',e=>{finishKeys();canvas.focus({preventScroll:true});down=controls!.enabled&&e.isPrimary&&e.button===0&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;},{signal:lifecycle.signal});
   canvas.addEventListener('pointercancel',()=>{down=null;},{signal:lifecycle.signal});
   canvas.addEventListener('pointerup',e=>{const start=down;down=null;if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)return;
    const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
    const objects:THREE.Mesh[]=[];for(const [key,model]of models){if(key==='skin'&&current.current.scene.inside&&current.current.scene.skinOpacity<.5)continue;model.traverseVisible(o=>{if(o instanceof THREE.Mesh&&visibleSource(o.userData.sourceId as string,current.current.scene))objects.push(o);});}
    const hit=raycaster.intersectObjects(objects,false).find(h=>{const mesh=h.object as THREE.Mesh;return(Array.isArray(mesh.material)?mesh.material:[mesh.material]).every(m=>m.opacity>0&&!m.clippingPlanes?.some(p=>p.distanceToPoint(h.point)<0));});
    if(hit){const id=hit.object.userData.sourceId as string;current.current.onSelect(id);cardTarget.current=id;setCard(id);}else closeCard();
   },{signal:lifecycle.signal});
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stopped=true;cancelAnimationFrame(renderFrame);cancelAnimationFrame(progressFrame);cancelWheel();cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;controls!.enabled=false;update.current=null;closeCard();current.current.onStatus('error');},{signal:lifecycle.signal});
   update.current=()=>{const p=current.current,s=p.scene;if((s.region!==previous.region&&s.selected!==cardTarget.current)||s.focusRevision!==previous.focusRevision||s.selected!==cardTarget.current||!p.active)closeCard();syncInput();if(!p.active){cancelWheel();cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);dampingFrame=0;pendingGesture=false;scripted=false;return;}
    if(retry!==p.retry){retry=p.retry;failed.clear();}
    if(s.camera&&JSON.stringify(s.camera)!==JSON.stringify(previous.camera)&&JSON.stringify(s.camera)!==JSON.stringify(pose()))move(s.camera);else if(s.focusRevision!==previous.focusRevision&&!s.camera)fit();else if(s.zoom!==previous.zoom&&!s.camera){const offset=camera.position.clone().sub(controls!.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*Math.pow(.8,s.zoom-previous.zoom),.025,8));move({position:controls!.target.clone().add(offset).toArray(),target:controls!.target.toArray()});}
    previous=s;reconcile();};
   update.current();current.current.onStatus('ready');
  }).catch(()=>{if(!stopped)current.current.onStatus('error');}).finally(()=>clearTimeout(skinTimer));
  return()=>{stopped=true;cancelAnimationFrame(renderFrame);cancelAnimationFrame(progressFrame);cancelWheel();lifecycle.abort();for(const request of pending.values())request.abort();cancelAnimationFrame(frame);cancelAnimationFrame(dampingFrame);update.current=null;observer?.disconnect();controls?.dispose();clearOutline();for(const model of models.values())disposeModel(model);renderer?.dispose();renderer?.domElement.remove();};
 },[catalog]);
 return <><div ref={host} style={{position:'absolute',inset:0}}/><div ref={label} hidden role="group" aria-label={`Lựa chọn xem ${props.label}`} data-body-card={card&&card===props.scene.selected?'open':undefined} style={{position:'absolute',pointerEvents:card?'auto':'none',width:card?208:undefined,maxWidth:'calc(100% - 16px)',padding:4,borderRadius:9,background:'#25282cf5',border:'1px solid #b7c0ce26',boxShadow:'0 4px 16px #0003',color:'#f3f6fc',fontSize:11,zIndex:4,overflowWrap:'anywhere'}} onKeyDown={e=>{if(e.key==='Escape'){dismiss();host.current?.querySelector('canvas')?.focus();e.stopPropagation();}}}>
 <div data-body-card-heading style={{display:'flex',alignItems:'center',gap:8}}><strong style={{flex:1,paddingLeft:6,lineHeight:1.4,fontWeight:500}}>{props.label}</strong>
 {card===props.scene.selected&&card&&<button aria-label="Đóng lựa chọn xem" onClick={()=>{dismiss();host.current?.querySelector('canvas')?.focus();}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>}</div>
 {card===props.scene.selected&&card&&<div data-body-card-actions style={{display:'flex',gap:6,paddingTop:6}}><button aria-label="Xem riêng" title="Xem riêng" onClick={()=>{props.onInspect?.(card);dismiss();host.current?.querySelector('canvas')?.focus();}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/><circle cx="12" cy="12" r="3"/></svg></button><button aria-label="Xem lân cận" title="Xem lân cận" onClick={()=>{props.onNearby?.(card);dismiss();host.current?.querySelector('canvas')?.focus();}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></svg></button></div>}
 </div></>;
}
