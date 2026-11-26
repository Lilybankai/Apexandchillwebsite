import { ComparePage } from "@/components/aio/compare/ComparePage";
import { SIMHUB } from "@/lib/aio-compare/simhub";
import { buildCompareMetadata } from "@/lib/aio-compare/seo";

export const metadata = buildCompareMetadata(SIMHUB);

/** The trial buttons read the live release. */
export const revalidate = 1800;

export default function Page() {
  return <ComparePage data={SIMHUB} />;
}
