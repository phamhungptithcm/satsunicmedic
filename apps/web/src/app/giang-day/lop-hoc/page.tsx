import ClassroomWorkspace from '../../../components/classroom-workspace';
import {canPreviewScenario} from '../../../lib/pathophysiology';
export const metadata={title:'Lớp học',robots:{index:false,follow:false}};
export default async function Classes(){const enabled=canPreviewScenario(process.env.NODE_ENV,process.env.DISCOVERY_MODE_ENABLED);const atlas=enabled?{binding:(await import('../../../lib/pathophysiology-draft')).heartBinding,scenario:(await import('../../../lib/coronary-scenarios')).coronaryScenarios.infarction}:undefined;return <main id="main" className="article-layout"><h1>Lớp học</h1><p className="lead">Giao bài và theo dõi bài nộp của học viên.</p><ClassroomWorkspace atlas={atlas}/></main>;}
