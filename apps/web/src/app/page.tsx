import { isDiscoveryEnabled } from "../lib/discovery-release";
export const dynamic = "force-dynamic";
import Explorer from "../components/explorer";
import FullBodyExperience from "../components/full-body-experience";
export default function Page() {
  if (isDiscoveryEnabled(process.env.NODE_ENV, process.env.DISCOVERY_MODE_ENABLED)) return <><FullBodyExperience /></>;
  return <Explorer />;
}
