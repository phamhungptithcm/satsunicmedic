"use client";
import { learningLevels, type LearningLevel } from "../lib/simulation-catalog";
import { fullBodyAnatomy } from "../lib/full-body-anatomy";
import { bodyLabel } from "../lib/body-explorer";
import StructureInfo from "./structure-info";
import Loading from "./loading";
import QuizSlides from "./quiz-slides";
import MedicalEnglish from "./medical-english";
import { medicalTerms, coronaryVocabulary } from "../lib/medical-english-data";
import { stageTerms, structureTerm } from "../lib/medical-english";
import { medicalQuiz } from "../lib/medical-english-quiz";
import englishStyles from "./medical-english.module.css";
import type { QuizQuestion } from "../lib/learning-quiz";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes } from "react";
import dynamic from "next/dynamic";
import Link from "./progress-link";
import { ArrowLeft, ArrowRight, BookOpen, Check, Pause, Play, RotateCcw, Search, Activity, Box, Layers3, Maximize2, Minimize2, SkipForward, ChevronDown, ChevronRight, Info, Heart, MousePointer2, ScanEye, SlidersHorizontal, Plus, Minus } from "lucide-react";
import type { BodyScene } from "@hs/anatomy-viewer/scene-history";
import type { HeartBinding, LearningScenario } from "@hs/contracts";
import { clampTime, matchesScenario, stageAt } from "../lib/pathophysiology";
import styles from "./pathophysiology.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
const HeartCanvas = dynamic(() => import("@hs/anatomy-viewer/pathophysiology-canvas"), { ssr: false });
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function ToolButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type="button" className={styles.tool} aria-label={label} {...props}>{children}<span className={styles.tooltip} aria-hidden="true">{label}</span></button>;
}

function FlowDiagram({ appearance, time, selected, baseline = false }: {
  appearance: LearningScenario["stages"][number]["appearance"];
  time: number;
  selected: string;
  baseline?: boolean;
}) {
  const prefix = useId().replaceAll(":", "");
  const blocked = appearance === "occlusion" || appearance === "injury";
  const injured = appearance === "injury";
  const label = baseline ? "Bình thường" : "Kịch bản đang xem";
  const title = `${label}: ${blocked ? "nhánh trên bị tắc, vùng cơ tim phía sau bị ảnh hưởng" : "dòng máu tới hai vùng cơ tim"}. Máu trong buồng tim được vẽ riêng.`;
  return <figure className={styles.diagram}>
    <figcaption><span>{label}</span><small>Sơ đồ cơ chế · không theo tỷ lệ</small></figcaption>
    <svg viewBox="0 0 640 330" role="img" aria-labelledby={`${prefix}-title ${prefix}-desc`}>
      <title id={`${prefix}-title`}>{title}</title>
      <desc id={`${prefix}-desc`}>Mũi tên chỉ chiều dòng máu. {blocked ? "Dấu chặn ở nhánh trên; dòng không vượt qua chỗ tắc. Nhánh dưới vẫn có dòng." : "Cả hai nhánh đều có đường dòng máu."} Vùng gạch chéo là ký hiệu mô bị ảnh hưởng, không phải số đo.</desc>
      <defs>
        <marker id={`${prefix}-arrow`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L6 3.5L0 7" fill="none" stroke="#b62944" strokeWidth="1.5" /></marker>
        <pattern id={`${prefix}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse"><path d="M-2 2L2 -2M0 9L9 0M7 11L11 7" stroke="#9a4c18" strokeWidth="1.5" /></pattern>
      </defs>
      <rect x="16" y="24" width="608" height="199" rx="18" fill="#fff" stroke={selected === "vessel" ? "#163cff" : "#dce2ec"} strokeWidth={selected === "vessel" ? 2 : 1} />
      <text x="34" y="49" className={styles.svgHeading}>MẠCH VÀNH → MÁU NUÔI CƠ TIM</text>
      <path d="M40 135H155Q185 135 200 110L228 84H444M155 135Q185 135 210 168H444" fill="none" stroke="#f5d6dc" strokeWidth="22" strokeLinecap="round" />
      <path d={blocked ? "M40 135H155Q185 135 200 110L228 84H300" : "M40 135H155Q185 135 200 110L228 84H436"} fill="none" stroke="#b62944" strokeWidth="4" strokeDasharray="7 11" strokeDashoffset={-time * 13} markerEnd={`url(#${prefix}-arrow)`} />
      <path d="M155 135Q185 135 210 168H436" fill="none" stroke="#b62944" strokeWidth="4" strokeDasharray="7 11" strokeDashoffset={-time * 13} markerEnd={`url(#${prefix}-arrow)`} />
      {appearance !== "normal" && <path d="M274 73Q304 98 335 73Z" fill="#c08a22" stroke="#875c0e" />}
      {blocked && <><rect x="304" y="73" width="18" height="22" rx="4" fill="#7e1936" /><path d="M300 69L325 99M325 69L300 99" stroke="#591025" strokeWidth="2" /><text x="270" y="119" className={styles.svgText}>Chỗ tắc</text></>}
      {appearance === "plaque" && <text x="269" y="119" className={styles.svgText}>Mảng xơ vữa</text>}
      <rect x="456" y="64" width="146" height="66" rx="10" fill={blocked ? "#fff2e3" : "#f3f6fe"} stroke={selected === "tissue" ? "#163cff" : "#ccd5e6"} strokeWidth={selected === "tissue" ? 3 : 1} />
      {blocked && <rect x="456" y="64" width="146" height="66" rx="10" fill={`url(#${prefix}-hatch)`} opacity=".3" />}
      <text x="529" y="90" textAnchor="middle" className={styles.svgText}>Vùng cơ tim</text>
      <text x="529" y="113" textAnchor="middle" className={styles.svgText}>{injured ? "Tổn thương" : blocked ? "Thiếu máu nuôi" : "Có máu nuôi"}</text>
      <rect x="456" y="148" width="146" height="48" rx="10" fill="#f3f6fe" stroke="#ccd5e6" />
      <text x="529" y="177" textAnchor="middle" className={styles.svgText}>Vùng khác</text>
      <text x="34" y="204" className={styles.svgNote}>Một nhánh tổn thương; không mô tả toàn bộ hệ mạch vành.</text>
      <rect x="16" y="240" width="608" height="72" rx="16" fill="#edf2ff" stroke={selected === "chamber" ? "#163cff" : "#dce2ec"} strokeWidth={selected === "chamber" ? 2 : 1} />
      <text x="34" y="269" className={styles.svgHeading}>ĐƯỜNG QUA BUỒNG TIM</text>
      <text x="34" y="292" className={styles.svgNote}>Tách riêng với đường máu nuôi cơ tim ở trên.</text>
      <path d="M407 276H592" stroke="#b62944" strokeWidth="4" strokeDasharray="7 11" strokeDashoffset={-time * 13} markerEnd={`url(#${prefix}-arrow)`} />
    </svg>
    <p className={styles.diagramSummary}>{blocked ? (injured ? "Nhánh minh họa bị tắc → vùng cơ tim phía sau bị tổn thương." : "Nhánh minh họa bị tắc → vùng cơ tim phía sau thiếu máu nuôi.") : "Hai nhánh có dòng máu tới cơ tim."} Đường qua buồng tim được biểu diễn riêng.</p>
  </figure>;
}

export default function PathophysiologyPanel({ scenario, binding, variant = "infarction", embedded = false, questions, initialStructure, initialScene }: { scenario: LearningScenario; binding: HeartBinding; variant?: "infarction" | "stenosis" | "spasm"; embedded?: boolean; questions?: QuizQuestion[]; initialStructure?: string; initialScene?: BodyScene }) {
  const [time, setTime] = useState(0);
  const [discoveryScene,setDiscoveryScene]=useState(()=>initialScene?structuredClone(initialScene):undefined);
  const [learningLevel,setLearningLevel]=useState<LearningLevel>('general');
  const learningLevelId=useId();
  const clock = useRef(0);
  const studio = useRef<HTMLElement>(null);
  const viewMenu = useRef<HTMLDetailsElement>(null);
  const libraryMenu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      for (const menu of [viewMenu.current, libraryMenu.current]) {
        if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === studio.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  async function toggleFullscreen() {
    setFullscreenError("");
    try {
      if (document.fullscreenElement === studio.current) await document.exitFullscreen();
      else if (studio.current?.requestFullscreen) await studio.current.requestFullscreen();
      else setFullscreenError("Trình duyệt này chưa hỗ trợ toàn màn hình.");
    } catch { setFullscreenError("Chưa mở được toàn màn hình. Bạn vẫn có thể xem ở khung hiện tại."); }
  }

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [compare, setCompare] = useState(false);
  const [selected, setSelected] = useState(scenario.structures[0]!.id);
  const [query, setQuery] = useState("");
  const [quizRevision, setQuizRevision] = useState(0);
  const [selected3d, setSelected3d] = useState(() => {
    const id=binding.structures.find(item=>item.sourceId===initialStructure)?.id??initialStructure;
    return id&&(binding.structures.some(item=>item.id===id)||fullBodyAnatomy.structures[id]||fullBodyAnatomy.concepts[id])?id:'FMA7088';
  });
  const [wallOpacity, setWallOpacity] = useState(1);
  const [view, setView] = useState<"front" | "back" | "left" | "right">("front");
  const [viewRevision, setViewRevision] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [modelProgress,setModelProgress]=useState({loaded:0,total:0});
  const onModelProgress=useCallback((next:{loaded:number;total:number})=>setModelProgress(old=>old.loaded===next.loaded&&old.total===next.total?old:next),[]);
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const onModelStatus = useCallback((status: "loading" | "ready" | "error") => { setModelStatus(status); if (status === "error") setPlaying(false); }, []);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const visible = matchesScenario(scenario, query);
  const index = stageAt(scenario, time);
  const stage = scenario.stages[index]!;
  const vocabulary = useMemo(() => stageTerms(medicalTerms, coronaryVocabulary, scenario, stage.id, compare), [scenario, stage.id, compare]);
  const englishQuestions = useMemo(() => medicalQuiz(medicalTerms, coronaryVocabulary, scenario), [scenario]);
  const englishSources = useMemo(() => [...new Map(medicalTerms.map(term => [term.source.id, term.source])).values()], []);
  const selectedTerm = structureTerm(medicalTerms, selected3d);
  const structure = scenario.structures.find(item => item.id === selected)!;
  const atEnd = time >= scenario.duration;
  const running = playing && !reducedMotion && visible && !atEnd && modelStatus === "ready";

  useEffect(() => {
    const pause = () => { if (document.hidden) setPlaying(false); };
    const media = window.matchMedia(motionQuery);
    const stop = () => setPlaying(false);
    document.addEventListener("visibilitychange", pause);
    media.addEventListener("change", stop);
    return () => { document.removeEventListener("visibilitychange", pause); media.removeEventListener("change", stop); };
  }, []);

  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    let previousUi = previous;
    let previousStage = stageAt(scenario, clock.current);
    let handle = 0;
    const tick = (now: number) => {
      const elapsed = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      clock.current = clampTime(clock.current + elapsed * speed, scenario.duration);
      const currentStage = stageAt(scenario, clock.current);
      if (now - previousUi >= 100 || previousStage !== currentStage || clock.current >= scenario.duration) {
        setTime(clock.current); previousUi = now; previousStage = currentStage;
      }
      if (clock.current < scenario.duration) handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [running, speed, scenario]);

  function seek(next: number) { setPlaying(false); setCompare(false); clock.current = clampTime(next, scenario.duration); setTime(clock.current); }
  function reset() { seek(0); setQuizRevision(value => value + 1); }

  return <section aria-label={scenario.title} className={styles.page}>
    {!embedded && <>
    <nav className={styles.breadcrumb} aria-label="Vị trí hiện tại"><Link href="/hoc-tap"><ArrowLeft size={14} /> Học tập</Link><ChevronRight size={13} /><span>Sinh lý bệnh</span></nav>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}><Activity size={14} /> KHÔNG GIAN THỰC HÀNH</p><h1>Nhìn sâu. Hiểu rõ.</h1><p>Khám phá cơ chế bệnh qua từng chuyển động.</p></div>
      <details ref={libraryMenu} className={styles.library} onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}><summary><Heart size={17} /><span>{scenario.title}<small>Tim mạch · 1 bài học</small></span><ChevronDown size={16} /></summary><div className={styles.libraryBody}>
        <label htmlFor="disease-search">Tìm bệnh hoặc cơ quan</label><div className={styles.search}><Search size={16} /><input id="disease-search" value={query} maxLength={120} placeholder="Tên Việt, Anh hoặc viết tắt" onChange={event => { setQuery(event.target.value); setPlaying(false); }} /></div>
        <p className={styles.small} role="status">{visible ? "1 bài học hiện có" : "Không tìm thấy bài học"}</p>
        <button onClick={() => { setQuery(""); setPlaying(false); if (libraryMenu.current) { libraryMenu.current.open = false; libraryMenu.current.querySelector("summary")?.focus(); } }}><Heart size={16} />{scenario.title}<Check size={15} /></button><p className={styles.small}>Đột quỵ: chưa có bài tương tác.</p>
      </div></details>
    </header>
    </>}
    {visible ? <>
      <section ref={studio} className={styles.studio} aria-label="Không gian mô hình tim 3D và diễn tiến 4D">
        <div className={styles.sceneColumn}>
          <div className={styles.sceneHeader}><div className={styles.sceneIdentity}><span className={styles.organIcon}><Heart size={19} /></span><div><h2>{scenario.title}</h2><span>BodyParts3D <i /> Mô hình 3D · Dòng chảy theo thời gian</span></div></div><ToolButton label={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</ToolButton></div>
          <div className={styles.heartViewer} data-model-status={modelStatus}>
            {modelStatus !== "error" && <HeartCanvas key={loadAttempt} catalog={fullBodyAnatomy} discoveryScene={discoveryScene} binding={binding} clock={clock} time={time} playing={running} variant={variant} recoveryAt={scenario.stages.find(item => item.id === "recovery")?.start} narrowingAt={scenario.stages.find(item => item.id === "limited-flow")?.start} blockedAt={scenario.stages.find(item => item.appearance === "occlusion")?.start ?? Infinity} plaqueAt={scenario.stages.find(item => item.appearance === "plaque" || item.id === "spasm")?.start ?? Infinity} normalView={compare} wallOpacity={wallOpacity} selected={selected3d} onSelect={setSelected3d} renderSelection={id => { const structure = binding.structures.find(item => item.id === id); return structure ? <StructureInfo item={{ id, medicalTerm: structureTerm(medicalTerms, id), label: structure.label, description: `Cấu trúc ${structure.label.toLowerCase()} trong mô hình tim BodyParts3D.`, scope: `Giai đoạn: ${compare ? "Tưới máu bình thường" : stage.label}. ${compare ? scenario.stages[0]!.event : stage.event}`, sourceUrl: binding.sourceUrl, sourceLabel: "BodyParts3D · Dữ liệu nguồn" }} /> : <StructureInfo item={{id,label:bodyLabel(id),description:"Cấu trúc giải phẫu từ cùng atlas với trang Khám phá.",scope:"Chưa có lớp mô phỏng riêng cho cấu trúc này.",sourceUrl:binding.sourceUrl,sourceLabel:"BodyParts3D"}} />; }} view={view} viewRevision={viewRevision} zoom={zoom} onProgress={onModelProgress} onStatus={onModelStatus} />}
            <div className={styles.sceneStatus}><span className={styles.viewerBadge}><span className={running ? styles.liveDot : styles.staticDot} />{compare ? "Bình thường · Cùng góc nhìn" : stage.label}</span><span className={styles.modeLabel}>{running ? "4D · Đang phát" : "3D · Khám phá"}</span></div>
            {discoveryScene&&modelStatus==="ready"&&<div className={styles.inheritedNotice}><span>Giữ cách hiển thị từ Khám phá</span><ToolButton label="Hiện mô hình bài học" onClick={()=>{setDiscoveryScene(undefined);setView("front");setViewRevision(value=>value+1);}}><ScanEye size={18}/></ToolButton></div>}
            {modelStatus === "loading" && <Loading overlay dark progress={modelProgress} label={modelProgress.total>0&&modelProgress.loaded>=modelProgress.total?"Đang dựng mô hình":"Đang tải mô hình tim"} />}
            {modelStatus === "error" && <div className={styles.modelMessage} role="alert"><Info size={28} /><strong>Chưa mở được mô hình 3D</strong><span>Thử tải lại hoặc xem sơ đồ giải thích bên dưới.</span><button onClick={() => { setModelStatus("loading"); setLoadAttempt(value => value + 1); }}><RotateCcw size={16} />Tải lại mô hình</button></div>}
            <div className={styles.dock} role="group" aria-label="Công cụ quan sát">
              <button className={styles.compareTool} aria-pressed={compare} disabled={modelStatus !== "ready"} onClick={() => setCompare(value => !value)}><ScanEye size={18} /><span>{compare ? "Về kịch bản bệnh" : "So với bình thường"}</span></button>
              <span className={styles.dockDivider} />
              <details ref={viewMenu} className={styles.viewSettings} onKeyDown={event => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}><summary aria-label="Góc nhìn và lớp mô"><Layers3 size={19} /><span className={styles.tooltip} aria-hidden="true">Góc nhìn và lớp mô</span></summary><div className={styles.settingsPanel}>
                <h3><SlidersHorizontal size={16} />Góc nhìn và lớp mô</h3>{discoveryScene&&<><p>Đang giữ phần ẩn, độ rõ và mặt cắt từ Khám phá.</p></>}<div className={styles.zoomControls}><span>Thu/phóng mô hình</span><ToolButton label="Thu nhỏ mô hình" disabled={modelStatus !== "ready"} onClick={() => setZoom(value => value - 1)}><Minus size={17} /></ToolButton><ToolButton label="Phóng to mô hình" disabled={modelStatus !== "ready"} onClick={() => setZoom(value => value + 1)}><Plus size={17} /></ToolButton></div><label htmlFor="camera-view">Góc quan sát</label><select id="camera-view" value={view} disabled={modelStatus !== "ready"} onChange={event => { setView(event.target.value as typeof view); setViewRevision(value => value + 1); }}><option value="front">Phía trước</option><option value="back">Phía sau</option><option value="left">Bên trái</option><option value="right">Bên phải</option></select>
                <label htmlFor="wall-opacity">Độ rõ thành tim <span>{Math.round(wallOpacity * 100)}%</span></label><input id="wall-opacity" type="range" min="0.12" max="1" step="0.01" value={wallOpacity} disabled={modelStatus !== "ready"} onChange={event => setWallOpacity(Number(event.target.value))} /><p>Giảm độ rõ để nhìn các mạch phía trong.</p>
              </div></details>
              <ToolButton label="Đặt lại góc nhìn" disabled={modelStatus !== "ready"} onClick={() => { setView("front"); setViewRevision(value => value + 1); }}><RotateCcw size={18} /></ToolButton>
            </div>
            <span className={styles.viewerHelp}><MousePointer2 size={12} />Kéo để xoay · Cuộn/chụm để phóng to · Chạm để chọn</span>
          </div>
          <div className={styles.playback}>
            <div className={styles.transport}><button className={styles.playButton} aria-label={running ? "Tạm dừng dòng chảy" : atEnd ? "Phát lại minh họa" : "Phát dòng chảy"} disabled={reducedMotion || modelStatus !== "ready"} onClick={() => { if (atEnd) { clock.current = 0; setTime(0); } setPlaying(!running); }}>{running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button><div className={styles.playbackLabel}><strong>{running ? "Theo dòng chảy" : atEnd ? "Đã hết minh họa" : "Khám phá dòng chảy"}</strong><span>{compare ? "Đang so với bình thường" : `Giai đoạn ${index + 1} / ${scenario.stages.length}`}</span></div><ToolButton label="Về đầu bài" onClick={reset}><RotateCcw size={16} /></ToolButton><ToolButton label="Giai đoạn tiếp" disabled={index === scenario.stages.length - 1} onClick={() => seek(scenario.stages[index + 1]!.start)}><SkipForward size={17} /></ToolButton><label className={styles.speed}><span className={styles.srOnly}>Tốc độ phát</span><select value={speed} disabled={reducedMotion} onChange={event => setSpeed(Number(event.target.value))}><option value="0.5">0,5×</option><option value="1">1×</option><option value="2">2×</option></select></label></div>
            <label className={styles.srOnly} htmlFor="lesson-timeline">Tiến trình minh họa</label><input id="lesson-timeline" className={styles.scrubber} type="range" min="0" max={scenario.duration} step="0.1" value={time} aria-valuetext={`Giai đoạn ${index + 1}: ${stage.label}`} onChange={event => seek(Number(event.target.value))} />
            <div className={styles.timelineCaptions}><span>Bình thường</span><span>{scenario.stages.at(-1)?.label}</span></div><p className={styles.motionNote}>{reducedMotion ? "Giảm chuyển động đang bật. Chọn từng giai đoạn để xem tĩnh." : "Tiến trình minh họa · Không phải thời gian diễn tiến bệnh thực tế"}</p>
            {fullscreenError && <p role="status" className={styles.fullscreenError}>{fullscreenError}</p>}
          </div>
        </div>
        <aside className={styles.inspector} aria-label="Giai đoạn và cấu trúc">
          <div className={styles.learningDepth}>
            <label htmlFor={learningLevelId}>Mức học</label>
            <select id={learningLevelId} value={learningLevel} onChange={event=>setLearningLevel(event.target.value as LearningLevel)} aria-describedby={`${learningLevelId}-hint`}>
              {learningLevels.map(level=><option key={level.id} value={level.id}>{level.label}</option>)}
            </select>
            <p id={`${learningLevelId}-hint`}>{learningLevel==='general'?'Bắt đầu từ điều đang xảy ra. Mở phần giải thích khi muốn hiểu thêm.':learningLevel==='medical'?'Theo dõi cơ chế, hệ quả và đối chiếu nguồn ở từng giai đoạn.':'Xem giới hạn bằng chứng. Bài chuyên khoa riêng chưa được biên soạn và thẩm định.'}</p>
          </div>
          <div className={styles.inspectorTitle}><span className={styles.eyebrow}><Activity size={14} />DIỄN TIẾN BỆNH</span><span>01—{String(scenario.stages.length).padStart(2, "0")}</span></div>
          <ol className={styles.stages}>{scenario.stages.map((item, position) => <li key={item.id}><button aria-current={!compare && index === position ? "step" : undefined} onClick={() => seek(item.start)}><span className={styles.stageNumber}>{String(position + 1).padStart(2, "0")}</span><span>{item.label}</span>{!compare && index === position && <ChevronRight size={16} />}</button></li>)}</ol>
          <div className={styles.stageExplanation} aria-live="polite"><span className={styles.kicker}>{compare ? "ĐỐI CHIẾU BÌNH THƯỜNG" : `GIAI ĐOẠN ${index + 1}`}</span><h3>{compare ? "Theo dõi mạch thông" : stage.label}</h3><p>{compare ? "Hai đường LAD và nhánh mũ được minh họa đang thông. Góc nhìn và cấu trúc bạn chọn được giữ nguyên." : stage.event}</p><details key={learningLevel} open={learningLevel!=='general'} className={styles.mechanism}><summary>Vì sao điều này xảy ra?<ChevronDown size={14} /></summary><p>{compare ? scenario.stages[0]!.mechanism : stage.mechanism}</p><p>{compare ? scenario.stages[0]!.consequence : stage.consequence}</p><div className={styles.sourceLine}>{(compare ? scenario.stages[0]! : stage).sourceIds.map(id => { const source = scenario.sources.find(item => item.id === id)!; return <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>; })}</div></details></div>
          {learningLevel==='specialist'&&<section className={styles.depthLimit} aria-label="Phạm vi nội dung chuyên khoa">
            <h3>Giới hạn của bài hiện có</h3><p>{scenario.limitation}</p>
            <p>Nội dung dưới đây vẫn là bài minh họa nền tảng. Chưa có bài chuyên khoa được thẩm định; không dùng mô hình này để suy ra thông số hay quyết định lâm sàng.</p>
          </section>}
          <div className={styles.anatomySelection}><label htmlFor="heart-structure"><Box size={15} />Cấu trúc đang chọn</label><select id="heart-structure" value={selected3d} onChange={event => setSelected3d(event.target.value)}><option value="FMA7088">Tim</option>{selected3d!=="FMA7088"&&fullBodyAnatomy.concepts[selected3d]&&<option value={selected3d}>{bodyLabel(selected3d)}</option>}{fullBodyAnatomy.concepts.FMA7088!.sourceIds.filter(id=>!binding.structures.some(item=>item.sourceId===id)).map(id=><option key={id} value={id}>{bodyLabel(id)}</option>)}{binding.structures.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><p role="status">{binding.structures.find(item => item.id === selected3d)?.label??bodyLabel(selected3d)}</p></div>
          <div className={styles.flowLegend}><span><i />Hạt sáng: chiều dòng chảy</span><span><i />{variant === "spasm" ? "Vòng tím: vị trí co thắt giả định" : "Vòng vàng: vị trí tổn thương giả định"}</span><p>Chỉ minh họa dòng trên LAD và nhánh mũ. Không phải vận tốc hay lưu lượng đo được.</p></div>
          {index >= 2 && !compare && <p className={styles.mappingNote}><Info size={14} />Mô hình hiện chưa thể hiện vùng cơ tim thiếu máu.</p>}
        </aside>
      </section>
      <div className={englishStyles.studyGrid}>
        <MedicalEnglish terms={vocabulary} context={`Từ vựng theo cảnh: ${compare ? scenario.stages[0]!.label : stage.label}`} />
        <div className={englishStyles.studyAside}>
          <MedicalEnglish terms={selectedTerm ? [selectedTerm] : []} context="Cấu trúc đang chọn trên mô hình" modelReady={modelStatus === "ready"} onObserve={id => { if (modelStatus === "ready" && binding.structures.some(item => item.id === id)) { setSelected3d(id); studio.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" }); } }} />
          <details><summary>Thử nhớ từ · {englishQuestions.length} câu Anh–Việt</summary>
            <QuizSlides key={`english-${scenario.id}-${quizRevision}`} medical questions={englishQuestions} sources={englishSources} observeDisabled={modelStatus !== "ready"} onObserve={stageId => { const target = scenario.stages.find(item => item.id === stageId); if (target && modelStatus === "ready") { seek(target.start); studio.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" }); } }} />
          </details>
        </div>
      </div>
      <div className={styles.learningExtras}>
        <QuizSlides key={`${scenario.id}-${quizRevision}`} questions={questions?.length ? questions : [{ ...scenario.quiz, id: "core", kind: "Khởi động" }]} sources={scenario.sources} onObserve={stageId => { const target = scenario.stages.find(item => item.id === stageId); if (target) { seek(target.start); studio.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" }); } }} />
        <div className={styles.reading}>
          {variant === "infarction" && <details className={styles.sources}><summary><Layers3 size={18} /><span>Sơ đồ giải thích 2D<small>Một góc nhìn khác về cùng cơ chế</small></span><ChevronDown size={16} /></summary><FlowDiagram appearance={stage.appearance} time={time} selected={selected} /><div className={styles.structures} role="group" aria-label="Chọn cấu trúc trong sơ đồ">{scenario.structures.map(item => <button key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.label}</button>)}</div><p>{structure.description}</p></details>}
          <details className={styles.sources}><summary><BookOpen size={18} /><span>Nguồn và giới hạn<small>Nội dung, mô hình và mức đơn giản hóa</small></span><ChevronDown size={16} /></summary><p>{scenario.limitation}</p><ul>{scenario.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul><p>{binding.attribution}</p><p><a href={binding.sourceUrl} target="_blank" rel="noreferrer">Nguồn BodyParts3D</a> · <a href={binding.licenseUrl} target="_blank" rel="noreferrer">CC BY 4.0</a></p><p>Dùng cùng hình học và danh tính cấu trúc với trang Khám phá. Đường dòng và dấu hiệu bệnh lý là lớp minh họa riêng; màu nhấn và độ trong suốt hỗ trợ quan sát. Mô hình không có chuyển động co bóp tim. “4D” là dòng chảy và biến cố theo thời gian trên cùng mô hình 3D.</p></details>
          <p className={styles.studyNote}><Info size={16} />Quan sát mô hình để đặt câu hỏi. Đối chiếu nguồn và hướng dẫn của giảng viên để học sâu hơn.</p>
        </div>
      </div>
    </> : <section className={styles.empty}><Search size={30} /><h2>Chưa có bài phù hợp.</h2><p>Thử “tim”, “nhồi máu cơ tim” hoặc “MI”.</p><button onClick={() => setQuery("")}><ArrowRight size={16} />Xem bài hiện có</button></section>}
  </section>;
}
