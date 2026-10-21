"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CTA } from "@/lib/brand";
import {
  RETREAT_TYPES,
  RETREAT_INTENTS,
  BUDGET_BANDS,
} from "@/lib/retreats/search-options";

const DURATIONS = [
  "Any duration",
  "Weekend",
  "About a week",
  "Two weeks",
  "A month",
  "Flexible",
];

type SearchFormData = {
  destination: string;
  month: string;
  type: string;
  intent: string;
  budget: string;
  duration: string;
};

export function RetreatSearchBar() {
  const router = useRouter();
  const [form, setForm] = useState<SearchFormData>({
    destination: "",
    month: "",
    type: "All types",
    intent: "What are you looking for?",
    budget: "Any budget",
    duration: "Any duration",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.destination.trim()) params.set("destination", form.destination.trim());
    if (form.month) params.set("month", form.month);
    if (form.type !== "All types") params.set("type", form.type.toLowerCase());
    if (form.intent !== "What are you looking for?")
      params.set("intent", form.intent.toLowerCase());
    if (form.budget !== "Any budget") {
      const band = BUDGET_BANDS.find((b) => b.label === form.budget);
      if (band) params.set("budget", band.slug);
    }
    if (form.duration !== "Any duration") params.set("duration", form.duration);
    const qs = params.toString();
    router.push(`/retreat-listings${qs ? `?${qs}` : ""}`);
  }

  const fieldClass =
    "w-full rounded-lg border border-sage-mist bg-white px-4 py-3 text-sm text-celestial-navy placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-river-teal focus:border-transparent";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-2xl bg-white/95 p-4 shadow-lg sm:p-6 backdrop-blur-sm"
      noValidate
    >
      <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="sr-only">Search retreats</legend>

        {/* Destination */}
        <div>
          <label htmlFor="search-destination" className="sr-only">Destination</label>
          <input
            id="search-destination"
            type="text"
            placeholder="Destination"
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
            className={fieldClass}
          />
        </div>

        {/* When (month) */}
        <div>
          <label htmlFor="search-month" className="sr-only">When</label>
          <input
            id="search-month"
            type="month"
            value={form.month}
            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
            className={fieldClass}
          />
        </div>

        {/* Retreat type */}
        <div>
          <label htmlFor="search-type" className="sr-only">Retreat type</label>
          <select
            id="search-type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className={fieldClass}
          >
            <option>All types</option>
            {RETREAT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* What are you looking for? (intent) */}
        <div>
          <label htmlFor="search-intent" className="sr-only">What are you looking for?</label>
          <select
            id="search-intent"
            value={form.intent}
            onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value }))}
            className={fieldClass}
          >
            <option>What are you looking for?</option>
            {RETREAT_INTENTS.map((i) => (
              <option key={i} value={i}>
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="search-budget" className="sr-only">Budget</label>
          <select
            id="search-budget"
            value={form.budget}
            onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            className={fieldClass}
          >
            <option>Any budget</option>
            {BUDGET_BANDS.map((b) => (
              <option key={b.slug} value={b.label}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="search-duration" className="sr-only">Duration</label>
          <select
            id="search-duration"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className={fieldClass}
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sacred-gold px-8 text-base font-semibold text-celestial-navy shadow-sm transition-all hover:bg-sacred-gold/90 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-river-teal focus-visible:ring-offset-2 sm:w-auto"
        >
          {CTA.DISCOVER_RETREATS}
        </button>
        <p className="text-sm text-stone-500">
          Not sure yet?{" "}
          <a href="/retreat-discovery-form" className="text-link font-medium">
            {CTA.FIND_YOUR_PATH}
          </a>
        </p>
      </div>
    </form>
  );
}