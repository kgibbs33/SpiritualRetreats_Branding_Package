import { ContactForm } from "@/components/contact/ContactForm";
import { SITE_CONFIG } from "@/config/site";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900">
        Contact us
      </h1>
      <p className="mt-2 text-base text-stone-600">
        Have a question, partnership idea, or general inquiry? We would love to
        hear from you.
      </p>

      <div className="mt-6 space-y-2 text-sm text-stone-600">
        <p>
          Email:{" "}
          <a href={`mailto:${SITE_CONFIG.support_email}`} className="text-link">
            {SITE_CONFIG.support_email}
          </a>
        </p>
        {SITE_CONFIG.contact_number && (
          <p>Phone: {SITE_CONFIG.contact_number}</p>
        )}
        {SITE_CONFIG.address && (
          <p>Address: {SITE_CONFIG.address}</p>
        )}
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 inline-block">
          Response time to be confirmed
        </p>
      </div>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
