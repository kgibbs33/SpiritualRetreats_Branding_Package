import Link from "next/link";

type Props = { searchParams: Promise<{ source?: string }> };

type SourceContent = {
  heading: string;
  body: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const sourceMap: Record<string, SourceContent> = {
  discovery: {
    heading: "Your retreat journey starts here",
    body: "Your questionnaire is saved. We will use your answers to match you with retreats that fit your intentions and will be in touch by email with personalised suggestions.",
    cta: { label: "Browse Retreat Listings", href: "/retreat-listings" },
    secondary: { label: "Back to Home", href: "/" },
  },
  "retreat-intake": {
    heading: "Your retreat has been submitted",
    body: "Thank you for listing your retreat with us. Our team will review your submission and reach out within 2–3 working days to discuss next steps and get your retreat live on the platform.",
    cta: { label: "Back to For Retreat Owners", href: "/for-retreat-owners" },
    secondary: { label: "Back to Home", href: "/" },
  },
  "facilitator-matching": {
    heading: "Your matching request is in",
    body: "Thank you for sharing your practice and availability. We will reach out when a retreat collaboration that fits your profile comes up. In the meantime, feel free to explore the platform.",
    cta: { label: "Back to Facilitators Portal", href: "/facilitators-portal" },
    secondary: { label: "Back to Home", href: "/" },
  },
  contact: {
    heading: "Message received",
    body: "Thank you for reaching out. We aim to reply within 1–2 working days. In the meantime, feel free to explore the platform.",
    cta: { label: "Explore Retreats", href: "/find-your-retreat" },
    secondary: { label: "Back to Home", href: "/" },
  },
};

const defaultContent: SourceContent = {
  heading: "Thank you",
  body: "Your submission has been received. We will get back to you as soon as possible.",
  cta: { label: "Back to Home", href: "/" },
};

export default async function ThankYouPage({ searchParams }: Props) {
  const { source } = await searchParams;
  const content = source ? (sourceMap[source] ?? defaultContent) : defaultContent;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
        <svg
          className="h-7 w-7 text-forest"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
        {content.heading}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-stone-600">
        {content.body}
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={content.cta.href}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-forest px-8 font-semibold text-white transition-all hover:bg-[#345834]"
        >
          {content.cta.label}
        </Link>
        {content.secondary && (
          <Link
            href={content.secondary.href}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-beige px-8 font-semibold text-stone-700 transition-all hover:bg-stone-50"
          >
            {content.secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}
