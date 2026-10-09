"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid password. Check your operator secret.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-forest text-cream mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-foreground">Admin Access</h1>
          <p className="text-sm text-muted mt-1">Light Path Retreats operations panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-beige p-6 shadow-[var(--shadow-card)]">
          <label className="block text-sm font-medium text-foreground mb-2">
            Operator Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your operator secret"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-beige bg-cream focus:outline-none focus:border-forest text-sm text-foreground placeholder:text-muted transition-colors"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 bg-forest text-cream py-3 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {isPending ? "Verifying…" : "Enter Admin Panel"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-4">
          This area is restricted to authorised operators only.
        </p>
      </div>
    </div>
  );
}
