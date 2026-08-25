"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { StyledSelect } from "@/components/ui/StyledSelect";

type FormStatus = "idle" | "submitting" | "success" | "error";

function runContactFieldValidation(data: {
  name: string;
  email: string;
  message: string;
}): Record<string, string> {
  const next: Record<string, string> = {};
  if (!data.name?.trim()) next.name = "Name is required";
  if (!data.email?.trim()) next.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    next.email = "Invalid email address";
  if (!data.message?.trim()) next.message = "Message is required";
  else if (data.message.length > 2000)
    next.message = "Message must be 2000 characters or less";
  return next;
}

function focusFirstContactField(fieldErrors: Record<string, string>) {
  queueMicrotask(() => {
    for (const key of ["name", "email", "message"] as const) {
      if (fieldErrors[key]) {
        document.getElementById(`contact-${key}`)?.focus();
        return;
      }
    }
  });
}

export function ContactForm() {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: (formData.get("subject") as string) || "general",
      message: formData.get("message") as string,
      company: ((formData.get("company") as string) || "").trim(),
    };

    setErrors({});

    const fieldErrors = runContactFieldValidation(data);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      focusFirstContactField(fieldErrors);
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          form: json.error || "Something went wrong. Please try again.",
        }));
        setStatus("error");
        queueMicrotask(() =>
          document.getElementById("contact-form-alert")?.focus()
        );
        return;
      }

      setStatus("success");
      form.reset();
      router.push("/thank-you?source=contact");
    } catch {
      setErrors((prev) => ({
        ...prev,
        form: "Failed to send. Please try again.",
      }));
      setStatus("error");
      queueMicrotask(() =>
        document.getElementById("contact-form-alert")?.focus()
      );
    }
  }

  const messageDescribedBy = [
    errors.message ? "contact-message-error" : null,
    "contact-message-hint",
  ]
    .filter(Boolean)
    .join(" ");

  if (status === "success") {
    return (
      <div className="rounded-xl border border-beige bg-cream p-8 text-center">
        <p className="text-lg font-medium text-stone-800">
          Thank you for getting in touch. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <p className="text-sm text-stone-600">
        This page is for general contact. If you are a{" "}
        <Link
          href="/for-retreat-owners"
          className="font-medium text-forest hover:underline"
        >
          retreat owner
        </Link>{" "}
        (run retreats) or{" "}
        <Link
          href="/facilitators-portal"
          className="font-medium text-forest hover:underline"
        >
          facilitator
        </Link>{" "}
        (give workshops or sessions), you can go here.
      </p>

      {errors.form && (
        <div
          id="contact-form-alert"
          role="alert"
          tabIndex={-1}
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 outline-none"
        >
          {errors.form}
        </div>
      )}

      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        defaultValue=""
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-stone-700"
        >
          Name *
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={status === "submitting"}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="mt-1 block w-full rounded-xl border border-beige px-4 py-3 text-stone-900 focus:border-forest focus:outline-none focus:ring-2 focus:ring-aqua disabled:bg-beige/30"
        />
        {errors.name && (
          <p id="contact-name-error" className="mt-1 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-stone-700"
        >
          Email *
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={status === "submitting"}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="mt-1 block w-full rounded-xl border border-beige px-4 py-3 text-stone-900 focus:border-forest focus:outline-none focus:ring-2 focus:ring-aqua disabled:bg-beige/30"
        />
        {errors.email && (
          <p id="contact-email-error" className="mt-1 text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-medium text-stone-700"
        >
          Subject
        </label>
        <StyledSelect
          id="contact-subject"
          name="subject"
          autoComplete="off"
          disabled={status === "submitting"}
          wrapperClassName="mt-1"
        >
          <option value="general">General inquiry</option>
          <option value="partnership">Partnership</option>
          <option value="other">Other</option>
        </StyledSelect>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-stone-700"
        >
          Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          maxLength={2000}
          autoComplete="off"
          disabled={status === "submitting"}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={messageDescribedBy}
          className="mt-1 block w-full rounded-xl border border-beige px-4 py-3 text-stone-900 focus:border-forest focus:outline-none focus:ring-2 focus:ring-aqua disabled:bg-beige/30"
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1 text-sm text-red-600">
            {errors.message}
          </p>
        )}
        <p id="contact-message-hint" className="mt-1 text-xs text-stone-500">
          Max 2000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-forest px-8 font-semibold text-white transition-all hover:bg-[#345834] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
      <p className="mt-3 text-xs text-stone-400">
        By submitting you agree to our{" "}
        <a href="/privacy" className="underline hover:text-stone-600">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
