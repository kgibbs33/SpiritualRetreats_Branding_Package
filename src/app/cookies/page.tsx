import { LegalLayout } from "@/components/layout/LegalLayout";
import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { COOKIES_MARKDOWN } from "@/content/legal/cookies-content";

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy">
      <LegalMarkdown source={COOKIES_MARKDOWN} />
    </LegalLayout>
  );
}