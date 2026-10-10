"use client";

import { useRef, useState } from "react";

type RequestPlaceFormProps = {
  retreatId: string;
  departureId?: string;
  retreatTitle: string;
  full?: boolean;
  /** true = "Ask a question" (kind='enquiry'), false = "Request a place" (kind='booking_request') */
  enquiry?: boolean;
};

export function RequestPlaceForm({
  retreatId,
  departureId,
  retreatTitle,
  full,
  enquiry,
}: RequestPlaceFormProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  if (submitted) {
    return (
      <p className="text-sm text-stone-500 italic">
        Thank you. Your request has been received. The team will be in touch to confirm availability.
      </p>
    );
  }

  const kind = enquiry ? "enquiry" : "booking_request";
  const label = enquiry ? "Ask a question" : full ? "Join waitlist" : "Request a place";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center rounded-xl bg-sacred-gold px-5 text-sm font-semibold text-celestial-navy shadow-sm hover:bg-sacred-gold/90"
      >
        {label}
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/retreat-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          retreatId,
          departureId: departureId ?? null,
          kind,
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || null,
          participants: fd.get("participants") ? Number(fd.get("participants")) : null,
          message: fd.get("message") || null,
          utmSource: new URLSearchParams(window.location.search).get("utm_source") || null,
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || null,
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || null,
          referrer: document.referrer || null,
          consent: true,
          company: (honeypotRef.current?.value || "").trim(),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        noValidate
      >
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-celestial-navy">
          {enquiry ? "Ask about " : "Request a place: "}{retreatTitle}
        </h3>

        <input ref={honeypotRef} type="text" name="company" autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute left-[-9999px] opacity-0" defaultValue="" />

        {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <div className="mt-4 space-y-3">
          <input name="name" required placeholder="Your name" className="block w-full rounded-xl border border-sage-mist px-4 py-3 text-sm" />
          <input name="email" type="email" required placeholder="Email" className="block w-full rounded-xl border border-sage-mist px-4 py-3 text-sm" />
          <input name="phone" type="tel" placeholder="Phone (optional)" className="block w-full rounded-xl border border-sage-mist px-4 py-3 text-sm" />
          <input name="participants" type="number" min={1} placeholder="Number of participants" className="block w-full rounded-xl border border-sage-mist px-4 py-3 text-sm" />
          <textarea name="message" rows={3} placeholder={enquiry ? "Your question..." : "Any notes for the operator..."} className="block w-full rounded-xl border border-sage-mist px-4 py-3 text-sm" />
          <label className="flex items-start gap-2 text-xs text-stone-600">
            <input type="checkbox" required className="mt-0.5 accent-river-teal" />
            I agree to be contacted about this request.
          </label>
        </div>

        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-sacred-gold py-3 text-sm font-semibold text-celestial-navy">
            {submitting ? "Sending..." : "Send"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-sage-mist px-5 py-3 text-sm text-stone-500">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}