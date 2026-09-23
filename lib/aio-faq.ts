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
    a: "No, and this is deliberate. The microphone only opens while you hold your bound push-to-talk button — there's no wake word and no open mic. For the 28 core questions everything happens on your PC. For free-form questions your speech is transcribed locally by whisper.cpp, so your audio never leaves your machine; only the transcribed text plus a telemetry summary is sent to be answered. And when he can't make out what you said, he asks \"Say again?\" rather than guessing.",
  },
  {
    q: "Does the race engineer cost extra?",
    page: "race-engineer",
    a: `No. The engineer — voices, speech recognition and all — is bundled inside the installer, signed, with nothing to download afterwards. The 28 telemetry questions are answered locally and are effectively free forever. Free-form AI questions are included in the ${PRICE} subscription with a generous monthly allowance.`,
  },
  {
    q: "Where do the reference lap times come from?",
    page: "telemetry",
    a: "From Ohne Speed, with lap times contributed by beAlien, Go and Hymo — the reference set the LMU community actually benchmarks against. The Reference Pace widget reads those times for your exact class and layout and places your best lap on a six-band ladder from Alien to Offline. The credit is shown in the widget itself, every time a score is on screen — it's their work, and the app only reads it.",
  },
  {
    q: "What makes it lighter than other LMU overlays?",
    page: "overlays",
    a: "Mainly one decision: the overlays are plain HTML and JavaScript rendered by the Chromium instance OBS already starts for Browser Sources. Nothing extra is shipped or launched, whereas an overlay tool built on its own Electron app keeps a second full Chromium and Node process resident for your entire stream. The widgets avoid the expensive things too — no web fonts, no CDN, no blur or backdrop filters — and telemetry is 1–2 KB per frame over a loopback WebSocket at a rate you control.",
  },
  {
    q: "Do I need to install a plugin or edit game files?",
    page: "overview",
    a: "You don't even need to install the plugin yourself. Le Mans Ultimate works out of the box over LMU's own REST API; the optional shared-memory plugin — which adds pedal inputs and tyre detail for the car you're driving, and is required for plain rFactor 2 — is installed into the game by the app itself, correctly, with one click.",
  },
  {
    q: "Is this only for streamers?",
    page: "overlays",
    a: "No. Every widget has two independent destinations — an OBS Browser Source and an in-game layer that draws over the sim itself. Drivers who never stream use the in-game layer with the layout editor, dragging and resizing each widget exactly where they want it over the cockpit — including onto the side screens of a triple-monitor rig. Streamers use OBS. Plenty of people use both at once.",
  },
  {
    q: "Can I really change my pit strategy from the overlay?",
    page: "overlays",
    a: "Yes, and no other LMU overlay does it. The MFD widget mirrors the sim's own pit menu and driving aids, and every adjustable row can be driven from four bindable buttons — up, down, plus and minus — on a wheel, a Stream Deck or a hotkey. Pit changes go over LMU's REST API, so the in-game MFD never has to be on screen and the game doesn't even need to be the focused window.",
  },
  {
    q: "How do the 3D track maps work?",
    page: "overlays",
    a: "Thirty-two LMU and WEC circuits ship bundled, ready to draw the moment you load in. For anywhere else: LMU packs its circuits into encrypted archives and no API exposes the shape of the road — but the sim does publish where your car is thirty times a second. The first time you drive an unknown track the widget builds the map from your own lap, then caches it locally and draws it instantly, every session, forever. No per-track setup, ever.",
  },
  {
    q: "Are the track-limit points accurate?",
    page: "overlays",
    a: "They're the sim's own numbers, not an estimate. LMU publishes its stewarding to its trace log, which the overlay reads; the reader was validated against a real session-end results file and reproduced every one of that race's charges in order. Penalties are named as the stewards name them — DRIVE THROUGH, STOP-GO 10S — with a PENALTY SERVED confirmation, and a rival's penalty online never touches your own count. The one caveat is timing: LMU flushes that log in blocks, so a charge can arrive up to ~25 seconds after the cut. The total is always right; occasionally it's right late.",
  },
  {
    q: "How does the setup optimiser change the car?",
    page: "setups",
    a: "The Race engineer uses ten intent sliders — including front turn-in, rear traction, braking stability and kerb compliance — to stage balanced changes across the real setup keys available on your current car. It never applies those changes silently: you see every proposed value first, and ruleset-locked or unavailable settings are skipped. Apply sends the staged setup to LMU; Revert removes the preview.",
  },
  {
    q: "Do community setups cost extra?",
    page: "setups",
    a: "No. Publishing and downloading community setups are included in Apex AIO, with no per-setup charge. Shared setups carry their track, car, class and handling tags, and can include the fastest verified clean lap driven on that exact setup as a useful baseline. You can sort by fastest verified lap, recommendation, rating, downloads or newest, then send a setup straight to LMU. Ratings are only opened after a driver has downloaded the setup.",
  },
  {
    q: "How does the team engineering pit wall follow our car?",
    page: "pit-wall",
    a: `Each teammate runs Apex AIO while signed in to the same crew. The driving PC relays its live local telemetry once per second, and the Team board automatically follows the freshest source with real tyre data, so a driver swap needs no manual handover. The board visibly marks live, relayed and stale data. Every crew member needs their own active Apex subscription, and up to six members can join a team. The board itself is also served on the web at ${WEB_BOARDS_LABEL}, so a crew member watching rather than driving doesn't need to be at a PC at all.`,
  },
  {
    q: "Do the engineer boards only work inside the app?",
    page: "pit-wall",
    a: `No. The Team pit wall and the Solo engineer board are served on the web as well, at ${WEB_BOARDS_LABEL}. Sign in with the same Apex account on a phone, a tablet, a Mac, a work laptop — anything with a browser — and you get the same live board: timing, fuel and strategy, per-corner tyres and brakes, car state, weather, the track map and lap trends. The only requirement is that an Apex AIO app is connected to the session and relaying it, because the telemetry still comes from a driving PC. Stand in the garage, sit on the sofa or engineer your teammate from another country — the board follows the session, not the machine.`,
  },
  {
    q: "What is the Review tab, and do I have to set it up?",
    page: "telemetry",
    a: "Nothing to set up, and nothing to wait for. Apex has been writing a file for every lap since the day you installed it, so the first time you open Review your whole history is already in it — sessions down the left, and on the right the one you picked. It reads those files off your own disk: no account, no upload, no cloud, and it works with the internet unplugged. The strip across the top counts your whole career on that PC — laps, distance, hours at the wheel, circuits, cars and sessions.",
  },
  {
    q: "What does Review actually tell me about a session?",
    page: "telemetry",
    a: "Your best lap, and then the part that matters: your optimal lap — your own best sector 1, 2 and 3 added together — and the untapped time between that and your real best. Consistency is given as the real spread of your clean laps in seconds rather than as a percentage, because ±0.31 s is something you can work on and a score isn't. Clean driving says what the rest was lost to, so it reads \"2 laps lost to track limits\" rather than quietly discounting them. Underneath: every lap as a chart with the stints marked, your best here over the last 30 days, tyre wear lap by lap, and a card per stint holding the full sheet.",
  },
  {
    q: "Can I compare two laps in Review?",
    page: "telemetry",
    a: "That is what it is for. Any lap with telemetry behind it opens into speed, throttle and brake, gear and steering, all drawn against distance round the circuit rather than against time — which is what makes two laps line up at the same corner instead of drifting apart. Pick any other lap of the session and it is laid underneath yours, dashed, with a delta band captioned slower above, faster below. Under the charts, one chip per stretch of road of about 500 m says what that stretch cost or gained — the difference between \"I was seven tenths slower\" and \"I was 0.18 s slower into turn 3\".",
  },
  {
    q: "Does it work with rFactor 2 as well as Le Mans Ultimate?",
    page: "overview",
    a: "Yes, though LMU gets the most. The standings, relative, radar, track map, speedo, motion, pedals and fuel widgets all work on both. The MFD, race control, track limits, damage and setup features are LMU-only, because they depend on data rFactor 2 simply doesn't publish — and where that data is missing, those widgets say so rather than showing a plausible-looking zero.",
  },
  {
    q: "What does the free trial include?",
    page: "overview",
    a: `Everything. The ${TRIAL_DAYS}-day trial is the complete system — every widget, the race engineer, setup optimiser, team pit wall, StreamBot, leaderboards and both overlay destinations. A card is taken at signup through Stripe's hosted checkout (the app never sees it) but nothing is charged until the trial ends, and you can cancel from the in-app subscription card at any point before then and pay nothing.`,
  },
  {
    q: "What if I'm racing somewhere without internet?",
    page: "overview",
    a: "A confirmed subscription carries a 72-hour offline grace window — the app keeps working for three full days with no connection at all, so a LAN event or a weekend away never locks you out. The engineer's 28 core questions and every overlay keep working offline too; only free-form AI questions and leaderboard sync need the network.",
  },
  {
    q: "Will Windows warn me about the installer?",
    page: "overview",
    a: "No. Every build is code-signed through Azure Trusted Signing under The Lilybank Agency Ltd, so there's no SmartScreen \"unknown publisher\" prompt on install or update — and the bundled voice engine is signed the same way, so antivirus tools have nothing to quarantine.",
  },
  {
    q: "Will an update interrupt me mid-stream?",
    page: "overview",
    a: "No. The app checks for new versions on launch and shows a banner, but nothing installs itself. You choose when to download and when to restart, so an update can never land in the middle of a race or a broadcast.",
  },
  {
    q: "Can I cancel?",
    page: "overview",
    a: "Yes, any time, from the subscription card in the app — it opens Stripe's own customer portal, where you can cancel, change card or download invoices. The subscription is month to month and stops when you tell it to.",
  },
];

/** The questions a page owns, in bank order. */
export function getAioFaq(page: AioPageKey): AioFaqItem[] {
  return AIO_FAQ.filter((item) => item.page === page);
}
