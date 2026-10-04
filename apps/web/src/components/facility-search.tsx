'use client';
import { useProgressRouter as useRouter } from './request-progress';
import Loading from './loading';
import { useEffect,useRef,useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search,RotateCcw,ChevronDown } from 'lucide-react';
import { request } from '@hs/api-client';
import { provinces,specialties,diseaseDirectoryRelations,relationForDisease,facilityPageSchema,type FacilityView } from '@hs/contracts';
import { FacilityCard } from './facility-card';
import styles from './learning-workspace.module.css';
export default function FacilitySearch(){
 const params=useSearchParams(),router=useRouter();
 const query=params.get('q')??'',areaCode=params.get('province')??'',specialtyId=params.get('specialty')??'',diseaseId=params.get('disease')??'';
 const [items,setItems]=useState<FacilityView[]>([]),[next,setNext]=useState<string|null>(null),[busy,setBusy]=useState(true),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 const pending=useRef<AbortController|null>(null);
 const related=relationForDisease(diseaseId);
 const filters={query,...(diseaseId?{diseaseId}:{}),...(areaCode?{areaCode}:{}),...(specialtyId?{specialtyId}:{}),limit:20};
 const filterKey=JSON.stringify(filters);
 useEffect(()=>{
  const controller=new AbortController();pending.current?.abort();pending.current=controller;
  setBusy(true);setFailed(false);setItems([]);setNext(null);
  request<unknown>('/api/v1/facilities/search',{method:'POST',body:filterKey,signal:controller.signal}).then(value=>{
   if(controller.signal.aborted)return;const page=facilityPageSchema.parse(value);setItems(page.items);setNext(page.nextCursor);
  }).catch(()=>{if(!controller.signal.aborted)setFailed(true);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});
  return ()=>controller.abort();
 },[filterKey,retry]);
 async function more(){
  if(!next||busy)return;const controller=new AbortController();pending.current?.abort();pending.current=controller;setBusy(true);setFailed(false);
  try{const page=facilityPageSchema.parse(await request<unknown>('/api/v1/facilities/search',{method:'POST',body:JSON.stringify({...filters,cursor:next}),signal:controller.signal}));if(controller.signal.aborted)return;setItems(old=>[...old,...page.items.filter(item=>!old.some(v=>v.id===item.id))]);setNext(page.nextCursor);}
  catch{if(!controller.signal.aborted)setFailed(true);}finally{if(!controller.signal.aborted)setBusy(false);}
 }
 function submit(event:React.SubmitEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget),search=new URLSearchParams();for(const key of ['q','province','specialty','disease']){const value=String(form.get(key)??'').trim();if(value)search.set(key,value);}const suffix=search.toString();if(suffix===params.toString())setRetry(v=>v+1);else router.replace(`/co-so-y-te${suffix?`?${suffix}`:''}`,{scroll:false});}
 return <>
  <form key={params.toString()} className={styles.filters} onSubmit={submit} aria-label="Tìm cơ sở y tế">
   <label>Tên cơ sở hoặc địa chỉ<input name="q" defaultValue={query} maxLength={120} placeholder="Ví dụ: Bạch Mai"/></label>
   <label>Tỉnh/thành<select name="province" defaultValue={areaCode}><option value="">Tất cả khu vực</option>{provinces.map(p=><option key={p.code} value={p.code}>{p.name}</option>)}</select></label>
   <label>Chuyên khoa<select name="specialty" defaultValue={specialtyId}><option value="">Tất cả chuyên khoa</option>{specialties.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
   <label>Chủ đề bệnh<select name="disease" defaultValue={diseaseId}><option value="">Tất cả bệnh trong danh mục</option>{diseaseDirectoryRelations.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
   <div className={styles.actions}><button type="submit" title="Tìm cơ sở" aria-label="Tìm cơ sở"><Search size={18}/></button><button type="button" title="Xóa bộ lọc" aria-label="Xóa bộ lọc" onClick={()=>{router.replace('/co-so-y-te',{scroll:false});setRetry(v=>v+1);}}><RotateCcw size={18}/></button></div>
  </form>
  {related&&<p className={styles.note}>{related.name}: tra cứu chuyên khoa liên quan. Bạn nên liên hệ cơ sở để được hướng dẫn trước khi khám. <a href={related.source} target="_blank" rel="noopener noreferrer">Tài liệu tham khảo</a></p>}
  <p className={styles.note}>Chuyên khoa được đối chiếu theo từng cơ sở. Thông tin quá hạn rà soát sẽ tạm ẩn.</p>
  <div role={busy?undefined:"status"}>{busy?<Loading inline label="Đang tìm cơ sở"/>:failed?'Chưa tải được danh sách. Bạn có thể thử lại.':`${items.length} cơ sở đã tìm thấy`}</div>
  {failed&&<button onClick={()=>next?void more():setRetry(v=>v+1)}>Thử lại</button>}
  {!busy&&!failed&&!items.length&&<section className="library-empty"><h2>{next?'Chưa tìm thấy trong phần đã xem':'Chưa tìm thấy cơ sở phù hợp'}</h2><p>Danh mục còn được bổ sung. Thử giảm bộ lọc{next?' hoặc tiếp tục tra cứu':''}.</p></section>}
  <div className="content-grid">{items.map(b=><FacilityCard key={b.id} branch={b} back={params.toString()}/>)}</div>
  {next&&<button disabled={busy} className={styles.more} onClick={()=>void more()}><ChevronDown size={16}/>Xem tiếp</button>}
 </>;
}
