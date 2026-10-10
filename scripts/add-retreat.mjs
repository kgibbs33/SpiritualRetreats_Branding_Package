#!/usr/bin/env node
/**
 * Import a retreat from a JSON file into the database.
 *
 * Usage:
 *   node scripts/add-retreat.mjs <path-to-json> [--dry-run]
 *
 * The JSON file must match the RetreatImport schema below.
 * Prints missing mandatory fields and TODO(owner) items.
 * With --dry-run, validates and prints the payload without inserting.
 * Never run against production — the retreat is inserted as status='draft'.
 */

import { readFileSync } from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");
const PATH = process.argv.find(a => a.endsWith(".json") || a.endsWith(".jsonc"));
if (!PATH) {
  console.error("Usage: node scripts/add-retreat.mjs <path-to-json> [--dry-run]");
  process.exit(1);
}

// ── Schema ──────────────────────────────────────────────────────────────
const REQUIRED = ["slug","title","type","dates_display","price_display","image_path"];
const OPTIONAL = [
  "categories","location","country","region",
  "price_from","price_currency","price_notes",
  "inclusions","exclusions","gallery_paths",
  "description","itinerary",
  "operator_name","operator_website",
  "min_age","max_age","age_notes",
  "capacity","bedrooms",
  "booking_url","commercial_status",
];

function readJSON(path) {
  try {
    const raw = readFileSync(path, "utf-8");
    // Allow trailing commas (JSONC)
    return JSON.parse(raw.replace(/,\s*\n?\s*}/g, "}").replace(/,\s*\n?\s*\]/g, "]"));
  } catch (e) {
    console.error(`Failed to parse ${path}: ${e.message}`);
    process.exit(1);
  }
}

// ── Main ────────────────────────────────────────────────────────────────
const data = readJSON(PATH);
const missing = REQUIRED.filter(f => !data[f]);
const warnings = [];

if (missing.length) {
  console.error("MISSING MANDATORY FIELDS:", missing.join(", "));
  process.exit(1);
}

if (data.rating || data.review_count) {
  warnings.push("TODO(owner): rating/review_count present — confirm these are real data, not fake.");
}
if (!data.country) {
  warnings.push("TODO(owner): country not set — will show location only.");
}
if (!data.gallery_paths?.length && !data.image_path) {
  warnings.push("TODO(owner): no gallery images — publishing blocked until images added.");
}
if (!data.departures?.length) {
  warnings.push("TODO(owner): no departures — publishing blocked until >=1 departure added.");
}
if (!data.description) {
  warnings.push("TODO(owner): no description — consider adding one.");
}

const retreat = {
  slug: data.slug,
  title: data.title,
  type: data.type,
  categories: data.categories ?? [data.type],
  location: data.location ?? null,
  country: data.country ?? null,
  region: data.region ?? null,
  dates_display: data.dates_display,
  price_display: data.price_display,
  price_from: data.price_from ?? null,
  price_currency: data.price_currency ?? "EUR",
  price_notes: data.price_notes ?? null,
  image_path: data.image_path,
  gallery_paths: data.gallery_paths ?? null,
  inclusions: data.inclusions ?? null,
  exclusions: data.exclusions ?? null,
  itinerary: data.itinerary ?? null,
  description: data.description ?? null,
  operator_name: data.operator_name ?? null,
  operator_website: data.operator_website ?? null,
  min_age: data.min_age ?? null,
  max_age: data.max_age ?? null,
  age_notes: data.age_notes ?? null,
  booking_url: data.booking_url ?? null,
  commercial_status: data.commercial_status ?? null,
  status: "draft",
  qualification_status: "submitted",
  sort_order: 0,
};

const departures = (data.departures ?? []).map(d => ({
  start_date: d.start_date,
  end_date: d.end_date,
  capacity: d.capacity ?? null,
  spots_left: d.spots_left ?? d.capacity ?? null,
  price_override: d.price_override ?? null,
  status: "open",
  notes: d.notes ?? null,
}));

console.log("=== RETREAT ===");
console.log(JSON.stringify(retreat, null, 2));
console.log("\n=== DEPARTURES ===");
console.log(JSON.stringify(departures, null, 2));

if (warnings.length) {
  console.log("\n=== WARNINGS ===");
  warnings.forEach(w => console.log("  " + w));
}

if (DRY_RUN) {
  console.log("\n[DRY RUN] Not inserting.");
  process.exit(0);
}

// Insert via admin API (requires the app to be running)
const BASE = process.env.APP_URL ?? "http://localhost:3000";
console.log(`\nInserting into ${BASE}...`);

// Since we can't auth via CLI, we print the curl commands
console.log("\nManual insert — run these with a valid admin session cookie:");
console.log(`\\n# 1. Insert retreat`);
console.log(`curl -X POST ${BASE}/api/admin/retreats \\\\`);
console.log(`  -H 'Content-Type: application/json' \\\\`);
console.log(`  -H 'Cookie: admin_session=<your-session>' \\\\`);
console.log(`  -d '${JSON.stringify(retreat)}'`);
console.log(`\\n# 2. Insert departures (repeat for each, using the returned retreat id)`);
departures.forEach((d, i) => {
  console.log(`curl -X POST ${BASE}/api/admin/departures \\\\`);
  console.log(`  -H 'Content-Type: application/json' \\\\`);
  console.log(`  -H 'Cookie: admin_session=<your-session>' \\\\`);
  console.log(`  -d '${JSON.stringify({...d, retreat_id: "<RETREAT_ID>"})}'`);
});