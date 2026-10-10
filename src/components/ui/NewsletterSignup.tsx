"use client";

import { useState } from "react";

interface NewsletterSignupProps {
  variant?: "light" | "dark";
  /** Stacked = full-width field + button (footer band). Inline = row from sm+. */
  layout?: "stacked" | "inline";
}

export function NewsletterSignup({
  variant = "light",
  layout = "inline",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      queueMicrotask(() =>
        document.getElementById("footer-newsletter-email")?.focus()
      );
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const company = ((fd.get("company") as string) || "").trim();
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Something went wrong.");
        return;
      }
      setStatus("done");
      setMessage(
        json.alreadySubscribed
          ? "You are already on the list."
          : "Thanks — you are on the list."
      );
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again later.");
    }
  }

  const feedbackRole = status === "error" ? "alert" : "status";

  const isDark = variant === "dark";
  const isStacked = layout === "stacked";

  const formClass = isStacked
    ? "flex flex-col gap-3"
    : "flex flex-col gap-3 sm:flex-row sm:items-stretch";

  const buttonClass = isStacked
    ? "inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors disabled:opacity-50"
    : "inline-flex h-12 w-full shrink-0 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-colors disabled:opacity-50 sm:w-auto";

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className={formClass} noValidate>
        <div className={`min-w-0 flex-1 ${isStacked ? "flex flex-col gap-1.5" : ""}`}>
          <input
            type="text"
            name="company"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            defaultValue=""
            className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <label
            htmlFor="footer-newsletter-email"
            className={
              isStacked
                ? "text-sm font-medium text-stone-700"
                : "sr-only"
            }
          >
            Email for updates
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            disabled={status === "loading"}
            aria-invalid={
              status === "error" &&
              message === "Please enter your email address."
                ? true
                : undefined
            }
            aria-describedby={
              status === "error" && message
                ? "footer-newsletter-feedback"
                : undefined
            }
            className={
              isDark
                ? "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60"
                : "w-full rounded-xl border border-beige bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-forest focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-60"
            }
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className={
            isDark
              ? `${buttonClass} bg-white text-forest hover:bg-cream`
              : `${buttonClass} bg-forest text-white hover:bg-[#345834]`
          }
        >
          {status === "loading" ? "…" : "Join the community"}
        </button>
      </form>
      {message ? (
        <p
          id="footer-newsletter-feedback"
          className={`text-sm ${
            status === "error"
              ? isDark
                ? "text-red-300"
                : "text-red-600"
              : isDark
                ? "text-white/70"
                : "text-stone-600"
          }`}
          role={feedbackRole}
          aria-live={status === "error" ? "assertive" : "polite"}
        >
          {message}
        </p>
      ) : null}
      <p
        className={`text-xs ${isDark ? "text-white/50" : "text-stone-400"}`}
      >
        By subscribing you agree to receive occasional email updates. You can
        unsubscribe at any time. See our{" "}
        <a
          href="/privacy"
          className={isDark ? "underline hover:text-white/80" : "underline hover:text-stone-600"}
        >
          privacy policy
        </a>
        .
      </p>
    </div>
  );
}
