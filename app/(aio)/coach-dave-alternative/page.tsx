import { ComparePage } from "@/components/aio/compare/ComparePage";
import { COACH_DAVE } from "@/lib/aio-compare/coach-dave";
import { buildCompareMetadata } from "@/lib/aio-compare/seo";

export const metadata = buildCompareMetadata(COACH_DAVE);

/** The trial buttons read the live release. */
export const revalidate = 1800;

export default function Page() {
  return <ComparePage data={COACH_DAVE} />;
}
