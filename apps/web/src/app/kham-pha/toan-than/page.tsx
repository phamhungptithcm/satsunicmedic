import { isDiscoveryEnabled } from "../../../lib/discovery-release";
import { notFound } from "next/navigation";
import FullBodyExperience from "../../../components/full-body-experience";
export const dynamic = "force-dynamic";
export const metadata = { title: "Khám phá toàn thân", robots: { index: false, follow: false } };
export default function Page() { if (!isDiscoveryEnabled(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED))
    notFound(); return <><FullBodyExperience /></>; }
