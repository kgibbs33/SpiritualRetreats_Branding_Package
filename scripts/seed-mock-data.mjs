/**
 * Seed mock data for the Re:Treat Yourself admin panel & website.
 * Run: node scripts/seed-mock-data.mjs
 *
 * Reads SUPABASE URL + SECRET from .env.local automatically.
 * Requires Node ≥ 18 (uses native fetch).
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Bootstrap env from .env.local (no dotenv dependency needed)
// ---------------------------------------------------------------------------
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");

function loadEnv(path) {
  try {
    const lines = readFileSync(path, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // strip inline comments
      val = val.split(/\s+#/)[0].trim();
      process.env[key] = process.env[key] ?? val;
    }
  } catch {
    console.warn("Could not load .env.local — relying on existing env vars.");
  }
}

loadEnv(envPath);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function upsert(table, rows, conflictCol) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, conflictCol ? { onConflict: conflictCol, ignoreDuplicates: true } : undefined);
  if (error) {
    console.error(`  ✗ ${table}:`, error.message);
  } else {
    console.log(`  ✓ ${table}: ${rows.length} row(s) seeded`);
  }
}

// ---------------------------------------------------------------------------
// 1. newsletter_subscriptions
// ---------------------------------------------------------------------------
async function seedNewsletter() {
  await upsert("newsletter_subscriptions", [
    { email: "maya.thornton@gmail.com",    created_at: daysAgo(14) },
    { email: "liam.adeyemi@icloud.com",    created_at: daysAgo(12) },
    { email: "sofia.reyes@protonmail.com", created_at: daysAgo(10) },
    { email: "noah.bergstrom@outlook.com", created_at: daysAgo(9)  },
    { email: "aiko.tanaka@gmail.com",      created_at: daysAgo(8)  },
    { email: "priya.menon@gmail.com",      created_at: daysAgo(7)  },
    { email: "christoph.huber@icloud.com", created_at: daysAgo(6)  },
    { email: "amara.osei@gmail.com",       created_at: daysAgo(5)  },
    { email: "lucas.ferreira@gmail.com",   created_at: daysAgo(4)  },
    { email: "eva.lindqvist@hotmail.com",  created_at: daysAgo(3)  },
  ], "email");
}

// ---------------------------------------------------------------------------
// 2. contact_inquiries
// ---------------------------------------------------------------------------
async function seedContactInquiries() {
  await upsert("contact_inquiries", [
    {
      name: "James Whitfield",
      email: "james.whitfield@gmail.com",
      subject: "Partnership enquiry — yoga studio",
      message: "Hi, I run a small yoga studio in Lisbon and I am interested in listing our upcoming 5-day retreat. Could you tell me more about the onboarding process?",
      created_at: daysAgo(11),
    },
    {
      name: "Natalie Cruz",
      email: "natalie.cruz@outlook.com",
      subject: "Question about the matching process",
      message: "Hello! I filled in the discovery form last week and was wondering how long the matching process typically takes. Very excited about this platform.",
      created_at: daysAgo(8),
    },
    {
      name: "Tomás Almeida",
      email: "tomas.almeida@gmail.com",
      subject: "Press & media",
      message: "I write for a Portuguese wellness publication and would love to feature Re:Treat Yourself. Who should I contact?",
      created_at: daysAgo(6),
    },
    {
      name: "Sarah O'Brien",
      email: "sarah.obrien@icloud.com",
      subject: "Accessibility question",
      message: "Do any of the retreats you list cater for people with limited mobility? I have been searching for something gentle and restorative.",
      created_at: daysAgo(4),
    },
    {
      name: "Marc Dupont",
      email: "marc.dupont@protonmail.com",
      subject: "Technical issue — form submission",
      message: "I tried to submit the retreat discovery form but got an error at step 3. Could you look into this?",
      created_at: daysAgo(2),
    },
  ]);
}

// ---------------------------------------------------------------------------
// 3. seeker_discovery_responses
// ---------------------------------------------------------------------------
async function seedSeekers() {
  await upsert("seeker_discovery_responses", [
    {
      full_name: "Maya Thornton",
      email: "maya.thornton@gmail.com",
      phone_whatsapp: "+44 7700 900001",
      travel_dates: "September 2026",
      travel_dates_flexible: true,
      destination_region: "Europe",
      budget_range: "€1,500 – €2,500",
      purpose: "burnout",
      answers: { retreat_style: "silent", depth: "deep", group_size: "small", accommodation: "private" },
      reflection_intention: "I have been running on empty for two years. I need to stop, breathe, and reconnect with what actually matters to me.",
      reflection_great_retreat: "A retreat where the schedule is spacious enough to just be — not every moment filled with activities.",
      reflection_special_requests: "I am vegetarian and would love access to a nature walk or forest area.",
      idempotency_key: "maya-thornton-seed-001",
      created_at: daysAgo(9),
    },
    {
      full_name: "Priya Menon",
      email: "priya.menon@gmail.com",
      phone_whatsapp: "+91 98765 43210",
      travel_dates: "October 2026",
      travel_dates_flexible: false,
      destination_region: "Asia",
      budget_range: "€1,000 – €2,000",
      purpose: "spiritual_growth",
      answers: { retreat_style: "active", depth: "moderate", group_size: "medium", accommodation: "shared" },
      reflection_intention: "I have been practicing yoga for three years and want to go deeper — ideally with an experienced teacher in an authentic setting.",
      reflection_great_retreat: "A structured daily practice with free time for journaling and personal reflection.",
      reflection_special_requests: "Interested in Ayurveda integration.",
      idempotency_key: "priya-menon-seed-001",
      created_at: daysAgo(7),
    },
    {
      full_name: "Liam Adeyemi",
      email: "liam.adeyemi@icloud.com",
      phone_whatsapp: "+353 87 900 1234",
      travel_dates: "November 2026",
      travel_dates_flexible: true,
      destination_region: "Latin America",
      budget_range: "€2,500 – €4,000",
      purpose: "grief",
      answers: { retreat_style: "gentle", depth: "deep", group_size: "small", accommodation: "private" },
      reflection_intention: "I lost my father six months ago. I want somewhere I can process this grief with support — not therapy exactly, but a held space.",
      reflection_great_retreat: "Trauma-informed facilitation, good food, and ideally somewhere beautiful and remote.",
      reflection_special_requests: null,
      idempotency_key: "liam-adeyemi-seed-001",
      created_at: daysAgo(6),
    },
    {
      full_name: "Sofia Reyes",
      email: "sofia.reyes@protonmail.com",
      phone_whatsapp: "+34 612 345 678",
      travel_dates: "August 2026",
      travel_dates_flexible: true,
      destination_region: "Europe",
      budget_range: "€800 – €1,500",
      purpose: "rest",
      answers: { retreat_style: "relaxed", depth: "light", group_size: "medium", accommodation: "shared" },
      reflection_intention: "I just want to properly rest and be in nature. No digital devices, no pressure. A genuine switch-off.",
      reflection_great_retreat: "Yoga, good food, a pool or the sea nearby.",
      reflection_special_requests: "Gluten-free diet please.",
      idempotency_key: "sofia-reyes-seed-001",
      created_at: daysAgo(5),
    },
    {
      full_name: "Noah Bergström",
      email: "noah.bergstrom@outlook.com",
      phone_whatsapp: "+46 70 123 4567",
      travel_dates: "January 2027",
      travel_dates_flexible: false,
      destination_region: "Africa or Middle East",
      budget_range: "€3,000 – €6,000",
      purpose: "leadership_reset",
      answers: { retreat_style: "transformational", depth: "deep", group_size: "small", accommodation: "private" },
      reflection_intention: "I am a founder going through a major inflection point in my company. I want to work on vision, values, and what kind of leader I want to be.",
      reflection_great_retreat: "A retreat that blends personal transformation with strategic thinking. Open to plant medicine if done professionally.",
      reflection_special_requests: "Ideally desert or ocean — somewhere visually powerful.",
      idempotency_key: "noah-bergstrom-seed-001",
      created_at: daysAgo(3),
    },
  ], "idempotency_key");
}

// ---------------------------------------------------------------------------
// 4. retreat_submissions
// ---------------------------------------------------------------------------
async function seedRetreatSubmissions() {
  const { data: existing } = await supabase
    .from("retreat_submissions")
    .select("email")
    .in("email", [
      "helena.voss@waldretreat.de",
      "ricardo@somaamsterdam.nl",
      "amara@sunriseyoga.co.ke",
      "elena@silencioretiro.es",
      "brad@fastgains.io",
    ]);

  const existingEmails = new Set((existing ?? []).map((r) => r.email));

  const rows = [
    {
      contact_name: "Helena Voss",
      email: "helena.voss@waldretreat.de",
      retreat_title: "Forest Bathing & Mindfulness — Black Forest, Germany",
      location: "Titisee-Neustadt, Black Forest, Germany",
      start_date: "2026-09-12",
      end_date: "2026-09-19",
      description: "A 7-day immersion in the ancient Black Forest combining Shinrin-yoku, morning meditation, breathwork, and integration circles. Small group of 8. Organic farmhouse meals.",
      capacity: 8,
      price_range: "€1,650 / 7 days",
      facilitator_notes: "I have been leading forest retreats for 6 years. Trauma-informed approach, partner with a licensed psychotherapist.",
      status: "pending",
      created_at: daysAgo(5),
    },
    {
      contact_name: "Ricardo Fonseca",
      email: "ricardo@somaamsterdam.nl",
      retreat_title: "Somatic Healing Intensive — Algarve, Portugal",
      location: "Sagres, Algarve, Portugal",
      start_date: "2026-10-03",
      end_date: "2026-10-10",
      description: "A week-long somatic healing retreat on Portugal's wild southwest coast. TRE, conscious movement, ocean therapy. Daily yoga, cold ocean plunges. Vegan, private rooms.",
      capacity: 12,
      price_range: "€2,200 / 7 days",
      facilitator_notes: "UKCP certified somatic therapist, 4 years running residential retreats in Netherlands. First Portugal edition.",
      status: "pending",
      created_at: daysAgo(4),
    },
    {
      contact_name: "Amara Diallo",
      email: "amara@sunriseyoga.co.ke",
      retreat_title: "Sunrise Yoga & Safari Spirit — Laikipia, Kenya",
      location: "Laikipia Plateau, Kenya",
      start_date: "2026-11-14",
      end_date: "2026-11-21",
      description: "Authentic Kenyan safari combined with daily yoga. Morning asana and pranayama, afternoon wildlife drives, evening fire circles. Traditional Maasai cultural exchange.",
      capacity: 10,
      price_range: "€3,800 / 7 days",
      facilitator_notes: "Founded Sunrise Yoga Kenya in 2020. 4.9-star reviews across 3 international group retreats. Solar-powered, fully off-grid camp.",
      status: "pending",
      created_at: daysAgo(2),
    },
    {
      contact_name: "Elena Marchetti",
      email: "elena@silencioretiro.es",
      retreat_title: "Silent Vipassana — Sierra Nevada, Spain",
      location: "Sierra Nevada, Granada, Spain",
      start_date: "2026-09-01",
      end_date: "2026-09-10",
      description: "10-day Vipassana-style silent meditation in the mountains above Granada. Noble silence from day 1. Experienced teacher with 20 years practice. Vegetarian meals.",
      capacity: 16,
      price_range: "€900 / 10 days",
      facilitator_notes: "Running silent retreats in Spain since 2018. This is our 14th edition.",
      status: "approved",
      created_at: daysAgo(10),
    },
    {
      contact_name: "Brad Thompson",
      email: "brad@fastgains.io",
      retreat_title: "High-Performance Biohacking Weekend",
      location: "London, UK",
      start_date: "2026-08-29",
      end_date: "2026-08-31",
      description: "Optimise your performance with cold plunge protocols, red light therapy, peptide stacks, and nootropic sessions. Access to our private London facility.",
      capacity: 30,
      price_range: "€595 / 2 days",
      facilitator_notes: "I run a biohacking community of 15,000 members.",
      status: "rejected",
      created_at: daysAgo(8),
    },
  ].filter((r) => !existingEmails.has(r.email));

  if (rows.length === 0) {
    console.log("  ✓ retreat_submissions: already seeded, skipping");
    return;
  }

  const { error } = await supabase.from("retreat_submissions").insert(rows);
  if (error) {
    console.error("  ✗ retreat_submissions:", error.message);
  } else {
    console.log(`  ✓ retreat_submissions: ${rows.length} row(s) seeded`);
  }
}

// ---------------------------------------------------------------------------
// 5. retreats  (4 extra listings)
// ---------------------------------------------------------------------------
async function seedRetreats() {
  await upsert("retreats", [
    {
      slug: "black-forest-mindfulness-germany",
      title: "Forest Bathing & Mindfulness Retreat",
      type: "nature",
      location: "Black Forest, Germany",
      dates_display: "September 12 – 19, 2026",
      price_display: "€1,650 / 7 days",
      image_path: "/images/nature-retreat-type.png",
      rating: 4.8,
      review_count: 9,
      badge: "New",
      description: "A 7-day immersion in the ancient Black Forest combining Shinrin-yoku, morning meditation, and breathwork. Small group of 8, organic farmhouse meals.",
      status: "published",
      sort_order: 7,
      trust_tier: "partner",
      verified_at: daysAgo(10),
      credibility_note: "Verified retreat host, trauma-informed facilitation",
    },
    {
      slug: "somatic-healing-algarve-portugal",
      title: "Somatic Healing Intensive — Algarve",
      type: "wellness",
      location: "Sagres, Portugal",
      dates_display: "October 3 – 10, 2026",
      price_display: "€2,200 / 7 days",
      image_path: "/images/beach-wellness.jpg",
      rating: null,
      review_count: null,
      badge: "Spotlight",
      description: "Somatic trauma release, conscious movement, and ocean therapy on Portugal's wild southwest coast. Vegan, private rooms.",
      status: "published",
      sort_order: 8,
      trust_tier: "listed",
      verified_at: daysAgo(4),
      credibility_note: null,
    },
    {
      slug: "sunrise-yoga-safari-kenya",
      title: "Sunrise Yoga & Safari Spirit",
      type: "yoga",
      location: "Laikipia Plateau, Kenya",
      dates_display: "November 14 – 21, 2026",
      price_display: "€3,800 / 7 days",
      image_path: "/images/yoga-retreat.jpg",
      rating: 4.9,
      review_count: 3,
      badge: "Featured",
      description: "Authentic Kenyan safari meets daily yoga. Morning practice, afternoon wildlife drives, evening fire circles. Off-grid solar camp.",
      status: "published",
      sort_order: 9,
      trust_tier: "partner",
      verified_at: daysAgo(2),
      credibility_note: "4.9★ across 3 international retreats",
    },
    {
      slug: "silent-vipassana-sierra-nevada",
      title: "Silent Vipassana — Sierra Nevada",
      type: "meditation",
      location: "Granada, Spain",
      dates_display: "September 1 – 10, 2026",
      price_display: "€900 / 10 days",
      image_path: "/images/meditation-retreat-type.png",
      rating: 5.0,
      review_count: 14,
      badge: null,
      description: "10-day Vipassana-style silent retreat in the mountains above Granada. Noble silence, experienced teacher with 20 years practice. Vegetarian meals.",
      status: "published",
      sort_order: 10,
      trust_tier: "verified_partner",
      verified_at: daysAgo(10),
      credibility_note: "14th edition — established since 2018",
    },
  ], "slug");
}

// ---------------------------------------------------------------------------
// 6. facilitator_onboarding_responses
// ---------------------------------------------------------------------------
async function seedFacilitators() {
  const { data: existing } = await supabase
    .from("facilitator_onboarding_responses")
    .select("email")
    .in("email", [
      "helena.voss@waldretreat.de",
      "ricardo@somaamsterdam.nl",
      "amara@sunriseyoga.co.ke",
      "elena@silencioretiro.es",
    ]);

  const existingEmails = new Set((existing ?? []).map((r) => r.email));

  const rows = [
    {
      full_name: "Helena Voss",
      email: "helena.voss@waldretreat.de",
      phone: "+49 761 1234567",
      practice_focus: "Forest therapy, mindfulness, breathwork",
      credentials: "Certified Nature & Forest Therapy Guide (ANFT), 6 years experience, trauma-informed",
      message: "I am looking to connect with seekers who need deep rest and nature immersion. My retreats are small and intimate — never more than 8 people.",
      created_at: daysAgo(5),
    },
    {
      full_name: "Ricardo Fonseca",
      email: "ricardo@somaamsterdam.nl",
      phone: "+31 6 12345678",
      practice_focus: "Somatic therapy, TRE, conscious movement",
      credentials: "UKCP Certified Somatic Therapist, 4 years running residential retreats in Netherlands and Portugal",
      message: "I specialise in nervous-system regulation and body-based trauma release. Interested in seekers recovering from burnout or complex stress.",
      created_at: daysAgo(4),
    },
    {
      full_name: "Amara Diallo",
      email: "amara@sunriseyoga.co.ke",
      phone: "+254 700 123456",
      practice_focus: "Yoga, pranayama, safari & nature immersion",
      credentials: "RYT-500 certified, Founder of Sunrise Yoga Kenya, 3 international group retreats with 4.9★ reviews",
      message: "My retreats blend authentic African experience with grounded yoga practice. Love to be matched with adventurous seekers open to cross-cultural transformation.",
      created_at: daysAgo(2),
    },
    {
      full_name: "Elena Marchetti",
      email: "elena@silencioretiro.es",
      phone: "+34 958 123456",
      practice_focus: "Vipassana meditation, silent retreat facilitation",
      credentials: "20 years personal Vipassana practice, trained in S.N. Goenka tradition, 14 retreat editions since 2018",
      message: "I facilitate Noble Silence retreats in the mountains above Granada. Interested in seekers seeking deep inner transformation through meditation.",
      created_at: daysAgo(10),
    },
  ].filter((r) => !existingEmails.has(r.email));

  if (rows.length === 0) {
    console.log("  ✓ facilitator_onboarding_responses: already seeded, skipping");
    return;
  }

  const { error } = await supabase.from("facilitator_onboarding_responses").insert(rows);
  if (error) {
    console.error("  ✗ facilitator_onboarding_responses:", error.message);
  } else {
    console.log(`  ✓ facilitator_onboarding_responses: ${rows.length} row(s) seeded`);
  }
}

// ---------------------------------------------------------------------------
// 7. matches
// ---------------------------------------------------------------------------
async function seedMatches() {
  const [{ data: seekers }, { data: retreats }] = await Promise.all([
    supabase.from("seeker_discovery_responses").select("id, email"),
    supabase.from("retreats").select("id, slug"),
  ]);

  const seekerMap = Object.fromEntries((seekers ?? []).map((s) => [s.email, s.id]));
  const retreatMap = Object.fromEntries((retreats ?? []).map((r) => [r.slug, r.id]));

  const { data: existingMatches } = await supabase
    .from("matches")
    .select("seeker_email, retreat_id");

  const existing = new Set(
    (existingMatches ?? []).map((m) => `${m.seeker_email}::${m.retreat_id}`)
  );

  const candidates = [
    {
      seeker_discovery_response_id: seekerMap["maya.thornton@gmail.com"] ?? null,
      retreat_id: retreatMap["black-forest-mindfulness-germany"],
      seeker_email: "maya.thornton@gmail.com",
      seeker_name: "Maya Thornton",
      facilitator_email: "helena.voss@waldretreat.de",
      facilitator_name: "Helena Voss",
      status: "notified",
      operator_notes: "Strong alignment — burnout recovery meets small trauma-informed nature immersion. Intro email sent to both.",
      created_at: daysAgo(3),
    },
    {
      seeker_discovery_response_id: seekerMap["priya.menon@gmail.com"] ?? null,
      retreat_id: retreatMap["restorative-yoga-ayurveda-kerala-india"],
      seeker_email: "priya.menon@gmail.com",
      seeker_name: "Priya Menon",
      facilitator_email: "elena@silencioretiro.es",
      facilitator_name: "Elena Marchetti",
      status: "recorded",
      operator_notes: "Priya wants deeper yoga with Ayurveda — Kerala retreat is ideal. Awaiting facilitator confirmation.",
      created_at: daysAgo(1),
    },
  ].filter((m) => {
    if (!m.retreat_id) return false;
    return !existing.has(`${m.seeker_email}::${m.retreat_id}`);
  });

  if (candidates.length === 0) {
    console.log("  ✓ matches: already seeded, skipping");
    return;
  }

  const { error } = await supabase.from("matches").insert(candidates);
  if (error) {
    console.error("  ✗ matches:", error.message);
  } else {
    console.log(`  ✓ matches: ${candidates.length} row(s) seeded`);
  }
}

// ---------------------------------------------------------------------------
// 8. events  (audit trail)
// ---------------------------------------------------------------------------
async function seedEvents() {
  const { error } = await supabase.from("events").insert([
    { event_type: "seeker_discovery_submitted", entity_type: "seeker_discovery_response", payload: { email: "maya.thornton@gmail.com", purpose: "burnout" }, created_at: daysAgo(9) },
    { event_type: "seeker_discovery_submitted", entity_type: "seeker_discovery_response", payload: { email: "priya.menon@gmail.com", purpose: "spiritual_growth" }, created_at: daysAgo(7) },
    { event_type: "seeker_discovery_submitted", entity_type: "seeker_discovery_response", payload: { email: "liam.adeyemi@icloud.com", purpose: "grief" }, created_at: daysAgo(6) },
    { event_type: "seeker_discovery_submitted", entity_type: "seeker_discovery_response", payload: { email: "sofia.reyes@protonmail.com", purpose: "rest" }, created_at: daysAgo(5) },
    { event_type: "seeker_discovery_submitted", entity_type: "seeker_discovery_response", payload: { email: "noah.bergstrom@outlook.com", purpose: "leadership_reset" }, created_at: daysAgo(3) },
    { event_type: "retreat_submission_received", entity_type: "retreat_submission", payload: { retreat_title: "Forest Bathing & Mindfulness", contact: "helena.voss@waldretreat.de" }, created_at: daysAgo(5) },
    { event_type: "retreat_submission_received", entity_type: "retreat_submission", payload: { retreat_title: "Somatic Healing Intensive", contact: "ricardo@somaamsterdam.nl" }, created_at: daysAgo(4) },
    { event_type: "retreat_submission_received", entity_type: "retreat_submission", payload: { retreat_title: "Sunrise Yoga & Safari Spirit", contact: "amara@sunriseyoga.co.ke" }, created_at: daysAgo(2) },
    { event_type: "retreat_published_from_submission", entity_type: "retreat_submission", payload: { slug: "silent-vipassana-sierra-nevada" }, created_at: daysAgo(10) },
    { event_type: "manual_match_created", entity_type: "match", payload: { seeker: "maya.thornton@gmail.com", facilitator: "helena.voss@waldretreat.de", retreat: "black-forest-mindfulness-germany" }, created_at: daysAgo(3) },
    { event_type: "manual_match_created", entity_type: "match", payload: { seeker: "priya.menon@gmail.com", facilitator: "elena@silencioretiro.es", retreat: "restorative-yoga-ayurveda-kerala-india" }, created_at: daysAgo(1) },
    { event_type: "contact_inquiry_received", entity_type: "contact_inquiry", payload: { name: "James Whitfield", subject: "Partnership enquiry" }, created_at: daysAgo(11) },
    { event_type: "newsletter_signup", entity_type: "newsletter_subscription", payload: { email: "maya.thornton@gmail.com" }, created_at: daysAgo(14) },
  ]);

  if (error) {
    console.error("  ✗ events:", error.message);
  } else {
    console.log("  ✓ events: 13 row(s) seeded");
  }
}

// ---------------------------------------------------------------------------
// Run all seeders
// ---------------------------------------------------------------------------
console.log("\n🌱  Seeding Re:Treat Yourself database…\n");

await seedNewsletter();
await seedContactInquiries();
await seedSeekers();
await seedRetreatSubmissions();
await seedRetreats();
await seedFacilitators();
await seedMatches();
await seedEvents();

console.log("\n✅  Seed complete. Open /admin/dashboard to see the data.\n");
