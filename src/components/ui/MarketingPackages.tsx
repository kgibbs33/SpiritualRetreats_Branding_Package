
/** E-04 — static marketing packages block (no live billing). */
const PACKAGES = [
  {
    name: "Bronze",
    price: "EUR 49.99",
    features: ["Single newsletter feature plus a social spotlight."],
  },
  {
    name: "Silver",
    price: "EUR 122.22",
    features: ["Dedicated promotional spotlight, custom graphics, multi-channel distribution."],
  },
  {
    name: "Gold",
    price: "EUR 499",
    features: ["Premium quarterly spotlight, top newsletter banner, multi-week social campaign, professional asset review."],
    featured: true,
  },
];

export function MarketingPackages() {
  return (
    <section className="mt-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className={`relative rounded-2xl border p-5 ${
              pkg.featured
                ? "border-sacred-gold bg-warm-cream"
                : "border-sage-mist bg-white"
            }`}
          >
            {pkg.featured && (
              <span className="absolute -top-3 left-4 rounded-full bg-sacred-gold px-3 py-0.5 text-xs font-semibold text-celestial-navy">
                Featured
              </span>
            )}
            <h3 className="font-semibold text-celestial-navy">{pkg.name}</h3>
            <p className="mt-1 text-lg font-semibold text-forest-green">{pkg.price}</p>
            <ul className="mt-3 space-y-1 text-sm text-stone-600">
              {pkg.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-400">
        Paid placement is labelled &ldquo;Featured&rdquo;. Prices shown are
        static; purchase is not live yet.
      </p>
    </section>
  );
}