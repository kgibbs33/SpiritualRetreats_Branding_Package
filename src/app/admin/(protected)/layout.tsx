import { type Metadata } from "next";
import { requireAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = { robots: "noindex, nofollow" };

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  return <>{children}</>;
}
