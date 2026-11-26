import { AIO_PRODUCT } from "@/lib/aio";
import type { ComparePageData } from "./types";

const { priceDisplay, trialDays } = AIO_PRODUCT;

/**
 * Coach Dave Academy's LMU setups (sold through its Delta app), plus the other
 * common places to get LMU setups. Checked against coachdaveacademy.com,
 * tracktitan.io and setup vendors' install guides. Coach Dave's monthly price
 * differs by currency and page, so quote the UK figures with "at the time of
 * writing" and re-check them when `checked` moves.
 */
export const COACH_DAVE: ComparePageData = {
  key: "coach-dave",
  path: "/coach-dave-alternative",
  competitor: "Coach Dave Academy",
  title: "Coach Dave Alternative for LMU Setups: Apex AIO vs Delta",
  description:
    "Coach Dave Delta or Apex AIO for Le Mans Ultimate setups? Pro setups vs community setups with verified laps, setup editing, price, and where else to get LMU setups.",
  breadcrumb: "Apex AIO vs Coach Dave",
  social: { headline: "LMU setups: Apex AIO vs Coach Dave", tagline: "Pro setups or community setups with verified laps." },
  kicker: "Compare · LMU setups · Coach Dave Delta",
  h1: ["Coach Dave alternative", "for LMU setups"],
  lead:
    "Coach Dave sells pro-built Le Mans Ultimate setups through its Delta app. Apex AIO takes a different route: community setups ranked by verified laps, and a live editor to tune your own. Here's how they compare, and the other places LMU drivers get setups.",
  stats: [
    { value: "£11.99", label: "Delta / mo (UK)" },
    { value: "£109", label: "Delta / year (UK)" },
    { value: priceDisplay, label: "Apex AIO / mo" },
    { value: `${trialDays} days`, label: "Apex free trial" },
  ],
  summary: [
    "Coach Dave Academy is the big name in paid LMU setups. Coach Dave says its setups are built by professional esports drivers and engineers and cover every car in the game, and Delta installs them for you when you join a session. You also get pro reference laps and telemetry to compare against. If you want a known-good setup for every car and don't want to think about it, that's what you're paying for.",
    "Apex AIO is a different idea. Setups come from the community, and each one can carry the fastest verified clean lap driven on it, so you judge it on pace it has already shown rather than a name. You can only rate a setup after downloading it. Then there's a live setup editor and an optimiser to change the car yourself, with every change shown before it's applied.",
    "The honest trade-off: Coach Dave's library is curated and maintained by pros, while Apex AIO's community library depends on what drivers share, so coverage varies by car and track. In return Apex AIO is cheaper, includes the setup tools, and comes with overlays, a race engineer and a pit wall in the same price.",
  ],
  rows: [
    {
      feature: "Who makes the setups",
      apex: { v: "partly", note: "The community. Coverage depends on what's been shared for your car and track." },
      them: { v: "yes", note: "Professional esports drivers and engineers, according to Coach Dave." },
    },
    {
      feature: "Proof of pace",
      apex: { v: "yes", note: "Each setup can carry the fastest verified clean lap driven on it, linked when it was published." },
      them: { v: "yes", note: "Pro reference laps in Delta to compare your driving against." },
    },
    {
      feature: "Installs into LMU",
      apex: { v: "yes", note: "Press Get setup and it goes straight into LMU's setup screen." },
      them: { v: "yes", note: "Delta installs setups automatically when you join a session on PC." },
    },
    {
      feature: "Edit the setup yourself",
      apex: { v: "yes", note: "Live garage editor, plus an optimiser with ten handling sliders. Nothing applies until you press Apply." },
      them: { v: "partly", note: "Setup IQ adjusts a pro setup to your driving after a few clean laps." },
    },
    {
      feature: "Kept up to date after patches",
      apex: { v: "partly", note: "Depends on drivers sharing updated setups. The live editor works on any setup you load." },
      them: { v: "yes", note: "New setups after major game updates and BoP changes, released in batches." },
    },
    {
      feature: "Telemetry and lap comparison",
      apex: { v: "yes", note: "Every lap saved locally, optimal lap and lap-vs-lap traces." },
      them: { v: "yes", note: "Delta has LMU telemetry, pro reference laps and lap comparison, after the session." },
    },
    {
      feature: "Live overlays",
      apex: { v: "yes", note: "Twenty widgets in OBS or in-game." },
      them: { v: "no", note: "Analysis is in the pits or after the session. Delta's FAQ points to other tools for overlays." },
    },
    {
      feature: "Console players",
      apex: { v: "no", note: "Windows only." },
      them: { v: "yes", note: "A Console Wizard to enter the values by hand." },
    },
    {
      feature: "Price",
      apex: { v: "info", note: `${trialDays}-day free trial, then ${priceDisplay} a month. Setups have no per-setup charge.` },
      them: { v: "info", note: "Delta from £11.99 a month or £109 a year (UK) at the time of writing. Quarterly plan too." },
    },
  ],
  theyDoBetter: [
    {
      title: "A setup for every car, ready",
      body: "Coach Dave says it covers every car in LMU, with safer and faster variants for race and qualifying. Apex AIO's community library won't always have something for every combination.",
    },
    {
      title: "Built by pros",
      body: "If you want setups made by professional drivers and engineers, with their reference laps to chase, that's Coach Dave's whole offer.",
    },
    {
      title: "Refreshed after BoP",
      body: "Coach Dave puts out new setups after major updates and BoP changes. With community setups, you rely on drivers updating theirs.",
    },
    {
      title: "Consoles",
      body: "Delta has a Console Wizard for entering values by hand. Apex AIO is a Windows app.",
    },
  ],
  apexDoesBetter: [
    {
      title: "Judge a setup on a real lap",
      body: "Setups can show the fastest verified clean lap driven on them and how far that is from the board's best. Stars only come from people who've downloaded it.",
      page: "setups",
    },
    {
      title: "Change the car yourself, safely",
      body: "The live editor changes the car in the garage. The optimiser stages changes from sliders like front turn-in and rear traction, shows every value, and only applies when you say so.",
      page: "setups",
    },
    {
      title: "Your own setup library",
      body: "Named, tagged copies of your real setup files, kept where LMU can't overwrite them.",
      page: "setups",
    },
    {
      title: "Cheaper, with more in the box",
      body: "Setups are included in the one subscription, alongside the overlays, the voice race engineer and the team pit wall.",
      page: "overview",
    },
  ],
  together: {
    label: "Other options",
    title: "Other places to get LMU setups",
    body: [
      "Track Titan sells LMU setups made by HYMO, one at a time, in car bundles or on a subscription, and also does AI coaching for LMU. Other paid sellers include GO Setups and SimRacingSetup.",
      "For free setups, the official Le Mans Ultimate Discord has a lot of setup talk, and OverTake.gg (which took over RaceDepartment) has an LMU downloads section where setups turn up. LMU also has a free Coach Dave preset in its own garage setup menu, which Coach Dave describes as a safe, one-size-fits-all starting point.",
      "If you install a setup by hand, LMU keeps them per track, not per car, in Le Mans Ultimate\\UserData\\player\\Settings\\ inside your Steam install folder. Put the car in the file name so two setups for the same track don't overwrite each other.",
    ],
  },
  whoFor: {
    stay: [
      "You want a pro setup for every car without looking for one",
      "You value setups refreshed after every major BoP change",
      "You play LMU on console",
      "You chase pro reference laps",
    ],
    switch: [
      "You'd rather pick setups by verified lap time than by brand",
      "You like tuning the car yourself and want a safe way to do it",
      "You want overlays, a race engineer and a pit wall too",
      "You want to pay less each month",
    ],
  },
  faq: [
    {
      q: "How much are Coach Dave LMU setups?",
      a: "Coach Dave's LMU setups come with its Delta subscription. At the time of writing its UK page lists £11.99 a month or £109 a year, with a quarterly plan too. Prices differ by currency, so check coachdaveacademy.com for yours.",
    },
    {
      q: "Where can I get free LMU setups?",
      a: "LMU has a free Coach Dave preset in its own garage setup menu, and setups are shared in the official Le Mans Ultimate Discord and on OverTake.gg. Apex AIO's community setups have no per-setup charge, but they need an Apex AIO subscription after the free trial.",
    },
    {
      q: "Where does Le Mans Ultimate keep setup files?",
      a: "In your Steam install, under Le Mans Ultimate\\UserData\\player\\Settings\\, with one folder per track. There are no per-car folders, so name each file after the car. If you use a different Steam library location, the path starts there instead.",
    },
    {
      q: "Can I use Coach Dave setups with Apex AIO?",
      a: "Yes. Apex AIO's live editor and optimiser work on whatever setup is loaded in LMU, so you can start from any setup you have and tune it from there. Don't share paid setups publicly in the community library; that's the setup maker's work.",
    },
    {
      q: "Are Apex AIO's community setup lap times real?",
      a: "Yes. They're the fastest verified clean lap driven on that exact setup, linked to it when it was published. The author doesn't type them in.",
    },
  ],
  sources: [
    { label: "Coach Dave Delta and pricing", url: "https://coachdaveacademy.com/delta/" },
    { label: "Coach Dave LMU setups", url: "https://coachdaveacademy.com/lmu-setups/" },
    { label: "Coach Dave LMU setup subscription (UK pricing)", url: "https://coachdaveacademy.com/product/le-mans-ultimate-setup-subscription/" },
    { label: "Coach Dave: free LMU setups in the game", url: "https://coachdaveacademy.com/tutorials/free-lmu-setups-from-coach-dave/" },
    { label: "Coach Dave Delta help centre", url: "https://coachdaveacademy.com/documentation/coach-dave-delta-help-centre-the-complete-faq-guide/" },
    { label: "Track Titan LMU setups", url: "https://app.tracktitan.io/setups/leMansUltimate" },
    { label: "OverTake.gg LMU downloads", url: "https://www.overtake.gg/downloads/categories/le-mans-ultimate.260/" },
    { label: "SimRacingSetup: installing LMU setups", url: "https://simracingsetup.com/support/how-to-install-le-mans-ultimate-setups/" },
  ],
  checked: "2026-11-26",
  ctaBody:
    "Try the community setups, the live editor and the optimiser free for a week. Bring your own setups too: the editor works on any of them.",
};
