import { Suspense } from 'react';
import FacilitySearch from '../../components/facility-search';
export const metadata={title:'Cơ sở y tế'};
export default function Facilities(){return <main id="main" className="article-layout"><p className="eyebrow">TRA CỨU</p><h1>Cơ sở y tế</h1><p className="lead">Tìm nơi khám theo tỉnh thành và chuyên khoa. Danh sách không xếp hạng chất lượng điều trị.</p><Suspense fallback={<p role="status">Đang mở tra cứu…</p>}><FacilitySearch/></Suspense></main>;}
