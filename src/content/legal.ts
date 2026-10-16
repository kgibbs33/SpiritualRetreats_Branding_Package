/**
 * Legal page content — placeholder text migrated from the current pages.
 * Gordana will supply final text later. Replacing one file is enough.
 */

import { SITE_CONFIG } from "@/config/site";

export const LEGAL = {
  lastUpdated: SITE_CONFIG.legal.last_updated,
  isDraft: !SITE_CONFIG.legal.text_approved,
  draftLabel: SITE_CONFIG.legal.label_draft,
  contactEmail: SITE_CONFIG.support_email,
  contactAddress: SITE_CONFIG.address,
};

export const PRIVACY_TEXT = `# Privacy Policy

*${SITE_CONFIG.legal.label_draft}*

This privacy policy describes how Light Path Retreats collects, uses, and protects your personal data.

**Last updated:** ${SITE_CONFIG.legal.last_updated}

[The full privacy policy text will be supplied by US counsel. This placeholder preserves the existing wording from the previous site in the source files. See src/content/legal/privacy.md for the current draft.]

For questions about this policy, contact ${SITE_CONFIG.support_email}.
`;

export const TERMS_TEXT = `# Terms of Service

*${SITE_CONFIG.legal.label_draft}*

**Last updated:** ${SITE_CONFIG.legal.last_updated}

[The full terms text will be supplied by US counsel. See src/content/legal/terms.md for the current draft.]

For questions, contact ${SITE_CONFIG.support_email}.
`;

export const COOKIES_TEXT = `# Cookie Policy

*${SITE_CONFIG.legal.label_draft}*

**Last updated:** ${SITE_CONFIG.legal.last_updated}

[The full cookie policy text will be supplied by US counsel. See src/content/legal/cookies.md for the current draft.]
`;