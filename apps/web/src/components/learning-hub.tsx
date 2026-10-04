'use client';
import {useEffect,useState} from 'react';
import Link from "./progress-link";
import {BookOpen,Presentation,Search,ArrowRight} from 'lucide-react';
import {request} from '@hs/api-client';
import {learningPositionSchema,type LearningPosition,normalizeDirectoryTerm} from '@hs/contracts';
import {learningLevels} from '../lib/simulation-catalog';
import styles from './learning-workspace.module.css';
type Unit={id:string;title:string;organ:string;system:string;simulation:boolean};
export default function LearningHub({units}:{units:Unit[]}){
 const [saved,setSaved]=useState<LearningPosition|null>(null);
 useEffect(()=>{let c=new AbortController();const load=()=>{c.abort();c=new AbortController();const signal=c.signal;setSaved(null);void request<{position:unknown}>('/api/v1/me/learning-position',{signal}).then(r=>{const parsed=learningPositionSchema.safeParse(r.position);if(!signal.aborted&&parsed.success)setSaved(parsed.data);}).catch(()=>{});};load();window.addEventListener('hs-auth-changed',load);return()=>{c.abort();window.removeEventListener('hs-auth-changed',load);};},[]);
 const [query,setQuery]=useState(''),[level,setLevel]=useState('general'),[recent,setRecent]=useState<string|null>(null);
 useEffect(()=>{try{const id=sessionStorage.getItem('hs-learning-topic');setRecent(units.some(u=>u.id===id)?id:null);}catch{/* Storage can be disabled. */}const clear=()=>{setRecent(null);try{sessionStorage.removeItem('hs-learning-topic');}catch{/* Optional session storage. */}};window.addEventListener('hs-auth-changed',clear);return()=>window.removeEventListener('hs-auth-changed',clear);},[units]);
 const terms=normalizeDirectoryTerm(query).split(' '),filtered=units.filter(u=>terms.every(t=>normalizeDirectoryTerm(`${u.title} ${u.organ} ${u.system}`).includes(t)));
 const href=(id:string)=>`/hoc-tap/sinh-ly-benh?topic=${encodeURIComponent(id)}&level=${level}`;
 return <><div className={styles.toolbar}><Link href="#kiem-tra"><BookOpen size={16}/> Kiểm tra và ôn tập</Link><Link href="/giang-day/lop-hoc">Lớp học của tôi</Link><Link href="/giang-day"><Presentation size={16}/> Soạn bài giảng</Link></div>
 {saved&&units.some(u=>u.id===saved.topicId)&&<p><Link href={`/hoc-tap/sinh-ly-benh?topic=${saved.topicId}&level=${saved.level}&step=${saved.step}`}>Học tiếp: {units.find(u=>u.id===saved.topicId)?.title} · bước {saved.step+1} →</Link></p>}
 {recent&&<p><Link href={href(recent)}>Vừa xem: {units.find(u=>u.id===recent)?.title} →</Link><span className={styles.note}> · Trong lần truy cập này</span></p>}
 {units.length>0&&<><div className={styles.filters}><label>Tìm chủ đề<input value={query} maxLength={120} onChange={e=>setQuery(e.target.value)} placeholder="Bệnh, cơ quan hoặc hệ cơ quan"/></label><label>Trình độ<select value={level} onChange={e=>setLevel(e.target.value)}>{learningLevels.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select></label></div><p className={styles.note}>Nội dung đang biên soạn, chưa được thẩm định chuyên môn. Nội dung chuyên khoa chưa đầy đủ.</p><p role="status">{filtered.length} chủ đề</p><div className={styles.grid}>{filtered.map(u=><Link key={u.id} className={styles.card} href={href(u.id)}><small>{u.system} · {u.organ}</small><h2>{u.title}</h2><p>{u.simulation?'Có mô phỏng':'Bài học từng bước · chưa có mô phỏng'}</p><ArrowRight size={18}/></Link>)}</div>{!filtered.length&&<div className="library-empty"><Search size={24}/><h2>Không tìm thấy chủ đề</h2><button onClick={()=>setQuery('')}>Xóa tìm kiếm</button></div>}</>}
 </>;
}
