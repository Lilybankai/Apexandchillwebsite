import { AIO_PRODUCT } from "@/lib/aio";
import type { AioPageKey } from "@/lib/aio-pages";

const { priceDisplay: PRICE, trialDays: TRIAL_DAYS, webBoardsLabel: WEB_BOARDS_LABEL } = AIO_PRODUCT;

export type AioFaqItem = {
  q: string;
  a: string;
  /**
   * The one page that answers this question and carries it in its FAQPage
   * markup. Each question lives on exactly one page so no two URLs compete
   * for the same answer; "overview" is the hub's short, general list.
   */
  page: AioPageKey;
};

/** Every Apex AIO question, each owned by one page. */
export const AIO_FAQ: readonly AioFaqItem[] = [
  {
    q: "Is the race engineer always listening?",
    page: "race-engineer",
    a: "No. The mic only opens while you hold your bound push-to-talk button. There's no wake word and no open mic. The 28 core questions are handled entirely on your PC. For free-form questions, whisper.cpp transcribes your speech locally, so your audio never leaves your machine; only the text and a telemetry summary are sent off to be answered. If he can't make out what you said, he asks \"Say again?\" instead of guessing.",
  },
  {
    q: "Does the race engineer cost extra?",
    page: "race-engineer",
    a: `No. The engineer, including the voices and speech recognition, is bundled in the signed installer, with nothing to download afterwards. The 28 telemetry questions are answered locally, so they're effectively free forever. Free-form AI questions are included in the ${PRICE} subscription with a generous monthly allowance.`,
  },
  {
    q: "Where do the reference lap times come from?",
    page: "telemetry",
    a: "Ohne Speed, with lap times contributed by beAlien, Go and Hymo. It's the reference set the LMU community benchmarks against. The Reference Pace widget reads those times for your exact class and layout and places your best lap on a six-band ladder, from Alien to Offline. Their credit is shown in the widget whenever a score is on screen. The data is theirs; the app only reads it.",
  },
  {
    q: "Why is Apex AIO lighter than other LMU overlays?",
    page: "overlays",
    a: "The overlays are plain HTML and JavaScript, rendered by the Chromium instance OBS already starts for Browser Sources, so nothing extra is shipped or launched. An overlay tool built on its own Electron app keeps a second full Chromium and Node process running for your whole stream. The widgets also skip web fonts, CDNs, and blur or backdrop filters. Telemetry is 1–2 KB per frame over a loopback WebSocket, at a rate you set.",
  },
  {
    q: "Do I need to install a plugin or edit game files?",
    page: "overview",
    a: "No. Le Mans Ultimate works out of the box over LMU's own REST API. The optional shared-memory plugin adds pedal inputs and tyre detail for the car you're driving, and is required for plain rFactor 2. If you want it, the app installs it into the game for you, in the right place, with one click.",
  },
  {
    q: "Can I use the overlays without streaming?",
    page: "overlays",
    a: "Yes. Every widget has two independent destinations: an OBS Browser Source, and an in-game layer drawn over the sim itself. If you don't stream, use the in-game layer and the layout editor to drag and resize each widget where you want it over the cockpit, including onto the side screens of a triple-monitor rig. Streamers use OBS. Plenty of people run both at once.",
  },
  {
    q: "Can I change my pit strategy from the overlay?",
    page: "overlays",
    a: "Yes. The MFD widget mirrors the sim's own pit menu and driving aids, and every adjustable row can be driven with four bindable buttons (up, down, plus, minus) on a wheel, a Stream Deck or a hotkey. No other LMU overlay does this. Pit changes go over LMU's REST API, so the in-game MFD never has to be on screen and the game doesn't need to be the focused window.",
  },
  {
    q: "How do the 3D track maps work?",
    page: "overlays",
    a: "32 LMU and WEC circuits ship bundled and draw as soon as you load in. For any other track, the widget builds the map from your first lap. LMU packs its circuits into encrypted archives and no API exposes the shape of the road, but the sim does publish your car's position 30 times a second. The map is then cached locally and drawn instantly in every later session. There's no per-track setup.",
  },
  {
    q: "Are the track-limit points accurate?",
    page: "overlays",
    a: "Yes. They're the sim's own numbers. LMU writes its stewarding to its trace log, and the overlay reads that log. The reader was validated against a real session-end results file and reproduced every charge from that race, in order. Penalties use the stewards' wording (DRIVE THROUGH, STOP-GO 10S) with a PENALTY SERVED confirmation, and a rival's penalty online never touches your own count. One caveat: LMU flushes the log in blocks, so a charge can show up to ~25 seconds after the cut. The final total is always correct.",
  },
  {
    q: "How does the setup optimiser change the car?",
    page: "setups",
    a: "The Race engineer uses ten intent sliders, among them front turn-in, rear traction, braking stability and kerb compliance, to stage balanced changes across the real setup keys on your current car. Nothing is applied silently. You see every proposed value first, and settings that are ruleset-locked or unavailable are skipped. Apply sends the staged setup to LMU; Revert removes the preview.",
  },
  {
    q: "Do community setups cost extra?",
    page: "setups",
    a: "No. Publishing and downloading community setups is included in Apex AIO, with no per-setup charge. Each shared setup carries its track, car, class and handling tags, and can include the fastest verified clean lap driven on it as a baseline. Sort by fastest verified lap, recommendation, rating, downloads or newest, then send a setup straight to LMU. You can only rate a setup after downloading it.",
  },
  {
    q: "How does the team pit wall follow our car?",
    page: "pit-wall",
    a: `Every teammate runs Apex AIO signed in to the same crew. The driving PC relays its live local telemetry once per second, and the Team board automatically follows the freshest source with real tyre data, so a driver swap needs no manual handover. Data on the board is marked live, relayed or stale. Up to six members can join a team, and each needs their own active Apex subscription. The board is also on the web at ${WEB_BOARDS_LABEL}, so a crew member who is watching rather than driving doesn't need a PC.`,
  },
  {
    q: "Can I view the engineer boards on a phone or in a browser?",
    page: "pit-wall",
    a: `Yes. The Team pit wall and the Solo engineer board are also served on the web at ${WEB_BOARDS_LABEL}. Sign in with the same Apex account on a phone, tablet, Mac or work laptop and you get the same live board: timing, fuel and strategy, per-corner tyres and brakes, car state, weather, the track map and lap trends. The one requirement is an Apex AIO app connected to the session and relaying it, because the telemetry still comes from a driving PC. You can engineer from the garage, the sofa or another country.`,
  },
  {
    q: "What is the Review tab, and do I have to set it up?",
    page: "telemetry",
    a: "Review is your lap history and session analysis, and it needs no setup. Apex has written a file for every lap since you installed it, so the first time you open Review your whole history is already there: sessions on the left, the one you picked on the right. It reads those files from your own disk, with no account, upload or cloud, and works with the internet unplugged. The strip across the top totals your career on that PC: laps, distance, hours at the wheel, circuits, cars and sessions.",
  },
  {
    q: "What does Review tell me about a session?",
    page: "telemetry",
    a: "Your best lap, your optimal lap (your best sector 1, 2 and 3 added together) and the untapped time between the two. Consistency is the real spread of your clean laps in seconds, e.g. ±0.31 s, rather than a percentage score. Clean driving shows what the other laps were lost to, e.g. \"2 laps lost to track limits\", instead of quietly discounting them. Below that: every lap charted with the stints marked, your best here over the last 30 days, tyre wear lap by lap, and a card per stint with the full sheet.",
  },
  {
    q: "Can I compare two laps in Review?",
    page: "telemetry",
    a: "Yes. Any lap with telemetry opens into speed, throttle and brake, gear and steering, plotted against distance round the circuit rather than time, so two laps line up at the same corner. Pick any other lap from the session and it's drawn under yours as a dashed line, with a delta band (slower above, faster below). Under the charts, one chip per stretch of about 500 m shows the time lost or gained there, so you get \"0.18 s slower into turn 3\" instead of \"seven tenths slower\".",
  },
  {
    q: "Does Apex AIO work with rFactor 2?",
    page: "overview",
    a: "Yes, but LMU gets more. The standings, relative, radar, track map, speedo, motion, pedals and fuel widgets work on both. The MFD, race control, track limits, damage and setup features are LMU-only, because rFactor 2 doesn't publish the data they need. Where that data is missing, the widget says so instead of showing a plausible-looking zero.",
  },
  {
    q: "What's included in the free trial?",
    page: "overview",
    a: `Everything. The ${TRIAL_DAYS}-day trial is the full system: every widget, the race engineer, setup optimiser, team pit wall, StreamBot, leaderboards and both overlay destinations. You add a card at signup through Stripe's hosted checkout (the app never sees it), but nothing is charged until the trial ends. Cancel from the in-app subscription card before then and you pay nothing.`,
  },
  {
    q: "Does Apex AIO work offline?",
    page: "overview",
    a: "Yes, for up to 72 hours. A confirmed subscription has a 72-hour offline grace window, so the app keeps working for three full days with no connection, which covers a LAN event or a weekend away. The engineer's 28 core questions and every overlay work offline. Only free-form AI questions and leaderboard sync need the network.",
  },
  {
    q: "Will Windows SmartScreen warn me about the installer?",
    page: "overview",
    a: "No. Every build is code-signed through Azure Trusted Signing under The Lilybank Agency Ltd, so there's no SmartScreen \"unknown publisher\" prompt on install or update. The bundled voice engine is signed the same way, so antivirus tools have nothing to quarantine.",
  },
  {
    q: "Will an update interrupt me mid-race or mid-stream?",
    page: "overview",
    a: "No. The app checks for new versions on launch and shows a banner, but never installs on its own. You choose when to download and when to restart, so an update can't land in the middle of a race or a broadcast.",
  },
  {
    q: "Can I cancel any time?",
    page: "overview",
    a: "Yes, from the subscription card in the app. It opens Stripe's own customer portal, where you can cancel, change card or download invoices. The subscription is month to month and stops when you cancel.",
  },
];

/** The questions a page owns, in bank order. */
export function getAioFaq(page: AioPageKey): AioFaqItem[] {
  return AIO_FAQ.filter((item) => item.page === page);
}
