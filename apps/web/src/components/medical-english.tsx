"use client";
import { useId, useState } from "react";
import { ArrowUpRight, BookOpen, Eye, EyeOff, ScanEye } from "lucide-react";
import type { MedicalTerm } from "../lib/medical-english";
import styles from "./medical-english.module.css";

export default function MedicalEnglish({ terms, context, onObserve, modelReady = false }: {
  terms: readonly MedicalTerm[];
  context: string;
  onObserve?: (structureId: string) => void;
  modelReady?: boolean;
}) {
  const uid = useId();
  const [showMeaning, setShowMeaning] = useState(true);
  return <section className={styles.panel} aria-labelledby={`${uid}-title`} data-medical-english>
    <header className={styles.header}><div><p className={styles.eyebrow}><BookOpen size={14} aria-hidden="true" />ANH–VIỆT Y KHOA</p><h2 id={`${uid}-title`}>Nhìn hình, nhớ từ</h2></div>
      {terms.length > 0 && <button type="button" aria-pressed={!showMeaning} className={styles.toggle} onClick={() => setShowMeaning(value => !value)}>{showMeaning ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}{showMeaning ? "Ẩn nghĩa Việt" : "Hiện nghĩa Việt"}</button>}
    </header>
    <p className={styles.context}>{context}</p>
    {terms.length ? <div className={styles.terms}>{terms.map(term => <article className={styles.term} key={term.id}>
      <h3 lang="en">{term.english}</h3>
      {showMeaning && <><p className={styles.translation}>{term.vietnamese}</p><p>{term.meaning}</p></>}
      <div className={styles.example}><span>Câu trong ngữ cảnh</span><p lang="en">{term.example}</p>{showMeaning && <p>{term.translation}</p>}</div>
      <div className={styles.actions}><a href={term.source.url} target="_blank" rel="noreferrer">Nguồn thuật ngữ<span className={styles.srOnly}>: {term.source.title}</span><ArrowUpRight size={13} aria-hidden="true" /></a>
        {term.structureId && onObserve && <button type="button" disabled={!modelReady} onClick={() => onObserve(term.structureId!)}><ScanEye size={14} aria-hidden="true" />Chọn trên mô hình</button>}
      </div>
    </article>)}</div> : <p>Chưa có từ vựng song ngữ cho phần này. Bạn vẫn có thể đọc giải thích tiếng Việt của bài.</p>}
    <p className={styles.note}>Bản học thử · Bản dịch chưa được chuyên gia y khoa duyệt. Các giới hạn của mô hình vẫn áp dụng.</p>
  </section>;
}
