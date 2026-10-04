"use client";
import type { MedicalTerm } from "../lib/medical-english";
import { Info, X } from "lucide-react";
import styles from "./structure-info.module.css";
export type StructureInfoData = { id: string; label: string; description: string; scope?: string; sourceUrl?: string; sourceLabel?: string; medicalTerm?: MedicalTerm };
export default function StructureInfo({ item, onClose }: { item: StructureInfoData; onClose?: () => void }) {
  return <div className={styles.card} onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onKeyDown={event => {
    if (event.key === "Escape") {
      const details = event.currentTarget.querySelector("details");
      if (details?.open) { details.open = false; details.querySelector("summary")?.focus(); } else onClose?.();
      event.stopPropagation();
    }
  }}>
    <span className={styles.name}>{item.label}{item.medicalTerm && <small className={styles.english} lang="en">{item.medicalTerm.english}</small>}</span>
    <details key={item.id} className={styles.details}>
      <summary aria-label={`Chi tiết ${item.label}`} title={`Chi tiết ${item.label}`}><Info size={16} strokeWidth={1.5} aria-hidden="true" /></summary>
      <section className={styles.body} aria-label={`Thông tin ${item.label}`}><span className={styles.eyebrow}>CẤU TRÚC GIẢI PHẪU</span><h3>{item.label}</h3><p>{item.description}</p>{item.medicalTerm && <div className={styles.vocabulary}><p lang="en">{item.medicalTerm.example}</p><p>{item.medicalTerm.translation}</p><a href={item.medicalTerm.source.url} target="_blank" rel="noreferrer">Nguồn thuật ngữ ↗</a><p className={styles.scope}>Bản học thử · Bản dịch chưa được chuyên gia y khoa duyệt.</p></div>}{item.scope && <p className={styles.scope}>{item.scope}</p>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceLabel ?? "Nguồn tham khảo"} ↗</a>}</section>
    </details>
    {onClose && <button type="button" className={styles.close} aria-label="Đóng tên cấu trúc" onClick={onClose}><X size={14} strokeWidth={1.5} aria-hidden="true" /></button>}
  </div>;
}
