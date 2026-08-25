"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Pagination } from "@/components/admin/Pagination";

type SeekerResponse = {
  id: string;
  full_name: string;
  email: string;
  phone_whatsapp: string | null;
  travel_dates: string | null;
  travel_dates_flexible: boolean;
  destination_region: string | null;
  budget_range: string | null;
  purpose: string | null;
  reflection_intention: string | null;
  reflection_great_retreat: string | null;
  reflection_special_requests: string | null;
  answers: Record<string, unknown>;
  created_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function SeekerResponsesPage() {
  const [items, setItems] = useState<SeekerResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SeekerResponse | null>(null);

  const fetchData = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/admin/seeker-responses?page=${p}`)
      .then(r => r.json())
      .then(json => {
        setItems(json.data ?? []);
        setTotal(json.total ?? 0);
        setLoading(false);
      });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(1); }, [fetchData]);

  return (
    <AdminShell title="Seeker Responses" subtitle="All retreat discovery questionnaire submissions">
      <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No responses yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige bg-cream/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Purpose</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Region</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Budget</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{item.full_name}</td>
                    <td className="px-5 py-3 text-muted max-w-[160px] truncate">{item.email}</td>
                    <td className="px-5 py-3">
                      {item.purpose ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-forest capitalize">{item.purpose}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">{item.destination_region ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{item.budget_range ?? "—"}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(item)} className="text-xs text-forest hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} total={total} limit={20} onPageChange={(p) => { setPage(p); fetchData(p); }} />

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-beige px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-foreground">{selected.full_name}</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              <p className="text-xs text-muted">Submitted {formatDate(selected.created_at)}</p>

              <DrawerSection label="Contact">
                <DrawerField label="Email" value={selected.email} />
                <DrawerField label="WhatsApp" value={selected.phone_whatsapp} />
              </DrawerSection>

              <DrawerSection label="Travel Preferences">
                <DrawerField label="Dates" value={selected.travel_dates} />
                <DrawerField label="Flexible" value={selected.travel_dates_flexible ? "Yes" : "No"} />
                <DrawerField label="Region" value={selected.destination_region} />
                <DrawerField label="Budget" value={selected.budget_range} />
              </DrawerSection>

              <DrawerSection label="Intention">
                <DrawerField label="Purpose" value={selected.purpose} />
              </DrawerSection>

              {selected.reflection_intention && (
                <DrawerSection label="Reflection: Intention">
                  <p className="text-sm text-foreground leading-relaxed">{selected.reflection_intention}</p>
                </DrawerSection>
              )}

              {selected.reflection_great_retreat && (
                <DrawerSection label="Reflection: Great Retreat">
                  <p className="text-sm text-foreground leading-relaxed">{selected.reflection_great_retreat}</p>
                </DrawerSection>
              )}

              {selected.reflection_special_requests && (
                <DrawerSection label="Special Requests">
                  <p className="text-sm text-foreground leading-relaxed">{selected.reflection_special_requests}</p>
                </DrawerSection>
              )}

              {selected.answers && Object.keys(selected.answers).length > 0 && (
                <DrawerSection label="Questionnaire Answers">
                  <pre className="text-xs text-muted bg-cream p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selected.answers, null, 2)}
                  </pre>
                </DrawerSection>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{label}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DrawerField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted w-24 shrink-0">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
