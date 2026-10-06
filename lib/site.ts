/**
 * Canonical site constants — the single source of truth for the production
 * origin used by metadata, canonical URLs, the sitemap and robots.
 */
export const SITE_URL = "https://apexandchillracing.co.uk";

/** Brand name as it appears in titles, schema.org markup and llms.txt. */
export const SITE_NAME = "Apex & Chill Racing";

/** Official community channels — the organisation's `sameAs` profiles. */
export const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";
export const YOUTUBE_URL = "https://youtube.com/channel/UCu7lyaGuo3sY2wWZo42-LVw";
export const CONTACT_EMAIL = "apexandchillracing@outlook.com";

/**
 * When this build was made (stamped in `next.config.mjs`). Pages whose content
 * only changes on deploy use it as their honest "last modified" date.
 */
export const BUILD_TIME = process.env.BUILD_TIME ?? new Date().toISOString();
