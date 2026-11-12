/**
 * Unit tests for listing-text-rules.ts — 30+ tests covering positives and false-positive guards.
 * Run: npx tsx scripts/test-listing-text-rules.ts
 */
import { checkListingText } from "../src/lib/listing-text-rules.js";

let passed = 0;
let failed = 0;

function t(name: string, text: string, expect: { type: string } | null) {
  const result = checkListingText(text);
  const ok =
    (result === null && expect === null) ||
    (result !== null && expect !== null && result.type === expect.type);
  if (ok) {
    passed++;
  } else {
    failed++;
    console.log(
      `FAIL ${name}`,
      `expected=${expect ? expect.type : "clean"} got=${result ? result.type : "clean"} excerpt=${result?.excerpt ?? ""}`
    );
  }
}

// ── Positive detections ────────────────────────────────────────────────────

t("URL http", "Book at http://example.com", { type: "link" });
t("URL https", "See https://retreat.io/schedule", { type: "link" });
t("URL www", "Visit www.serenity-retreat.com for more", { type: "link" });
t("bare domain .com", "See serenityretreat.com for details", { type: "link" });
t("bare .org", "Check mindfulpath.org", { type: "link" });
t("bare .travel", "Visit goldenpath.travel", { type: "link" });
t("bare .io", "Found on realign.io", { type: "link" });
t("bare .net", "Check peacehaven.net today", { type: "link" });
t("country .de", "Visit stillzeit.de", { type: "link" });
t("country .uk", "Check wildwood.co.uk", { type: "link" });

t("email simple", "Email us at hello@retreat.com", { type: "email" });
t("email with +", "Contact info+support@venue.org for info", { type: "email" });

t("phone +", "Call +49 30 123456789", { type: "phone" });
t("phone brackets", "Phone (030) 12345678", { type: "phone" });
t("phone plain", "Call 030 1234567890", { type: "phone" });
t("phone dashes", "Phone 030-123456789", { type: "phone" });

t("instagram", "Follow us on instagram.com/retreat", { type: "social" });
t("facebook", "Check our facebook.com/lakeview page", { type: "social" });
t("wa.me", "WhatsApp wa.me/49123456", { type: "social" });
t("linktr.ee", "More links at linktr.ee/sacredpath", { type: "social" });

t("@handle", "DM @sacred_retreat on social", { type: "handle" });

// ── False-positive guards ──────────────────────────────────────────────────

t("price euro", "From €1,200 per week", null);
t("price eur words", "Price: 1.200,00 EUR", null);
t("date ISO", "2027-03-14", null);
t("date DMY", "14.03.2027", null);
t("time", "Open 08:30–17:00 daily", null);
t("range days", "3–5 days", null);
t("text dots", "A calm, quiet place. Perfect for solo", null);
t("number only", "Capacity: 1200 people", null);
t("door number", "House number 123, main road", null);
t("normal sentence", "We offer yoga, meditation and wellness retreats in a beautiful mountain setting.", null);

console.log(`${passed} passed, ${failed} failed, ${passed + failed} total`);