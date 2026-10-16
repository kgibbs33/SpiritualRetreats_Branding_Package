import { LegalLayout } from "@/components/layout/LegalLayout";
import { COOKIES_CONTENT } from "@/content/legal/cookies";

export default function CookiesPage() {
  return <LegalLayout title="Cookie Policy">{COOKIES_CONTENT}</LegalLayout>;
}