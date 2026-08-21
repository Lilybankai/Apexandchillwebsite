import type { Metadata } from "next";
import { Clause, LegalList, LegalPage } from "@/components/legal/LegalPage";

/**
 * `/privacy` — Privacy Policy.
 *
 * Written against what the site ACTUALLY does today:
 *   • `/join` → POST /api/join → Supabase `join_submissions`
 *   • `/merch` → Stripe-hosted Checkout (GB/IE shipping) → print-on-demand order
 *   • GA4 loaded only after opt-in consent (see components/analytics/Analytics.tsx)
 *   • YouTube embeds on /live and /replays
 * Keep this page in step whenever one of those data flows changes.
 *
 * OPERATOR NOTE: not legal advice. Fill in the controller name/address in
 * {@link CONTROLLER} and confirm your ICO registration position before launch.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  description:
    "How Apex & Chill Racing collects, uses and protects your personal data — league entries, merch orders, cookies and your rights under UK GDPR.",
};

const CONTACT_EMAIL = "apexandchillracing@outlook.com";
const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

/** TODO(operator): replace with the registered controller name and postal address. */
const CONTROLLER = {
  name: "Apex & Chill Racing",
  address: "[Registered address — to be supplied]",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      intro="What we collect, why we collect it, who we share it with and how to get it back or get it deleted. Short version: we ask for the minimum needed to put you on a grid or get your merch to your door."
      lastUpdated="2026-08-21"
    >
      <Clause id="controller" number={1} title="Who is responsible for your data">
        <p>
          <strong>{CONTROLLER.name}</strong> ({CONTROLLER.address}) is the data controller for the
          personal data described here. If you have any question about this policy, or want to
          exercise one of the rights in clause 8, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <p>
          This policy covers <strong>apexandchillracing.co.uk</strong>. It does not cover Discord,
          YouTube, or our partners&apos; sites — those have their own policies.
        </p>
      </Clause>

      <Clause id="what-we-collect" number={2} title="What we collect">
        <p>
          <strong>League entry (the &ldquo;Join&rdquo; form).</strong> When you apply for a seat we
          collect your driver name, chosen league, platform, PSN ID or Steam name, email address,
          Discord username, preferred car class, input method, experience level, anything you write
          in the message box, and your confirmation that you&apos;re 16 or over.
        </p>
        <p>
          <strong>Merch orders.</strong> Checkout is hosted by Stripe. Stripe collects your name,
          email, delivery address and payment details; we receive the order contents, your email and
          your delivery address so the order can be printed and shipped.{" "}
          <strong>Card details never touch our servers.</strong>
        </p>
        <p>
          <strong>Analytics.</strong> Only if you accept the cookie banner. Google Analytics 4 then
          records pages viewed, approximate location, device and browser, and how you arrived at the
          site. We enable IP anonymisation.
        </p>
        <p>
          <strong>Emails to us.</strong> If you contact us directly, we keep the message and your
          address so we can reply.
        </p>
        <p>
          <strong>Racing data.</strong> Results, lap times, penalties and standings from events you
          enter, published under your driver name.
        </p>
      </Clause>

      <Clause id="why" number={3} title="Why we use it, and our lawful basis">
        <LegalList
          items={[
            <>
              <strong>To run the league</strong> — reviewing entries, allocating grids, contacting
              you about races, publishing standings and stewarding outcomes.{" "}
              <em>Basis: legitimate interests</em> (operating a members&apos; community you asked to
              join).
            </>,
            <>
              <strong>To fulfil merch orders</strong> — taking payment, printing, shipping, handling
              returns. <em>Basis: performance of a contract.</em>
            </>,
            <>
              <strong>To keep the site and community safe</strong> — preventing cheating, spam,
              abuse and fraud. <em>Basis: legitimate interests.</em>
            </>,
            <>
              <strong>To understand how the site is used</strong> — analytics.{" "}
              <em>Basis: your consent</em>, which you can withdraw at any time.
            </>,
            <>
              <strong>To meet legal obligations</strong> — keeping tax and transaction records for
              merch sales. <em>Basis: legal obligation.</em>
            </>,
          ]}
        />
        <p>
          We do not sell your data, and we don&apos;t use it for automated decision-making or
          profiling.
        </p>
      </Clause>

      <Clause id="cookies" number={4} title="Cookies and similar technology">
        <p>
          The site sets <strong>no analytics or advertising cookies until you accept them</strong>.
          Until you choose, Google Analytics is not loaded at all.
        </p>
        <LegalList
          items={[
            <>
              <strong>Strictly necessary</strong> — a small entry in your browser&apos;s local
              storage remembers your cookie choice, and another remembers your merch basket. No
              consent needed; the site can&apos;t work properly without them.
            </>,
            <>
              <strong>Analytics (optional)</strong> — Google Analytics 4 cookies (`_ga`, `_ga_*`),
              set only after you click Accept, typically expiring after up to 2 years.
            </>,
            <>
              <strong>Third-party embeds</strong> — pages with YouTube players (Live, Replays) may
              set cookies from Google when the player loads.
            </>,
          ]}
        />
        <p>
          <strong>Changing your mind:</strong> clear this site&apos;s data in your browser settings
          (Privacy → Cookies and site data) and the banner will appear again on your next visit, so
          you can decline. You can also block cookies at browser level.
        </p>
      </Clause>

      <Clause id="sharing" number={5} title="Who we share it with">
        <p>We use a small number of processors and partners, each for one specific job:</p>
        <LegalList
          items={[
            <>
              <strong>Supabase</strong> — hosts the database that stores league entries.
            </>,
            <>
              <strong>Stripe</strong> — takes payment for merch orders and holds the transaction
              record.
            </>,
            <>
              <strong>Our print-on-demand partner</strong> — receives your name, delivery address
              and order contents so your item can be printed and posted.
            </>,
            <>
              <strong>Google (Analytics, YouTube)</strong> — site analytics and video embeds.
            </>,
            <>
              <strong>Our hosting provider</strong> — serves the site and keeps standard server
              logs.
            </>,
          ]}
        />
        <p>
          We&apos;ll also disclose data where the law requires it, or to protect our rights, our
          members or the public.
        </p>
      </Clause>

      <Clause id="transfers" number={6} title="International transfers">
        <p>
          Some of these providers are based outside the UK, mainly in the United States or the EU.
          Where data leaves the UK, it is protected by an adequacy decision or by Standard
          Contractual Clauses together with the UK International Data Transfer Addendum.
        </p>
      </Clause>

      <Clause id="retention" number={7} title="How long we keep it">
        <LegalList
          items={[
            <>
              <strong>League entries</strong> — for as long as you race with us, and up to{" "}
              <strong>24 months</strong> after your last event, so we can handle returning drivers
              and appeals. Rejected applications are deleted within 12 months.
            </>,
            <>
              <strong>Merch orders</strong> — transaction records kept for{" "}
              <strong>6 years</strong> to meet UK tax rules.
            </>,
            <>
              <strong>Analytics</strong> — up to <strong>14 months</strong> in Google Analytics.
            </>,
            <>
              <strong>Race results and standings</strong> — kept indefinitely as a historical record
              of the league, under your driver name.
            </>,
            <>
              <strong>Emails</strong> — up to <strong>24 months</strong> after the conversation
              ends.
            </>,
          ]}
        />
      </Clause>

      <Clause id="rights" number={8} title="Your rights">
        <p>Under UK GDPR you can ask us to:</p>
        <LegalList
          items={[
            "Give you a copy of the personal data we hold about you.",
            "Correct anything that's wrong or out of date.",
            "Delete your data (we may need to keep order records for tax purposes).",
            "Restrict or object to how we use it — including objecting to our legitimate interests.",
            "Port your data to another service in a machine-readable format.",
            "Withdraw consent for analytics at any time, without affecting what came before.",
          ]}
        />
        <p>
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll respond
          within one month. There&apos;s no charge for a reasonable request.
        </p>
        <p>
          If you&apos;re not happy with how we&apos;ve handled it, you can complain to the{" "}
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">
            Information Commissioner&apos;s Office
          </a>{" "}
          — though we&apos;d appreciate the chance to put it right first.
        </p>
      </Clause>

      <Clause id="children" number={9} title="Under-16s">
        <p>
          Our leagues are for drivers aged <strong>16 and over</strong> and we don&apos;t knowingly
          collect data from anyone younger. If you believe a child has given us their details, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll delete it.
        </p>
      </Clause>

      <Clause id="security" number={10} title="Security">
        <p>
          The site is served over HTTPS, database access is restricted to league admins, and payment
          data is handled entirely by Stripe. No system is perfectly secure, but if a breach is
          likely to put your rights at risk we&apos;ll tell you and the ICO as the law requires.
        </p>
      </Clause>

      <Clause id="changes" number={11} title="Changes to this policy">
        <p>
          We&apos;ll update this page when our data practices change, and the &ldquo;last
          updated&rdquo; date above will tell you when. Significant changes will be announced in{" "}
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
          .
        </p>
      </Clause>
    </LegalPage>
  );
}
