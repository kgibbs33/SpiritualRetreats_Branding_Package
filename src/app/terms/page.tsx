import { LegalLayout } from "@/components/layout/LegalLayout";
import { LEGAL_ENTITY_NAME } from "@/lib/constants";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions">
      <h2>1. General use of the website</h2>
      <p>
        By using this website, you agree to these terms. Use the platform
        lawfully and respectfully.
      </p>

      <h2>2. Platform description</h2>
      <p>
        Re: Treat Yourself is a retreat discovery and matching platform. We
        connect seekers with retreat owners and facilitators. We do not book
        retreats directly. Retreat owners and facilitators are responsible for
        their own retreat bookings and operations.
      </p>

      <h2>3. Booking and participation</h2>
      <p>
        We do not handle bookings. The retreat officially does this. Our role
        is to match and coordinate retreat owners and clients. All bookings,
        payments to retreats, and participation conditions are between you and
        the retreat operator. We are not a party to those transactions.
      </p>

      <h2>4. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {LEGAL_ENTITY_NAME}
        is not liable for any loss, damage, or injury arising from your use of
        the platform or from retreat participation. Retreat owners and
        facilitators are responsible for their own services and policies,
        including cancellation policies.
      </p>

      <h2>5. Responsibilities</h2>
      <p>
        <strong>Users:</strong> Provide accurate information and use the
        platform in good faith.
      </p>
      <p>
        <strong>Retreat owners and facilitators:</strong> Are responsible for
        their retreat listings, bookings, and compliance with applicable laws.
        Retreat cancellation policies are set by each retreat; we do not impose
        a platform-level cancellation policy.
      </p>
    </LegalLayout>
  );
}
