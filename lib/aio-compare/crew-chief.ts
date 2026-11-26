import { AIO_PRODUCT } from "@/lib/aio";
import type { ComparePageData } from "./types";

const { priceDisplay, trialDays } = AIO_PRODUCT;

/**
 * Crew Chief. Checked against the official GitLab repo (release tags, the
 * in-app changelog and the help site's source), which is the primary record
 * of what each version does. Its help site's games table predates LMU, so
 * don't read LMU's absence there as anything.
 */
export const CREW_CHIEF: ComparePageData = {
  key: "crew-chief",
  path: "/crew-chief-alternative",
  competitor: "Crew Chief",
  title: "Crew Chief Alternative for LMU: Apex AIO vs Crew Chief",
  description:
    "Crew Chief or Apex AIO's race engineer for Le Mans Ultimate? Spotter, voice commands, pit menu, overlays and price, compared honestly.",
  breadcrumb: "Apex AIO vs Crew Chief",
  social: { headline: "Apex AIO vs Crew Chief", tagline: "Two radio voices for LMU, and how to run both." },
  kicker: "Compare · Crew Chief · Le Mans Ultimate",
  h1: ["Crew Chief alternative", "for Le Mans Ultimate"],
  lead:
    "Crew Chief is free, open source and has the best voice spotter in sim racing. Apex AIO's race engineer does a different job, and comes with overlays, setups and a pit wall. This is how they compare in LMU, and how to run them together.",
  stats: [
    { value: "Free", label: "Crew Chief" },
    { value: "20+", label: "Crew Chief sims" },
    { value: "28", label: "Apex offline questions" },
    { value: `${trialDays} days`, label: "Apex free trial" },
  ],
  summary: [
    "Crew Chief is one of the best things in sim racing, and it costs nothing. Its spotter calls \"car left\" and \"clear\" in a human voice, it knows thousands of driver names, and it has handled LMU since 2024. In LMU it can also change the pit menu by voice, including virtual energy. If you only want a voice in your ear, it's very hard to beat.",
    "Apex AIO's race engineer isn't a spotter. It's a radio you ask questions: the gap behind, fuel to the end, when to pit, what the weather's doing. Twenty-eight of those are answered on your PC from live telemetry, and anything else can be asked in your own words. It sits in the same app as twenty overlays, LMU setups, a team pit wall and lap review.",
    "So the real question isn't one or the other. For a lot of LMU drivers the best answer is Crew Chief's spotter plus Apex AIO's overlays, setups and pit wall. That works fine, and we explain how below.",
  ],
  rows: [
    {
      feature: "Le Mans Ultimate support",
      apex: { v: "yes", note: "Built for LMU first. Works over LMU's own API with no plugin to install." },
      them: { v: "yes", note: "Since 4.18.4 (Aug 2024). From 4.19.6.0 it reads LMU's built-in shared memory with no plugin DLL." },
    },
    {
      feature: "Voice spotter",
      apex: { v: "no", note: "No car-left, car-right calls. The proximity radar overlay does that job on screen." },
      them: { v: "yes", note: "Its best feature. Human-recorded spotter calls with a choice of voices." },
    },
    {
      feature: "Ask questions by voice",
      apex: { v: "yes", note: "Push-to-talk. 28 core questions offline, plus free-form questions in your own words." },
      them: { v: "yes", note: "A long list of voice commands through Windows speech recognition, push-to-talk or always on." },
    },
    {
      feature: "Change the LMU pit menu",
      apex: { v: "yes", note: "From wheel buttons, a Stream Deck or hotkeys through the MFD overlay." },
      them: { v: "yes", note: "By voice, including virtual energy. Described by its makers as a bit experimental." },
    },
    {
      feature: "Overlays",
      apex: { v: "yes", note: "Twenty widgets: standings, relative, radar, fuel, track map and more, in OBS or in-game." },
      them: { v: "partly", note: "Subtitles, telemetry charts and live tyre, brake and fuel windows. Standings and relative aren't its focus." },
    },
    {
      feature: "LMU setups",
      apex: { v: "yes", note: "Community setups with verified laps, a live editor and an optimiser." },
      them: { v: "no", note: "Not something Crew Chief does." },
    },
    {
      feature: "Team pit wall",
      apex: { v: "yes", note: "Live board for the crew in the app or any browser." },
      them: { v: "partly", note: "Can publish telemetry to a third-party community pit wall service." },
    },
    {
      feature: "Lap telemetry review",
      apex: { v: "yes", note: "Every lap saved. Optimal lap and lap-vs-lap traces by distance." },
      them: { v: "partly", note: "Voice-called charts of your last and best laps." },
    },
    {
      feature: "Other games",
      apex: { v: "partly", note: "LMU fully. rFactor 2 for the core widgets." },
      them: { v: "yes", note: "20+ sims, from iRacing and ACC to RaceRoom, AMS2 and rally." },
    },
    {
      feature: "Price",
      apex: { v: "info", note: `${trialDays}-day free trial, then ${priceDisplay} a month.` },
      them: { v: "info", note: "Free and open source (MIT). Donations welcome." },
    },
  ],
  theyDoBetter: [
    {
      title: "The spotter",
      body: "Apex AIO doesn't call cars alongside you by voice. Crew Chief does, and does it well. If you rely on a voice spotter in a busy LMU field, keep Crew Chief for that.",
    },
    {
      title: "It's free",
      body: "Free, open source and maintained for years, with releases through 2026. Apex AIO is a paid app after the trial.",
    },
    {
      title: "It talks to you like a person",
      body: "Thousands of recorded driver names, several voices and pace notes you record yourself. That's years of work, and Apex AIO doesn't try to copy it.",
    },
    {
      title: "Every sim",
      body: "20+ sims, including rally co-driver calls. One app for everything you race.",
    },
  ],
  apexDoesBetter: [
    {
      title: "Ask in your own words",
      body: "Beyond the 28 core questions, you can ask anything about the race and get an answer worked out from your telemetry. Your speech is transcribed on your PC first.",
      page: "race-engineer",
    },
    {
      title: "Overlays in the same app",
      body: "Standings, relative, a radar drawn to scale, fuel, track limits and a 3D track map, in OBS or over the sim.",
      page: "overlays",
    },
    {
      title: "Setups",
      body: "Community setups ranked by verified clean laps, sent straight into LMU, and a live setup editor.",
      page: "setups",
    },
    {
      title: "A pit wall for the crew",
      body: "Teammates follow the car live from any browser, with strategy, tyres, weather and the track map.",
      page: "pit-wall",
    },
    {
      title: "Lap review",
      body: "Every lap you've driven, your optimal lap, and two laps compared corner by corner.",
      page: "telemetry",
    },
  ],
  together: {
    title: "Running Crew Chief and Apex AIO together",
    body: [
      "Use Crew Chief as your spotter and Apex AIO for everything on screen. They read LMU separately, so neither needs setting up around the other.",
      "The one thing to sort out is who talks. Set Apex AIO's proactive radio to Off and it will only speak when you press its push-to-talk button, so Crew Chief keeps the airwaves for spotter calls. Bind the two apps to different wheel buttons and you can ask either one.",
    ],
  },
  whoFor: {
    stay: [
      "You want a voice spotter above everything else",
      "You don't want to pay for anything",
      "You race lots of different sims",
      "You love the driver names and pace notes",
    ],
    switch: [
      "You want overlays, setups, a pit wall and lap review in one LMU app",
      "You'd like to ask the radio questions in your own words",
      "You race endurance with a team",
      "You're happy keeping Crew Chief for spotting and adding Apex AIO for the rest",
    ],
  },
  faq: [
    {
      q: "Does Crew Chief work with Le Mans Ultimate?",
      a: "Yes. Crew Chief added Le Mans Ultimate in release candidates in February 2024 and in a main release with 4.18.4 in August 2024. Since 4.19.6.0 in November 2026 it reads LMU's built-in shared memory and no longer needs its own plugin.",
    },
    {
      q: "Is Apex AIO a spotter like Crew Chief?",
      a: "No. Apex AIO's race engineer doesn't call cars alongside you. For car-left, car-right awareness it uses a proximity radar overlay on screen. If you want voice spotting, run Crew Chief with it.",
    },
    {
      q: "Can I use Crew Chief and Apex AIO at the same time?",
      a: "Yes. Turn Apex AIO's proactive radio to Off so it only speaks when you ask, and bind each app's push-to-talk to a different button. Crew Chief does the spotting and Apex AIO handles overlays, setups and the pit wall.",
    },
    {
      q: "Is Crew Chief free?",
      a: "Yes. Crew Chief is free, open-source software under the MIT licence, and its developers welcome donations.",
    },
    {
      q: "What can I ask Apex AIO's race engineer that I can't ask Crew Chief?",
      a: "Both answer the usual questions about gaps, fuel and tyres. The difference is that Apex AIO also takes free-form questions in your own words, transcribed on your PC, and answers them from your telemetry. Crew Chief listens for set commands, and that list is very long.",
    },
  ],
  sources: [
    { label: "Crew Chief on GitLab (repo and licence)", url: "https://gitlab.com/mr_belowski/CrewChiefV4" },
    { label: "Crew Chief release tags", url: "https://gitlab.com/mr_belowski/CrewChiefV4/-/tags" },
    { label: "Crew Chief 4.19.6.0 (LMU built-in shared memory)", url: "https://gitlab.com/mr_belowski/CrewChiefV4/-/tags/4.19.6.0" },
    { label: "Crew Chief changelog", url: "https://gitlab.com/mr_belowski/CrewChiefV4/-/blob/main/change_log_for_auto_updated.html" },
    { label: "Crew Chief help: voice recognition", url: "https://mr_belowski.gitlab.io/CrewChiefV4/VoiceRecognition_InstallationTraining.html" },
    { label: "Crew Chief help: in-game overlays", url: "https://mr_belowski.gitlab.io/CrewChiefV4/Overlays_InGame.html" },
    { label: "Crew Chief forum", url: "https://thecrewchief.org/" },
  ],
  checked: "2026-11-26",
  ctaBody:
    "Keep Crew Chief as your spotter and try the rest for a week: overlays, the race engineer, setups and the pit wall.",
};
