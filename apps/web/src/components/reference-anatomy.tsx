"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Bone, Check, Heart, Layers3, Minus, Plus, RotateCcw, RotateCw, Scan, Wind } from "lucide-react";
import { referenceAnatomy } from "../lib/reference-anatomy";
import StructureInfo from "./structure-info";
import { referenceStructures, referenceGroups } from "../lib/structure-information";
import Loading from "./loading";
import styles from "./reference-anatomy.module.css";

const ReferenceCanvas = dynamic(() => import("@hs/anatomy-viewer/reference-canvas"), { ssr: false });
const layers = [
  { id: "skeleton", label: "Lồng ngực", Icon: Bone },
  { id: "lungs", label: "Mạch và phế quản", Icon: Wind },
  { id: "heart", label: "Tim", Icon: Heart },
];
export default function ReferenceAnatomy() {
  const [groups, setGroups] = useState(layers.map(layer => layer.id));
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [reset, setReset] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const onStatus = useCallback((next: typeof status) => setStatus(next), []);
  const ready = status === "ready";
  const [picked, setPicked] = useState<{ id: string; x: number; y: number } | null>(null);
  const selected = picked && groups.includes(referenceGroups[picked.id] ?? "") ? referenceStructures[picked.id] : undefined;
  const actions = [
    { label: "Xoay trái", Icon: RotateCcw, run: () => setRotation(value => value - 1) },
    { label: "Xoay phải", Icon: RotateCw, run: () => setRotation(value => value + 1) },
    { label: "Phóng to", Icon: Plus, run: () => setZoom(value => value + 1) },
    { label: "Thu nhỏ", Icon: Minus, run: () => setZoom(value => value - 1) },
    { label: "Góc nhìn ban đầu", Icon: Scan, run: () => setReset(value => value + 1) },
  ];
  return <main id="main" className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Vị trí hiện tại"><Link href="/"><ArrowLeft size={14} aria-hidden="true" /> Khám phá</Link><span>/</span><span aria-current="page">Mô hình tham khảo</span></nav>
    <section className={styles.workspace} aria-labelledby="reference-title">
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>GIẢI PHẪU TƯƠNG TÁC</p><h1 id="reference-title">Khám phá vùng ngực</h1></div>
      </div>
      <div className={styles.viewer}>
        <ReferenceCanvas key={attempt} url="/kham-pha/mo-hinh-tham-khao/asset" sha256={referenceAnatomy.sha256} byteLength={referenceAnatomy.byteLength} groups={groups} rotation={rotation} zoom={zoom} reset={reset} onStatus={onStatus} onPick={setPicked} selectedId={selected?.id} />
        {ready && picked && selected && <div className={styles.selection} style={{ left: `clamp(12px, ${picked.x}px, calc(100% - 300px))`, top: `clamp(70px, ${picked.y}px, calc(100% - 340px))` }}><StructureInfo item={selected} onClose={() => setPicked(null)} /></div>}
        <div className={styles.modelMeta}><span>Nam · Trưởng thành</span><span>BodyParts3D</span></div>
        {status === "loading" && <Loading overlay label="Đang mở mô hình" />}
        <div className={styles.feedback}>
          <p role="status">{status === "error" ? "Chưa mở được mô hình. Bạn có thể thử tải lại." : groups.length === 0 ? "Các lớp đang được ẩn. Chọn một lớp để xem lại." : ""}</p>
          {status === "error" && <button className={styles.retry} onClick={() => { setStatus("loading"); setAttempt(value => value + 1); }}>Thử lại</button>}
        </div>
        <div className={styles.controls} role="group" aria-label="Điều khiển mô hình">
          {actions.map(({ label, Icon, run }, index) => <button key={label} type="button" className={index === 2 || index === 4 ? styles.divider : undefined} disabled={!ready} aria-label={label} onClick={run}><Icon size={19} strokeWidth={1.7} aria-hidden="true" /><span className={styles.tooltip}>{label}</span></button>)}
        </div>
        <div className={styles.layerDock} role="group" aria-label="Các lớp giải phẫu">
          <span className={styles.layerLabel}><Layers3 size={16} aria-hidden="true" /> Lớp</span>
          {layers.map(({ id, label, Icon }) => <button type="button" key={id} disabled={!ready} aria-pressed={groups.includes(id)} onClick={() => setGroups(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id])}><Icon size={17} aria-hidden="true" /><span>{label}</span><Check size={13} className={styles.check} aria-hidden="true" /></button>)}
        </div>
        <p className={styles.hint}>Chạm cấu trúc để xem tên · Kéo để xoay · Cuộn/chụm để thu phóng</p>
      </div>
      <div className={styles.notes}>
        <label className={styles.structurePicker}>Tìm cấu trúc <select disabled={!ready} value={selected?.id ?? ""} onChange={event => setPicked(event.target.value ? { id: event.target.value, x: 20, y: 85 } : null)}><option value="">Chọn để xem thông tin</option>{Object.values(referenceStructures).filter(item => groups.includes(referenceGroups[item.id]!)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <details className={styles.details}><summary>Thông tin mô hình</summary><div>
          <p><strong>Độ tuổi:</strong> Mẫu nam trưởng thành. Nguồn chưa xác định tuổi cụ thể và chưa có các mẫu tuổi khác.</p>
          <p><strong>Phạm vi:</strong> Phần phổi chỉ có mạch và phế quản, chưa có bề mặt phổi. Màu sắc giúp phân biệt cấu trúc. Bản nguồn đã giảm số đa giác, có thể mất chi tiết nhỏ.</p>
          <p>{referenceAnatomy.sourceParts} thành phần nguồn · 8,7 MiB</p>
        </div></details>
      </div>
    </section>
    <footer className={styles.footer}>BodyParts3D, © The Database Center for Life Science · <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html">CC Attribution 4.0 International</a>. Chuyển OBJ sang GLB, đổi đơn vị và thêm màu minh họa bởi HumanScope.</footer>
  </main>;
}
