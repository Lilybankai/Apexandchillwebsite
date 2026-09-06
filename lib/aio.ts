/** Public product details shared by the landing page and its SEO metadata. */
export const AIO_PRODUCT = {
  name: "Apex AIO System",
  version: "0.82.0",
  installerUrl:
    "https://github.com/Lilybankai/Apexandchilloverlaysystem/releases/download/v0.82.0/Apex-Overlay-System-Setup-0.82.0.exe",
  installerFilename: "Apex Overlay System Setup 0.82.0.exe",
  price: 4.99,
  priceDisplay: "£4.99",
  trialDays: 7,
  discordUrl: "https://discord.gg/MBew2Bb2hj",
} as const;

export type AioReview = {
  author: string;
  body: string;
  context: string;
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
    featured: true,
  },
  {
    author: "Jammskie",
    body: "Absolutely great work from you guys. Brilliant software. Should be proud.",
    context: "Apex & Chill member",
  },
  {
    author: "Obsidian",
    body:
      "Super proud of this product. Great work — glad to be a part of the test team. Can't wait for everyone else to get to use this.",
    context: "Moderator & test team",
  },
  {
    author: "Timmy P",
    body:
      "Absolutely every LMU Apex & Chill member really should try this app. You will not be disappointed.",
    context: "Moderator",
  },
  {
    author: "Obsidian",
    body: "I second this — it's an absolute game changer.",
    context: "Moderator & test team",
  },
] as const;
