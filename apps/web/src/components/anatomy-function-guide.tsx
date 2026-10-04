"use client";
import {useId,useState} from 'react';
import {ArrowUpRight,Focus} from 'lucide-react';
import type {AnatomyFunction} from '../lib/anatomy-functions';
import {learningLevels,type LearningLevel} from '../lib/simulation-catalog';
import {bodyLabel} from '../lib/body-explorer';
import styles from './anatomy-function-guide.module.css';
export default function AnatomyFunctionGuide({guide,onSelect}:{guide:AnatomyFunction;onSelect:(id:string)=>void}){
 const [level,setLevel]=useState<LearningLevel>('general');const id=useId();
 return <details className={styles.guide}>
  <summary>{guide.title}</summary>
  <div className={styles.level}><label htmlFor={id}>Mức học</label><select id={id} value={level} onChange={event=>setLevel(event.target.value as LearningLevel)}>{learningLevels.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
  <p>{guide[level]}</p>
  <div className={styles.parts} role="group" aria-label="Các cấu trúc tham gia">{guide.structures.map(part=><button key={part} onClick={()=>onSelect(part)} aria-label={`Xem ${bodyLabel(part)}`}><Focus size={13} aria-hidden="true"/>{bodyLabel(part)}</button>)}</div>
  <p className={styles.scope}>Giải thích trên atlas tĩnh · {guide.limitation}</p>
  <a href={guide.source.url} target="_blank" rel="noreferrer">{guide.source.title}<ArrowUpRight size={13} aria-hidden="true"/></a>
  <small>Đối chiếu nguồn: {guide.checkedAt} · Chưa có thẩm định độc lập.</small>
 </details>;
}
