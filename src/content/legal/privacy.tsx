import type { ReactNode } from "react";

export const PRIVACY_CONTENT: ReactNode = (
  <>
    <h2>1. What data we collect</h2>
    <p>
      We collect information you provide directly when using our platform:
      your name, email address, phone/WhatsApp number (optional), and form
      responses — including preferences, intentions, and other details you
      choose to share through our questionnaires, contact form, or newsletter
      signup. We do not collect payment information from individual retreat
      clients; payments between you and a retreat owner are handled directly
      between you, outside our platform.
    </p>
    <p>
      <strong>Sensitive information you may share voluntarily.</strong> Some
      of our forms include open text fields (for example, describing what
      brings you to a retreat). If you choose to share information about your
      health, religious or philosophical beliefs, or similar sensitive
      topics in these fields, we treat this as information you have
      knowingly and voluntarily provided to help us match you with a
      suitable retreat, and we handle it with the same restricted access as
      the rest of your data. You are never required to share this level of
      detail — general answers are enough for matching.
    </p>
    <p>
      <strong>Referee contacts.</strong> Facilitators may optionally provide
      the name and email of one or two referees so we can verify their
      experience. Facilitators confirm they have each referee&apos;s permission
      before sharing these details. We use referee contacts only to verify a
      facilitator&apos;s experience, keep them private (never shown publicly),
      and delete them on request. If you are a referee and want your details
      removed, contact us using the details below.
    </p>

    <h2>2. How and why we use your data (legal basis)</h2>
    <p>We process your data for the following purposes:</p>
    <ul>
      <li>
        <strong>Matching and communication</strong> (legal basis: performance
        of a contract, or steps taken at your request before entering one) —
        to match seekers with retreats, respond to your inquiries, and
        coordinate between retreat owners, facilitators, and seekers.
      </li>
      <li>
        <strong>Newsletter and updates</strong> (legal basis: consent) — only
        if you sign up for updates. You can unsubscribe at any time using the
        link in any email or by contacting us.
      </li>
      <li>
        <strong>Service improvement and security</strong> (legal basis:
        legitimate interest) — to keep the platform secure, prevent abuse,
        and understand how our forms are used so we can improve them.
      </li>
    </ul>

    <h2>3. Where your data is stored and who processes it</h2>
    <p>
      Your data is stored in our database, hosted by Supabase on servers in
      the EU (Frankfurt, Germany). Transactional emails (confirmations,
      notifications) are sent through our mail server, also hosted in the
      EU. Some form submissions are also automatically forwarded to internal
      workflow-automation tooling used by our team to coordinate follow-up —
      we are in the process of confirming and documenting exactly where this
      tooling is hosted so this section can name it precisely.
    </p>
    <p>
      Data is accessed only by our team, for the purposes described in this
      policy, and is protected by access controls (only authorised team
      members can view submissions through our admin system).
    </p>

    <h2>4. How long we keep your data</h2>
    <p>
      We keep your data for as long as necessary to fulfil the purpose it
      was collected for — for example, seeker and retreat submissions are
      kept while we may still act on them (matching, follow-up), and you can
      ask us to delete your data at any time using the contact details
      below. We do not keep data indefinitely once it is no longer needed.
    </p>

    <h2>5. Your rights</h2>
    <p>Under data protection law, you have the right to:</p>
    <ul>
      <li>Access the personal data we hold about you.</li>
      <li>Ask us to correct inaccurate data.</li>
      <li>Ask us to delete your data (&quot;right to be forgotten&quot;).</li>
      <li>Ask us to restrict how we use your data.</li>
      <li>Receive your data in a portable format, where technically feasible.</li>
      <li>Object to processing based on our legitimate interest.</li>
      <li>Withdraw consent at any time (for newsletter/marketing communications), without affecting the lawfulness of processing before withdrawal.</li>
    </ul>

    <h2>6. Contact for data questions</h2>
    <p>
      For any questions about how we handle your data, please contact us at{" "}
      <a href="mailto:contact@lightpathretreats.com">contact@lightpathretreats.com</a>.
    </p>
  </>
);