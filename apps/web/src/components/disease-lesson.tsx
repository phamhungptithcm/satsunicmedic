"use client";
import dynamic from 'next/dynamic';
import {useId,useRef,useState,useEffect} from 'react';
import {ChevronLeft,ChevronRight,RotateCcw,Box,X} from 'lucide-react';
import {request,csrfHeaders,ApiError} from '@hs/api-client';
import {learningPositionSchema} from '@hs/contracts';
import type {HeartBinding,LearningScenario} from '@hs/contracts';
import type {Disease} from '../lib/disease-catalog';
import {bodyLabel} from '../lib/body-explorer';
import {anatomyForDisease,mechanismStep} from '../lib/disease-anatomy';
import {learningLevels,type LearningLevel} from '../lib/simulation-catalog';
import Loading from './loading';
import styles from './disease-lesson.module.css';
const Atlas=dynamic(()=>import('./full-body-anatomy'),{loading:()=> <Loading label="Đang mở atlas"/>,ssr:false});
export default function DiseaseLesson({disease,binding,scenario,initialLevel,initialStep}:{initialLevel?:string;initialStep?:number;disease:Disease;binding:HeartBinding;scenario:LearningScenario}){
 const [step,setStep]=useState(()=>mechanismStep(0,initialStep??0,disease.mechanism.length)),[level,setLevel]=useState<LearningLevel>(()=>learningLevels.find(l=>l.id===initialLevel)?.id??'general'),[organ,setOrgan]=useState<string|null>(null);
 const [saveMessage,setSaveMessage]=useState(''),[saving,setSaving]=useState(false);const pending=useRef<AbortController|null>(null);
 useEffect(()=>{const clear=()=>{pending.current?.abort();setSaving(false);setSaveMessage('');};window.addEventListener('hs-auth-changed',clear);return()=>{clear();window.removeEventListener('hs-auth-changed',clear);};},[]);
 async function savePosition(){const value=learningPositionSchema.parse({schemaVersion:1,unitRevision:'2026-10-01',topicId:disease.id,level,step});pending.current?.abort();const c=new AbortController();pending.current=c;setSaving(true);try{await request('/auth/csrf',{signal:c.signal});await request('/api/v1/me/learning-position',{method:'PUT',headers:csrfHeaders(),body:JSON.stringify(value),signal:c.signal});if(!c.signal.aborted)setSaveMessage('Đã lưu vị trí học vào tài khoản.');}catch(e){if(!c.signal.aborted)setSaveMessage(e instanceof ApiError&&e.status===401?'Đăng nhập để lưu vị trí học vào tài khoản.':'Chưa lưu được vị trí học. Bạn có thể thử lại.');}finally{if(!c.signal.aborted)setSaving(false);}}
 const id=useId(),trigger=useRef<HTMLButtonElement|null>(null);const parts=anatomyForDisease(disease.id);
 return <section className={styles.lesson} aria-label="Học từng bước">
  <div className={styles.header}><h2>Điều gì đang xảy ra?</h2><label htmlFor={id}>Mức học <select id={id} value={level} onChange={e=>setLevel(e.target.value as LearningLevel)}>{learningLevels.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}</select></label></div>
  <p className={styles.note}>Các bước giải thích cơ chế, không phải thời gian diễn tiến bệnh.</p>
  {disease.mechanism.length>0?<><div className={styles.steps} role="group" aria-label="Chọn bước cơ chế">{disease.mechanism.map((text,index)=><button key={text} aria-label={`Bước ${index+1}: ${text}`} aria-pressed={step===index} onClick={()=>setStep(index)}>{index+1}</button>)}</div>
  <p className={styles.current} role="status">{disease.mechanism[step]}</p>
  <div className={styles.transport}><button title="Bước trước" aria-label="Bước trước" disabled={step===0} onClick={()=>setStep(s=>mechanismStep(s,-1,disease.mechanism.length))}><ChevronLeft size={18}/></button><span>{step+1} / {disease.mechanism.length}</span><button title="Bước tiếp" aria-label="Bước tiếp" disabled={step===disease.mechanism.length-1} onClick={()=>setStep(s=>mechanismStep(s,1,disease.mechanism.length))}><ChevronRight size={18}/></button><button title="Về bước đầu" aria-label="Về bước đầu" disabled={step===0} onClick={()=>setStep(0)}><RotateCcw size={16}/></button></div></>:<p>Chưa có chuỗi cơ chế cho bài này.</p>}
  {level!=='general'&&<><ol>{disease.mechanism.map(text=><li key={text}>{text}</li>)}</ol><p><strong>Điểm cần phân biệt: </strong>{disease.distinction}</p></>}
  {level==='specialist'&&<p className={styles.note}>Chưa có bài chuyên khoa đầy đủ cho chủ đề này. <a href={disease.source.url} target="_blank" rel="noreferrer">Đối chiếu tài liệu gốc</a> để đọc thêm; phần tóm lược không bao quát chẩn đoán hoặc điều trị.</p>}
  <div className={styles.transport}><button disabled={saving} onClick={()=>void savePosition()}>{saving?'Đang lưu…':'Lưu vị trí học'}</button><span role="status">{saveMessage}</span></div>
  <div className={styles.parts}>{parts.length>0?parts.map(part=><button key={part} aria-expanded={organ===part} onClick={e=>{trigger.current=e.currentTarget;setOrgan(organ===part?null:part);}}><Box size={16}/> {`Xem ${bodyLabel(part)}`}</button>):<p className={styles.note}>Chưa có cấu trúc tương ứng được xác minh trong atlas.</p>}</div>
  {organ&&<div className={styles.atlas}><div className={styles.header}><p>Atlas tĩnh · Cấu trúc tham khảo, không biểu diễn tổn thương hay vi thể của bệnh.</p><button title="Đóng atlas" aria-label="Đóng atlas" onClick={()=>{setOrgan(null);requestAnimationFrame(()=>trigger.current?.focus());}}><X size={18}/></button></div><Atlas key={organ} initialStructure={organ} embedded binding={binding} scenario={scenario}/></div>}
 </section>;
}
