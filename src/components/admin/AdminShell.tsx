"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Retreat Submissions",
    href: "/admin/retreat-submissions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    badge: "pending",
  },
  {
    label: "Published Retreats",
    href: "/admin/retreats",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Seeker Responses",
    href: "/admin/seeker-responses",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Facilitator Responses",
    href: "/admin/facilitator-responses",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 1 0-16 0" />
        <line x1="12" y1="16" x2="12" y2="22" />
        <line x1="9" y1="19" x2="15" y2="19" />
      </svg>
    ),
  },
  {
    label: "Matches",
    href: "/admin/matches",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  counts?: Record<string, number>;
}

export function AdminShell({ children, title, subtitle, actions, counts }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const sidebar = (
    <aside className="w-56 shrink-0 bg-white border-r border-beige flex flex-col h-full">
      <div className="px-5 py-5 border-b border-beige">
        <Link href="/" className="block">
          <p className="font-display text-lg text-forest leading-tight">Re: Treat</p>
          <p className="text-xs text-muted tracking-wide uppercase">Admin Panel</p>
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const count = item.badge && counts ? counts[item.badge] : null;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-forest text-cream font-medium"
                      : "text-foreground hover:bg-cream"
                  }`}
                >
                  <span className="shrink-0 opacity-80">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {count != null && count > 0 && (
                    <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${active ? "bg-white/20 text-cream" : "bg-gold/20 text-warm-brown"}`}>
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-beige">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-cream transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-[100dvh] w-full min-w-0 flex-1 bg-background-alt">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-[100dvh] shrink-0 md:flex md:flex-col">
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 flex h-full max-w-[min(100vw,18rem)] flex-col">{sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-beige bg-white px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-cream transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
