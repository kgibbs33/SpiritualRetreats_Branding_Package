"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

type Enquiry = {
  id: string; kind: string; name: string; email: string; phone: string | null;
  participants: number | null; message: string | null;
  retreat_id: string | null; departure_id: string | null;
  status: string; created_at: string;
};

export default function EnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/enquiries").then(r => r.json()).then(json => {
      setItems(json.data ?? []); setLoading(false);
    });
  }, []);

  return (
    <AdminShell title="Enquiries">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Enquiries & Booking Requests</h1>
        {loading ? <p className="mt-4 text-sm text-stone-400">Loading…</p> : (
          <table className="mt-4 w-full text-sm">
            <thead className="border-b text-xs uppercase text-stone-400">
              <tr><th className="py-2 pr-3">Kind</th><th className="py-2 px-2">Name</th><th className="py-2 px-2">Email</th><th className="py-2 px-2">Date</th><th className="py-2 pl-2">Status</th></tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.id} className="border-b border-sage-mist/50">
                  <td className="py-2 pr-3 font-medium">{e.kind}</td>
                  <td className="py-2 px-2">{e.name}</td>
                  <td className="py-2 px-2">{e.email}</td>
                  <td className="py-2 px-2 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pl-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}