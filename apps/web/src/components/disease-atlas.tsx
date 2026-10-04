"use client";
import { useEffect, useRef, useState } from "react";
import { Activity, ArrowLeft, ArrowUpRight, BookOpen, Box, Brain, ChevronRight, Heart, Search, Wind, Bone, Droplets, Microscope, Utensils } from "lucide-react";
import Link from "./progress-link";
import {relationForDisease} from '@hs/contracts';
import type { HeartBinding, LearningScenario } from "@hs/contracts";
import { simulationCoverage } from "../lib/simulation-catalog";
import { filterDiseases, type Disease } from "../lib/disease-catalog";
import type { QuizQuestion } from "../lib/learning-quiz";
import DiseaseLesson from "./disease-lesson";
import PathophysiologyPanel from "./pathophysiology-panel";
import styles from "./disease-atlas.module.css";
const icons = { "Tim mạch": Heart, "Hô hấp": Wind, "Thần kinh": Brain, "Nội tiết": Microscope, "Thận – tiết niệu": Droplets, "Tiêu hóa": Utensils, "Cơ xương khớp": Bone };
export default function DiseaseAtlas({ diseases, scenarios, binding, quizDecks, initialTopic,initialLevel,initialStep }: { initialTopic?:string;initialLevel?:string;initialStep?:number; diseases: Disease[]; scenarios: Record<NonNullable<Disease["simulation"]>, LearningScenario>; binding: HeartBinding; quizDecks: Record<NonNullable<Disease["simulation"]>, QuizQuestion[]> }) {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [selected, setSelected] = useState<Disease | null>(()=>diseases.find(d=>d.id===initialTopic)??null);
  useEffect(()=>{if(selected)try{sessionStorage.setItem('hs-learning-topic',selected.id);}catch{/* Optional session storage. */}},[selected]);
  const [showSimulation, setShowSimulation] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const systems = [...new Set(diseases.map(item => item.system))];
  const filtered = filterDiseases(diseases, query, system, simulated);
  const coverage = simulationCoverage(diseases);
  const ready = coverage.filter(item=>item.status==="implemented-unreviewed").length;
  function open(item: Disease) { setSelected(item); setShowSimulation(false); window.requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }); }
  function back() { setSelected(null); setShowSimulation(false); window.requestAnimationFrame(() => search.current?.focus()); }
  const Icon = selected ? icons[selected.system as keyof typeof icons] ?? Activity : Activity;
  return <main id="main" className={styles.page}>
    {!selected ? <>
      <header className={styles.hero}><p className={styles.eyebrow}><Activity size={15} /> ATLAS SINH LÝ BỆNH</p><h1>Từ cơ quan<br />đến cơ chế bệnh.</h1><p>Tra cứu, nối các bước diễn tiến và khám phá dòng chảy trên mô hình 3D.</p><div className={styles.stats}><span><strong>{diseases.length}</strong> chủ đề bệnh</span><span><strong>{systems.length}</strong> hệ cơ quan</span><span><strong>{ready}</strong> mô phỏng minh họa</span><span><strong>{diseases.length-ready}</strong> chưa có mô phỏng</span></div></header>
      <div className={styles.searchbar}><Search size={20} /><label className={styles.srOnly} htmlFor="atlas-search">Tìm bệnh, cơ quan hoặc viết tắt</label><input ref={search} id="atlas-search" value={query} onChange={e => setQuery(e.target.value)} maxLength={120} placeholder="Tìm bệnh, cơ quan, tên tiếng Anh…" /><kbd aria-hidden="true">Tra cứu</kbd></div>
      <div className={styles.layout}><aside className={styles.filters} aria-label="Lọc thư viện"><h2>Hệ cơ quan</h2><button aria-pressed={!system} onClick={() => setSystem("")}><Activity size={17} />Tất cả<span>{diseases.length}</span></button>{systems.map(name => { const SystemIcon = icons[name as keyof typeof icons] ?? Activity; return <button key={name} aria-pressed={system === name} onClick={() => setSystem(name)}><SystemIcon size={17} />{name}<span>{diseases.filter(item => item.system === name).length}</span></button>; })}<label className={styles.toggle}><input type="checkbox" checked={simulated} onChange={e => setSimulated(e.target.checked)} /><Box size={17} />Có mô phỏng 3D</label><p>Nội dung học tập đang được phát triển. Nguồn tham khảo nằm trong từng bài; chưa qua duyệt chuyên môn.</p></aside>
      <section aria-label="Danh mục bệnh"><div className={styles.results}><h2>{system || "Khám phá thư viện"}</h2><span role="status">{filtered.length} kết quả</span></div><div className={styles.grid}>{filtered.map(item => { const CardIcon = icons[item.system as keyof typeof icons] ?? Activity; return <button key={item.id} className={styles.card} onClick={() => open(item)}><div className={styles.cardTop}><span className={styles.icon}><CardIcon size={22} /></span><span className={item.simulation ? styles.badge : styles.readBadge}>{item.simulation ? <Box size={13} /> : <BookOpen size={13} />}{item.simulation ? "3D tương tác" : "Tra cứu"}</span></div><small>{item.organ}</small><h3>{item.title}</h3><p>{item.summary}</p><div className={styles.cardFooter}><span>{item.english.split(" · ")[0]}</span><ChevronRight size={17} /></div></button>; })}</div>{!filtered.length && <div className={styles.empty}><Search size={32} /><h3>Chưa tìm thấy bệnh phù hợp</h3><p>Thử tên khác hoặc bỏ bớt bộ lọc.</p><button onClick={() => { setQuery(""); setSystem(""); setSimulated(false); search.current?.focus(); }}>Xóa tìm kiếm và bộ lọc</button></div>}</section></div>
    </> : <>
      <button className={styles.back} onClick={back}><ArrowLeft size={16} />Về thư viện</button>
      <header className={styles.detailHeader}><span className={styles.icon}><Icon size={28} /></span><div><p className={styles.eyebrow}>{selected.system} / {selected.organ}</p><h1 ref={heading} tabIndex={-1}>{selected.title}</h1><p>{selected.english}</p></div></header>
      <p className={styles.lead}>{selected.summary}</p><p><Link href="/giang-day">Soạn bài giảng</Link>{relationForDisease(selected.id)&&<> · <Link href={`/co-so-y-te?disease=${selected.id}`}>Tra cứu cơ sở theo chuyên khoa liên quan</Link></>}</p>
      <div className={styles.lessonLayout}><DiseaseLesson key={selected.id} disease={selected} initialLevel={initialLevel} initialStep={Number.isInteger(initialStep)?initialStep:0} binding={binding} scenario={scenarios.infarction}/><aside className={styles.observation}><Box size={28} /><h2>{selected.simulation ? "Khám phá trên mô hình" : "Nội dung tra cứu"}</h2><p>{selected.simulation ? "Xoay atlas tim, chọn cấu trúc và tua từng giai đoạn. Dòng hạt biểu diễn cơ chế định tính." : "Bài này chưa có mô phỏng 3D phù hợp. Bạn có thể học chuỗi cơ chế và đối chiếu tài liệu gốc bên dưới."}</p>{selected.simulation && <button aria-expanded={showSimulation} onClick={() => setShowSimulation(value => !value)}><Box size={17} />{showSimulation ? "Đóng mô phỏng" : "Mở mô phỏng 3D"}<ChevronRight size={16} /></button>}<small>Mô hình không phải dữ liệu người bệnh. Nội dung chưa qua duyệt chuyên môn.</small></aside></div>
      {selected.simulation && showSimulation && <PathophysiologyPanel key={selected.id} embedded questions={quizDecks[selected.simulation]} variant={selected.simulation} scenario={scenarios[selected.simulation]} binding={binding} />}
      <section className={styles.references}><div><BookOpen size={21} /><h2>Đọc sâu từ nguồn gốc</h2></div><a href={selected.source.url} target="_blank" rel="noreferrer">{selected.source.title}<ArrowUpRight size={17} /></a><p>Tóm lược học tập · Đối chiếu nguồn ngày 01/10/2026 · Chưa bao quát chẩn đoán, phân loại mức độ hoặc điều trị.</p></section>
    </>}
  </main>;
}
