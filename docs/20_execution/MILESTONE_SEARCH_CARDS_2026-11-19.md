# Milestone search and cards, 19 November 2026

Scope: milestone-4-website-update only. No payments, booking, member accounts, production alias or main changes.

- Date search: specific window (retreat fits wholly within it), flexible months (any overlap), no set dates.
- Date matches use the four existing submitted date ranges, including both Bahia sessions. These are not availability checks.
- Active filters have individual remove links. Form values remain in the query string. Detail links carry validated search state and offer Back to your results.
- Result cards show town/region/country, existing submitted summary, expandable submitted details, existing exact price basis, and one Explore action. No copied ratings, badges, reviews, or wishlist placeholder.
- Compact browsing header after filtering; desktop image/details/price columns; mobile stacked cards and inline date panel.
- Existing preview notices, illustrative photo labels and not-bookable state retained.

Verification: TypeScript and production build pass. ESLint: 0 errors, 14 warnings in existing areas. Automated desktop/mobile browser checks cover specific windows, multi-month OR, invalid date rejection, empty results, chips, semantic full-state return, expandable details and no horizontal overflow at 390px. Screenshots inspected, mobile hero padding corrected and recaptured. Live checks to be completed after deployment.
