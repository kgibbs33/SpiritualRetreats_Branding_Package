"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const fieldClass =
  "block w-full rounded-xl border-2 border-sage-mist bg-white px-4 py-3 text-celestial-navy placeholder:text-stone-300 focus:border-river-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-river-teal/30 transition-colors";

const labelClass = "block text-sm font-semibold text-stone-700";

function Field({
  id,
  label,
  required,
  children,
  error,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : (
          <span className="font-normal text-stone-400"> (optional)</span>
        )}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function VenueApplicationForm() {
  const router = useRouter();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    contactName: "",
    email: "",
    phone: "",
    venueName: "",
    relationship: "",
    website: "",
    country: "",
    location: "",
    capacity: "",
    bedrooms: "",
    practiceSpace: "",
    practiceSpaceDetails: "",
    catering: "",
    exclusiveUse: "",
    facilities: "",
    suitableRetreatTypes: "",
    accessNotes: "",
    priceRange: "",
    minimumStay: "",
    description: "",
    consent: false,
  });

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!form.consent) {
      setErrors({ form: "Please confirm you agree to be contacted." });
      return;
    }

    setSubmitting(true);

    const payload = {
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      venueName: form.venueName.trim(),
      relationship: form.relationship || null,
      website: form.website.trim() || null,
      country: form.country.trim() || null,
      location: form.location.trim() || null,
      capacity: form.capacity ? Number(form.capacity) : null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      practiceSpace: form.practiceSpace ? form.practiceSpace === "yes" : null,
      practiceSpaceDetails: form.practiceSpaceDetails.trim() || null,
      catering: form.catering.trim() || null,
      exclusiveUse: form.exclusiveUse ? form.exclusiveUse === "yes" : null,
      facilities: form.facilities.trim() || null,
      suitableRetreatTypes: form.suitableRetreatTypes.trim() || null,
      accessNotes: form.accessNotes.trim() || null,
      priceRange: form.priceRange.trim() || null,
      minimumStay: form.minimumStay.trim() || null,
      description: form.description.trim() || null,
      consent: true,
      company: (honeypotRef.current?.value || "").trim(),
    };

    try {
      const res = await fetch("/api/venue-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: json.error || "Submission failed. Please try again." });
        setSubmitting(false);
        return;
      }
      router.push("/thank-you?source=venue-application");
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot */}
      <input
        ref={honeypotRef}
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        defaultValue=""
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {errors.form && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      {/* Contact */}
      <fieldset className="rounded-2xl border border-sage-mist bg-white p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-forest-green">
          Your details
        </legend>
        <div className="space-y-4">
          <Field id="va-contactName" label="Contact name" required>
            <input
              id="va-contactName"
              type="text"
              autoComplete="name"
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              placeholder="Your name"
              required
              className={fieldClass}
            />
          </Field>
          <Field id="va-email" label="Email" required>
            <input
              id="va-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              required
              className={fieldClass}
            />
          </Field>
          <Field id="va-phone" label="Phone">
            <input
              id="va-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+44…"
              className={fieldClass}
            />
          </Field>
        </div>
      </fieldset>

      {/* Venue */}
      <fieldset className="rounded-2xl border border-sage-mist bg-white p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-forest-green">
          The venue
        </legend>
        <div className="space-y-4">
          <Field id="va-venueName" label="Venue name" required>
            <input
              id="va-venueName"
              type="text"
              value={form.venueName}
              onChange={(e) => set("venueName", e.target.value)}
              placeholder="Name of your venue"
              required
              className={fieldClass}
            />
          </Field>
          <Field id="va-relationship" label="Your relationship to the property">
            <select
              id="va-relationship"
              value={form.relationship}
              onChange={(e) => set("relationship", e.target.value)}
              className={fieldClass}
            >
              <option value="">Select…</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field id="va-website" label="Website">
            <input
              id="va-website"
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://…"
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="va-country" label="Country">
              <input
                id="va-country"
                type="text"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="Country"
                className={fieldClass}
              />
            </Field>
            <Field id="va-location" label="Location">
              <input
                id="va-location"
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Region / town"
                className={fieldClass}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="va-capacity" label="Guest capacity">
              <input
                id="va-capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="Max guests"
                className={fieldClass}
              />
            </Field>
            <Field id="va-bedrooms" label="Bedrooms">
              <input
                id="va-bedrooms"
                type="number"
                min={1}
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
                placeholder="Number of bedrooms"
                className={fieldClass}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      {/* Facilities */}
      <fieldset className="rounded-2xl border border-sage-mist bg-white p-5 sm:p-6">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wider text-forest-green">
          Facilities &amp; suitability
        </legend>
        <div className="space-y-4">
          <Field id="va-practiceSpace" label="Practice or workshop space">
            <select
              id="va-practiceSpace"
              value={form.practiceSpace}
              onChange={(e) => set("practiceSpace", e.target.value)}
              className={fieldClass}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field id="va-practiceSpaceDetails" label="Practice / workshop space description">
            <textarea
              id="va-practiceSpaceDetails"
              rows={3}
              value={form.practiceSpaceDetails}
              onChange={(e) => set("practiceSpaceDetails", e.target.value)}
              placeholder="Yoga shala, meditation hall, workshop room…"
              className={fieldClass}
            />
          </Field>
          <Field id="va-catering" label="Catering">
            <input
              id="va-catering"
              type="text"
              value={form.catering}
              onChange={(e) => set("catering", e.target.value)}
              placeholder="In-house chef, full board, self-catering…"
              className={fieldClass}
            />
          </Field>
          <Field id="va-exclusiveUse" label="Exclusive use available">
            <select
              id="va-exclusiveUse"
              value={form.exclusiveUse}
              onChange={(e) => set("exclusiveUse", e.target.value)}
              className={fieldClass}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </Field>
          <Field id="va-facilities" label="Facilities">
            <textarea
              id="va-facilities"
              rows={3}
              value={form.facilities}
              onChange={(e) => set("facilities", e.target.value)}
              placeholder="Pool, sauna, gardens, treatment rooms…"
              className={fieldClass}
            />
          </Field>
          <Field id="va-suitableRetreatTypes" label="Suitable retreat types">
            <input
              id="va-suitableRetreatTypes"
              type="text"
              value={form.suitableRetreatTypes}
              onChange={(e) => set("suitableRetreatTypes", e.target.value)}
              placeholder="Yoga, meditation, wellness…"
              className={fieldClass}
            />
          </Field>
          <Field id="va-accessNotes" label="Airport / access notes">
            <input
              id="va-accessNotes"
              type="text"
              value={form.accessNotes}
              onChange={(e) => set("accessNotes", e.target.value)}
              placeholder="Nearest airport, transfers…"
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="va-priceRange" label="Price range">
              <input
                id="va-priceRange"
                type="text"
                value={form.priceRange}
                onChange={(e) => set("priceRange", e.target.value)}
                placeholder="e.g. per night / per person"
                className={fieldClass}
              />
            </Field>
            <Field id="va-minimumStay" label="Minimum stay">
              <input
                id="va-minimumStay"
                type="text"
                value={form.minimumStay}
                onChange={(e) => set("minimumStay", e.target.value)}
                placeholder="e.g. 3 nights"
                className={fieldClass}
              />
            </Field>
          </div>
          <Field id="va-description" label="Description">
            <textarea
              id="va-description"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell us about your venue and what makes it special…"
              className={fieldClass}
            />
          </Field>
        </div>
      </fieldset>

      {/* Consent */}
      <div className="rounded-2xl bg-sage-mist/60 p-5 sm:p-6">
        <label htmlFor="va-consent" className="flex items-start gap-3 text-sm text-stone-700">
          <input
            id="va-consent"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-river-teal"
            required
          />
          <span>
            I confirm I am authorised to submit this venue and agree to be
            contacted about my application. <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-sacred-gold px-10 text-base font-semibold text-celestial-navy shadow-sm transition-all hover:bg-sacred-gold/90 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-river-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Submitting…" : "Submit venue application"}
      </button>
    </form>
  );
}