import { LegalLayout } from "@/components/layout/LegalLayout";

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy">
      <h2>1. Cookies we currently use</h2>
      <p>
        We currently use only one cookie, which is strictly necessary for the
        site to function: a secure session cookie used to keep our team
        signed in to the administrative area of the platform. This cookie is
        not used for advertising, analytics, or tracking, and is not set for
        regular visitors browsing the public site.
      </p>
      <p>
        Because this cookie is strictly necessary for a feature you (or our
        team) actively request — staying signed in — it does not require your
        consent under applicable law, but we disclose it here for
        transparency.
      </p>

      <h2>2. If this changes</h2>
      <p>
        If we introduce analytics, performance-measurement, or marketing
        cookies in the future, we will ask for your consent before setting
        them, using a clear opt-in mechanism (not simply by you continuing to
        browse the site), and we will update this page to describe them.
      </p>

      <h2>3. Managing cookies in your browser</h2>
      <p>
        You can view, block, or delete cookies through your browser settings
        at any time. Blocking the session cookie described above will prevent
        our team from staying signed in to the admin area, but has no effect
        on your experience as a visitor to the public site.
      </p>
    </LegalLayout>
  );
}
