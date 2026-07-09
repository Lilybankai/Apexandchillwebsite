import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Car,
  CheckCircle2,
  Download,
  FolderDown,
  Gauge,
  Image as ImageIcon,
  Layers,
  Palette,
  Play,
  Shapes,
  Sparkles,
  Type as TypeIcon,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * ── OPERATOR: THE LIVE LINKS ─────────────────────────────────────────────────
 * These two buttons are the whole point of the page.
 *   • STUDIO_URL        — the hosted LMU Livery Studio web tool (opens the editor)
 *   • COMPANION_APP_URL — the installer, hosted as a GitHub Release asset (keeps
 *     the big binary out of the app repo). To ship a new build, upload the new
 *     .exe to a GitHub Release and point this at its asset URL.
 */
const STUDIO_URL = "https://lmuliverystudio.com/";
const COMPANION_APP_URL =
  "https://github.com/Lilybankai/Apexandchillwebsite/releases/download/livery-installer-v0.1.0/LMU.Livery.Installer.Setup.0.1.0.exe";
/** Clean filename the browser saves the download as. */
const COMPANION_APP_FILENAME = "LMU Livery Installer Setup 0.1.0.exe";

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

export const metadata: Metadata = {
  title: "LMU Livery Studio — Free Le Mans Ultimate Livery Creator",
  description:
    "Create high-quality Le Mans Ultimate liveries in your browser — no GIMP or Photoshop needed. Add images, textures, patterns, shapes and text, export a 4K TGA, and let the free companion installer app drop it straight into your game. Supports every GT3 car in LMU.",
  keywords: [
    "LMU liveries",
    "LMU livery creator",
    "LMU livery tool",
    "Le Mans Ultimate livery",
    "Le Mans Ultimate liveries",
    "Le Mans Ultimate livery creator",
    "LMU livery editor",
    "LMU custom liveries",
    "LMU livery maker",
    "LMU livery installer",
    "how to install LMU liveries",
    "LMU GT3 liveries",
  ],
  alternates: {
    canonical: "/lmu-livery-studio",
  },
  openGraph: {
    type: "website",
    url: "/lmu-livery-studio",
    title: "LMU Livery Studio — Free Le Mans Ultimate Livery Creator",
    description:
      "Design pro-quality Le Mans Ultimate liveries in your browser — no Photoshop needed — then auto-install them into the game with the free companion app.",
    images: [{ url: "/lmu-livery-studio.png", width: 1913, height: 944, alt: "LMU Livery Studio editor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LMU Livery Studio — Free Le Mans Ultimate Livery Creator",
    description:
      "Design pro-quality LMU liveries in your browser, then auto-install them with the free companion app. Supports every GT3 car in Le Mans Ultimate.",
    images: ["/lmu-livery-studio.png"],
  },
};

/** What you can add to a livery inside the editor. */
const TOOLBOX: { icon: typeof Palette; title: string; body: string }[] = [
  { icon: ImageIcon, title: "Images", body: "Drop in logos, sponsor decals or your own artwork and position them anywhere on the car." },
  { icon: Sparkles, title: "Textures", body: "Layer carbon fibre, brushed metal and finish textures for depth a flat fill can't give." },
  { icon: Shapes, title: "Patterns", body: "Racing stripes, checkerboard, houndstooth, honeycomb, herringbone and more in a click." },
  { icon: Layers, title: "Shapes", body: "Draw and warp shapes — drag the corners to distort, curve the edges, build any form." },
  { icon: TypeIcon, title: "Text", body: "Add race numbers, driver names and sponsor text with full control over the look." },
  { icon: BookOpen, title: "Full tutorial", body: "A built-in, step-by-step tutorial walks you through your first livery start to finish." },
];

/** The four-step design → drive flow. */
const STEPS: { icon: typeof Wand2; title: string; body: string }[] = [
  {
    icon: Wand2,
    title: "Design in the Studio",
    body: "Pick your car and base colour, then build your livery with images, textures, patterns, shapes and text. No GIMP, no Photoshop — everything happens in the browser.",
  },
  {
    icon: Download,
    title: "Export a 4K TGA",
    body: "One click exports a game-ready 4K TGA straight to your Downloads folder — the exact format and resolution Le Mans Ultimate expects.",
  },
  {
    icon: FolderDown,
    title: "Companion app installs it",
    body: "Our free LMU Livery Installer watches your Downloads folder, detects the export and moves it into the correct game files folder automatically — no manual file wrangling.",
  },
  {
    icon: Play,
    title: "Load it in-game",
    body: "Open Le Mans Ultimate and your custom livery is already in the right place, ready to select and drive. That's it.",
  },
];

/** Frequently-asked questions — also emitted as FAQPage structured data below. */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need Photoshop or GIMP to make an LMU livery?",
    a: "No. The LMU Livery Studio runs entirely in your browser. If you've never touched image-editing software, you can still build a clean, high-quality Le Mans Ultimate livery using simple tools for images, textures, patterns, shapes and text.",
  },
  {
    q: "How do I install a livery into Le Mans Ultimate?",
    a: "Export your design from the Studio as a 4K TGA, then run our free LMU Livery Installer companion app. It automatically detects the download and copies it into the correct game folder, so the livery is ready the next time you open the game — no manual file moving required.",
  },
  {
    q: "Which cars are supported?",
    a: "The Studio currently supports every GT3 car enabled in Le Mans Ultimate, so you can build a livery for the full LMGT3 grid.",
  },
  {
    q: "Is the LMU Livery Studio free?",
    a: "Yes — both the browser-based livery creator and the companion installer app are free to use.",
  },
];

export default function LmuLiveryStudioPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LMU Livery Studio",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "A free browser-based livery creator for Le Mans Ultimate. Add images, textures, patterns, shapes and text, export a 4K TGA, and auto-install with the companion app.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  };

  return (
    <div className="pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <div className="container-rail relative py-20">
          <span className="kicker mb-4">Le Mans Ultimate · Free Livery Creator</span>
          <h1 className="max-w-4xl text-5xl font-bold text-ink sm:text-6xl lg:text-7xl">
            LMU <span className="text-gradient">Livery Studio</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Design pro-quality <strong className="text-ink">Le Mans Ultimate liveries</strong> right
            in your browser — no GIMP, no Photoshop, no experience needed. Build it, export a 4K TGA,
            and let our companion app drop it straight into the game for you.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={STUDIO_URL} size="lg" clip target="_blank" rel="noopener noreferrer">
              <Wand2 size={18} />
              Open the Livery Studio
            </Button>
            <Button href={COMPANION_APP_URL} size="lg" variant="outline" download={COMPANION_APP_FILENAME}>
              <Download size={18} />
              Download the Installer App
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {["No Photoshop required", "4K TGA export", "Auto-install companion app", "Every LMU GT3 car"].map(
              (point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success" />
                  {point}
                </li>
              ),
            )}
          </ul>

          {/* Editor preview — autoplaying promo. Muted + playsInline are required
              for autoplay; the screenshot is the poster for an instant first paint. */}
          <div className="relative mt-12 overflow-hidden rounded-card border border-line shadow-glow-soft">
            <video
              src="/lmu-livery-studio-promo.mp4"
              poster="/lmu-livery-studio.png"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="A walkthrough of the LMU Livery Studio editor designing a Le Mans Ultimate livery"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* ── What it is ───────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Pro liveries, <span className="text-gradient">zero learning curve</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              Making a custom livery used to mean wrestling with layered PSDs and UV maps in complex
              editors like GIMP or Photoshop. The LMU Livery Studio throws all of that out. Everything
              you need lives on one canvas: pick your car, set a base colour, and start adding images,
              textures, patterns, shapes and text until it looks exactly how you want.
            </p>
            <p className="mt-4 text-lg text-muted">
              A live UV guide and class stickers show you precisely where each element lands on the
              car, so the finished livery looks sharp from every angle — the very first time.
            </p>
          </div>
          <Card variant="glow" className="p-8">
            <div className="flex items-center gap-3">
              <Gauge className="text-cyan" size={22} />
              <h3 className="text-2xl font-bold text-ink">Built for LMGT3</h3>
            </div>
            <p className="mt-4 text-muted">
              The Studio supports <strong className="text-ink">every GT3 car currently enabled in
              Le Mans Ultimate</strong> — so whichever machine you race in the LMGT3 class, you can
              give it a livery that's unmistakably yours.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-card border border-line bg-surface/60 px-4 py-2 text-sm text-muted">
              <Car size={16} className="text-accent" />
              Full LMU GT3 grid supported
            </div>
          </Card>
        </div>
      </section>

      {/* ── Toolbox ──────────────────────────────────────────────────────── */}
      <section className="container-rail py-8">
        <div className="mb-8 flex items-center gap-3">
          <Palette size={20} className="text-accent" />
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
            Everything in one editor
          </h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLBOX.map((tool) => (
            <Card key={tool.title} variant="default" interactive className="p-6">
              <tool.icon size={24} className="text-cyan" />
              <h3 className="mt-4 text-xl font-bold text-ink">{tool.title}</h3>
              <p className="mt-2 text-sm text-muted">{tool.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-10 text-center">
          <span className="kicker mb-4">Design → Drive in four steps</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            From canvas to <span className="text-gradient">cockpit</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            The whole point of the Studio is that it's effortless end to end. Here's the entire
            journey from a blank car to driving your own design.
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card variant="default" className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-bold text-line">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-ink">{step.title}</h3>
                <p className="text-sm text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Companion app ────────────────────────────────────────────────── */}
      <section className="container-rail py-8">
        <Card variant="glow" clip className="overflow-hidden">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <span className="kicker mb-4">The companion app</span>
              <h2 className="text-4xl font-bold text-ink">
                LMU Livery <span className="text-gradient">Installer</span>
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-muted">
                No digging through game directories. Install the free companion app once and it runs
                quietly in the background — the moment you export a livery, it detects the download,
                moves it into the correct Le Mans Ultimate folder, and you're done. Open the game and
                your livery is already there, ready to load.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Auto-detects new livery exports in your Downloads folder",
                  "Moves them into the correct LMU game files folder for you",
                  "Your livery loads automatically next time you launch the game",
                  "Set it up once — no manual file moving ever again",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-muted">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={COMPANION_APP_URL} size="lg" download={COMPANION_APP_FILENAME}>
                  <Download size={18} />
                  Download the Installer App
                </Button>
                <Button href={STUDIO_URL} size="lg" variant="outline" target="_blank" rel="noopener noreferrer">
                  <Wand2 size={18} />
                  Open the Studio
                </Button>
              </div>
            </div>
            <div
              aria-hidden
              className="hidden items-center justify-center lg:flex"
            >
              <div className="grid h-40 w-40 place-items-center rounded-card border border-accent/40 bg-surface/60 shadow-glow-soft">
                <FolderDown size={72} className="text-accent" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="container-rail py-16">
        <div className="mb-8 flex items-center gap-3">
          <Zap size={20} className="text-accent" />
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
            Frequently asked
          </h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <Card key={item.q} variant="default" className="p-6">
              <h3 className="text-lg font-bold text-ink">{item.q}</h3>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="container-rail py-8">
        <div className="flex flex-col items-center gap-5 rounded-card border border-accent/40 bg-surface/50 p-10 text-center shadow-glow-soft">
          <h2 className="text-4xl font-bold text-ink">Build your first LMU livery</h2>
          <p className="max-w-xl text-muted">
            Open the Studio, design something unmistakably yours, and have it in-game in minutes.
            Free to use, no editing experience required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={STUDIO_URL} size="lg" clip target="_blank" rel="noopener noreferrer">
              <Wand2 size={18} />
              Open the Livery Studio
              <ArrowRight size={18} />
            </Button>
            <Button href={COMPANION_APP_URL} size="lg" variant="outline" download={COMPANION_APP_FILENAME}>
              <Download size={18} />
              Get the Installer App
            </Button>
          </div>
          <p className="text-sm text-subtle">
            Questions or want to share your design?{" "}
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
              Join our Discord
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
