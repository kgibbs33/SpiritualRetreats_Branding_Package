import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900">
        Contact us
      </h1>
      <p className="mt-2 text-base text-stone-600">
        Have a question, partnership idea, or general inquiry? We&apos;d love to
        hear from you.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
