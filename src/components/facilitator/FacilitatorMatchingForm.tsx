"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IconYoga, IconLotus, IconBreath, IconSoundWave, IconHerb,
  IconBody, IconBolt, IconBrush, IconSparkles, IconCompass,
  IconGroup, IconPerson, IconCouple, IconUsers,
  IconMountains, IconOcean, IconJungle, IconCactus, IconHills, IconMap,
  IconSunrise, IconCalendar, IconMoonStar, IconLeaf, IconInfinity,
  IconDiamond,
  IconHandshake, IconHeart, IconScales,
} from "@/components/ui/icons/retreat-icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TileOption = {
  value: string;
  label: string;
  icon: React.ReactElement;
  sub?: string;
};

type QuestionDef =
  | {
      kind: "tiles";
      key: string;
      heading: string;
      sub?: string;
      options: TileOption[];
      multi?: boolean;
    }
  | {
      kind: "details";
      heading: string;
      sub?: string;
    };

// ---------------------------------------------------------------------------
// Question definitions
// ---------------------------------------------------------------------------

const ic = "h-6 w-6";

const QUESTIONS: QuestionDef[] = [
  {
    kind: "tiles",
    key: "practiceAreas",
    heading: "What is your practice focus?",
    sub: "Choose all that describe your facilitation.",
    multi: true,
    options: [
      { value: "yoga",          label: "Yoga & movement",  icon: <IconYoga className={ic} />,      sub: "Asana, dance, flow" },
      { value: "meditation",    label: "Meditation",        icon: <IconLotus className={ic} />,     sub: "Mindfulness, silence" },
      { value: "breathwork",    label: "Breathwork",        icon: <IconBreath className={ic} />,    sub: "Pranayama, holotropic" },
      { value: "sound-healing", label: "Sound healing",     icon: <IconSoundWave className={ic} />, sub: "Bowls, gongs, voice" },
      { value: "plant-medicine",label: "Plant medicine",    icon: <IconHerb className={ic} />,      sub: "Ceremonial & sacred" },
      { value: "somatic",       label: "Somatic",           icon: <IconBody className={ic} />,      sub: "Body-led therapy" },
      { value: "coaching",      label: "Coaching",          icon: <IconBolt className={ic} />,      sub: "Leadership & personal" },
      { value: "creative",      label: "Creative arts",     icon: <IconBrush className={ic} />,     sub: "Art, writing, craft" },
      { value: "spiritual",     label: "Spiritual",         icon: <IconSparkles className={ic} />,  sub: "Sacred inner work" },
      { value: "other",         label: "Other",             icon: <IconCompass className={ic} />,   sub: "Let us know below" },
    ],
  },
  {
    kind: "tiles",
    key: "sessionFormat",
    heading: "How do you prefer to work?",
    sub: "Your typical facilitation style.",
    options: [
      { value: "group",      label: "Group sessions",  icon: <IconGroup className={ic} />,  sub: "Circles & workshops" },
      { value: "one-to-one", label: "1:1 sessions",    icon: <IconPerson className={ic} />, sub: "Individual depth" },
      { value: "both",       label: "Both",            icon: <IconCouple className={ic} />, sub: "Flexible format" },
    ],
  },
  {
    kind: "tiles",
    key: "experienceYears",
    heading: "How long have you been facilitating?",
    options: [
      { value: "lt2",   label: "Under 2 years",  icon: <IconSunrise className={ic} />,  sub: "Emerging facilitator" },
      { value: "2to5",  label: "2 – 5 years",    icon: <IconCalendar className={ic} />, sub: "Growing practice" },
      { value: "5to10", label: "5 – 10 years",   icon: <IconMoonStar className={ic} />, sub: "Established" },
      { value: "gt10",  label: "10 + years",     icon: <IconInfinity className={ic} />, sub: "Seasoned & deep" },
    ],
  },
  {
    kind: "tiles",
    key: "retreatDurationPref",
    heading: "What retreat length are you open to?",
    sub: "Select all that work for you.",
    multi: true,
    options: [
      { value: "day",       label: "Day retreat",  icon: <IconSunrise className={ic} />,  sub: "4–8 hours" },
      { value: "weekend",   label: "Weekend",      icon: <IconCalendar className={ic} />, sub: "2–3 days" },
      { value: "week",      label: "One week",     icon: <IconMoonStar className={ic} />, sub: "5–7 days" },
      { value: "twoweeks",  label: "Two weeks",    icon: <IconLeaf className={ic} />,     sub: "10–14 days" },
      { value: "flexible",  label: "Flexible",     icon: <IconInfinity className={ic} />, sub: "Open to any length" },
    ],
  },
  {
    kind: "tiles",
    key: "settingPreference",
    heading: "What settings inspire you?",
    sub: "Choose all that resonate.",
    multi: true,
    options: [
      { value: "jungle",      label: "Jungle & forest", icon: <IconJungle className={ic} />,    sub: "Wild & verdant" },
      { value: "ocean",       label: "Ocean & beach",   icon: <IconOcean className={ic} />,     sub: "Salt air & waves" },
      { value: "mountains",   label: "Mountains",       icon: <IconMountains className={ic} />, sub: "Altitude & silence" },
      { value: "desert",      label: "Desert",          icon: <IconCactus className={ic} />,    sub: "Vast & ancient" },
      { value: "countryside", label: "Countryside",     icon: <IconHills className={ic} />,     sub: "Pastoral & slow" },
      { value: "any",         label: "Open to any",     icon: <IconMap className={ic} />,       sub: "Location flexible" },
    ],
  },
  {
    kind: "tiles",
    key: "groupSizePreference",
    heading: "What group size suits you best?",
    options: [
      { value: "intimate", label: "Intimate",    icon: <IconPerson className={ic} />,  sub: "1–6 people" },
      { value: "small",    label: "Small group", icon: <IconCouple className={ic} />,  sub: "6–15 people" },
      { value: "medium",   label: "Medium",      icon: <IconGroup className={ic} />,   sub: "15–30 people" },
      { value: "large",    label: "Large",       icon: <IconUsers className={ic} />,   sub: "30+ people" },
    ],
  },
  {
    kind: "tiles",
    key: "compensationPreference",
    heading: "How do you prefer to be compensated?",
    sub: "This helps us match you with the right retreat owners.",
    options: [
      { value: "revenue-share", label: "Revenue share",   icon: <IconHandshake className={ic} />, sub: "% of ticket sales" },
      { value: "day-rate",      label: "Day rate",         icon: <IconDiamond className={ic} />,   sub: "Fixed daily fee" },
      { value: "volunteer",     label: "Volunteer",        icon: <IconHeart className={ic} />,     sub: "Experience & exchange" },
      { value: "open",          label: "Open to discuss",  icon: <IconScales className={ic} />,    sub: "Flexible arrangement" },
    ],
  },
  {
    kind: "details",
    heading: "Final details",
    sub: "Tell us where you want to go and what makes your facilitation unique.",
  },
];

const TOTAL_STEPS = 1 + QUESTIONS.length;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div
      className="mb-10"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-valuetext={`Step ${current} of ${total}`}
      aria-label="Questionnaire progress"
    >
      <div className="mb-2 flex items-center justify-between" aria-hidden="true">
        <span className="text-xs font-medium text-stone-400 tabular-nums">
          {current} of {total}
        </span>
        <span className="text-xs font-medium text-warm-brown tabular-nums">
          {pct}%
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-warm-brown transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type TileProps = {
  option: TileOption;
  selected: boolean;
  onClick: () => void;
};

function Tile({ option, selected, onClick }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 text-center transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2",
        selected
          ? "border-forest bg-forest/5 shadow-sm scale-[1.03]"
          : "border-beige bg-white hover:border-warm-brown/50 hover:shadow-sm hover:scale-[1.02] active:scale-[0.99]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150",
          selected
            ? "bg-forest/10 text-forest"
            : "bg-cream text-warm-brown group-hover:bg-warm-brown/10 group-hover:text-forest",
        ].join(" ")}
        aria-hidden
      >
        {option.icon}
      </span>
      <span
        className={[
          "text-sm font-semibold leading-tight transition-colors",
          selected ? "text-forest" : "text-stone-800",
        ].join(" ")}
      >
        {option.label}
      </span>
      {option.sub && (
        <span className="text-xs leading-snug text-stone-400">{option.sub}</span>
      )}
      {selected && (
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[9px] font-bold text-white leading-none"
        >
          ✓
        </span>
      )}
    </button>
  );
}

function SlideIn({
  children,
  stepKey,
}: {
  children: React.ReactNode;
  stepKey: string | number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [stepKey]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200";

const labelClass = "mb-1.5 block text-sm font-medium text-stone-800";

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function FacilitatorMatchingForm() {
  const router = useRouter();
  const honeypotRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 0 — contact
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Tile answers (single)
  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});
  // Tile answers (multi)
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({
    practiceAreas: [],
    retreatDurationPref: [],
    settingPreference: [],
  });

  // Details step
  const [regionPreference, setRegionPreference] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [bio, setBio] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [promotionConsent, setPromotionConsent] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const questionIndex = step - 1;
  const currentQuestion = QUESTIONS[questionIndex] as QuestionDef | undefined;

  // Single source of truth for the progress bar. Derived from `step`, never
  // hardcoded, and clamped into 1..TOTAL_STEPS so the displayed number can
  // never exceed the total again (the 8 -> 10 bug: three call sites passed
  // TOTAL_STEPS + 1 and the last screen hardcoded its own `current`).
  const displayStep = clamp(step + 1, 1, TOTAL_STEPS);

  const goForward = useCallback(() => {
    setStep((s) => clamp(s + 1, 0, TOTAL_STEPS));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => clamp(s - 1, 0, TOTAL_STEPS));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function handleSingleTile(key: string, value: string) {
    setSingleAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleMultiTile(key: string, value: string) {
    setMultiAnswers((prev) => {
      const current = prev[key] ?? [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  // Step 0 validation
  function validateContact(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Valid email is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Tile step validation
  function validateTileStep(q: QuestionDef): boolean {
    if (q.kind !== "tiles") return true;
    if (q.multi) {
      const vals = multiAnswers[q.key] ?? [];
      if (vals.length === 0) {
        setErrors({ tile: "Please select at least one option to continue." });
        return false;
      }
    }
    // Single-select tile steps: selection optional — allow skipping
    return true;
  }

  function handleNext() {
    if (step === 0) {
      if (!validateContact()) return;
      goForward();
      return;
    }
    if (currentQuestion) {
      if (!validateTileStep(currentQuestion)) return;
      goForward();
      return;
    }
    goForward();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot check
    if (honeypotRef.current?.value) return;

    setSubmitting(true);
    setErrors({});

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      practiceAreas:          multiAnswers.practiceAreas ?? [],
      sessionFormat:          singleAnswers.sessionFormat ?? null,
      experienceYears:        singleAnswers.experienceYears ?? null,
      retreatDurationPref:    multiAnswers.retreatDurationPref ?? [],
      settingPreference:      multiAnswers.settingPreference ?? [],
      groupSizePreference:    singleAnswers.groupSizePreference ?? null,
      regionPreference:       regionPreference.trim() || null,
      availabilityNotes:      availabilityNotes.trim() || null,
      compensationPreference: singleAnswers.compensationPreference ?? null,
      bio:                    bio.trim() || null,
      specialRequests:        specialRequests.trim() || null,
      lookingFor:             lookingFor.trim() || null,
      hourlyRateCents: (() => {
        const n = parseFloat(hourlyRate);
        return hourlyRate.trim() && Number.isFinite(n)
          ? Math.round(n * 100)
          : null;
      })(),
      dailyRateCents: (() => {
        const n = parseFloat(dailyRate);
        return dailyRate.trim() && Number.isFinite(n)
          ? Math.round(n * 100)
          : null;
      })(),
      promotionConsent,
      linkedinUrl:            linkedinUrl.trim() || null,
      socialUrls:             [],
    };

    try {
      const res = await fetch("/api/facilitator-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: json.error || "Submission failed. Please try again." });
        setSubmitting(false);
        return;
      }
      router.push("/thank-you?source=facilitator-matching");
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderTileGrid(q: Extract<QuestionDef, { kind: "tiles" }>) {
    const isMulti = q.multi ?? false;
    const gridCols =
      q.options.length <= 4
        ? "grid-cols-2 sm:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

    return (
      <div className={`grid gap-3 ${gridCols}`}>
        {q.options.map((opt) => {
          const selected = isMulti
            ? (multiAnswers[q.key] ?? []).includes(opt.value)
            : singleAnswers[q.key] === opt.value;
          return (
            <Tile
              key={opt.value}
              option={opt}
              selected={selected}
              onClick={() =>
                isMulti
                  ? handleMultiTile(q.key, opt.value)
                  : handleSingleTile(q.key, opt.value)
              }
            />
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 0 — Contact
  // ---------------------------------------------------------------------------

  if (step === 0) {
    return (
      <div>
        <ProgressBar current={displayStep} total={TOTAL_STEPS} />
        <SlideIn stepKey={0}>
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-800">
              Let&apos;s start with your details
            </h2>
            <p className="mt-2 text-[15px] text-stone-500">
              We will use this to contact you when a retreat match comes up.
            </p>
          </div>

          <div className="space-y-5">
            <input
              ref={honeypotRef}
              type="text"
              name="company"
              autoComplete="off"
              tabIndex={-1}
              className="hidden"
              aria-hidden
            />

            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                autoComplete="name"
                placeholder="Your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                WhatsApp / phone{" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                autoComplete="tel"
                placeholder="+1 555 000 0000"
              />
            </div>

            <div>
              <label className={labelClass}>
                LinkedIn{" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className={inputClass}
                placeholder="https://linkedin.com/in/…"
              />
            </div>
          </div>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-forest font-semibold text-white transition-colors hover:bg-[#345834] sm:w-auto sm:px-10"
            >
              Continue →
            </button>
          </div>
        </SlideIn>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Tile question steps
  // ---------------------------------------------------------------------------

  if (currentQuestion && currentQuestion.kind === "tiles") {
    const q = currentQuestion;
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <ProgressBar current={displayStep} total={TOTAL_STEPS} />
        <SlideIn stepKey={step}>
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-800">
              {q.heading}
            </h2>
            {q.sub && (
              <p className="mt-2 text-[15px] text-stone-500">{q.sub}</p>
            )}
          </div>

          {errors.tile && (
            <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              {errors.tile}
            </p>
          )}

          {renderTileGrid(q)}

          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-beige px-6 font-semibold text-stone-600 transition-colors hover:bg-stone-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-forest font-semibold text-white transition-colors hover:bg-[#345834] sm:flex-none sm:px-10"
            >
              {q.multi
                ? `Continue (${(multiAnswers[q.key] ?? []).length} selected)`
                : "Continue →"}
            </button>
          </div>
        </SlideIn>
      </form>
    );
  }

  // ---------------------------------------------------------------------------
  // Details / reflection step (last)
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit}>
      <ProgressBar current={displayStep} total={TOTAL_STEPS} />
      <SlideIn stepKey="details">
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-800">
            Final details
          </h2>
          <p className="mt-2 text-[15px] text-stone-500">
            Help us understand your situation and what you bring.
          </p>
        </div>

        {errors.form && (
          <div
            role="alert"
            className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errors.form}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className={labelClass}>
              What are you looking for? *
            </label>
            <p className="mb-2 text-xs text-stone-400">
              Retreat collaborations, venues, revenue share, geography — be specific.
            </p>
            <textarea
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              rows={4}
              required
              className={inputClass}
              placeholder="e.g. Weekend yoga retreats in Europe, revenue-share with established venues…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Hourly rate (EUR){" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputClass}
                placeholder="e.g. 120"
              />
            </div>
            <div>
              <label className={labelClass}>
                Day rate (EUR){" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                className={inputClass}
                placeholder="e.g. 800"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-beige bg-white p-4">
            <input
              type="checkbox"
              checked={promotionConsent}
              onChange={(e) => setPromotionConsent(e.target.checked)}
              className="mt-1 size-4 rounded border-stone-300 text-forest focus:ring-forest"
            />
            <span className="text-sm text-stone-600">
              I consent to Light Path Retreats featuring my profile in marketing
              to retreat owners (optional).
            </span>
          </label>

          <div>
            <label className={labelClass}>
              Preferred region or destination{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              value={regionPreference}
              onChange={(e) => setRegionPreference(e.target.value)}
              className={inputClass}
              placeholder="e.g. Bali, Costa Rica, Spain, Open to anywhere"
            />
          </div>

          <div>
            <label className={labelClass}>
              Availability{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              type="text"
              value={availabilityNotes}
              onChange={(e) => setAvailabilityNotes(e.target.value)}
              className={inputClass}
              placeholder="e.g. Available from September 2026, flexible dates, need 6 weeks notice"
            />
          </div>

          <div>
            <label className={labelClass}>About your facilitation</label>
            <p className="mb-2 text-xs text-stone-400">
              This is your pitch to retreat owners — what makes your practice
              unique and what you bring to a collaboration.
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="Share your background, style, certifications, and what a retreat with you looks and feels like…"
            />
          </div>

          <div>
            <label className={labelClass}>
              Anything else we should know?{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Special conditions, existing retreat ideas, partnerships you are open to, etc."
            />
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-beige px-6 font-semibold text-stone-600 transition-colors hover:bg-stone-50"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-forest font-semibold text-white transition-colors hover:bg-[#345834] disabled:opacity-60 sm:flex-none sm:px-10"
          >
            {submitting ? "Submitting…" : "Submit matching request"}
          </button>
        </div>

        <p className="mt-5 text-xs text-stone-400">
          By submitting you agree to our{" "}
          <a href="/privacy" className="underline hover:text-stone-600">
            privacy policy
          </a>
          . We will only contact you about relevant retreat opportunities.
        </p>
      </SlideIn>
    </form>
  );
}
