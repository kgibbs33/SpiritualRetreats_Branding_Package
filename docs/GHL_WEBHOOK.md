# GoHighLevel Webhook Mapping

Every public form POSTs a standardised JSON payload to the webhook URL
configured via the `FORM_WEBHOOK_URL` environment variable (already set
in Vercel Production + Preview). The secret is sent as the `X-Webhook-Secret`
header — never in the URL or body.

## Standard payload envelope

```json
{
  "form_type": "contact",
  "submitted_at": "2026-10-09T12:34:56.789Z",
  "source_url": "",
  "contact": { "name": "Jane Doe", "email": "jane@example.com", "phone": "+44..." },
  "data": { ... },
  "record_id": "uuid-string"
}
```

## Form types and field maps

### 1. `contact`

| Route | `/api/contact` |
|-------|---------------|

```json
{
  "form_type": "contact",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Jane Doe", "email": "jane@example.com" },
  "data": { "subject": "Question about retreats", "message": "Hi, I would like to..." },
  "record_id": "a1b2c3d4-..."
}
```

### 2. `seeker_discovery`

| Route | `/api/seeker-discovery` |
|-------|------------------------|

```json
{
  "form_type": "seeker_discovery",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Jane Doe", "email": "jane@example.com", "phone": "+447..." },
  "data": { "answers": { ... }, "purpose": "Healing", "budget": "€1,000–2,000", "destination": "Thailand" },
  "record_id": "b2c3d4e5-..."
}
```

### 3. `retreat_submission`

| Route | `/api/retreat-submission` |
|-------|--------------------------|

```json
{
  "form_type": "retreat_submission",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Mary Owner", "email": "mary@retreat.com" },
  "data": { "retreatTitle": "Sunrise Yoga Retreat", "location": "Bali" },
  "record_id": "c3d4e5f6-..."
}
```

### 4. `venue_submission`

| Route | `/api/venue-submission` |
|-------|------------------------|

```json
{
  "form_type": "venue_submission",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Sam Host", "email": "sam@venue.com", "phone": "+44..." },
  "data": { "venueName": "Mountain Haven", "location": "Andalusia" },
  "record_id": "d4e5f6a7-..."
}
```

### 5. `facilitator_onboarding`

| Route | `/api/facilitator-onboarding` |
|-------|-----------------------------|

```json
{
  "form_type": "facilitator_onboarding",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Alex Guide", "email": "alex@facilitator.com" },
  "data": { "practiceAreas": ["yoga"], "city": "Barcelona" },
  "record_id": "e5f6a7b8-..."
}
```

### 6. `facilitator_matching`

| Route | `/api/facilitator-matching` |
|-------|---------------------------|

```json
{
  "form_type": "facilitator_matching",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Alex Guide", "email": "alex@facilitator.com", "phone": null },
  "data": { "practiceAreas": ["yoga"], "sessionFormat": "workshop" },
  "record_id": "f6a7b8c9-..."
}
```

### 7. `newsletter`

| Route | `/api/newsletter` |
|-------|------------------|

```json
{
  "form_type": "newsletter",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "", "email": "jane@example.com" },
  "data": {},
  "record_id": "jane@example.com"
}
```

### 8. `home_quick_capture`

| Route | `/api/home-quick-capture` |
|-------|--------------------------|

```json
{
  "form_type": "home_quick_capture",
  "submitted_at": "2026-10-09T12:00:00.000Z",
  "source_url": "",
  "contact": { "name": "Jane Doe", "email": "jane@example.com", "phone": "+447..." },
  "data": { "purpose": "Reset", "budget": "€1,000–2,000", "destination": "Spain" },
  "record_id": "a7b8c9d0-..."
}
```

## Mapping in GHL

1. In GHL, create a **Webhook** trigger for each `form_type` value.
2. Use the inbound webhook URL from step 1 as the `FORM_WEBHOOK_URL` env var.
3. The `X-Webhook-Secret` header can be validated in GHL's webhook settings.
4. Map GHL contact fields from the `contact` object and custom fields from `data`.
   `record_id` is the Supabase row UUID — use it for deduplication or linking back.