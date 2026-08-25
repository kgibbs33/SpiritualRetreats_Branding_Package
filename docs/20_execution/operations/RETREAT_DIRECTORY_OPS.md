# Retreat directory operations (SCOPE-048)

## Listing lifecycle

1. Owner completes **retreat intake** (`/retreat-intake-form` → `retreat_submissions`).
2. Operator reviews in **Admin → Retreat submissions** (48h target on marketing copy).
3. **Publish** via operator API → row in `retreats` with `source_submission_id`.
4. Listing appears on **`/retreat-listings`** and homepage spotlight when `published`.

## Sorting (SCOPE-055 — partial)

Current implementation: query order from `listPublishedRetreats` (typically `created_at` desc).  
**Planned:** explicit sort params (date, price, region) — not yet in UI.

## Categories (SCOPE-021)

- SSOT: `src/lib/retreat-categories.ts`
- Filter query params should align with slug values (`?type=yoga`, etc.)
- Legacy slugs (`plant`, `sound`) retained for existing rows

## Owner types (SCOPE-023)

- `venue_only` — space/hosting focus
- `program_operator` — full programme

Stored on `retreat_submissions.owner_type` after migration `20260602193000_scope_john_batch.sql`.

## Quality bar

- Vetting copy on `/trust` and facilitator flows references human review.
- Reject or request edits via admin notes (extend admin UI as needed).
