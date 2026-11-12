/**
 * Prove Step 1 schemas work after the .omit() fix.
 * Run: npx tsx scripts/test-zod-omit-fix.ts
 */
import { retreatSubmissionSchema, retreatSubmissionInsertSchema } from "../src/validation/retreatSubmission.js";
import { venueSubmissionSchema, venueSubmissionInsertSchema } from "../src/validation/venueSubmission.js";

let p = 0, f = 0;

function ok(label: string, cond: boolean) {
  if (cond) { p++; } else { f++; console.log("FAIL", label); }
}

// a) All four schemas imported without throwing
console.log("retreatSubmissionSchema is ZodObject:", typeof retreatSubmissionSchema.parse === "function");
console.log("retreatInsert is ZodObject:", typeof retreatSubmissionInsertSchema.parse === "function");
console.log("venueSubmissionSchema is ZodObject:", typeof venueSubmissionSchema.parse === "function");
console.log("venueInsert is ZodObject:", typeof venueSubmissionInsertSchema.parse === "function");
p += 4;

// b) Accept a normal submission
const normal = { contactName: "Test", email: "test@example.com", retreatTitle: "Yoga Retreat", consent: true, venueName: "Lakeside" };
const r1 = retreatSubmissionSchema.safeParse(normal);
ok("retreat normal", r1.success);

const v1 = venueSubmissionSchema.safeParse(normal);
ok("venue normal", v1.success);

// Insert schemas work
const i1 = retreatSubmissionInsertSchema.safeParse(normal);
ok("retreat insert normal", i1.success);

const iv1 = venueSubmissionInsertSchema.safeParse(normal);
ok("venue insert normal", iv1.success);

// c) Rejects description containing www.mysite.com
const withLink = { ...normal, description: "Visit www.mysite.com for details" };
const r2 = retreatSubmissionSchema.safeParse(withLink);
ok("retreat blocks link in desc", !r2.success && r2.error?.issues.some(i => i.path.includes("description")));

const v2 = venueSubmissionSchema.safeParse(withLink);
ok("venue blocks link in desc", !v2.success && v2.error?.issues.some(i => i.path.includes("description")));

// d) Rejects venue facilities containing a phone number
const withPhone = { ...normal, facilities: "Call +49 30 12345678 to book" };
const v3 = venueSubmissionSchema.safeParse(withPhone);
ok("venue blocks phone in facilities", !v3.success && v3.error?.issues.some(i => i.path.includes("facilities")));

// Contact fields (private) NOT blocked
const withEmailInContact = { ...normal, contactName: "John", email: "john@myretreat.com" };
const r3 = retreatSubmissionSchema.safeParse(withEmailInContact);
ok("retreat allows email in contact field", r3.success);

const v4 = venueSubmissionSchema.safeParse(withEmailInContact);
ok("venue allows email in contact field", v4.success);

console.log(`\n${p} passed, ${f} failed, ${p+f} total`);