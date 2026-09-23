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

/** The closing call to action every Apex AIO topic page ends on. */
export async function AioTrialCta({
  heading = `Try it free for ${trialDays} days`,
  body,
}: {
  heading?: string;
  body: string;
}) {
  const release = await getLatestAioRelease();
  return (
    <section className="container-rail py-8">
      <div className="flex flex-col items-center gap-5 rounded-card border border-accent/40 bg-surface/50 p-10 text-center shadow-glow-soft">
        <h2 className="text-4xl font-bold text-ink">{heading}</h2>
        <p className="max-w-xl text-muted">{body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <AioTrialButton label="Start the free trial" />
          <Button href={discordUrl} size="lg" variant="outline" target="_blank" rel="noopener noreferrer">
            Ask us anything
            <ArrowRight size={18} />
          </Button>
        </div>
        <p className="text-sm text-subtle">
          Windows · v{release.version} · {priceDisplay}/month after the trial · everything included
        </p>
      </div>
    </section>
  );
}
