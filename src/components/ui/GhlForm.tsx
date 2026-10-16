"use client";

import Script from "next/script";
import { GHL_FORMS } from "@/config/forms";
import { SITE_CONFIG } from "@/config/site";

type GhlFormProps = {
  /** Key in GHL_FORMS config */
  formKey: keyof typeof GHL_FORMS;
  /** Shown when embed is empty */
  existingForm?: React.ReactNode;
  /** Custom label for the "coming soon" fallback card */
  label?: string;
};

/**
 * Renders a GoHighLevel iframe embed when the URL is configured.
 * Falls back to the built-in form (if provided) or a "coming soon" card.
 * Loads the GHL embed script via next/script only when the URL is set,
 * to respect Content Security Policy and avoid unnecessary script loading.
 */
export function GhlForm({ formKey, existingForm, label }: GhlFormProps) {
  const url = GHL_FORMS[formKey];

  if (!url) {
    if (existingForm) return <>{existingForm}</>;
    return (
      <div className="rounded-2xl border border-sage-mist bg-warm-cream p-6 text-center">
        <p className="text-sm font-semibold text-forest-green">
          {label ?? `${formKey} form`}
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Form coming soon. Contact{" "}
          <a href={`mailto:${SITE_CONFIG.support_email}`} className="text-link">
            {SITE_CONFIG.support_email}
          </a>{" "}
          for details.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full" style={{ minHeight: "600px" }}>
        <iframe
          src={url}
          title={label ?? formKey}
          className="absolute inset-0 h-full w-full rounded-xl border-0"
          loading="lazy"
        />
      </div>
      <Script
        src="https://link.gohighlevel.com/js/embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}