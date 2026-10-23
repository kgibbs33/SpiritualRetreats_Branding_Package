import { LegalLayout } from "@/components/layout/LegalLayout";
import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { PRIVACY_MARKDOWN } from "@/content/legal/privacy-content";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <LegalMarkdown source={PRIVACY_MARKDOWN} />
    </LegalLayout>
  );
}