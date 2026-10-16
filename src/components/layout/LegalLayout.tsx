import { SITE_CONFIG } from "@/config/site";

export function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="prose prose-stone mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-700">
        {SITE_CONFIG.legal.label_draft}
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-forest">
        {title}
      </h1>
      <p className="mt-4 text-sm text-stone-500">
        Last updated: {SITE_CONFIG.legal.last_updated}.
        Contact:{" "}
        <a href={`mailto:${SITE_CONFIG.support_email}`} className="text-link">
          {SITE_CONFIG.support_email}
        </a>
        {SITE_CONFIG.address ? `. ${SITE_CONFIG.address}` : ""}
      </p>
      <div className="mt-8 space-y-6 text-stone-600 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-forest [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-warm-brown [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </article>
  );
}