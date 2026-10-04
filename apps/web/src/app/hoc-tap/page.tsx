import PersonalStudy from '../../components/personal-study';
import Quizzes from '../../components/quizzes';
import LearningHub from '../../components/learning-hub';
import {canPreviewScenario} from '../../lib/pathophysiology';
export const metadata={title:'Học tập'};
export default async function Learning({searchParams}:{searchParams:Promise<{quiz?:string;revision?:string}>}){
 const {quiz,revision}=await searchParams;
 const units=canPreviewScenario(process.env.NODE_ENV,process.env.DISCOVERY_MODE_ENABLED)?(await import('../../lib/disease-catalog-data')).diseases.map(({id,title,organ,system,simulation})=>({id,title,organ,system,simulation:simulation!==null})):[];
 return <main id="main" className="article-layout"><p className="eyebrow">HỌC TẬP</p><h1>Học và ôn tập</h1><p className="lead">Tìm hiểu giải phẫu, cơ chế bệnh và ôn lại kiến thức.</p><LearningHub units={units}/><section id="kiem-tra"><h2>Kiểm tra và ôn tập</h2><p>Đăng nhập để lưu kết quả bài kiểm tra.</p><Quizzes initialQuiz={quiz} initialRevision={revision?Number(revision):undefined}/></section><PersonalStudy/></main>;
}
