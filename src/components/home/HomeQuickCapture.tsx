"use client";

import { useState } from "react";
import Link from "next/link";

export function HomeQuickCapture() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [purpose, setPurpose] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/home-quick-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phoneWhatsapp: phone.trim() || null,
          travelDates: travelDates.trim() || null,
          destinationRegion: destination.trim() || null,
          budgetRange: budget.trim() || null,
          purpose: purpose.trim() || null,
          company: company.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("err");
        setMessage(json.error || "Something went wrong.");
        return;
      }
      setStatus("ok");
      setMessage("Thank you — we'll be in touch within 24 hours.");
      setFullName("");
      setEmail("");
      setPhone("");
      setTravelDates("");
      setDestination("");
      setBudget("");
      setPurpose("");
    } catch {
      setStatus("err");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section
      className="bg-cream py-14 sm:py-20"
      aria-labelledby="quick-capture-heading"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-forest">
          Quick capture
        </p>
        <h2
          id="quick-capture-heading"
          className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl"
        >
          Not ready for the full questionnaire?
        </h2>
        <p className="mt-2 text-stone-600">
          Leave the essentials — a human will follow up. Or{" "}
          <Link
            href="/retreat-discovery-form"
            className="font-medium text-forest underline-offset-2 hover:underline"
          >
            complete the full discovery form
          </Link>
          .
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qc-name" className="block text-sm font-medium text-stone-700">
                Name *
              </label>
              <input
                id="qc-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="qc-email" className="block text-sm font-medium text-stone-700">
                Email *
              </label>
              <input
                id="qc-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qc-phone" className="block text-sm font-medium text-stone-700">
                Mobile / WhatsApp
              </label>
              <input
                id="qc-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="qc-dates" className="block text-sm font-medium text-stone-700">
                Travel dates
              </label>
              <input
                id="qc-dates"
                value={travelDates}
                onChange={(e) => setTravelDates(e.target.value)}
                placeholder="e.g. March 2026, flexible"
                className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qc-dest" className="block text-sm font-medium text-stone-700">
                Destination
              </label>
              <input
                id="qc-dest"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="qc-budget" className="block text-sm font-medium text-stone-700">
                Budget
              </label>
              <input
                id="qc-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
              />
            </div>
          </div>
          <div>
            <label htmlFor="qc-purpose" className="block text-sm font-medium text-stone-700">
              What are you hoping for?
            </label>
            <textarea
              id="qc-purpose"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 w-full rounded-xl border border-beige px-4 py-3"
            />
          </div>
          {message && (
            <p
              role="status"
              className={
                status === "ok" ? "text-sm text-forest" : "text-sm text-red-600"
              }
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "loading" || status === "ok"}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-forest px-8 font-semibold text-white transition-colors hover:bg-[#345834] disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send — free"}
          </button>
        </form>
      </div>
    </section>
  );
}
