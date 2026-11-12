/**
 * Listing text rules — detects contact details, URLs, and social links
 * in public free-text listing fields (never in private contact fields).
 *
 * False-positive guards: prices (€1,200), dates (2027-03-14), times (08:30),
 * ranges (3–5 days), ordinary full stops.
 */

const DOMAIN_ENDINGS = [
  ".com", ".net", ".org", ".co", ".io", ".info", ".travel",
  ".retreat", ".life", ".app",
  ".de", ".fr", ".es", ".it", ".pt", ".nl", ".be", ".at", ".ch",
  ".uk", ".au", ".nz", ".ca", ".in", ".br", ".mx", ".za", ".jp",
  ".cn", ".se", ".no", ".dk", ".fi", ".pl", ".gr", ".tr", ".ru",
];

const SOCIAL_DOMAINS = [
  "instagram.com", "facebook.com", "fb.com", "x.com", "twitter.com",
  "linkedin.com", "wa.me", "t.me", "linktr.ee", "youtube.com",
  "youtu.be", "tiktok.com", "pinterest.com", "threads.net",
];

// ── patterns ──────────────────────────────────────────────────────────────

const URL_LIKE: RegExp =
  /\bhttps?:\/\/[^\s]{3,}|\bwww\.\S{3,}|(?:^|\s|\.)(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*[a-z0-9]\.(?:com|net|org|co|io|info|travel|retreat|life|app|de|fr|es|it|pt|nl|be|at|ch|uk|au|nz|ca|in|br|mx|za|jp|cn|se|no|dk|fi|pl|gr|tr|ru)(?:\/|\s|$)/i;

const EMAIL = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

const PHONE = /(?:(?:\+|00)\d{1,3}[-\s.]?)?(?:\(?\d{2,4}\)?[-\s.]?){2,}\d{3,}/g;

const SOCIAL_HANDLE = /@[a-zA-Z0-9_.]{2,30}/g;

const SOCIAL_LINKS = new RegExp(
  SOCIAL_DOMAINS.map((d) => d.replace(/\./g, "\\.")).join("|"),
  "i"
);

// ── false‑positive safeguards ─────────────────────────────────────────────

const PRICE = /\b(?:€|£|\$|usd|eur|gbp)?\s?\d{1,3}(?:[.,]\d{2,3})?\s?(?:€|£|\$|usd|eur|gbp)?\b/;

const DATE_LIKE =
  /\b\d{4}[-/]\d{2}[-/]\d{2}\b|\b\d{2}[./]\d{2}[./]\d{4}\b|\b\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\b/;

const TIME_LIKE = /\b\d{2}:\d{2}\b/;

// ── helper ─────────────────────────────────────────────────────────────────

/**
 * Return the first violation (type + excerpt) or null if clean.
 * Types: "link", "email", "phone", "social", "handle"
 */
export function checkListingText(text: string): {
  type: string;
  excerpt: string;
} | null {
  // Temporarily strip harmless patterns
  const sanitised = text
    .replace(PRICE, " ")
    .replace(DATE_LIKE, " 2027-01-01 ")
    .replace(TIME_LIKE, " 12:00 ");

  // Check URL-like patterns — but exclude emails already handled
  // Social platforms first (before generic URL matching)
  if (SOCIAL_LINKS.test(sanitised))
    return { type: "social", excerpt: sanitised.match(SOCIAL_LINKS)![0] };

  const emailMatch = sanitised.match(EMAIL);
  if (emailMatch) return { type: "email", excerpt: emailMatch[0] };

  const handleMatch = sanitised.match(SOCIAL_HANDLE);
  if (handleMatch) return { type: "handle", excerpt: handleMatch[0] };

  const urlMatch = sanitised.match(URL_LIKE);
  if (urlMatch) {
    const m = urlMatch[0] as string;
    if (!EMAIL.test(m)) {
      return { type: "link", excerpt: m.slice(0, 80) };
    }
  }

  const phoneMatch = sanitised.match(PHONE);
  if (phoneMatch) return { type: "phone", excerpt: phoneMatch[0] };

  return null;
}