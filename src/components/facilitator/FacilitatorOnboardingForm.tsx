"use client";

import { useState } from "react";

import {
  PRACTICE_AREAS,
  PRACTICE_AREA_LABELS,
} from "@/lib/facilitators/practice-areas";

type Status = "idle" | "submitting" | "success" | "error";
type PhotoStatus = "idle" | "uploading" | "done" | "error";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_DIM = 600;

/**
 * Downscale to <= MAX_PHOTO_DIM and re-encode as JPEG before upload.
 * Shrinks the payload and strips EXIF metadata (incl. GPS). Falls back to the
 * original file if the canvas path is unavailable.
 */
async function optimizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_PHOTO_DIM / Math.max(bitmap.width, bitmap.height)
    );
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85)
    );
  } catch {
    return file;
  }
}

export function FacilitatorOnboardingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>("idle");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cvPath, setCvPath] = useState<string | null>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const [cvStatus, setCvStatus] = useState<PhotoStatus>("idle");
  const [cvError, setCvError] = useState<string | null>(null);

  async function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvError(null);
    if (file.type !== "application/pdf") {
      setCvError("Upload a PDF.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setCvError("PDF too large (max 5 MB).");
      return;
    }
    setCvStatus("uploading");
    try {
      const body = new FormData();
      body.append("file", file, "cv.pdf");
      const res = await fetch("/api/facilitator-cv", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCvError(json.error || "Upload failed.");
        setCvStatus("error");
        return;
      }
      setCvPath(json.path);
      setCvName(file.name);
      setCvStatus("done");
    } catch {
      setCvError("Upload failed. Please try again.");
      setCvStatus("error");
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setPhotoError("Image too large (max 5 MB).");
      return;
    }
    setPhotoStatus("uploading");
    try {
      const optimized = await optimizeImage(file);
      const body = new FormData();
      body.append("file", optimized, "photo.jpg");
      const res = await fetch("/api/facilitator-photo", {
        method: "POST",
        body,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhotoError(json.error || "Upload failed.");
        setPhotoStatus("error");
        return;
      }
      setPhotoPath(json.path);
      setPhotoPreview(URL.createObjectURL(optimized));
      setPhotoStatus("done");
    } catch {
      setPhotoError("Upload failed. Please try again.");
      setPhotoStatus("error");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Assemble referee contacts (SCOPE-030). Include a row if it has any input
    // so the server can validate it; fully-empty rows are dropped.
    const referrals = [1, 2]
      .map((i) => ({
        name: ((fd.get(`referral${i}Name`) as string) || "").trim(),
        email: ((fd.get(`referral${i}Email`) as string) || "").trim(),
        relationship:
          ((fd.get(`referral${i}Relationship`) as string) || "").trim() ||
          undefined,
      }))
      .filter((r) => r.name || r.email);

    const payload = {
      fullName: (fd.get("fullName") as string)?.trim() ?? "",
      email: (fd.get("email") as string)?.trim() ?? "",
      company: ((fd.get("company") as string) || "").trim(),
      phone: ((fd.get("phone") as string) || "").trim() || undefined,
      practiceAreas: fd.getAll("practiceAreas") as string[],
      city: ((fd.get("city") as string) || "").trim() || undefined,
      region: ((fd.get("region") as string) || "").trim() || undefined,
      country: ((fd.get("country") as string) || "").trim() || undefined,
      websiteUrl: ((fd.get("websiteUrl") as string) || "").trim() || undefined,
      linkedinUrl: ((fd.get("linkedinUrl") as string) || "").trim() || undefined,
      instagramUrl:
        ((fd.get("instagramUrl") as string) || "").trim() || undefined,
      practiceFocus:
        ((fd.get("practiceFocus") as string) || "").trim() || undefined,
      credentials:
        ((fd.get("credentials") as string) || "").trim() || undefined,
      message: ((fd.get("message") as string) || "").trim() || undefined,
      photoPath: photoPath || undefined,
      cvPath: cvPath || undefined,
      referrals: referrals.length ? referrals : undefined,
      referralConsent: fd.get("referralConsent") === "on",
    };

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/facilitator-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: json.error || "Submission failed." });
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrors({ form: "Network error. Try again." });
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-beige bg-cream p-8 text-center">
        <p className="text-lg font-medium text-stone-800">
          Thank you — we received your facilitator profile. Check your email
          for a short confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errors.form && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {errors.form}
        </div>
      )}

      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        aria-hidden
      />

      <div>
        <label
          htmlFor="fo-fullName"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Full name
        </label>
        <input
          id="fo-fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      <div>
        <label
          htmlFor="fo-email"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Email
        </label>
        <input
          id="fo-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      <div>
        <label
          htmlFor="fo-phone"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Phone (optional)
        </label>
        <input
          id="fo-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-sm font-medium text-stone-800">
          Location (optional)
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="fo-city" className="sr-only">
              City
            </label>
            <input
              id="fo-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder="City"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <div>
            <label htmlFor="fo-region" className="sr-only">
              Region / state
            </label>
            <input
              id="fo-region"
              name="region"
              type="text"
              autoComplete="address-level1"
              placeholder="Region / state"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <div>
            <label htmlFor="fo-country" className="sr-only">
              Country
            </label>
            <input
              id="fo-country"
              name="country"
              type="text"
              autoComplete="country-name"
              placeholder="Country"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>
        </div>
        <p className="text-xs text-stone-400">
          Helps us match you to nearby retreats. Kept private — never shown
          publicly without your consent.
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-stone-800">
          Skills &amp; practices (optional)
        </legend>
        <p className="mb-2.5 text-xs text-stone-400">
          Select all that describe your facilitation.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRACTICE_AREAS.map((area) => (
            <label key={area} className="cursor-pointer">
              <input
                type="checkbox"
                name="practiceAreas"
                value={area}
                className="peer sr-only"
              />
              <span className="inline-flex items-center rounded-full border border-stone-300 px-3.5 py-1.5 text-sm text-stone-700 transition-colors hover:border-warm-brown/60 peer-checked:border-forest peer-checked:bg-forest/5 peer-checked:font-medium peer-checked:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-forest peer-focus-visible:ring-offset-1">
                {PRACTICE_AREA_LABELS[area]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="fo-practice"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Practice focus{" "}
          <span className="font-normal text-stone-400">
            (anything not covered above)
          </span>
        </label>
        <input
          id="fo-practice"
          name="practiceFocus"
          type="text"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
          placeholder="Yoga, plant medicine, somatic, etc."
        />
      </div>

      <div>
        <label
          htmlFor="fo-credentials"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Credentials & experience
        </label>
        <textarea
          id="fo-credentials"
          name="credentials"
          rows={4}
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      <div>
        <label
          htmlFor="fo-message"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Anything else we should know?
        </label>
        <textarea
          id="fo-message"
          name="message"
          rows={3}
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-sm font-medium text-stone-800">
          Referee contacts (optional)
        </legend>
        {[1, 2].map((i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`fo-ref${i}-name`} className="sr-only">
                Referee {i} name
              </label>
              <input
                id={`fo-ref${i}-name`}
                name={`referral${i}Name`}
                type="text"
                autoComplete="off"
                placeholder={`Referee ${i} name`}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <div>
              <label htmlFor={`fo-ref${i}-email`} className="sr-only">
                Referee {i} email
              </label>
              <input
                id={`fo-ref${i}-email`}
                name={`referral${i}Email`}
                type="email"
                autoComplete="off"
                placeholder="Email"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
            <div>
              <label htmlFor={`fo-ref${i}-rel`} className="sr-only">
                Relationship to referee {i}
              </label>
              <input
                id={`fo-ref${i}-rel`}
                name={`referral${i}Relationship`}
                type="text"
                autoComplete="off"
                placeholder="Relationship"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          </div>
        ))}
        <label className="flex cursor-pointer items-start gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            name="referralConsent"
            className="mt-0.5 accent-forest"
          />
          <span>
            I confirm I have these people&apos;s permission to share their
            contact details for the purpose of verifying my experience.
          </span>
        </label>
        <p className="text-xs text-stone-400">
          Admin-only. We contact referees solely to verify your experience and
          never share their details. They can ask us to delete their data at any
          time.
        </p>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1.5 text-sm font-medium text-stone-800">
          Links (optional)
        </legend>
        <div className="space-y-3">
          <div>
            <label htmlFor="fo-website" className="sr-only">
              Website
            </label>
            <input
              id="fo-website"
              name="websiteUrl"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="Website — https://yoursite.com"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <div>
            <label htmlFor="fo-linkedin" className="sr-only">
              LinkedIn
            </label>
            <input
              id="fo-linkedin"
              name="linkedinUrl"
              type="url"
              inputMode="url"
              placeholder="LinkedIn — https://linkedin.com/in/you"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>
          <div>
            <label htmlFor="fo-instagram" className="sr-only">
              Instagram
            </label>
            <input
              id="fo-instagram"
              name="instagramUrl"
              type="url"
              inputMode="url"
              placeholder="Instagram — https://instagram.com/you"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
            />
          </div>
        </div>
        <p className="text-xs text-stone-400">
          Optional. Helps us verify your work. Shown publicly only with your
          consent.
        </p>
      </fieldset>

      <div>
        <label
          htmlFor="fo-photo"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Profile photo (optional)
        </label>
        <input
          id="fo-photo"
          name="photoFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
        />
        {photoStatus === "uploading" && (
          <p className="mt-1.5 text-sm text-stone-500">Uploading…</p>
        )}
        {photoError && (
          <p className="mt-1.5 text-sm text-red-600">{photoError}</p>
        )}
        {photoStatus === "done" && photoPreview && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset */}
            <img
              src={photoPreview}
              alt="Profile preview"
              className="h-16 w-16 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-forest">Photo added</span>
          </div>
        )}
        <p className="mt-1.5 text-xs text-stone-400">
          JPEG, PNG, or WebP. Max 5 MB. Resized automatically; kept private.
        </p>
      </div>

      <div>
        <label
          htmlFor="fo-cv"
          className="mb-1.5 block text-sm font-medium text-stone-800"
        >
          CV / credentials document (optional)
        </label>
        <input
          id="fo-cv"
          name="cvFile"
          type="file"
          accept="application/pdf"
          onChange={handleCvChange}
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
        />
        {cvStatus === "uploading" && (
          <p className="mt-1.5 text-sm text-stone-500">Uploading…</p>
        )}
        {cvError && <p className="mt-1.5 text-sm text-red-600">{cvError}</p>}
        {cvStatus === "done" && cvName && (
          <p className="mt-1.5 text-sm font-medium text-forest">
            Added: {cvName}
          </p>
        )}
        <p className="mt-1.5 text-xs text-stone-400">
          PDF only. Max 5 MB. Used privately by our team to verify your
          experience; never shown publicly.
        </p>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-forest font-semibold text-white transition-colors hover:bg-[#345834] disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit profile"}
      </button>
      <p className="text-center text-xs text-stone-400">
        By submitting you agree to our{" "}
        <a href="/privacy" className="underline hover:text-stone-600">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
