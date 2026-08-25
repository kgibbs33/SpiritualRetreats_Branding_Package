"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return (
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
        {children}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-w-0 w-full flex-1">{children}</main>
      <Footer />
    </>
  );
}
