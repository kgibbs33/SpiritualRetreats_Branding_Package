"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function SearchAlertsPage() {
  const [items, setItems] = useState<{ id: string; email: string; criteria: unknown; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/search-alerts").then(r => r.json()).then(json => {
      setItems(json.data ?? []); setLoading(false);
    });
  }, []);

  return (
    <AdminShell title="Search Alerts">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Search Alerts</h1>
        {loading ? <p className="mt-4 text-sm text-stone-400">Loading…</p> : (
          <table className="mt-4 w-full text-sm">
            <thead className="border-b text-xs uppercase text-stone-400">
              <tr><th className="py-2 pr-3">Email</th><th className="py-2 px-2">Criteria</th><th className="py-2 pl-2">Date</th></tr>
            </thead>
            <tbody>
              {items.map(a => (
                <tr key={a.id} className="border-b border-sage-mist/50">
                  <td className="py-2 pr-3">{a.email}</td>
                  <td className="py-2 px-2 text-xs font-mono">{JSON.stringify(a.criteria)}</td>
                  <td className="py-2 pl-2 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}