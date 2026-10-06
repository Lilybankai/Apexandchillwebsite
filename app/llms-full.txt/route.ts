import { buildLlmsFullTxt } from "@/lib/llms";
import { fetchGt7Schedule } from "@/lib/api/gt7";
import { fetchLmuSchedule, fetchThursdaySchedule } from "@/lib/api/simgrid";
import { isThursdayConfigured } from "@/lib/leagues";

/** Re-derive hourly so the upcoming-races list follows the calendar. */
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const [gt7, lmu, thu] = await Promise.all([
    fetchGt7Schedule(),
    fetchLmuSchedule(),
    isThursdayConfigured() ? fetchThursdaySchedule() : Promise.resolve(undefined),
  ]);
  return new Response(buildLlmsFullTxt({ GT7: gt7, LMU: lmu, THU: thu }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
