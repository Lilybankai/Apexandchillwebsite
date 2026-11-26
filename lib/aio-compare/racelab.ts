import { AIO_PRODUCT } from "@/lib/aio";
import type { ComparePageData } from "./types";

const { priceDisplay, trialDays } = AIO_PRODUCT;

/**
 * RaceLab. Checked against racelab.app, its LMU page, and the release notes
 * and docs on garage.racelab.app. Prices are in euros on their site; quote
 * them as listed and keep the "at the time of writing" wording.
 */
export const RACELAB: ComparePageData = {
  key: "racelab",
  path: "/racelab-alternative",
  competitor: "RaceLab",
  title: "RaceLab Alternative for LMU: Apex AIO vs RaceLab Compared",
  description:
    "RaceLab or Apex AIO for Le Mans Ultimate? Overlays, VR, voice engineer, setups, team tools, incident review and price, side by side.",
  breadcrumb: "Apex AIO vs RaceLab",
  social: { headline: "Apex AIO vs RaceLab", tagline: "Two LMU overlay apps, compared honestly." },
  kicker: "Compare · RaceLab · Le Mans Ultimate",
  h1: ["RaceLab alternative", "for Le Mans Ultimate"],
  lead:
    "RaceLab is a polished overlay app that covers a lot of sims and has supported LMU since March 2024. Apex AIO is narrower and goes deeper on LMU: a voice engineer, setups, a team pit wall and lap review in the same app.",
  stats: [
    { value: "Free", label: "RaceLab Basic" },
    { value: "€4.90", label: "RaceLab Pro / mo" },
    { value: priceDisplay, label: "Apex AIO / mo" },
    { value: `${trialDays} days`, label: "Apex free trial" },
  ],
  summary: [
    "If all you want is good overlays, RaceLab is a strong choice and you might not need anything else. It has a free tier, VR overlays on Pro, a Stream Deck plugin, an incident list that jumps the replay, and it's updated constantly. It also covers iRacing, ACC, rFactor 2, AMS2 and more, so it suits people who switch sims a lot.",
    "Apex AIO is for people who mostly race Le Mans Ultimate and want the whole race weekend in one place. As well as the overlays, you get a push-to-talk race engineer, community setups with verified laps and a setup editor, a team pit wall the crew can open in any browser, and a full review of every lap you've driven.",
    "Price is close. RaceLab Pro and Apex AIO both cost about a fiver a month. RaceLab has a free tier and a yearly plan. Apex AIO has one plan with everything in it.",
  ],
  rows: [
    {
      feature: "Le Mans Ultimate support",
      apex: { v: "yes", note: "Built for LMU first. No plugin needed; LMU works over its own API." },
      them: { v: "yes", note: "Since v5.0.1 (March 2024), with LMU-specific work since, like ERS and virtual energy columns." },
    },
    {
      feature: "Standings, relative, radar",
      apex: { v: "yes", note: "All included, along with delta, fuel, tyres, pedals and more." },
      them: { v: "yes", note: "Relative, standings, radar and fuel are on the free tier." },
    },
    {
      feature: "Track map",
      apex: { v: "yes", note: "3D map with 32 LMU and WEC circuits bundled; others build from your first lap." },
      them: { v: "partly", note: "Included on Pro, not the free tier." },
    },
    {
      feature: "Voice race engineer",
      apex: { v: "yes", note: "Push-to-talk. 28 questions answered offline from live telemetry." },
      them: { v: "no", note: "We found none. Its spotter is a visual overlay." },
    },
    {
      feature: "Team / endurance tools",
      apex: { v: "yes", note: "Live team pit wall with strategy, tyres and weather, in the app or a browser." },
      them: { v: "partly", note: "Fuel Sharing shows teammates' fuel. Needs one teammate on Pro." },
    },
    {
      feature: "LMU setups",
      apex: { v: "yes", note: "Community setups ranked by verified laps, a live editor and an optimiser." },
      them: { v: "partly", note: "Has a setups hub. We couldn't confirm how much of it covers LMU." },
    },
    {
      feature: "Lap telemetry review",
      apex: { v: "yes", note: "Every lap saved locally. Optimal lap and lap-vs-lap traces by distance." },
      them: { v: "partly", note: "Live input telemetry against your best or a friend's lap. We found no after-session analysis tool." },
    },
    {
      feature: "Incident review",
      apex: { v: "yes", note: "Race log of contacts, track limits and penalties, a click from the replay." },
      them: { v: "yes", note: "Race Events window lists incidents and jumps the replay to them." },
    },
    {
      feature: "OBS / streaming",
      apex: { v: "yes", note: "Every widget is an OBS Browser Source. Twitch and YouTube StreamBot included." },
      them: { v: "yes", note: "Every overlay works as a browser source. F1-style broadcast mode and a Stream Deck plugin." },
    },
    {
      feature: "VR",
      apex: { v: "no", note: "Not offered." },
      them: { v: "yes", note: "RaceLab VR on the Pro plan. LMU is listed as supported." },
    },
    {
      feature: "Other games",
      apex: { v: "partly", note: "LMU fully. rFactor 2 for the core widgets." },
      them: { v: "yes", note: "iRacing, ACC, AC, rFactor 2, AMS2, F1 and RaceRoom too." },
    },
    {
      feature: "Price",
      apex: { v: "info", note: `${trialDays}-day free trial, then ${priceDisplay} a month. No free tier.` },
      them: { v: "info", note: "Free Basic tier. Pro is €4.90 a month or €49.90 a year at the time of writing." },
    },
  ],
  theyDoBetter: [
    {
      title: "A free tier",
      body: "RaceLab Basic is free for good, with standings, relative, radar and a fuel calculator. Apex AIO has a 7-day trial and then it's paid.",
    },
    {
      title: "VR",
      body: "If you race in a headset, RaceLab VR is the answer and Apex AIO isn't. It's on the Pro plan.",
    },
    {
      title: "More sims",
      body: "RaceLab covers iRacing in real depth (series data, iRating) plus ACC, rFactor 2, AMS2, F1 and RaceRoom. Apex AIO is about LMU.",
    },
    {
      title: "Customisation",
      body: "Smart Layouts that switch by car, track or session, and a big layout library. If you like tweaking every pixel, RaceLab gives you more to play with.",
    },
  ],
  apexDoesBetter: [
    {
      title: "A race engineer on the radio",
      body: "Ask for the gap behind, fuel to the end or the pit window and hear the answer in under a second. We found no voice features in RaceLab.",
      page: "race-engineer",
    },
    {
      title: "The LMU pit menu from your wheel",
      body: "The MFD widget mirrors LMU's pit menu, and every row can be changed from wheel buttons, a Stream Deck or hotkeys, without the in-game MFD on screen.",
      page: "overlays",
    },
    {
      title: "A proper pit wall for endurance",
      body: "Timing, fuel and energy strategy, tyres, weather and the track map for the whole crew, live, in any browser. It follows the car through a driver swap by itself.",
      page: "pit-wall",
    },
    {
      title: "Setups in the same app",
      body: "Community setups ranked by fastest verified clean lap, sent straight to LMU, plus a live setup editor and an optimiser.",
      page: "setups",
    },
    {
      title: "Every lap, reviewed",
      body: "Your optimal lap, the time you left out there, consistency in seconds, and any two laps traced corner by corner.",
      page: "telemetry",
    },
  ],
  whoFor: {
    stay: [
      "You race in VR",
      "You split your time between iRacing, ACC and LMU",
      "You want overlays and nothing else, and the free tier covers you",
      "You love building custom layouts",
    ],
    switch: [
      "LMU is your main sim",
      "You'd use a voice engineer, setups and lap review if they came in the same app",
      "You race endurance with a team and want a shared live pit wall",
      "You want one plan with nothing held back",
    ],
  },
  faq: [
    {
      q: "Does RaceLab work with Le Mans Ultimate?",
      a: "Yes. RaceLab added Le Mans Ultimate in version 5.0.1 in March 2024, and it has kept adding LMU features since, including an ERS overlay for hybrids and virtual energy columns in standings and relative.",
    },
    {
      q: "Is Apex AIO cheaper than RaceLab?",
      a: `About the same. Apex AIO is ${priceDisplay} a month after a ${trialDays}-day free trial. RaceLab Pro is €4.90 a month or €49.90 a year at the time of writing, and RaceLab also has a free Basic tier. Apex AIO's price includes the race engineer, setups, pit wall and lap review as well as the overlays.`,
    },
    {
      q: "Does Apex AIO support VR like RaceLab?",
      a: "No. If you race LMU in a headset, RaceLab VR is the better fit today. Apex AIO's overlays go into OBS or over the sim on a monitor setup, including triple screens.",
    },
    {
      q: "Can I move from RaceLab to Apex AIO without losing my overlays?",
      a: "You can try Apex AIO alongside RaceLab during the free trial. Both run from their own Browser Source URLs in OBS, so you can put an Apex widget next to your RaceLab layout and compare before you decide.",
    },
    {
      q: "Does RaceLab have a race engineer or spotter for LMU?",
      a: "RaceLab's spotter is a visual overlay, and we found no voice race engineer in it. Apex AIO's engineer answers spoken questions on push-to-talk, and its proximity radar overlay handles car-left, car-right.",
    },
  ],
  sources: [
    { label: "RaceLab home and pricing", url: "https://racelab.app/" },
    { label: "RaceLab for Le Mans Ultimate", url: "https://racelab.app/lemansultimate/" },
    { label: "RaceLab v5.0.1 release notes (LMU added)", url: "https://garage.racelab.app/release-notes/2024/03/01/2024/v5.0.1/" },
    { label: "RaceLab v6.12.0 release notes (LMU virtual energy)", url: "https://garage.racelab.app/release-notes/2025/08/09/2025/v6.12.0/" },
    { label: "RaceLab VR install docs", url: "https://garage.racelab.app/docs/vr/install/" },
    { label: "RaceLab Race Events beta", url: "https://garage.racelab.app/news/2025/07/30/2025/race-events-beta-v1/" },
    { label: "RaceLab v8.8.0 release notes", url: "https://garage.racelab.app/release-notes/2026/11/25/2026/v8.8.0/" },
  ],
  checked: "2026-11-26",
  ctaBody:
    "Run it next to your RaceLab layout for a week. If the race engineer, setups and pit wall don't earn their place, cancel before the trial ends and pay nothing.",
};
