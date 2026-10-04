"use client";
import type { HTMLAttributes } from 'react';
import { Scissors } from 'lucide-react';
import { defaultSection, sceneSections, sectionAxes, type BodySection, type BodySections, type SectionAxis } from '@hs/anatomy-viewer/body-sections';
import type { BodyScene } from '@hs/anatomy-viewer/scene-history';
import styles from './full-body-anatomy.module.css';

const names: Record<SectionAxis, string> = { axial: 'Ngang', coronal: 'Trán', sagittal: 'Dọc' };
type Props = { scene: BodyScene; disabled: boolean; change: (patch: Partial<BodyScene>) => void; adjust: (patch: Partial<BodyScene>) => void; sliderEvents: HTMLAttributes<HTMLInputElement> };
export default function BodySectionControls({ scene, disabled, change, adjust, sliderEvents }: Props) {
 const sections = sceneSections(scene), enabled = sectionAxes.some(axis => !!sections[axis]);
 const update = (axis: SectionAxis, cut: BodySection | undefined, transient = false) => {
  const next: BodySections = { ...sections };
  if (cut) next[axis] = cut; else delete next[axis];
  (transient ? adjust : change)({ sections: next, clipping: null });
 };
 return <section aria-label="Cắt hình học">
  <label className={styles.toggle}><span><Scissors size={15}/>Cắt mô hình</span><input type="checkbox" checked={enabled} disabled={disabled} onChange={e=>change({clipping:null,sections:e.target.checked?{axial:defaultSection()}:{}})}/></label>
  {enabled && <>
   <p className={styles.note}>Chọn tối đa ba mặt phẳng. Vị trí tính theo vùng cơ thể đang xem. Đây là cắt hình học, không phải ảnh CT/MRI.</p>
   {sectionAxes.map(axis => {
    const cut=sections[axis];
    return <fieldset key={axis} className={styles.sectionPlane} disabled={disabled}>
     <legend>{names[axis]}</legend>
     <label className={styles.toggle}><span>Bật mặt phẳng {names[axis].toLowerCase()}</span><input type="checkbox" checked={!!cut} onChange={e=>update(axis,e.target.checked?defaultSection():undefined)}/></label>
     {cut && <>
      <label className={styles.range}>Vị trí {names[axis].toLowerCase()} · {Math.round(cut.position*100)}%<input type="range" min="0" max="100" aria-label={`Vị trí cắt ${names[axis].toLowerCase()}`} value={Math.round(cut.position*100)} {...sliderEvents} onChange={e=>update(axis,{...cut,position:Number(e.target.value)/100},true)}/></label>
      <label className={styles.range}>Góc nghiêng {names[axis].toLowerCase()} · {cut.tilt}°<input type="range" min="-60" max="60" aria-label={`Góc nghiêng ${names[axis].toLowerCase()}`} value={cut.tilt} {...sliderEvents} onChange={e=>update(axis,{...cut,tilt:Number(e.target.value)},true)}/></label>
      <button type="button" className={styles.textButton} aria-pressed={cut.reversed} onClick={()=>update(axis,{...cut,reversed:!cut.reversed})}>Đảo phía giữ lại · {names[axis]}</button>
     </>}
    </fieldset>;
   })}
   <button type="button" className={styles.textButton} onClick={()=>change({sections:{},clipping:null})}>Bỏ các mặt phẳng cắt</button>
  </>}
 </section>;
}
