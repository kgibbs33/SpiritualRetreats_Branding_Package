import { createAdminClient } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

async function getStats() {
  const admin = createAdminClient();
  const [
    { count: seekers },
    { count: submissions },
    { count: pending },
    { count: facilitators },
    { count: matches },
    { count: retreats },
    { data: recentSubmissions },
    { data: recentSeekers },
  ] = await Promise.all([
    admin.from("seeker_discovery_responses").select("*", { count: "exact", head: true }),
    admin.from("retreat_submissions").select("*", { count: "exact", head: true }),
    admin.from("retreat_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("facilitator_onboarding_responses").select("*", { count: "exact", head: true }),
    admin.from("matches").select("*", { count: "exact", head: true }),
    admin.from("retreats").select("*", { count: "exact", head: true }).eq("status", "published"),
    admin.from("retreat_submissions").select("id, retreat_title, contact_name, status, created_at").order("created_at", { ascending: false }).limit(5),
    admin.from("seeker_discovery_responses").select("id, full_name, email, purpose, created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  return {
    seekers: seekers ?? 0,
    submissions: submissions ?? 0,
    pending: pending ?? 0,
    facilitators: facilitators ?? 0,
    matches: matches ?? 0,
    retreats: retreats ?? 0,
    recentSubmissions: recentSubmissions ?? [],
    recentSeekers: recentSeekers ?? [],
  };
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl p-5 border transition-all hover:-translate-y-0.5 ${
        accent
          ? "bg-forest text-cream border-forest shadow-[var(--shadow-card-hover)]"
          : "bg-white text-foreground border-beige shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
      }`}
    >
      <p className={`text-3xl font-semibold ${accent ? "text-cream" : "text-forest"}`}>{value}</p>
      <p className={`text-sm mt-1 ${accent ? "text-cream/70" : "text-muted"}`}>{label}</p>
    </Link>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <AdminShell title="Dashboard" subtitle="Platform overview" counts={{ pending: stats.pending }}>
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard label="Published Retreats" value={stats.retreats} href="/admin/retreats" />
        <StatCard label="Retreat Submissions" value={stats.submissions} href="/admin/retreat-submissions" />
        <StatCard label="Pending Review" value={stats.pending} href="/admin/retreat-submissions?status=pending" accent={stats.pending > 0} />
        <StatCard label="Seeker Responses" value={stats.seekers} href="/admin/seeker-responses" />
        <StatCard label="Facilitators" value={stats.facilitators} href="/admin/facilitator-responses" />
        <StatCard label="Matches Created" value={stats.matches} href="/admin/matches" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent retreat submissions */}
        <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-beige flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Retreat Submissions</h2>
            <Link href="/admin/retreat-submissions" className="text-xs text-forest hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-beige">
            {stats.recentSubmissions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted text-center">No submissions yet</p>
            ) : stats.recentSubmissions.map((s: Record<string, string>) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.retreat_title}</p>
                  <p className="text-xs text-muted">{s.contact_name} · {formatDate(s.created_at)}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                  s.status === "pending" ? "bg-amber-50 text-amber-700" :
                  s.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                  "bg-red-50 text-red-600"
                }`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent seeker responses */}
        <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-beige flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Seeker Responses</h2>
            <Link href="/admin/seeker-responses" className="text-xs text-forest hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-beige">
            {stats.recentSeekers.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted text-center">No seeker responses yet</p>
            ) : stats.recentSeekers.map((s: Record<string, string>) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.full_name}</p>
                  <p className="text-xs text-muted truncate">{s.email}</p>
                </div>
                {s.purpose && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-sage/20 text-forest capitalize">
                    {s.purpose}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/retreat-submissions?status=pending" className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-cream rounded-full text-sm font-medium hover:bg-primary-hover transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            Review Pending Submissions
          </Link>
          <Link href="/admin/matches" className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal text-cream rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Create a Match
          </Link>
          <Link href="/admin/seeker-responses" className="inline-flex items-center gap-1.5 px-4 py-2 border border-beige bg-cream text-foreground rounded-full text-sm hover:bg-beige transition-colors">
            View Seeker Responses
          </Link>
          <Link href="/admin/facilitator-responses" className="inline-flex items-center gap-1.5 px-4 py-2 border border-beige bg-cream text-foreground rounded-full text-sm hover:bg-beige transition-colors">
            View Facilitator Responses
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
