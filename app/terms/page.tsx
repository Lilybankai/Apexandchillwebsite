import type { Metadata } from "next";
import { Clause, LegalList, LegalPage } from "@/components/legal/LegalPage";

/**
 * `/terms` — Terms of Service.
 *
 * OPERATOR NOTE: this is a plain-English starting point written to match what
 * the site actually does (league sign-ups, Stripe-hosted merch checkout with
 * print-on-demand fulfilment, Discord community). It is not legal advice — have
 * it reviewed before you rely on it, and fill in the registered entity name and
 * postal address in {@link OPERATOR} below.
 */
export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/terms" },
  description:
    "The terms that govern your use of the Apex & Chill Racing website, league entry, merch store and community spaces.",
};

const CONTACT_EMAIL = "apexandchillracing@outlook.com";
const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

/** TODO(operator): replace with the registered trading name and postal address. */
const OPERATOR = {
  name: "Apex & Chill Racing",
  address: "[Registered address — to be supplied]",
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Service"
      intro="These terms set out the deal between you and Apex & Chill Racing when you use this website, enter one of our leagues, buy from the merch store or take part in our community."
      lastUpdated="2026-08-21"
    >
      <Clause id="who-we-are" number={1} title="Who we are">
        <p>
          This website is operated by <strong>{OPERATOR.name}</strong> ({OPERATOR.address}),
          referred to below as &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;the league&rdquo;. You
          can reach us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or in our{" "}
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            Discord server
          </a>
          .
        </p>
        <p>
          Apex &amp; Chill Racing is an independent sim racing community. We are not affiliated
          with, endorsed by or sponsored by Sony Interactive Entertainment, Polyphony Digital,
          Studio 397, Motorsport Games, the ACO, or any real-world racing series. Game titles, car
          marques and circuit names are the trade marks of their respective owners.
        </p>
      </Clause>

      <Clause id="acceptance" number={2} title="Accepting these terms">
        <p>
          By using this site you accept these terms. If you don&apos;t agree with them, please
          don&apos;t use the site. We may update these terms from time to time — the &ldquo;last
          updated&rdquo; date above always shows the current version, and continuing to use the
          site after a change means you accept the new version.
        </p>
      </Clause>

      <Clause id="eligibility" number={3} title="Eligibility and league entry">
        <LegalList
          items={[
            <>
              You must be <strong>16 or over</strong> to apply for a seat. If you&apos;re under 18,
              make sure a parent or guardian is happy for you to take part and to share the details
              the entry form asks for.
            </>,
            <>
              Applying is not a guarantee of a seat. Grids are finite, and we allocate places at our
              discretion based on capacity, class balance and race craft.
            </>,
            <>
              The information you give us on the entry form — driver name, platform ID, email and so
              on — must be accurate and yours to give.
            </>,
            <>
              Entry is free unless a specific event says otherwise. Where an event does carry an
              entry fee, the terms for that event are stated at the point of entry.
            </>,
          ]}
        />
      </Clause>

      <Clause id="conduct" number={4} title="On-track and community conduct">
        <p>
          Clean racing is the point of this league. Race hard, leave room, and own your mistakes.
          The following will get you penalised, dropped from a grid or removed from the community:
        </p>
        <LegalList
          items={[
            "Deliberate contact, blocking, or driving in a way intended to end someone else's race.",
            "Cheating of any kind — modified game files, exploits, unapproved assists where a series bans them, or letting someone else drive under your name.",
            "Harassment, hate speech, threats, doxxing, or sexual content in any of our spaces.",
            "Spam, unsolicited advertising, or scam links in Discord or on stream.",
            "Ignoring stewards, race control or admin instructions during an event.",
          ]}
        />
        <p>
          <strong>Stewarding decisions are final.</strong> Incidents are reviewed against the
          published league rules for the series you&apos;re racing in. We may issue warnings, time
          penalties, grid drops, points deductions, or a ban from future events. We can suspend or
          remove any account, entry or Discord membership at our discretion where these terms are
          broken.
        </p>
      </Clause>

      <Clause id="content" number={5} title="Your content, streams and broadcasts">
        <LegalList
          items={[
            <>You keep ownership of anything you submit — liveries, clips, messages, artwork.</>,
            <>
              By taking part in a league event or posting in our community spaces, you give us a
              non-exclusive, royalty-free licence to broadcast, record, replay, clip and promote
              that content in connection with the league (for example on our YouTube channel,
              stream overlays, socials and this website), including your driver name and livery.
            </>,
            <>
              Don&apos;t upload anything you don&apos;t have the rights to, and don&apos;t put
              logos, slogans or imagery on a livery that you aren&apos;t licensed to use or that
              would breach clause 4.
            </>,
            <>
              Tell us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you want content
              featuring you taken down and we&apos;ll deal with it reasonably — though we can&apos;t
              always remove material already published to third-party platforms.
            </>,
          ]}
        />
      </Clause>

      <Clause id="our-content" number={6} title="Our content and tools">
        <p>
          The site&apos;s design, branding, written content, the Apex Overlay System and the LMU
          Livery Studio belong to us or our licensors. You may use them for their intended purpose —
          running and watching our events. You may not resell them, redistribute the downloads, or
          strip our branding and pass the work off as your own.
        </p>
        <p>
          Free tools and downloads are provided <strong>as-is</strong>, without warranty. Back up
          your own files before installing anything.
        </p>
      </Clause>

      <Clause id="merch" number={7} title="Merch store, payments and delivery">
        <LegalList
          items={[
            <>
              Payment is taken through <strong>Stripe Checkout</strong>. We never see or store your
              card details — Stripe handles the payment end to end.
            </>,
            <>
              Orders are printed and shipped by our print-on-demand partner. We currently ship to
              the <strong>United Kingdom and Ireland</strong> only.
            </>,
            <>
              Prices are shown in the currency displayed at checkout and include VAT where it
              applies. Shipping costs are shown before you pay.
            </>,
            <>
              A contract is formed when we confirm your order. If an item turns out to be
              unavailable, or a price is listed in error, we&apos;ll cancel and refund in full.
            </>,
            <>
              <strong>Your right to cancel:</strong> if you&apos;re a consumer in the UK or EU you
              generally have 14 days from delivery to change your mind, and a further 14 days to
              return the goods. Personalised or made-to-order items may be excluded. Faulty or
              misdescribed items are always refundable or replaceable — email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll sort it.
            </>,
          ]}
        />
      </Clause>

      <Clause id="third-parties" number={8} title="Third-party services and links">
        <p>
          Parts of the site rely on services we don&apos;t control — Discord, YouTube embeds,
          Stripe, our print partner, and the sites of our racing partners. Their own terms and
          privacy policies apply when you use them, and we&apos;re not responsible for their content
          or availability.
        </p>
      </Clause>

      <Clause id="availability" number={9} title="Availability">
        <p>
          We run this site and our events as a community project. Standings, schedules, live timing
          and replays are provided in good faith but may be delayed, incomplete or occasionally
          wrong. We don&apos;t promise the site will be available uninterrupted, and we may change,
          pause or retire any feature, series or season.
        </p>
      </Clause>

      <Clause id="liability" number={10} title="Liability">
        <p>
          Nothing in these terms limits our liability for death or personal injury caused by our
          negligence, for fraud, or for anything else that can&apos;t be limited by law — and if
          you&apos;re a consumer, your statutory rights are unaffected.
        </p>
        <p>
          Beyond that, and to the extent the law allows, we aren&apos;t liable for indirect or
          consequential loss, lost data, lost race results, or loss arising from your use of
          downloads, third-party services, or the outcome of any stewarding decision.
        </p>
      </Clause>

      <Clause id="law" number={11} title="Governing law">
        <p>
          These terms are governed by the laws of England and Wales, and the courts of England and
          Wales have jurisdiction. If you&apos;re a consumer resident elsewhere in the UK or the EU,
          you keep the protection of the mandatory consumer law of your home country.
        </p>
      </Clause>

      <Clause id="contact" number={12} title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or ask an admin in{" "}
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
          .
        </p>
      </Clause>
    </LegalPage>
  );
}
