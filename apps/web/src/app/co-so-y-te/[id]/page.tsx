import Link from "../../../components/progress-link";
import { notFound } from 'next/navigation';
import { facilityViewSchema,uuid } from '@hs/contracts';
import { FacilityCard } from '../../../components/facility-card';
export const dynamic='force-dynamic';
export const metadata={title:'Chi nhánh cơ sở y tế'};
export default async function Branch({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{back?:string}>}){
 const {back}=await searchParams;const returnTo=typeof back==='string'&&back.length<=1024?`/co-so-y-te?${back}`:'/co-so-y-te';
 const {id}=await params;if(!uuid.safeParse(id).success)notFound();
 const response=await fetch(`${process.env.API_ORIGIN??'http://127.0.0.1:4186'}/api/v1/facilities/${id}`,{cache:'no-store',signal:AbortSignal.timeout(5000)});
 if(response.status===404)notFound();if(!response.ok)throw new Error('Facility unavailable');
 const branch=facilityViewSchema.parse(await response.json());
 return <main id="main" className="article-layout"><Link href={returnTo}>← Tra cứu cơ sở y tế</Link><h1>{branch.branchName}</h1><FacilityCard branch={branch} detail/><p>Thông tin tra cứu không xác nhận lịch hẹn hay khả năng tiếp nhận. Liên hệ cơ sở qua kênh chính thức.</p></main>;
}
