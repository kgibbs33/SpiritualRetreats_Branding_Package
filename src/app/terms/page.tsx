import { LegalLayout } from "@/components/layout/LegalLayout";
import { TERMS_CONTENT } from "@/content/legal/terms";

export default function TermsPage() {
  return <LegalLayout title="Terms & Conditions">{TERMS_CONTENT}</LegalLayout>;
}