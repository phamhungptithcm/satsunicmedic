import { notFound } from "next/navigation";
import DiseaseAtlas from "../../../components/disease-atlas";
import { canPreviewScenario } from "../../../lib/pathophysiology";

export const metadata = { title: "Sinh lý bệnh", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PathophysiologyPreview({searchParams}:{searchParams:Promise<{topic?:string;level?:string;step?:string}>}) {
  const selected=await searchParams;
  if (!canPreviewScenario(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED)) notFound();
  const { heartBinding } = await import("../../../lib/pathophysiology-draft");
  const { diseases } = await import("../../../lib/disease-catalog-data");
  const { coronaryScenarios } = await import("../../../lib/coronary-scenarios");
  const { coronaryQuizDecks } = await import("../../../lib/coronary-quiz");
  return <><DiseaseAtlas initialTopic={selected.topic} initialLevel={selected.level} initialStep={selected.step?Number(selected.step):0} diseases={diseases} scenarios={coronaryScenarios} quizDecks={coronaryQuizDecks} binding={heartBinding} /></>;
}
