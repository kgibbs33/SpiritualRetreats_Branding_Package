"use client";
import { MARKETING_WORDING, ROLE_TERMS, SERVICE_WORDING, type ListingRole } from "@/lib/listing-consent-copy";
export function ListingConsents({role, accepted, onAccepted, marketing, onMarketing}: {
  role: ListingRole; accepted?: boolean; onAccepted?: (value:boolean)=>void;
  marketing?: boolean; onMarketing?: (value:boolean)=>void;
}) {
  const terms=ROLE_TERMS[role];
  return <fieldset className="space-y-5 rounded-2xl border border-stone-200 bg-[#f5f6ef] p-5 text-sm leading-6 text-stone-700" data-listing-consents={role}>
    <legend className="sr-only">Terms and email preferences</legend>
    <label className="flex items-start gap-3">
      <input type="checkbox" name="termsAccepted" required checked={accepted} onChange={onAccepted ? e=>onAccepted(e.target.checked):undefined} className="mt-1.5 size-4 shrink-0 accent-[#104c3b]" />
      <span>I have read and agree to the <a className="underline underline-offset-2" href={terms.path} target="_blank" rel="noopener noreferrer">{terms.label}</a>, and I have read the <a className="underline underline-offset-2" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. <span className="text-xs">(required)</span></span>
    </label>
    <label className="flex items-start gap-3">
      <input type="checkbox" name="marketingOptIn" checked={marketing} onChange={onMarketing ? e=>onMarketing(e.target.checked):undefined} className="mt-1.5 size-4 shrink-0 accent-[#104c3b]" />
      <span>{MARKETING_WORDING}</span>
    </label>
    <p className="pl-7 text-xs leading-5 text-stone-600">{SERVICE_WORDING}</p>
  </fieldset>;
}
