import { notFound } from "next/navigation";
import ReferenceAnatomy from "../../../components/reference-anatomy";
import { canPreviewReferenceAnatomy } from "../../../lib/reference-anatomy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mô hình tham khảo", robots: { index: false, follow: false } };
export default function ReferenceAnatomyPage() {
  if (!canPreviewReferenceAnatomy(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED)) notFound();
  return <><div style={{padding:"14px 28px",background:"#eef2ff",color:"#163cff"}}><a href="/kham-pha/toan-than">Mở toàn thân · Chọn từng cấu trúc và khám phá bên trong →</a></div><ReferenceAnatomy /></>;
}
