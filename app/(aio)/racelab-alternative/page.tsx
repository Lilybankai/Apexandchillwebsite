import { ComparePage } from "@/components/aio/compare/ComparePage";
import { RACELAB } from "@/lib/aio-compare/racelab";
import { buildCompareMetadata } from "@/lib/aio-compare/seo";

export const metadata = buildCompareMetadata(RACELAB);

/** The trial buttons read the live release. */
export const revalidate = 1800;

export default function Page() {
  return <ComparePage data={RACELAB} />;
}
