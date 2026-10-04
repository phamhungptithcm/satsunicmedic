"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import {bodySceneSchema} from '@hs/contracts';
import type { HeartBinding, LearningScenario } from '@hs/contracts';
import { ArrowLeft, Focus, Layers, RotateCcw, ChevronRight, Search, Eye, EyeOff, Undo2, Redo2, Scan, Activity, X, Tag, Plus, Minus, Move, Rotate3D, MoreHorizontal, CircleHelp, ChevronDown, Check, ChevronLeft, PersonStanding, BicepsFlexed, Network } from "lucide-react";
import { fullBodyAnatomy as model } from "../lib/full-body-anatomy";
import { bodyLabel, searchBody, activityBinding, bodyPage, bodyChildren, bodyCoverage, type BodyBrowseKind, type BodyClassification } from '../lib/body-explorer';
import { inspectBodyStructure, viewBodyScope, nearbyBodyStructure, pickBodyStructure, setBodyMusclesHidden } from '../lib/body-explorer-ux';
import { commitScene, requiredChunks, scopeSourceIds, replaceScene, undoScene, redoScene, initialBodyScene, selectionIds, type BodyScene, type SceneHistory, type CameraPose } from '@hs/anatomy-viewer/scene-history';
import {functionsForStructure} from "../lib/anatomy-functions";
import AnatomyFunctionGuide from "./anatomy-function-guide";
import BodySectionControls from './body-section-controls';
import StructureInfo from './structure-info';
import Loading from "./loading";
import styles from "./full-body-anatomy.module.css";
const Canvas = dynamic(() => import("@hs/anatomy-viewer/full-body-canvas"), { ssr: false });
const ActivityPanel=dynamic(()=>import('./pathophysiology-panel'),{loading:()=> <Loading label="Đang mở hoạt động"/>});
export default function FullBodyAnatomy({binding,scenario,initialStructure,initialScene,onCapture,embedded=false}:{binding:HeartBinding;scenario:LearningScenario;initialStructure?:string;initialScene?:BodyScene;onCapture?:(scene:BodyScene)=>void;embedded?:boolean}) {
 const [history,setHistory]=useState<SceneHistory>(()=>({past:[],present:initialScene?bodySceneSchema.parse(initialScene):initialStructure&&selectionIds(model,initialStructure).length?inspectBodyStructure(model,initialBodyScene(),initialStructure):initialBodyScene(),future:[]}));const scene=history.present;
 const query=scene.query??'', system=scene.system??'', searchRegion=scene.region;
 const [browseKind,setBrowseKind]=useState<BodyBrowseKind>('concepts');
 const [classification,setClassification]=useState<BodyClassification>('');
 const [branch,setBranch]=useState<string[]>([]);
 const [pagination,setPagination]=useState({key:'',index:0});
 const resultsRef=useRef<HTMLDivElement>(null);
 const [returnView,setReturnView]=useState<BodyScene|null>(null);
 const [mode,setMode]=useState<'rotate'|'pan'>('pan'),[help,setHelp]=useState(false),[notice,setNotice]=useState('');
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading'),[chunkStatus,setChunkStatus]=useState<'loading'|'ready'|'error'>('ready');
 const [attempt,setAttempt]=useState(0),[retry,setRetry]=useState(0),[activity,setActivity]=useState<string|null>(null);
 const [mobilePanel,setMobilePanel]=useState<'search'|'tools'>('search'),[interacting,setInteracting]=useState(false);
 const moreRef=useRef<HTMLDetailsElement>(null);
 const closeHelp=()=>{setHelp(false);moreRef.current?.querySelector('summary')?.focus();};
 const stageRef=useRef<HTMLElement>(null),selectionHeading=useRef<HTMLHeadingElement>(null);
 const activityButton=useRef<HTMLButtonElement>(null),sliderStart=useRef<BodyScene|null>(null);
 const change=useCallback((patch:Partial<BodyScene>)=>setHistory(h=>commitScene(h,{...h.present,...patch})),[]);
 const select=useCallback((id:string)=>setHistory(h=>commitScene(h,pickBodyStructure(model,h.present,id))),[]);
 const camera=useCallback((pose:CameraPose,gesture:boolean)=>setHistory(h=>gesture?commitScene(h,{...h.present,camera:pose}):replaceScene(h,{...h.present,camera:pose})),[]);
 const setQuery=(query:string)=>{setPagination({key:'',index:0});setBranch([]);setHistory(h=>replaceScene(h,{...h.present,query}));};
 const choose=(region:string,requestedSystem=system)=>{
  setPagination({key:'',index:0});
  setBranch([]);
  setReturnView(null);
  const next=viewBodyScope(model,scene,region,requestedSystem);
  setNotice(requestedSystem&&next.system!==requestedSystem?'Đã chuyển sang tất cả hệ trong vùng này.':'');
  setHistory(h=>commitScene(h,viewBodyScope(model,h.present,region,requestedSystem)));
 };
 const focus=(id:string)=>{if(!selectionIds(model,id).some(source=>model.structures[source]!.regions.length)){setNotice('Chưa có phân vùng đủ tin cậy để xem lân cận cấu trúc này.');return;}setReturnView(structuredClone(scene));setHistory(h=>commitScene(h,nearbyBodyStructure(model,h.present,id)));};
 const goBack=()=>{if(!returnView)return;const previous=returnView;setReturnView(null);setNotice('');setHistory(h=>commitScene(h,{...previous,focusRevision:h.present.focusRevision+1}));requestAnimationFrame(()=>stageRef.current?.querySelector('canvas')?.focus({preventScroll:true}));};
 const frame=(selected=true)=>setHistory(h=>commitScene(h,{...h.present,focus:selected&&h.present.selected?h.present.selected:'@scope',focusRevision:h.present.focusRevision+1,camera:null}));
 const showModel=()=>stageRef.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 const inspect=(id:string)=>{setReturnView(structuredClone(scene));setNotice('');setHistory(h=>commitScene(h,inspectBodyStructure(model,h.present,id)));if(matchMedia('(max-width:650px)').matches)showModel();};
 const selectFromList=(id:string)=>inspect(id);
 const whole=()=>{setPagination({key:'',index:0});setBranch([]);setClassification('');setBrowseKind('concepts');setReturnView(null);setNotice('');setHistory(h=>commitScene(h,{...initialBodyScene(),focusRevision:h.present.focusRevision+1}));};
 const selectedIds=useMemo(()=>selectionIds(model,scene.selected),[scene.selected]);
 const muscleIds=model.systems.FMA5022?.sourceIds??[];
 const musclesHidden=muscleIds.length>0&&muscleIds.every(id=>scene.hidden.includes(id));
 const hidden=selectedIds.length>0&&selectedIds.every(id=>scene.hidden.includes(id));
 const parent=branch.at(-1)??null;
 const entries=useMemo(()=>searchBody(query,searchRegion,system,browseKind,parent,classification),[query,searchRegion,system,browseKind,parent,classification]);
 const pageKey=JSON.stringify([query,searchRegion,system,browseKind,parent,classification]);
 const page=bodyPage(entries,pagination.key===pageKey?pagination.index:0);
 const turnPage=(index:number)=>{setPagination({key:pageKey,index});resultsRef.current?.scrollTo({top:0});};
 const drill=(id:string)=>{setPagination({key:'',index:0});setBranch(path=>[...path,id]);setHistory(h=>replaceScene(h,{...h.present,query:''}));};
 const changeBrowse=(kind:BodyBrowseKind)=>{setPagination({key:'',index:0});setBrowseKind(kind);setBranch([]);setClassification('');};
 const transparent=selectedIds.length>0&&selectedIds.every(id=>(scene.opacity[id]??model.structures[id]!.defaultOpacity)<=0);
 const currentView=!scene.inside?'Bề mặt cơ thể':scene.selected?bodyLabel(scene.selected):`${model.regions[scene.region]?.label??'Toàn thân'} · ${model.systems[system]?.label??'Tất cả hệ'}`;
 const boundActivity=embedded?null:activityBinding(scene.selected,binding);
 const adjust=(patch:Partial<BodyScene>)=>setHistory(h=>replaceScene(h,{...h.present,...patch}));
 const beginSlider=()=>{sliderStart.current??=structuredClone(scene);};
 const endSlider=()=>{const baseline=sliderStart.current;sliderStart.current=null;if(baseline)setHistory(h=>commitScene({...h,present:baseline},h.present));};
 const sliderEvents={onPointerDown:beginSlider,onPointerUp:endSlider,onPointerCancel:endSlider,onKeyDown:beginSlider,onKeyUp:endSlider,onBlur:endSlider};
 const reveal=()=>change({inside:true,skinOpacity:.12});
 const Container=embedded?'section':'main';
 return <Container id={embedded?undefined:"main"} aria-label={embedded?"Atlas giải phẫu":undefined} className={`${styles.page} ${embedded?styles.embedded:""}`}>
  {onCapture&&<button onClick={()=>onCapture(structuredClone(scene))}>Dùng góc nhìn này trong bài giảng</button>}
  {!embedded&&<div className={styles.heading}><div><p>GIẢI PHẪU TƯƠNG TÁC</p><h1>Cơ thể người, từ toàn cảnh đến chi tiết.</h1></div><span className={styles.headingHint}>Chọn để xem · Kéo để khám phá</span></div>}
  {activity&&<section className={styles.activity}><button className={styles.back} onClick={()=>{setActivity(null);requestAnimationFrame(()=>activityButton.current?.focus());}}><ArrowLeft size={17}/> Trở về cấu trúc đang xem</button><p>Cơ chế mạch vành · Minh họa định tính theo thời gian</p><ActivityPanel key={activity} scenario={scenario} binding={binding} initialStructure={scene.selected??activity} initialScene={scene} embedded/></section>}
  <div className={styles.workspace} hidden={!!activity} data-mobile-panel={mobilePanel}>
   <div className={styles.mobilePanels} aria-label="Bảng công cụ">
    <button aria-pressed={mobilePanel==='search'} aria-controls="body-search-panel" onClick={()=>setMobilePanel('search')}><Search size={16}/>Tìm cấu trúc</button>
    <button aria-pressed={mobilePanel==='tools'} aria-controls="body-tools-panel" onClick={()=>setMobilePanel('tools')}><Layers size={16}/>Công cụ{scene.selected&&<span className={styles.selectionDot} aria-label="Có cấu trúc đang chọn"/>}</button>
   </div>
   <aside id="body-search-panel" className={styles.sidebar} aria-label="Tìm và chọn cấu trúc">
    <h2 className={styles.searchTitle}>Khám phá cơ thể</h2>
    <label className={styles.search}><Search size={16}/><span className={styles.srOnly}>Tìm cấu trúc Việt hoặc Anh</span><input aria-label="Tìm cấu trúc Việt hoặc Anh" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tim, não, xương…"/>{query&&<button aria-label="Xóa tìm kiếm" onClick={()=>setQuery('')}><X size={14}/></button>}</label>
    {browseKind!=='gaps'&&<details className={styles.browseFilters}>
     <summary>Lọc theo vùng, hệ<ChevronDown size={14}/></summary>
     <div className={styles.filterFields}>
      <label className={styles.field}>Vùng cơ thể<select aria-label="Vùng cơ thể" value={searchRegion} onChange={e=>choose(e.target.value)}><option value="all">Toàn thân</option>{Object.entries(model.regions).map(([id,r])=><option key={id} value={id}>{r.label}</option>)}</select></label>
      <label className={styles.field}>Hệ và nhóm<select aria-label="Hệ và nhóm" value={system} onChange={e=>choose(searchRegion,e.target.value)}><option value="">Tất cả hệ</option>{Object.entries(model.systems).filter(([id])=>scopeSourceIds(model,searchRegion,id).length>0).map(([id,s])=><option key={id} value={id}>{s.label}</option>)}</select></label>
     </div>
    </details>}
    {(searchRegion!=='all'||system||classification||browseKind!=='concepts')&&<div className={styles.activeFilters}>
     <span>{browseKind==='gaps'?'Phần cần bổ sung':[
      browseKind==='parts'?'Từng phần mô hình':null,
      searchRegion!=='all'?model.regions[searchRegion]?.label:null,
      system?model.systems[system]?.label:null,
      classification==='no-region'?'Chưa gán vùng':classification==='no-system'?'Chưa gán hệ':null
     ].filter(Boolean).join(' · ')}</span>
     <button onClick={()=>{changeBrowse('concepts');choose('all','');}} aria-label="Bỏ tất cả bộ lọc">Bỏ lọc<X size={12}/></button>
    </div>}
    {browseKind==='gaps'&&<p className={styles.coverageNote}>Đối chiếu với nguồn IS-A của BodyParts3D. Ngoài nguồn này, vẫn cần bổ sung mẫu nữ, mô học và vi thể; chưa có danh mục chuẩn đầy đủ để nghiệm thu toàn bộ cơ thể.</p>}
    {parent&&<nav className={styles.branch} aria-label="Các phần của cấu trúc"><button onClick={()=>setBranch(path=>path.slice(0,-1))}><ArrowLeft size={14}/> Lên một cấp</button><span>{bodyLabel(parent)}</span></nav>}
    <div className={styles.listHeading}><span>{parent?'Các phần của bộ phận này':query?'Kết quả tìm kiếm':'Chọn bộ phận để khám phá'}</span></div>
    <p className={styles.resultCount} role="status">{page.total?`${page.start}–${page.end} / ${page.total.toLocaleString('vi-VN')} mục`:'Không có kết quả'}</p>
    <div ref={resultsRef} id="anatomy-results" className={styles.results}>{page.entries.map(entry=>browseKind==='gaps'?<div key={entry.id} className={styles.gapRow}><span lang="en">{entry.name}</span><small>{'availableCount' in entry&&Number(entry.availableCount)>0?`Đã có ${entry.availableCount} phần; còn thiếu ${entry.count} phần mô hình.`:`Chưa có mô hình · ${entry.count} phần nguồn cần bổ sung.`}</small></div>:<div key={entry.id} className={styles.catalogRow}><button aria-pressed={scene.selected===entry.id} onClick={()=>selectFromList(entry.id)}><span>{entry.label}{entry.label!==entry.name&&<small lang="en">{entry.name}</small>}{browseKind==='parts'&&<small>{entry.id}</small>}</span><ChevronRight size={14}/></button>{browseKind==='concepts'&&!!bodyChildren[entry.id]?.length&&<button className={styles.childButton} onClick={()=>drill(entry.id)} aria-label={`Các phần của ${entry.label}`} title={`Các phần của ${entry.label}`}><Network size={15} aria-hidden="true"/></button>}</div>)}{!entries.length&&<div className={styles.emptySearch}><p>{query?'Chưa tìm thấy cấu trúc phù hợp.':browseKind==='gaps'?'Không còn ID hình học bị thiếu so với nguồn IS-A đã đối chiếu.':'Chưa có cấu trúc trong bộ lọc này.'}</p><p className={styles.note}>{browseKind==='gaps'&&!query?'Đủ ID của nguồn không có nghĩa là đủ mọi bộ phận cơ thể. Phạm vi ngoài nguồn vẫn cần được mở rộng và thẩm định.':'Thử tên khác hoặc bỏ bộ lọc. Tên chuyên sâu có thể cần tiếng Anh.'}</p>{(searchRegion!=='all'||system||classification||parent)&&browseKind!=='gaps'&&<button onClick={()=>{setClassification('');choose('all','');}}>Bỏ bộ lọc</button>}{query&&<button onClick={()=>setQuery('')}>Xóa tìm kiếm</button>}</div>}</div>
    {page.pages>1&&<nav className={styles.pagination} aria-label="Trang danh mục"><button aria-label="Trang trước" title="Trang trước" aria-controls="anatomy-results" disabled={page.index===0} onClick={()=>turnPage(page.index-1)}><ChevronLeft size={16} aria-hidden="true"/></button><span>{page.index+1} / {page.pages}</span><button aria-label="Trang sau" title="Trang sau" aria-controls="anatomy-results" disabled={page.index===page.pages-1} onClick={()=>turnPage(page.index+1)}><ChevronRight size={16} aria-hidden="true"/></button></nav>}
    <p className={styles.scopeStatus} role="status">{status==='error'||(scene.inside&&chunkStatus==='error')?'Chưa tải đủ':status!=='ready'||(scene.inside&&chunkStatus!=='ready')?'Đang tải':'Đang xem'}: {currentView}{hidden?' · Đã ẩn':transparent?' · Độ rõ 0%':''}{scene.clipping!==null||Object.values(scene.sections??{}).some(Boolean)?' · Có mặt cắt':''}{notice&&<small> · {notice}</small>}</p>
    <details className={styles.advancedBrowse}>
     <summary>Tra cứu nâng cao</summary>
     <label className={styles.field}>Danh mục<select aria-label="Danh mục" value={browseKind} onChange={e=>changeBrowse(e.target.value as BodyBrowseKind)}><option value="concepts">Cấu trúc và nhóm</option><option value="parts">Từng phần mô hình</option><option value="gaps">Phần cần bổ sung</option></select></label>
     {browseKind!=='gaps'&&<label className={styles.field}>Phân loại theo nguồn<select aria-label="Phân loại theo nguồn" value={classification} onChange={e=>{setPagination({key:'',index:0});setClassification(e.target.value as BodyClassification);setBranch([]);}}><option value="">Tất cả</option><option value="no-region">Chưa được gán vùng</option><option value="no-system">Chưa được gán hệ</option></select></label>}
    </details>
    <details className={styles.coverage}><summary>Phạm vi mô hình hiện có</summary><p>{bodyCoverage.structures.toLocaleString('vi-VN')} phần mô hình, thuộc {bodyCoverage.concepts.toLocaleString('vi-VN')} khái niệm nguồn. Số phần không phải số cơ quan.</p><p>{bodyCoverage.missingSourceIds?`Còn ${bodyCoverage.missingSourceIds.toLocaleString('vi-VN')} phần nguồn IS-A chưa được tích hợp.`:'Đã tích hợp đủ ID hình học của nguồn IS-A đã đối chiếu.'} Chưa xác định tỷ lệ đầy đủ của toàn bộ cơ thể; mô và vi thể chưa được kiểm kê đầy đủ.</p><button onClick={()=>changeBrowse('gaps')}>Xem phần cần bổ sung</button></details>
    <button className={styles.modelJump} onClick={showModel}>Xem mô hình</button>
    <p className={styles.note}>Chọn cấu trúc để xem ngay trên mô hình. Trái và phải theo cơ thể người.</p>
   </aside>
   <section ref={stageRef} className={styles.stage} aria-label="Không gian mô hình toàn thân">
    <div className={styles.stageTop}><button onClick={whole}>Toàn thân</button>{scene.region!=='all'&&<><ChevronRight size={12}/><span>{model.regions[scene.region]?.label}</span></>}<span className={styles.source}>BodyParts3D</span></div>
    <Canvas key={attempt} catalog={model} scene={scene} retainedChunks={returnView?requiredChunks(model,returnView):[]} active={!activity} interacting={interacting} retry={retry} label={bodyLabel(scene.selected)} mode={mode} onInspect={inspect} onNearby={focus} onFrame={frame} onHelp={()=>setHelp(v=>!v)} onCloseHelp={()=>setHelp(false)} onSelect={select} onCamera={camera} onStatus={setStatus} onChunks={setChunkStatus}/>
    {status==='loading'&&<Loading label="Đang tải mô hình toàn thân" overlay dark/>}
    {status==='error'&&<div className={styles.overlay} role="alert"><Focus size={32}/><h2>Chưa tải được mô hình</h2><button onClick={()=>{setStatus('loading');setAttempt(a=>a+1);}}>Thử lại</button></div>}
    {scene.inside&&chunkStatus!=='ready'&&status==='ready'&&<div className={styles.loading} role={chunkStatus==='error'?'alert':'status'}>{chunkStatus==='loading'?<Loading label="Đang tải các cấu trúc cần xem" inline dark/>:<><span>Một số cấu trúc chưa tải được. Phần đã tải vẫn được giữ lại.</span><button onClick={()=>setRetry(r=>r+1)}>Tải lại phần còn thiếu</button></>}</div>}
    {!scene.inside&&status==='ready'&&<button className={styles.reveal} onClick={reveal} aria-label="Khám phá bên trong" title="Khám phá bên trong"><Layers size={22} strokeWidth={1.6} aria-hidden="true"/></button>}
    <button className={styles.interactionMode} aria-label={interacting?'Xong · Cuộn trang':'Tương tác với mô hình'} aria-pressed={interacting} disabled={status!=='ready'} onClick={()=>setInteracting(value=>!value)}>{interacting&&<Check size={14}/>} {interacting?'Xong':'Tương tác'}</button>
    {returnView&&<button className={styles.returnView} aria-label="Quay lại" onClick={goBack} title="Khôi phục góc nhìn trước khi xem chi tiết"><span className={styles.returnGlyph}><ArrowLeft size={15} strokeWidth={1.5}/></span></button>}
    <label className={styles.viewPicker}><Scan size={15}/><span className={styles.srOnly}>Góc nhìn chuẩn</span><select aria-label="Góc nhìn chuẩn" value={scene.view} onChange={e=>{const view=e.target.value as BodyScene['view'];setHistory(h=>commitScene(h,{...h.present,view,camera:null,focusRevision:h.present.focusRevision+1}));}}>{([['front','Trước'],['back','Sau'],['left','Trái'],['right','Phải']] as const).map(([view,text])=><option key={view} value={view}>{text}</option>)}</select><ChevronDown size={13}/></label>
    <div className={styles.controlDock} role="group" aria-label="Điều khiển mô hình">
      <div className={styles.navigationModes} aria-label="Thao tác chuột"><button title="Xoay" aria-label="Xoay" aria-pressed={mode==='rotate'} onClick={()=>{setMode('rotate');setInteracting(true);}}><Rotate3D size={18} aria-hidden="true"/></button><button title="Di chuyển" aria-label="Di chuyển" aria-pressed={mode==='pan'} onClick={()=>{setMode('pan');setInteracting(true);}}><Move size={18} aria-hidden="true"/></button></div>
      <div className={styles.zoomControls}><button aria-label="Thu nhỏ" title="Thu nhỏ" disabled={status!=='ready'} onClick={()=>change({zoom:scene.zoom-1,camera:null})}><Minus size={18}/></button><button aria-label="Phóng to" title="Phóng to" disabled={status!=='ready'} onClick={()=>change({zoom:scene.zoom+1,camera:null})}><Plus size={18}/></button></div>
      <button className={styles.dockIcon} title="Đưa vào khung nhìn" aria-label="Đưa vào khung nhìn" disabled={!scene.selected||status!=='ready'} onClick={()=>frame()}><Focus size={18}/></button>
      <details ref={moreRef} className={styles.moreControls} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))e.currentTarget.open=false;}} onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.open=false;e.currentTarget.querySelector('summary')?.focus();e.stopPropagation();}}}>
       <summary aria-label="Thêm điều khiển" title="Thêm điều khiển"><MoreHorizontal size={19}/></summary>
       <div className={styles.morePanel} onClick={e=>{const details=e.currentTarget.closest('details');if(details){details.open=false;details.querySelector('summary')?.focus();}}}>
        <button aria-label="Hoàn tác" disabled={!history.past.length} onClick={()=>setHistory(undoScene)}><Undo2 size={16}/>Hoàn tác</button>
        <button aria-label="Làm lại" disabled={!history.future.length} onClick={()=>setHistory(redoScene)}><Redo2 size={16}/>Làm lại</button>
        <button aria-label="Ẩn hoặc hiện nhãn" aria-pressed={scene.labels} onClick={()=>change({labels:!scene.labels})}><Tag size={16}/>{scene.labels?'Ẩn nhãn':'Hiện nhãn'}</button>
        <button aria-label="Về toàn thân" onClick={whole}><RotateCcw size={16}/>Về toàn thân</button>
        <button aria-expanded={help} aria-controls="body-navigation-help" onClick={()=>setHelp(v=>!v)}><CircleHelp size={16}/>Cách điều khiển</button>
       </div>
      </details>
    </div>
    {help&&<div id="body-navigation-help" className={styles.navigationHelp} onKeyDown={e=>{if(e.key==='Escape'){closeHelp();e.stopPropagation();}}}><button aria-label="Đóng hướng dẫn" onClick={closeHelp}><X size={18}/></button><h3>Di chuyển đến nơi muốn xem</h3><p>Mặc định, kéo chuột trái để di chuyển; giữ Shift để xoay. Kéo chuột phải để xoay. Hai nút Xoay / Di chuyển đổi thao tác kéo chuột trái.</p><p>Trackpad: bấm vào mô hình rồi vuốt hai ngón để di chuyển; giữ Shift và vuốt để xoay. Pinch hoặc giữ Ctrl / ⌘ và cuộn để phóng to tại con trỏ. Esc trả lại cuộn trang; ngoài mô hình, cuộn trang và zoom trình duyệt vẫn hoạt động.</p><p>Khi mô hình có tiêu điểm: phím mũi tên di chuyển; Shift + mũi tên xoay; + / − phóng to, thu nhỏ; F căn bộ phận đang chọn; Home căn vùng đang xem; Esc đóng menu và rời điều khiển; ? mở hướng dẫn. Ctrl / ⌘ + phím + / − vẫn phóng to trang.</p><p>Trên điện thoại, bấm “Tương tác” hoặc chọn Xoay / Di chuyển. Kéo một ngón theo chế độ đã chọn; dùng hai ngón để di chuyển và phóng to. Bấm “Xong” để cuộn trang.</p></div>}
    <p className={styles.gestures}><span className={styles.desktopGesture}>Kéo để {mode==='pan'?'di chuyển':'xoay'} · Ctrl/⌘ + cuộn để zoom</span><span className={styles.mobileGesture}>{interacting?`Kéo để ${mode==='pan'?'di chuyển':'xoay'} · Hai ngón để phóng to`:'Vuốt để cuộn trang · Bấm “Tương tác” để điều khiển'}</span></p>
   </section>
   <aside id="body-tools-panel" className={styles.details} aria-label="Cấu trúc và lớp hiển thị">
    <p className={styles.eyebrow}>ĐANG CHỌN</p><h2 ref={selectionHeading} tabIndex={-1} aria-live="polite">{bodyLabel(scene.selected)}</h2>
    {scene.selected?<><StructureInfo item={{id:scene.selected,label:bodyLabel(scene.selected),description:model.structures[scene.selected]?.representation==='cavity'?'Đây là bề mặt giới hạn khoang trong atlas, không phải thành mô cơ. Lớp khoang được làm mờ để phân biệt với mô xung quanh.':`Lựa chọn gồm ${selectedIds.length} phần hình học trong atlas BodyParts3D.`,scope:'Thuật ngữ tiếng Anh giữ nguyên từ nguồn khi chưa có bản dịch xác minh. Mỗi phần giữ danh tính nguồn riêng.',sourceUrl:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/desc.html',sourceLabel:'BodyParts3D · Nguồn cấu trúc'}}/>
    <div className={styles.actions} role="group" aria-label="Thao tác với cấu trúc"><button className={styles.iconButton} aria-label="Xem riêng" title="Xem riêng" disabled={status!=='ready'} onClick={()=>inspect(scene.selected!)}><Focus size={16} aria-hidden="true"/></button><button className={styles.iconButton} aria-label="Xem lân cận" title="Xem lân cận" disabled={status!=='ready'} onClick={()=>focus(scene.selected!)}><Scan size={16} aria-hidden="true"/></button><button className={styles.iconButton} aria-label={hidden?'Hiện cấu trúc':'Ẩn cấu trúc'} title={hidden?'Hiện cấu trúc':'Ẩn cấu trúc'} aria-pressed={hidden} onClick={()=>change({hidden:hidden?scene.hidden.filter(id=>!selectedIds.includes(id)):[...new Set([...scene.hidden,...selectedIds])]})}>{hidden?<Eye size={16} aria-hidden="true"/>:<EyeOff size={16} aria-hidden="true"/>}</button></div>
    {scene.isolate&&<p className={styles.note}>{selectedIds.some(id=>model.structures[id]!.regions.length)?'Đang xem riêng cấu trúc. Bấm “Xem lân cận” để thấy các phần xung quanh.':'Đang xem riêng cấu trúc. Chưa có phân vùng đủ tin cậy để xem lân cận.'}</p>}
    <label className={styles.range}>Độ rõ cấu trúc · {Math.round((scene.opacity[selectedIds[0]!]??model.structures[selectedIds[0]!]!.defaultOpacity??1)*100)}%<input type="range" min="0" max="100" value={Math.round((scene.opacity[selectedIds[0]!]??model.structures[selectedIds[0]!]!.defaultOpacity??1)*100)} {...sliderEvents} onChange={e=>adjust({opacity:{...scene.opacity,...Object.fromEntries(selectedIds.map(id=>[id,Number(e.target.value)/100]))}})}/></label>
    {selectedIds.length>1&&<details className={styles.parts}><summary>{selectedIds.length} phần của lựa chọn</summary><div>{selectedIds.map(id=><button key={id} onClick={()=>select(id)}>{model.structures[id]!.name}<small>{id}</small></button>)}</div></details>}
    {(model.structures[scene.selected]?.alternativeConcepts.length??0)>1&&<p className={styles.note}>Phần nguồn này thuộc nhiều khái niệm cùng mức: {model.structures[scene.selected]!.alternativeConcepts.map(id=>model.concepts[id]!.name).join('; ')}.</p>}
    </>:<p className={styles.note}>Chọn trong danh sách để xem ngay, hoặc bấm bộ phận trên mô hình để mở lựa chọn xem.</p>}
    <h3><Layers size={16}/>Lớp hiển thị</h3><div className={styles.layerIcons} role="group" aria-label="Lớp hiển thị"><button className={styles.iconButton} aria-label="Bề mặt" title="Bề mặt" aria-pressed={!scene.inside} onClick={()=>change({inside:false,clipping:null,sections:{},skinOpacity:1,isolate:null,hidden:scene.hidden.filter(id=>id!=='FJ2810'),opacity:{...scene.opacity,FJ2810:1}})}><PersonStanding size={17} aria-hidden="true"/></button><button className={styles.iconButton} aria-label="Bên trong" title="Bên trong" aria-pressed={scene.inside} onClick={reveal}><Layers size={17} aria-hidden="true"/></button>
    {scene.inside&&muscleIds.length>0&&<button className={styles.iconButton} aria-label={musclesHidden?'Hiện cơ':'Ẩn cơ'} title={musclesHidden?'Hiện cơ':'Ẩn cơ'} aria-pressed={musclesHidden} onClick={()=>setHistory(h=>commitScene(h,setBodyMusclesHidden(model,h.present,!musclesHidden)))}><BicepsFlexed size={17} aria-hidden="true"/>{musclesHidden&&<span className={styles.iconSlash} aria-hidden="true"/>}</button>}
    {scene.hidden.length>0&&<button className={styles.iconButton} aria-label="Hiện lại các cấu trúc đã ẩn" title="Hiện lại các cấu trúc đã ẩn" onClick={()=>change({hidden:[],opacity:{},isolate:null})}><RotateCcw size={17} aria-hidden="true"/></button>}
    </div>
    {scene.inside&&<label className={styles.range}>Độ rõ da · {Math.round(scene.skinOpacity*100)}%<input type="range" min="0" max="100" value={Math.round(scene.skinOpacity*100)} {...sliderEvents} onChange={e=>adjust({skinOpacity:Number(e.target.value)/100})}/></label>}

    <BodySectionControls scene={scene} disabled={!scene.inside||chunkStatus!=='ready'} change={change} adjust={adjust} sliderEvents={sliderEvents}/>
    <h3><Activity size={16}/>Chức năng và hoạt động</h3>
    {functionsForStructure(model,scene.selected).map(guide=><AnatomyFunctionGuide key={guide.id} guide={guide} onSelect={inspect}/>)}
    {!embedded&&(boundActivity?<button ref={activityButton} className={styles.lesson} onClick={()=>setActivity(boundActivity)}>Khám phá cơ chế mạch vành <ChevronRight size={16}/></button>:<p className={styles.note}>{scene.selected?'Chưa có mô phỏng chuyển động cho cấu trúc này.':'Chọn cấu trúc để xem chức năng và bài hoạt động hiện có.'}</p>)}
    {boundActivity&&<p className={styles.note}>Bài mạch vành minh họa cơ chế định tính. Chưa có dữ liệu chuyển động co bóp cho chu kỳ tim.</p>}
    <details className={styles.provenance}><summary>Nguồn và cách đọc mô hình</summary><p>BodyParts3D · Nam trưởng thành · Hình học giảm chi tiết. Màu theo nhóm nguồn để phân biệt, không biểu thị màu mô thật hay mức oxy. Nhóm nguồn có thể chồng lấp.</p><p>Tên tiếng Việt hỗ trợ tìm kiếm trong bản xem thử; chưa được chuyên gia y khoa duyệt. Tên tiếng Anh và danh tính cấu trúc giữ theo nguồn.</p><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">© The Database Center for Life Science · CC BY 4.0 ↗</a></details>
   </aside>
  </div>
 </Container>;
}
