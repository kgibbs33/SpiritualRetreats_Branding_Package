import Link from "next/link";

export const metadata = {
  title: "Guest Terms (draft)",
  robots: { index: false, follow: false },
};

const Pending = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-sm text-amber-800">Pending: {children}</span>
);

export default function GuestTermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-stone-500">Light Path Retreats · Legal</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[#104c3b]">Guest Terms</h1>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Draft for partner review. Not yet approved. Guest booking and checkout are not enabled, and no payment is taken on this site. Items marked &quot;Pending&quot; still need a decision.
      </p>
      <div className="mt-8 space-y-8 text-[15px] leading-7 text-stone-700">
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">1. Who we are</h2>
          <p>Light Path Retreats LLC, 1209 Mountain Road PL NE, Suite R, Albuquerque, NM 87110, USA (&quot;Light Path&quot;, &quot;we&quot;). Contact: connect@lightpathretreats.com. We run an online platform where retreat planners, venues and facilitators list retreats. Light Path is a marketing and booking platform. We do not run retreats and we are not the seller of any retreat. Your contract for a retreat is with the retreat planner.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">2. Booking and payment</h2>
          <p>When checkout launches, you will pay through the platform into the planner&apos;s own Stripe account. The planner is the seller. We do not store your card details.</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Retreats more than 6 weeks away with a ticket price of EUR 300 or more: a 40% retainer is paid at booking, unless the planner has chosen full payment. The balance is paid directly to the planner by the date shown on the listing.</li>
            <li>Retreats starting within 6 weeks, tickets under EUR 300, or where the planner requires it: full payment at booking.</li>
            <li>Light Path charges the planner a booking commission, taken from your first payment. It is part of the ticket price and is not added on top. Prices are shown in euros unless the listing says otherwise, and currency conversion uses Stripe&apos;s rate. The planner&apos;s listing shows whether a retainer or full payment applies.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">3. Cancelling within 72 hours</h2>
          <p>If you booked more than 6 weeks before the retreat starts, you can cancel through the platform within 72 hours of booking, or up to 24 hours before the start date if that comes first. You are refunded what you paid, less a cancellation charge of EUR 30 plus the actual card processing costs of your payment. The refund is made from the planner&apos;s Stripe account. <Pending>refund timing</Pending></p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">4. Cancelling after 72 hours, and bookings within 6 weeks</h2>
          <p>Bookings made within 6 weeks of the retreat start are paid in full and are non-refundable from the time of booking. For bookings made earlier, the retainer is non-refundable once the cancellation window has closed. Any refund after the window is between you and the planner under the cancellation policy on the listing, and the planner issues it. We recommend travel insurance. <Pending>any exceptions</Pending></p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">5. If the planner cancels or changes the retreat</h2>
          <p>If the planner cancels, the planner must refund you in full within 14 days. If the planner moves the retreat to a new date, you keep your booking if you can attend. If you cannot attend the new date, the planner must refund you in full within 14 days.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">6. Changes you make</h2>
          <p>Room upgrades or transfers added after booking should be made through the platform. Optional treatments and activities, extra nights and travel outside the retreat dates are arranged and paid directly with the planner.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">7. Retreat information</h2>
          <p>Listings are provided by planners. Dates, prices, inclusions and suitability are the planner&apos;s responsibility. Retreats are not medical treatment. Check the programme, safety information and your own health and travel needs before booking. <Pending>liability wording</Pending></p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">8. Your data</h2>
          <p>Our <Link href="/privacy" className="text-[#104c3b] underline">Privacy Policy</Link> explains how we use your data.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-[#104c3b]">9. Contact and disputes</h2>
          <p>connect@lightpathretreats.com. <Pending>governing law and dispute wording</Pending></p>
        </section>
      </div>
      <Link href="/terms" className="mt-10 inline-block text-[#104c3b] underline">Back to Terms &amp; Conditions</Link>
    </article>
  );
}
