#!/usr/bin/env node
/**
 * Smoke-test all public form routes.
 *
 * Usage: node scripts/test-forms.mjs [BASE_URL]
 *   Defaults to http://localhost:3000 if no argument given.
 *
 * Posts fake test-only data to each form.  Prints PASS or FAIL per form.
 * Exits non-zero if any form fails.
 *
 * After running, delete the test rows in Supabase and check HighLevel
 * for any stray test contacts.
 */

const BASE = process.argv[2] ?? "http://localhost:3000";

const TS = Date.now();
const TEST_NAME = "TEST - ignore";
const TEST_EMAIL = `test+${TS}@example.com`;

const forms = [
  {
    name: "contact",
    url: "/api/contact",
    body: {
      name: TEST_NAME,
      email: TEST_EMAIL,
      subject: "TEST - delete me",
      message: "Automated test submission. Please ignore.",
      company: "",
    },
  },
  {
    name: "seeker-discovery",
    url: "/api/seeker-discovery",
    body: {
      fullName: TEST_NAME,
      email: TEST_EMAIL,
      answers: { purpose: "TEST - delete me" },
      company: "",
    },
  },
  {
    name: "retreat-submission",
    url: "/api/retreat-submission",
    body: {
      contactName: TEST_NAME,
      email: TEST_EMAIL,
      retreatTitle: "TEST - delete me",
      company: "",
    },
  },
  {
    name: "venue-submission",
    url: "/api/venue-submission",
    body: {
      contactName: TEST_NAME,
      email: TEST_EMAIL,
      venueName: "TEST - delete me",
      consent: true,
      company: "",
    },
  },
  {
    name: "facilitator-onboarding",
    url: "/api/facilitator-onboarding",
    body: {
      fullName: TEST_NAME,
      email: TEST_EMAIL,
      practiceAreas: ["yoga"],
      company: "",
    },
  },
  {
    name: "facilitator-matching",
    url: "/api/facilitator-matching",
    body: {
      fullName: TEST_NAME,
      email: TEST_EMAIL,
      practiceAreas: ["yoga"],
      sessionFormat: "workshop",
      retreatDurationPref: "weekend",
      settingPreference: "retreat_center",
      company: "",
    },
  },
  {
    name: "newsletter",
    url: "/api/newsletter",
    body: {
      email: TEST_EMAIL,
      company: "",
    },
  },
  {
    name: "home-quick-capture",
    url: "/api/home-quick-capture",
    body: {
      fullName: TEST_NAME,
      email: TEST_EMAIL,
      purpose: "TEST - delete me",
      company: "",
    },
  },
];

let failed = 0;

for (const { name, url, body } of forms) {
  const fullUrl = BASE.replace(/\/+$/, "") + url;
  process.stdout.write(`${name.padEnd(26)} `);
  try {
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 200 || res.status === 201) {
      console.log("PASS");
    } else {
      console.log(`FAIL (HTTP ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`FAIL (${err.message.slice(0, 50)})`);
    failed++;
  }
}

console.log(
  `\n${forms.length - failed} / ${forms.length} passed` +
    (failed ? `, ${failed} FAILED` : "")
);

console.log(
  "\nREMINDER: Delete test rows in Supabase and check HighLevel for stray test contacts."
);

process.exit(failed > 0 ? 1 : 0);