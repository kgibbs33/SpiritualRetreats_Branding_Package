#!/usr/bin/env node
/**
 * Smoke-test every public form route on a given base URL.
 * Usage: node scripts/test-forms.mjs <BASE_URL>
 * Example: node scripts/test-forms.mjs https://spiritual-retreats-branding-package-git-milestone-2-xforria.vercel.app
 *
 * Posts clearly fake data (name "TEST - ignore") to each form endpoint.
 * Prints a table: form, HTTP status, result (thank-you or error).
 * Never runs against production — you provide the URL.
 */

const TEST_NAME = "TEST - ignore";
const TEST_EMAIL = "test@example.com";

const forms = [
  {
    name: "contact",
    url: "/api/contact",
    body: {
      name: TEST_NAME,
      email: TEST_EMAIL,
      subject: "Test submission",
      message: "This is an automated test. Please ignore.",
      company: "",
    },
  },
  {
    name: "seeker-discovery",
    url: "/api/seeker-discovery",
    body: {
      fullName: TEST_NAME,
      email: TEST_EMAIL,
      answers: { q1: "test" },
      company: "",
    },
  },
  {
    name: "retreat-submission",
    url: "/api/retreat-submission",
    body: {
      contactName: TEST_NAME,
      email: TEST_EMAIL,
      retreatTitle: "Test Retreat",
      company: "",
    },
  },
  {
    name: "venue-submission",
    url: "/api/venue-submission",
    body: {
      contactName: TEST_NAME,
      email: TEST_EMAIL,
      venueName: "Test Venue",
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
      purpose: "Test",
      company: "",
    },
  },
];

const BASE = process.argv[2];
if (!BASE) {
  console.error("Usage: node scripts/test-forms.mjs <BASE_URL>");
  process.exit(1);
}
const baseUrl = BASE.replace(/\/+$/, "");

console.log("Form                    Status  Result");
console.log("────────────────────────────────────────");

for (const { name, url, body } of forms) {
  const fullUrl = baseUrl + url;
  try {
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text().catch(() => "");
    let result = `HTTP ${res.status}`;
    if (res.status >= 500) {
      result += " — ERROR";
    } else if (res.status >= 400) {
      result += " — validation (expected on missing fields)";
    } else {
      result += " — " + (text.includes("success") ? "thank-you" : text.slice(0, 50));
    }
    console.log(`${name.padEnd(24)} ${result}`);
  } catch (err) {
    console.log(`${name.padEnd(24)} NETWORK ERROR: ${err.message.slice(0, 40)}`);
  }
}