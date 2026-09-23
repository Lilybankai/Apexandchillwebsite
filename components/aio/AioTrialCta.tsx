import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AIO_PRODUCT } from "@/lib/aio";
import { getLatestAioRelease } from "@/lib/aio-release";

const { discordUrl, downloadPath, priceDisplay, trialDays } = AIO_PRODUCT;

/**
 * The download button, with the live installer filename so the browser saves
 * it under the right name. Reads the same cached release lookup as the hub, so
 * any number of these on a page cost one GitHub request per revalidate.
 */
export async function AioTrialButton({
  label = `Start your ${trialDays}-day free trial`,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const release = await getLatestAioRelease();
  return (
    <Button href={downloadPath} size="lg" clip download={release.installerFilename} className={className}>
      <Download size={18} />
      {label}
    </Button>
  );
}

/**
 * The closing call to action every Apex AIO topic page ends on, set like a
 * broadcast end card: flat, hairline, a plain heading and the build line in
 * mono. The trial button is the one lit thing on it.
 */
export async function AioTrialCta({
  heading = `Try it free for ${trialDays} days`,
  body,
}: {
  heading?: string;
  body: string;
}) {
  const release = await getLatestAioRelease();
  return (
    <section className="container-rail py-12">
      <div className="border-y border-line">
        <div className="flex items-center justify-between gap-4 border-b border-line py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
          <span>Apex AIO</span>
          <span className="tabular-nums">v{release.version}</span>
        </div>
        <div className="grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-14">
          <div>
            <h2 className="text-4xl font-bold leading-[0.95] text-ink sm:text-5xl lg:text-6xl">{heading}</h2>
            <p className="mt-5 max-w-xl text-lg text-muted">{body}</p>
          </div>
          <div className="flex flex-col gap-5 lg:items-end">
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <AioTrialButton label="Start the free trial" />
              <Button href={discordUrl} size="lg" variant="ghost" target="_blank" rel="noopener noreferrer">
                Ask us on Discord
                <ArrowRight size={18} />
              </Button>
            </div>
            <dl className="grid grid-cols-3 border-t border-line pt-4 font-mono text-xs uppercase tracking-wider lg:min-w-[26rem]">
              {[
                ["Platform", "Windows"],
                ["Trial", `${trialDays} days`],
                ["Then", `${priceDisplay}/mo`],
              ].map(([term, value]) => (
                <div key={term} className="flex flex-col gap-1">
                  <dt className="text-[10px] tracking-[0.2em] text-subtle">{term}</dt>
                  <dd className="tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="font-mono text-[11px] uppercase tracking-wider text-subtle">Everything included. One plan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
