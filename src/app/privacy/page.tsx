import { LegalLayout } from "@/components/layout/LegalLayout";
import { PRIVACY_CONTENT } from "@/content/legal/privacy";

export default function PrivacyPage() {
  return <LegalLayout title="Privacy Policy">{PRIVACY_CONTENT}</LegalLayout>;
}