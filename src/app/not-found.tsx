import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-warm-brown">
        404
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
        Page not found
      </h1>
      <p className="mt-4 text-stone-600">
        The page you are looking for does not exist or is not available.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-forest px-6 font-semibold text-white transition-colors hover:bg-[#345834]"
      >
        Back to home
      </Link>
    </div>
  );
}
