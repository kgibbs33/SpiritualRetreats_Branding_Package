"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { RETREAT_TYPES, RETREAT_INTENTS } from "@/lib/retreats/search-options";

export default function NewRetreatPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugOk, setSlugOk] = useState<boolean | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [slugChecking, setSlugChecking] = useState(false);

  function toggleSelected(v: string) {
    setSelectedTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }
  function toggleIntent(v: string) {
    setSelectedIntents(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "";
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    // Only auto-fill slug if user hasn't touched it manually
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(v));
    }
    setError("");
  }

  async function checkSlug(s: string) {
    if (!s.trim()) { setSlugOk(null); return; }
    setSlugChecking(true);
    try {
      const res = await fetch(`/api/admin/retreats?slug_available=${encodeURIComponent(s.trim())}`);
      const j = await res.json();
      setSlugOk(j.available);
    } catch {
      setSlugOk(null);
    } finally {
      setSlugChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    if (!type.trim()) { setError("Type is required."); return; }

    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/retreats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim().toLowerCase(),
        title: title.trim(),
        type: type.trim().toLowerCase(),
        categories: [...new Set([type.trim().toLowerCase(), ...selectedTypes, ...selectedIntents])],
        country: country.trim() || null,
        location: location.trim() || null,
      }),
    });

    if (res.ok) {
      const j = await res.json();
      router.push(`/admin/retreats/${j.id}`);
    } else {
      const j = await res.json().catch(() => ({}));
      // Friendlier slug message
      const msg = j.error || "Something went wrong.";
      setError(
        msg.includes("duplicate key") || msg.includes("already exists")
          ? "That slug is already used. Pick another."
          : msg
      );
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Create retreat">
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-lg">
        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold text-stone-500">
            Title <span className="text-red-400">*</span>
            <input
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              required
              placeholder="e.g. Mountain Yoga Retreat"
              className="mt-1 block w-full rounded-lg border border-sage-mist px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-semibold text-stone-500">
            Slug <span className="text-red-400">*</span>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugOk(null); setError(""); }}
              onBlur={e => checkSlug(e.target.value)}
              required
              pattern="[a-z0-9-]+"
              placeholder="mountain-yoga-retreat"
              className="mt-1 block w-full rounded-lg border border-sage-mist px-3 py-2 text-sm"
            />
            {slugChecking && <span className="text-xs text-stone-400">Checking…</span>}
            {slugOk === true && <span className="text-xs text-emerald-600">Available</span>}
            {slugOk === false && <span className="text-xs text-red-500">Already taken</span>}
          </label>

          <label className="block text-xs font-semibold text-stone-500">
            Primary type <span className="text-red-400">*</span>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-sage-mist px-3 py-2 text-sm"
            >
              <option value="">Choose a type…</option>
              {RETREAT_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>

          <fieldset className="rounded-lg border border-sage-mist p-3">
            <legend className="text-xs font-semibold text-stone-500">
              Retreat types (search tags)
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {RETREAT_TYPES.map(t => (
                <label key={t} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleSelected(t)}
                    className="h-4 w-4 rounded border-sage-mist"
                  />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-sage-mist p-3">
            <legend className="text-xs font-semibold text-stone-500">
              What are you looking for? (search tags)
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {RETREAT_INTENTS.map(t => (
                <label key={t} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={selectedIntents.includes(t)}
                    onChange={() => toggleIntent(t)}
                    className="h-4 w-4 rounded border-sage-mist"
                  />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-xs font-semibold text-stone-500">
            Country
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="Spain"
              className="mt-1 block w-full rounded-lg border border-sage-mist px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-semibold text-stone-500">
            Location
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Andalusia"
              className="mt-1 block w-full rounded-lg border border-sage-mist px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="w-full rounded-xl bg-sacred-gold px-6 py-3 text-sm font-semibold text-celestial-navy shadow-sm disabled:opacity-50 hover:bg-sacred-gold/90"
          >
            {saving ? "Creating…" : "Create retreat"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}