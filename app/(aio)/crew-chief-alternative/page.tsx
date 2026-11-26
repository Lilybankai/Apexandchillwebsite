import { ComparePage } from "@/components/aio/compare/ComparePage";
import { CREW_CHIEF } from "@/lib/aio-compare/crew-chief";
import { buildCompareMetadata } from "@/lib/aio-compare/seo";

export const metadata = buildCompareMetadata(CREW_CHIEF);

/** The trial buttons read the live release. */
export const revalidate = 1800;

export default function Page() {
  return <ComparePage data={CREW_CHIEF} />;
}
