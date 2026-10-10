"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

const REGIONS = ["","europe","latin_america","asia","africa","north_america","oceania","middle_east"];
const COMMERCIAL = ["","free_listing","promotion","commission","partnership","other"];
const QUAL_LEVELS = ["submitted","reviewed","approved","live","inactive","archived"];
const QUAL_CHECKS = ["Identity","Fit","Information","Quality and trust","Commercial terms","Media"];

type Departure = {
  id: string;
  retreat_id: string;
  start_date: string;
  end_date: string;
  capacity: number | null;
  spots_left: number | null;
  price_override: number | null;
  status: string;
  notes: string | null;
  created_at?: string;
};

export default function RetreatEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [depts, setDepts] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/admin/retreats`)
      .then(r => r.json()).then(j => {
        const found = (j.data ?? []).find((r: Record<string, unknown>) => r.id === id || r.slug === id);
        if (found) {
          setForm(found);
          const qc = found.qualification_checks || {};
          const c: Record<string, boolean> = {};
          QUAL_CHECKS.forEach(k => { c[k] = !!qc[k]; });
          setChecks(c);
          // Load departures
          fetch(`/api/admin/departures?retreat_id=${found.id}`)
            .then(r => r.json()).then(dj => {
            setDepts(dj.data ?? []);
          });
        }
        setLoading(false);
      });
  }, [id]);

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }
  function setCheck(k: string, v: boolean) { setChecks(c => ({ ...c, [k]: v })); }

  async function save() {
    setMsg("");
    startTransition(async () => {
      const payload = { ...form, qualification_checks: checks, id };
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setMsg(res.ok ? "Saved." : `Error: ${json.error}`);
    });
  }

  const publishMissing: string[] = [];
  const qs = (form.qualification_status as string) || "submitted";
  if (qs !== "approved" && qs !== "live") publishMissing.push("qualification_status must be approved or live");
  if (!(form.gallery_paths as string[])?.length && !form.image_path) publishMissing.push("at least one image required");
  if (depts.length < 1) publishMissing.push("at least one departure required");

  if (loading) return <AdminShell title="Edit Retreat"><p className="p-8">Loading…</p></AdminShell>;

  const f = (k: string, type = "text") => (
    <input type={type} value={(form[k] as string) ?? ""} onChange={e => set(k, e.target.value)}
      className="w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" />
  );

  return (
    <AdminShell title={`Edit: ${form.title || "Retreat"}`}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl">
        {msg && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{msg}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-stone-500">Title<input className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" value={(form.title as string) ?? ""} onChange={e => set("title", e.target.value)} /></label>
          <label className="text-xs font-semibold text-stone-500">Slug<input className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" value={(form.slug as string) ?? ""} onChange={e => set("slug", e.target.value)} /></label>
          <label className="text-xs font-semibold text-stone-500">Type<input className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" value={(form.type as string) ?? ""} onChange={e => set("type", e.target.value)} /></label>
          <label className="text-xs font-semibold text-stone-500">Country<input className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" value={(form.country as string) ?? ""} onChange={e => set("country", e.target.value)} /></label>
          <label className="text-xs font-semibold text-stone-500">Location<input className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" value={(form.location as string) ?? ""} onChange={e => set("location", e.target.value)} /></label>
          <label className="text-xs font-semibold text-stone-500">Region
            <select value={(form.region as string) ?? ""} onChange={e => set("region", e.target.value)} className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm">
              {REGIONS.map(r => <option key={r} value={r}>{r || "—"}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-stone-500">Price display{f("price_display")}</label>
          <label className="text-xs font-semibold text-stone-500">Price from (numeric){f("price_from", "number")}</label>
          <label className="text-xs font-semibold text-stone-500">Currency{f("price_currency")}</label>
          <label className="text-xs font-semibold text-stone-500">Price notes{f("price_notes")}</label>
          <label className="text-xs font-semibold text-stone-500">Image path{f("image_path")}</label>
          <label className="text-xs font-semibold text-stone-500">Gallery paths (comma-separated)
            <input value={((form.gallery_paths as string[]) ?? []).join(", ")} onChange={e => set("gallery_paths", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-500">Inclusions (comma-separated)
            <input value={((form.inclusions as string[]) ?? []).join(", ")} onChange={e => set("inclusions", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-500">Exclusions (comma-separated)
            <input value={((form.exclusions as string[]) ?? []).join(", ")} onChange={e => set("exclusions", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-semibold text-stone-500">Age min{f("min_age","number")}</label>
          <label className="text-xs font-semibold text-stone-500">Age max{f("max_age","number")}</label>
          <label className="text-xs font-semibold text-stone-500">Age notes{f("age_notes")}</label>
          <label className="text-xs font-semibold text-stone-500">Operator name{f("operator_name")}</label>
          <label className="text-xs font-semibold text-stone-500">Operator website{f("operator_website")}</label>
          <label className="text-xs font-semibold text-stone-500">Booking URL{f("booking_url")}</label>
          <label className="text-xs font-semibold text-stone-500">Commercial status
            <select value={(form.commercial_status as string) ?? ""} onChange={e => set("commercial_status", e.target.value)} className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm">
              {COMMERCIAL.map(c => <option key={c} value={c}>{c || "—"}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-stone-500">Qualification status
            <select value={qs} onChange={e => set("qualification_status", e.target.value)} className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm">
              {QUAL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-4 block text-xs font-semibold text-stone-500">Description
          <textarea rows={5} value={(form.description as string) ?? ""} onChange={e => set("description", e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" />
        </label>

        <label className="mt-4 block text-xs font-semibold text-stone-500">Internal notes
          <textarea rows={3} value={(form.internal_notes as string) ?? ""} onChange={e => set("internal_notes", e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm text-stone-400 italic" />
        </label>

        {/* Qualification checks */}
        <fieldset className="mt-6 rounded-2xl border border-sage-mist bg-white p-4">
          <legend className="text-sm font-semibold text-forest-green">Qualification checks</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {QUAL_CHECKS.map(k => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checks[k] || false} onChange={e => setCheck(k, e.target.checked)} className="accent-river-teal" />
                {k}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Publish checklist */}
        {publishMissing.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-semibold">Cannot publish — missing:</p>
            <ul className="mt-1 list-disc pl-5">{publishMissing.map((m,i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}
        {publishMissing.length === 0 && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Ready to publish. Set qualification_status to approved/live and click Publish on the listing.
          </div>
        )}

        {/* Departures */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Departures</h2>
          {depts.length === 0 && <p className="text-sm text-stone-400">No departures yet.</p>}
          <div className="mt-2 divide-y divide-sage-mist rounded-xl border border-sage-mist">
            {depts.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 text-sm">
                <span>{d.start_date} — {d.end_date} | {d.status} | {d.capacity ?? "—"} capacity</span>
                <button onClick={() => navigator.clipboard.writeText(d.id)} className="text-xs text-link">Copy ID</button>
              </div>
            ))}
          </div>
          {/* Add departure simplified */}
          <details className="mt-3">
            <summary className="text-sm text-link cursor-pointer">+ Add departure</summary>
            <form className="mt-2 grid gap-2 sm:grid-cols-5" onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const res = await fetch("/api/admin/departures", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  retreat_id: id,
                  start_date: fd.get("start_date"),
                  end_date: fd.get("end_date"),
                  capacity: Number(fd.get("capacity")) || null,
                  status: fd.get("status") || "open",
                }),
              });
              if (res.ok) {
                const j = await res.json();
                setDepts(prev => [...prev, j]);
                setMsg("Departure added.");
              }
            }}>
              <input name="start_date" type="date" required className="rounded-lg border border-sage-mist px-2 py-1 text-sm" />
              <input name="end_date" type="date" required className="rounded-lg border border-sage-mist px-2 py-1 text-sm" />
              <input name="capacity" type="number" placeholder="Capacity" className="rounded-lg border border-sage-mist px-2 py-1 text-sm" />
              <select name="status" className="rounded-lg border border-sage-mist px-2 py-1 text-sm"><option value="open">Open</option><option value="full">Full</option></select>
              <button type="submit" className="rounded-lg bg-forest-green px-3 py-1 text-sm text-white">Add</button>
            </form>
          </details>
        </section>

        <div className="mt-8 flex gap-3">
          <button onClick={save} disabled={isPending} className="rounded-xl bg-sacred-gold px-6 py-3 text-sm font-semibold text-celestial-navy">Save changes</button>
          <button onClick={() => router.push("/admin/retreats")} className="rounded-xl border border-sage-mist px-6 py-3 text-sm text-stone-500">Cancel</button>
        </div>
      </div>
    </AdminShell>
  );
}