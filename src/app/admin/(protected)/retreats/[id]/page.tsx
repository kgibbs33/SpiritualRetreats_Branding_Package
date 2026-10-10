"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

const REGIONS = ["","europe","latin_america","asia","africa","north_america","oceania","middle_east"];
const COMMERCIAL = ["","free_listing","promotion","commission","partnership","other"];
const QUAL_LEVELS = ["submitted","reviewed","approved","live","inactive","archived"];
const QUAL_CHECKS = ["Identity","Fit","Information","Quality and trust","Commercial terms","Media"];

/** Fields the user may edit. Read-only fields are stripped before PATCH. */
const EDITABLE_STRING_FIELDS = [
  "slug","title","type","location","country","dates_display",
  "price_display","price_currency","price_notes","description",
  "operator_name","operator_website","age_notes","booking_url","internal_notes",
  "image_path",
] as const;

const EDITABLE_SELECT_FIELDS = ["region","commercial_status","qualification_status"] as const;
const EDITABLE_NUMBER_FIELDS = ["price_from","min_age","max_age"] as const;
const EDITABLE_LIST_FIELDS = ["inclusions","exclusions","gallery_paths"] as const;

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
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [retreatId, setRetreatId] = useState<string>("");
  const [depts, setDepts] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [depStart, setDepStart] = useState("");
  const [delId, setDelId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function reloadDepartures(rid: string) {
    const res = await fetch(`/api/admin/departures?retreat_id=${rid}`);
    const j = await res.json();
    setDepts(j.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    // Bug 4: single-retreat endpoint works for any id, not just page 1 of the list
    fetch(`/api/admin/retreats?id=${encodeURIComponent(id as string)}`)
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        if (j.data) {
          setRetreatId(j.data.id as string);
          setForm(j.data);

          // Bug 1 defensive parse: qualification_checks may arrive stringified
          let qc = j.data.qualification_checks;
          if (typeof qc === "string" && qc.trim().length) {
            try { qc = JSON.parse(qc); } catch { qc = {}; }
          }
          qc = (qc && typeof qc === "object") ? qc : {};
          const c: Record<string, boolean> = {};
          QUAL_CHECKS.forEach(k => { c[k] = !!qc[k]; });
          setChecks(c);
          reloadDepartures(j.data.id as string);
        } else {
          setMsg({ kind: "err", text: j.error || "Retreat not found." });
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setMsg({ kind: "err", text: "Failed to load retreat." }); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [id]);

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })); }
  function setCheck(k: string, v: boolean) { setChecks(c => ({ ...c, [k]: v })); }

  async function deleteRetreat() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setMsg(null);
    const res = await fetch(`/api/admin/retreats?id=${retreatId}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push("/admin/retreats");
    } else {
      setMsg({ kind: "err", text: j.error || "Failed to delete." });
      setDeleting(false);
      setDeleteConfirm("");
    }
  }

  async function archiveRetreat() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: retreatId, status: "archived", qualification_status: "archived" }),
      });
      const j = await res.json();
      if (res.ok) {
        setMsg({ kind: "ok", text: "Retreat archived." });
        setForm(f => ({ ...f, status: "archived", qualification_status: "archived" }));
      } else {
        setMsg({ kind: "err", text: j.error || "Archive failed." });
      }
    } catch {
      setMsg({ kind: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteDeparture(depId: string) {
    setDelId(null);
    const res = await fetch(`/api/admin/departures?id=${depId}`, { method: "DELETE" });
    if (res.ok) {
      setMsg({ kind: "ok", text: "Departure deleted." });
      await reloadDepartures(retreatId);
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg({ kind: "err", text: j.error || "Failed to delete departure." });
    }
  }

  async function save() {
    // Bug 3: build a clean PATCH body — null for empty optionals,
    // numbers as numbers, no read-only fields (created_at, updated_at, id…)
    const body: Record<string, unknown> = { id: retreatId };

    for (const k of EDITABLE_STRING_FIELDS) {
      const v = (form[k as string] as string | undefined) ?? "";
      body[k] = v.trim() === "" ? null : v;
    }
    for (const k of EDITABLE_SELECT_FIELDS) {
      const v = (form[k as string] as string | undefined) ?? "";
      body[k] = v === "" ? null : v;
    }
    for (const k of EDITABLE_NUMBER_FIELDS) {
      const raw = form[k as string];
      if (raw === "" || raw === null || raw === undefined) body[k] = null;
      else body[k] = Number(raw);
    }
    for (const k of EDITABLE_LIST_FIELDS) {
      const v = form[k as string];
      body[k] = Array.isArray(v) && v.length ? v : (v ?? null);
    }
    body.qualification_checks = checks;

    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setMsg(res.ok ? { kind: "ok", text: "Saved." } : { kind: "err", text: `Error: ${json.error}` });
    } catch {
      setMsg({ kind: "err", text: "Network error. Not saved." });
    } finally {
      setSaving(false);
    }
  }

  const publishMissing: string[] = [];
  const qs = (form.qualification_status as string) || "submitted";
  if (qs !== "approved" && qs !== "live") publishMissing.push("qualification_status must be approved or live");
  if (!(form.gallery_paths as string[])?.length && !form.image_path) publishMissing.push("at least one image required");
  if (depts.length < 1) publishMissing.push("at least one departure required");

  if (loading) return <AdminShell title="Edit Retreat"><p className="p-8">Loading…</p></AdminShell>;

  const f = (k: string, type = "text") => (
    <input type={type} value={(form[k] as string | number | null) ?? ""} onChange={e => set(k, e.target.value)}
      className="mt-1 w-full rounded-lg border border-sage-mist px-3 py-2 text-sm" />
  );

  return (
    <AdminShell title={`Edit: ${form.title || "Retreat"}`}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-3xl">
        {/* Bug 5: visible feedback */}
        {msg && (
          <div role="alert" className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {msg.text}
          </div>
        )}

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
              <div key={d.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{d.start_date} — {d.end_date} | {d.status} | {d.capacity ?? "—"} capacity</span>
                  <span className="flex items-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(d.id)} className="text-xs text-link">Copy</button>
                    {delId === d.id ? (
                      <span className="text-xs text-red-500">
                        Are you sure?{" "}
                        <button onClick={() => deleteDeparture(d.id)} className="font-semibold underline">Yes</button>
                        {" / "}
                        <button onClick={() => setDelId(null)} className="underline">No</button>
                      </span>
                    ) : (
                      <button onClick={() => setDelId(d.id)} className="text-xs text-red-500">Delete</button>
                    )}
                  </span>
                </div>
                {/* Bug 3: inline edit */}
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select value={d.status} onChange={async e => {
                    const res = await fetch("/api/admin/departures", {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: d.id, status: e.target.value }),
                    });
                    if (res.ok) reloadDepartures(retreatId);
                    else { const j = await res.json().catch(() => ({})); setMsg({ kind: "err", text: j.error || "Update failed." }); }
                  }} className="rounded border border-sage-mist px-1 py-0.5 text-xs">
                    <option value="open">Open</option><option value="full">Full</option><option value="cancelled">Cancelled</option>
                  </select>
                  <input type="number" placeholder="Capacity" defaultValue={d.capacity ?? ""} className="rounded border border-sage-mist px-1 py-0.5 text-xs"
                    onBlur={async e => {
                      const v = e.target.value.trim();
                      const body: Record<string, unknown> = { id: d.id };
                      if (v === "") body.capacity = null; else body.capacity = Number(v);
                      await fetch("/api/admin/departures", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                    }} />
                  <input type="number" placeholder="Spots left" defaultValue={d.spots_left ?? ""} className="rounded border border-sage-mist px-1 py-0.5 text-xs"
                    onBlur={async e => {
                      const v = e.target.value.trim();
                      const body: Record<string, unknown> = { id: d.id };
                      if (v === "") body.spots_left = null; else body.spots_left = Number(v);
                      await fetch("/api/admin/departures", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                    }} />
                </div>
              </div>
            ))}
          </div>
          <details className="mt-3">
            <summary className="text-sm text-link cursor-pointer">+ Add departure</summary>
            <form className="mt-2 grid gap-2 sm:grid-cols-5" onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const s = fd.get("start_date") as string;
              const en = fd.get("end_date") as string;
              if (en < s) { setMsg({ kind: "err", text: "End date must be on or after the start date." }); return; }
              const res = await fetch("/api/admin/departures", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  retreat_id: retreatId,
                  start_date: s,
                  end_date: en,
                  capacity: Number(fd.get("capacity")) || null,
                  status: fd.get("status") || "open",
                }),
              });
              if (res.ok) {
                await reloadDepartures(retreatId);
                setMsg({ kind: "ok", text: "Departure added." });
                (e.currentTarget as HTMLFormElement).reset();
                setDepStart("");
              } else {
                const j = await res.json().catch(() => ({}));
                setMsg({ kind: "err", text: j.error || "Failed to add departure." });
              }
            }}>
              <input name="start_date" type="date" required value={depStart} onChange={e => setDepStart(e.target.value)}
                className="rounded-lg border border-sage-mist px-2 py-1 text-sm" />
              <input name="end_date" type="date" required min={depStart || undefined}
                className="rounded-lg border border-sage-mist px-2 py-1 text-sm" />
              <input name="capacity" type="number" placeholder="Capacity" className="rounded-lg border border-sage-mist px-2 py-1 text-sm" />
              <select name="status" className="rounded-lg border border-sage-mist px-2 py-1 text-sm">
                <option value="open">Open</option><option value="full">Full</option><option value="cancelled">Cancelled</option>
              </select>
              <button type="submit" className="rounded-lg bg-forest-green px-3 py-1 text-sm text-white">Add</button>
            </form>
          </details>
        </section>

        {/* Bug 5: disabled while saving */}
        <div className="mt-8 flex gap-3">
          <button onClick={save} disabled={saving} aria-busy={saving}
            className="rounded-xl bg-sacred-gold px-6 py-3 text-sm font-semibold text-celestial-navy disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button onClick={() => router.push("/admin/retreats")} className="rounded-xl border border-sage-mist px-6 py-3 text-sm text-stone-500">Cancel</button>
        </div>

        {/* Danger zone */}
        <div className="mt-10 border-t border-sage-mist pt-6">
          <h3 className="text-sm font-semibold text-red-500">Danger zone</h3>
          {form.status === "draft" && ["submitted", "reviewed"].includes(form.qualification_status as string) ? (
            <div className="mt-2 space-y-3">
              <p className="text-xs text-stone-500">This draft can be deleted. Type DELETE to confirm.</p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE to confirm"
                disabled={deleting}
                className="w-full max-w-xs rounded-lg border border-red-200 px-3 py-2 text-sm"
              />
              <button
                onClick={deleteRetreat}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete draft"}
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-xs text-stone-500">This retreat cannot be deleted. Archive it to remove it from the public site.</p>
              <button
                onClick={archiveRetreat}
                disabled={saving || form.qualification_status === "archived"}
                className="mt-2 rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {form.qualification_status === "archived" ? "Already archived" : "Archive retreat"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}