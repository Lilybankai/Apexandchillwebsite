import { AIO_PRODUCT } from "@/lib/aio";
import type { ComparePageData } from "./types";

const { priceDisplay, trialDays } = AIO_PRODUCT;

/**
 * SimHub. Checked against SHWotever's GitHub releases and wiki (primary) and
 * simhubdash.com. The licence price is pay-what-you-want and third-party
 * guides disagree on the minimum, so the page deliberately quotes no figure.
 */
export const SIMHUB: ComparePageData = {
  key: "simhub",
  path: "/simhub-alternative",
  competitor: "SimHub",
  title: "SimHub Alternative for LMU: Apex AIO vs SimHub Compared",
  description:
    "SimHub or Apex AIO for Le Mans Ultimate? An honest comparison: hardware, dashboards, overlays, voice engineer, setups, team pit wall and price.",
  breadcrumb: "Apex AIO vs SimHub",
  social: { headline: "Apex AIO vs SimHub", tagline: "Which one you need for LMU, and when to run both." },
  kicker: "Compare · SimHub · Le Mans Ultimate",
  h1: ["SimHub alternative", "for Le Mans Ultimate"],
  lead:
    "SimHub drives your hardware. Apex AIO is built around LMU itself: overlays that can work the pit menu, a voice engineer, setups, a team pit wall and lap review. Here's where each one fits, including the bits SimHub does better.",
  stats: [
    { value: "9.2.0", label: "SimHub LMU since" },
    { value: "80+", label: "SimHub games" },
    { value: "LMU", label: "Apex built for" },
    { value: `${trialDays} days`, label: "Apex free trial" },
  ],
  summary: [
    "Most people searching for a SimHub alternative don't need to replace SimHub at all. SimHub is the best tool going for the physical side of a rig: bass shakers, wind fans, LEDs, Arduino builds, button boxes and gauges, plus a paid motion add-on. If you've built your rig around it, keep it.",
    "Where it runs out is the LMU-specific software around the race. It has no voice race engineer, no setup library, no lap-trace comparison and no team pit wall over the internet. Its browser dashboards are meant for your home network. Apex AIO does all of those for Le Mans Ultimate in one app.",
    "So the honest answer: if you want a nicer standings overlay and that's it, a SimHub dash can do it. If you want the race engineer, setups and pit wall as well, run Apex AIO alongside SimHub. The two don't fight over anything.",
  ],
  rows: [
    {
      feature: "Le Mans Ultimate support",
      apex: { v: "yes", note: "Built for LMU first. Works over LMU's own API with no plugin to install." },
      them: { v: "yes", note: "Official since 9.2.0 (Feb 2024). Since 9.11.6 most data comes from LMU's native shared memory." },
    },
    {
      feature: "Overlays",
      apex: { v: "yes", note: "Twenty ready-made widgets, in OBS or drawn over the sim." },
      them: { v: "yes", note: "Build your own in Dash Studio or use community dashes. In-game overlays need windowed or borderless mode." },
    },
    {
      feature: "Voice race engineer",
      apex: { v: "yes", note: "Push-to-talk. 28 questions answered offline from live telemetry." },
      them: { v: "no", note: "Not built in. People add third-party tools for voice." },
    },
    {
      feature: "LMU setups",
      apex: { v: "yes", note: "Community setups with verified laps, a live setup editor and an optimiser." },
      them: { v: "no", note: "No setup library or editor in SimHub's docs." },
    },
    {
      feature: "Team pit wall",
      apex: { v: "yes", note: "Live board for the crew, in the app or any browser, anywhere." },
      them: { v: "partly", note: "Browser dashboards work on your local network. Team telemetry over the internet needs a paid third-party add-on." },
    },
    {
      feature: "Lap telemetry review",
      apex: { v: "yes", note: "Every lap saved locally. Optimal lap and lap-vs-lap traces by distance." },
      them: { v: "partly", note: "Tracks lap times, sector bests and deltas for dashboards. No lap-trace comparison." },
    },
    {
      feature: "Bass shakers, wind, motion",
      apex: { v: "no", note: "Not something Apex AIO does." },
      them: { v: "yes", note: "ShakeIt for shakers and wind. Motion is a paid add-on." },
    },
    {
      feature: "LEDs, Arduino, button boxes",
      apex: { v: "partly", note: "MFD rows can be driven from wheel buttons, a Stream Deck or hotkeys. No LED or Arduino output." },
      them: { v: "yes", note: "LEDs, displays, gauges, button boxes, wheels and a Stream Deck editor." },
    },
    {
      feature: "Other games",
      apex: { v: "partly", note: "LMU fully. rFactor 2 for the core widgets." },
      them: { v: "yes", note: "80+ games across racing and more." },
    },
    {
      feature: "Price",
      apex: { v: "info", note: `${trialDays}-day free trial, then ${priceDisplay} a month. One plan, everything in it.` },
      them: { v: "info", note: "Free to use. An optional licence is a one-off, perpetual payment that unlocks extra features." },
    },
  ],
  theyDoBetter: [
    {
      title: "Hardware, by a long way",
      body: "Bass shakers, wind, motion, LEDs, Arduino builds, gauges, wheels and button boxes. SimHub claims 200+ supported devices and adds more nearly every release. Apex AIO doesn't drive hardware at all.",
    },
    {
      title: "You can build anything",
      body: "Dash Studio, NCalc and JavaScript formulas and a plugin SDK mean a determined user can make almost any dash. There's also a huge free library of community dashboards to start from.",
    },
    {
      title: "Every sim you own",
      body: "SimHub covers 80+ games. If you race iRacing on Tuesday and LMU on Thursday, one SimHub setup follows you. Apex AIO is about LMU, with partial rFactor 2 support.",
    },
    {
      title: "No subscription",
      body: `SimHub is free, and the licence is a one-off payment you keep. Apex AIO is ${priceDisplay} a month after the trial.`,
    },
  ],
  apexDoesBetter: [
    {
      title: "Ready on first launch",
      body: "Twenty overlays that already know LMU: standings, relative, radar, fuel, track limits in the stewards' own count, a 3D track map with 32 circuits bundled. Nothing to build or import.",
      page: "overlays",
    },
    {
      title: "A race engineer you can talk to",
      body: "Hold a wheel button and ask for the gap behind, fuel to the end or when to pit. The core questions are answered on your PC, offline.",
      page: "race-engineer",
    },
    {
      title: "Setups in the same app",
      body: "Browse community setups ranked by verified clean laps, send one straight into LMU, or tune your own with the live editor.",
      page: "setups",
    },
    {
      title: "A pit wall that works over the internet",
      body: "Your crew can follow the car from a phone, a laptop or another country. SimHub's web dashboards are designed for your home network.",
      page: "pit-wall",
    },
    {
      title: "Lap review after the session",
      body: "Every lap you drive is saved. See your optimal lap, where the time went and two laps traced corner by corner.",
      page: "telemetry",
    },
  ],
  together: {
    title: "Running SimHub and Apex AIO together",
    body: [
      "This is the setup we'd suggest. SimHub keeps running your shakers, LEDs and wheel display. Apex AIO handles the overlays, the radio, setups and the pit wall. They read LMU independently, so neither has to be set up around the other.",
      "If you already use a SimHub overlay you love, keep it and turn off the matching Apex widget. Each Apex widget can be switched on or off on its own, for OBS and in-game separately.",
    ],
  },
  whoFor: {
    stay: [
      "Your rig is built around shakers, LEDs, wind or motion",
      "You race lots of different sims and want one tool for all of them",
      "You enjoy building your own dashboards",
      "You don't want another monthly payment",
    ],
    switch: [
      "You race LMU most and want it working on first launch",
      "You want a voice engineer, setups and lap review without stitching tools together",
      "You run endurance races and need a pit wall your crew can open anywhere",
      "You stream and want broadcast-ready overlays in OBS",
    ],
  },
  faq: [
    {
      q: "Is Apex AIO a replacement for SimHub?",
      a: "Not for hardware. SimHub drives bass shakers, LEDs, wind, motion and button boxes, and Apex AIO doesn't do any of that. Apex AIO replaces the software side for LMU: overlays, a voice race engineer, setups, a team pit wall and lap review. You can run both.",
    },
    {
      q: "Can I run SimHub and Apex AIO at the same time?",
      a: "Yes. They read Le Mans Ultimate separately and don't share settings, so neither gets in the other's way. A common setup is SimHub for the rig and Apex AIO for the overlays, radio and pit wall.",
    },
    {
      q: "Does SimHub support Le Mans Ultimate?",
      a: "Yes. SimHub has officially supported LMU since version 9.2.0 in February 2024, and since 9.11.6 in March 2026 most of its LMU data comes from the game's native shared memory.",
    },
    {
      q: "Does SimHub have a voice race engineer for LMU?",
      a: "Not built in. SimHub can feed radar-style dashboards with proximity data, but voice calls come from other tools. Apex AIO's engineer answers spoken questions on push-to-talk, and its proximity radar overlay covers car-left, car-right awareness.",
    },
    {
      q: "Is SimHub free?",
      a: "SimHub is free to use. An optional licence, paid once and kept for good, unlocks extra features. Motion needs a separate paid add-on. Check simhubdash.com for current pricing.",
    },
  ],
  sources: [
    { label: "SimHub 9.2.0 release notes (LMU support)", url: "https://github.com/SHWotever/SimHub/releases/tag/9.2.0" },
    { label: "SimHub 9.11.6 release notes (LMU native shared memory)", url: "https://github.com/SHWotever/SimHub/releases/tag/9.11.6" },
    { label: "SimHub wiki: Dash Studio overlays", url: "https://github.com/SHWotever/SimHub/wiki/Dash-Studio-Overlays" },
    { label: "SimHub wiki: Dash Studio web access", url: "https://github.com/SHWotever/SimHub/wiki/Troubleshoot-Dashstudio-Web-access" },
    { label: "SimHub wiki: all pages", url: "https://github.com/SHWotever/SimHub/wiki/_pages" },
    { label: "SimHub licence", url: "https://www.simhubdash.com/get-a-license/" },
    { label: "SimHub motion add-on", url: "https://www.simhubdash.com/simhub-motion-addon/" },
  ],
  checked: "2026-11-26",
  ctaBody:
    "Keep SimHub on your rig and add the LMU side: overlays, the race engineer, setups and the pit wall. The trial is the full app.",
};
