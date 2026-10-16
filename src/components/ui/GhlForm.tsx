"use client";

import Script from "next/script";
import { GHL_FORMS, deriveFormId, type GhlFormKey } from "@/config/forms";
import { SITE_CONFIG } from "@/config/site";

type GhlFormProps = {
  formKey: GhlFormKey;
  existingForm?: React.ReactNode;
  label?: string;
};

/**
 * Renders a GoHighLevel iframe embed when the URL is configured.
 * Falls back to the built-in form (if provided) or a "coming soon" card.
 * Loads the GHL embed script only when the URL is set.
 *
 * NOTE: Could not verify GHL's official inline-embed code pattern (requires
 * a live GHL account). Current implementation uses a plain iframe with the
 * URL as src. If GHL requires specific data attributes (data-layout,
 * data-trigger-type, data-activation-type, data-deactivation-type,
 * data-form-name, data-height, data-form-id), the component can be
 * extended when a real URL is available for testing.
 */
export function GhlForm({ formKey, existingForm, label }: GhlFormProps) {
  const config = GHL_FORMS[formKey];
  const url = config.iframeUrl;

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

  const formId = deriveFormId(url);

  return (
    <>
      <div className="relative w-full" style={{ minHeight: "600px" }}>
        <iframe
          id={`inline-${formId}`}
          src={url}
          title={label ?? formKey}
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-activation-type="alwaysActivated"
          data-deactivation-type="leadCollected"
          data-form-name={formKey}
          data-height="613"
          data-layout-iframe-id={`inline-${formId}`}
          data-form-id={formId}
          className="absolute inset-0 h-full w-full rounded-xl border-0"
        />
      </div>
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}