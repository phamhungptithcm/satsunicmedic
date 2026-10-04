import Link from "./progress-link";
import { specialties, provinceForCode, type FacilityView } from '@hs/contracts';
export function FacilityCard({branch:b,detail=false,back=''}:{branch:FacilityView;detail?:boolean;back?:string}){
 return <article className="content-card">
  {!detail&&<h2><Link href={`/co-so-y-te/${b.id}${back?`?back=${encodeURIComponent(back)}`:''}`}>{b.branchName}</Link></h2>}
  <p>{b.legalName}</p><p>{b.address}</p><p>{provinceForCode(b.areaCode)?.name??'Khu vực chưa chuẩn hóa'}</p>
  {b.services.length>0?<ul>{b.services.map((s,i)=><li key={`${s.specialtyId}-${i}`}>{specialties.find(v=>v.id===s.specialtyId)?.name} · <a href={s.evidence.url} target="_blank" rel="noopener noreferrer">Thông tin chuyên khoa</a></li>)}</ul>:<p>Chưa xác minh được chuyên khoa tại cơ sở này.</p>}
  <a href={b.officialUrl} target="_blank" rel="noopener noreferrer">Trang chính thức ↗</a>
  <p>Rà soát ngày: <time dateTime={b.checkedAt}>{new Intl.DateTimeFormat('vi',{dateStyle:'medium',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(b.checkedAt))}</time></p>
  <details open={detail}><summary>Nguồn thông tin</summary>{b.evidence.map((e,i)=><p key={i}><a href={e.url} target="_blank" rel="noopener noreferrer">{e.title}</a></p>)}</details>
 </article>;
}
