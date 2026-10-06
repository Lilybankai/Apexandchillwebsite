import { buildLlmsTxt } from "@/lib/llms";

/** Static — the index only changes when the site is deployed. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
