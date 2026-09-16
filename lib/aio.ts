/** Public product details shared by the landing page and its SEO metadata. */
export const AIO_PRODUCT = {
  name: "Apex AIO System",
  /**
   * `owner/repo` holding the public releases. `lib/aio-release.ts` reads the
   * newest release from here so the download button follows `npm run release`
   * on its own.
   */
  releasesRepo: "Lilybankai/apex-aio-releases",
  /**
   * The link the site actually points at. It redirects to whichever installer
   * is newest, so it never needs changing and is safe to share anywhere.
   */
  downloadPath: "/api/aio/download",
  /**
   * The last release pinned by hand. Only ever served if GitHub can't be
   * reached, so keep it pointing at a real, working installer.
   */
  version: "0.99.11",
  installerUrl:
    "https://github.com/Lilybankai/apex-aio-releases/releases/download/v0.99.11/Apex-AIO-System-Setup-0.99.11.exe",
  installerFilename: "Apex-AIO-System-Setup-0.99.11.exe",
  price: 4.99,
  priceDisplay: "£4.99",
  trialDays: 7,
  discordUrl: "https://discord.gg/MBew2Bb2hj",
  /**
   * The web pit wall. The Team and Solo engineer boards are served here as
   * well as in the desktop app, so a crew can follow a live session from a
   * phone, tablet or any other machine while the driver's PC relays telemetry.
   */
  webBoardsUrl: "https://aio.apexandchillracing.co.uk/",
  /** The same address, written the way it should be read on screen. */
  webBoardsLabel: "aio.apexandchillracing.co.uk",
} as const;

export type AioReview = {
  author: string;
  body: string;
  context: string;
  rating: number;
  featured?: boolean;
};

/**
 * Launch feedback supplied by the product's testers in the Apex & Chill
 * Discord. Keeping it as structured text makes the proof accessible,
 * responsive and available to search engines.
 */
export const AIO_REVIEWS: readonly AioReview[] = [
  {
    author: "Kyle Essman",
    body:
      "The pit wall for engineering your teammate is phenomenal. No other app has anything close. So useful to have the correct info, not the BS LMU gives you.",
    context: "Apex & Chill member",
    rating: 5,
    featured: true,
  },
  {
    author: "Jammskie",
    body: "Absolutely great work from you guys. Brilliant software. Should be proud.",
    context: "Apex & Chill member",
    rating: 5,
  },
  {
    author: "Obsidian",
    body:
      "Super proud of this product. Great work — glad to be a part of the test team. Can't wait for everyone else to get to use this.",
    context: "Moderator & test team",
    rating: 5,
  },
  {
    author: "Timmy P",
    body:
      "Absolutely every LMU Apex & Chill member really should try this app. You will not be disappointed.",
    context: "Moderator",
    rating: 5,
  },
  {
    author: "Obsidian",
    body: "I second this — it's an absolute game changer.",
    context: "Moderator & test team",
    rating: 5,
  },
] as const;
