"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconMoon, IconLeaf, IconSprout, IconCrystal, IconBolt,
  IconHandshake, IconCompass, IconSparkles, IconSpa,
  IconWaves, IconHeart, IconButterfly, IconScales,
  IconGroup, IconPerson, IconCouple, IconCircleHalf,
  IconMountains, IconOcean, IconJungle, IconCactus, IconTemple, IconHills, IconMap,
  IconSunrise, IconCalendar, IconMoonStar, IconInfinity,
  IconYoga, IconLotus, IconBreath, IconBody, IconSoundWave,
  IconTree, IconBrush, IconDrop, IconChart, IconHerb,
  IconCircle, IconGem, IconDiamond, IconCrown, IconSpiral,
} from "@/components/ui/icons/retreat-icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SevenAnswers = {
  mainIntention: string;
  relaxationHealingTransform: string;
  groupOrPrivate: string;
  locationInspiration: string;
  duration: string;
  practices: string;
  budget: string;
};

const emptyAnswers: SevenAnswers = {
  mainIntention: "",
  relaxationHealingTransform: "",
  groupOrPrivate: "",
  locationInspiration: "",
  duration: "",
  practices: "",
  budget: "",
};

// ---------------------------------------------------------------------------
// Tile option type — icon is a React element
// ---------------------------------------------------------------------------

type TileOption = {
  value: string;
  label: string;
  icon: React.ReactElement;
  sub?: string;
};

// ---------------------------------------------------------------------------
// Question definitions
// ---------------------------------------------------------------------------

type QuestionDef =
  | {
      kind: "tiles";
      key: keyof SevenAnswers;
      heading: string;
      sub?: string;
      options: TileOption[];
      multi?: boolean;
    }
  | {
      kind: "textarea";
      key: keyof SevenAnswers;
      heading: string;
      sub?: string;
      placeholder: string;
    };

const ic = "h-6 w-6"; // shared icon size class

const QUESTIONS: QuestionDef[] = [
  {
    kind: "tiles",
    key: "mainIntention",
    heading: "What brings you to a retreat?",
    sub: "Choose the one that resonates most right now.",
    options: [
      { value: "rest",        label: "Rest & recharge",      icon: <IconMoon className={ic} />,       sub: "I need deep rest" },
      { value: "healing",     label: "Healing",               icon: <IconLeaf className={ic} />,       sub: "Physical or emotional" },
      { value: "growth",      label: "Personal growth",       icon: <IconSprout className={ic} />,     sub: "Become a better version" },
      { value: "clarity",     label: "Clarity",               icon: <IconCrystal className={ic} />,    sub: "Find direction" },
      { value: "leadership",  label: "Leadership renewal",    icon: <IconBolt className={ic} />,       sub: "Executives & founders" },
      { value: "connection",  label: "Connection",            icon: <IconHandshake className={ic} />,  sub: "Community & belonging" },
      { value: "adventure",   label: "Adventure",             icon: <IconCompass className={ic} />,    sub: "Explore & experience" },
      { value: "spiritual",   label: "Spiritual deepening",   icon: <IconSparkles className={ic} />,   sub: "Sacred inner work" },
      { value: "health_wellbeing", label: "Health & Wellbeing", icon: <IconSpa className={ic} />,      sub: "Physical vitality & balance" },
    ],
  },
  {
    kind: "tiles",
    key: "relaxationHealingTransform",
    heading: "What kind of shift are you seeking?",
    sub: "Pick the one that feels most true.",
    options: [
      { value: "relax",     label: "Relaxation",    icon: <IconWaves className={ic} />,     sub: "Soften, unwind, breathe" },
      { value: "heal",      label: "Healing",        icon: <IconHeart className={ic} />,     sub: "Address what's hurting" },
      { value: "transform", label: "Transformation", icon: <IconButterfly className={ic} />, sub: "Emerge different" },
      { value: "balance",   label: "Balance",        icon: <IconScales className={ic} />,    sub: "Restore equilibrium" },
    ],
  },
  {
    kind: "tiles",
    key: "groupOrPrivate",
    heading: "Do you want to go solo or share the experience?",
    options: [
      { value: "group",   label: "Group retreat",    icon: <IconGroup className={ic} />,      sub: "Energy of community" },
      { value: "private", label: "Private / solo",   icon: <IconPerson className={ic} />,     sub: "Just me, undistracted" },
      { value: "couple",  label: "Couple or friends", icon: <IconCouple className={ic} />,    sub: "Together experience" },
      { value: "either",  label: "Open to either",   icon: <IconCircleHalf className={ic} />, sub: "Surprise me" },
    ],
  },
  {
    kind: "tiles",
    key: "locationInspiration",
    heading: "Where does your soul want to go?",
    sub: "The landscape shapes the experience.",
    options: [
      { value: "mountains", label: "Mountains",       icon: <IconMountains className={ic} />, sub: "Altitude & silence" },
      { value: "ocean",     label: "Ocean & beach",   icon: <IconOcean className={ic} />,     sub: "Salt air & waves" },
      { value: "jungle",    label: "Jungle & forest", icon: <IconJungle className={ic} />,    sub: "Wild & verdant" },
      { value: "desert",    label: "Desert",          icon: <IconCactus className={ic} />,    sub: "Vast & ancient" },
      { value: "spiritual", label: "Sacred site",     icon: <IconTemple className={ic} />,    sub: "Temples & centers" },
      { value: "country",   label: "Countryside",     icon: <IconHills className={ic} />,     sub: "Pastoral & slow" },
      { value: "anywhere",  label: "Anywhere",        icon: <IconMap className={ic} />,        sub: "Surprise me" },
    ],
  },
  {
    kind: "tiles",
    key: "duration",
    heading: "How long would you like to go?",
    options: [
      { value: "weekend",   label: "Weekend",    icon: <IconSunrise className={ic} />,  sub: "2–3 days" },
      { value: "week",      label: "One week",   icon: <IconCalendar className={ic} />, sub: "5–7 days" },
      { value: "twoweeks",  label: "Two weeks",  icon: <IconMoonStar className={ic} />, sub: "10–14 days" },
      { value: "month",     label: "A month +",  icon: <IconLeaf className={ic} />,     sub: "Deep immersion" },
      { value: "flexible",  label: "Flexible",   icon: <IconInfinity className={ic} />, sub: "Open to what fits" },
    ],
  },
  {
    kind: "tiles",
    key: "practices",
    heading: "What practices call to you?",
    sub: "Select all that feel right.",
    multi: true,
    options: [
      { value: "yoga",       label: "Yoga",              icon: <IconYoga className={ic} /> },
      { value: "meditation", label: "Meditation",         icon: <IconLotus className={ic} /> },
      { value: "breathwork", label: "Breathwork",         icon: <IconBreath className={ic} /> },
      { value: "somatic",    label: "Somatic healing",    icon: <IconBody className={ic} /> },
      { value: "sound",      label: "Sound healing",      icon: <IconSoundWave className={ic} /> },
      { value: "nature",     label: "Nature immersion",   icon: <IconTree className={ic} /> },
      { value: "creative",   label: "Creative arts",      icon: <IconBrush className={ic} /> },
      { value: "fasting",    label: "Fasting / detox",    icon: <IconDrop className={ic} /> },
      { value: "leadership", label: "Coaching",           icon: <IconChart className={ic} /> },
      { value: "plant",      label: "Plant medicine",     icon: <IconHerb className={ic} /> },
      { value: "open",       label: "Open to guidance",   icon: <IconSparkles className={ic} /> },
    ],
  },
  {
    kind: "tiles",
    key: "budget",
    heading: "What's your budget for this experience?",
    sub: "All-inclusive per person.",
    options: [
      { value: "under1000", label: "Under $1,000",     icon: <IconCircle className={ic} />,  sub: "Budget-conscious" },
      { value: "1000-2500", label: "$1,000 – $2,500",  icon: <IconGem className={ic} />,     sub: "Mid-range" },
      { value: "2500-5000", label: "$2,500 – $5,000",  icon: <IconDiamond className={ic} />, sub: "Premium" },
      { value: "5000plus",  label: "$5,000+",           icon: <IconCrown className={ic} />,   sub: "Luxury immersion" },
      { value: "open",      label: "Fit me first",      icon: <IconSpiral className={ic} />,  sub: "Budget is secondary" },
    ],
  },
];

const TOTAL_STEPS = 2 + QUESTIONS.length;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// ---------------------------------------------------------------------------
// Progress bar
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

// ---------------------------------------------------------------------------
// Tile card
// ---------------------------------------------------------------------------

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
      {/* Icon container */}
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

      {/* Selected checkmark badge */}
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

// ---------------------------------------------------------------------------
// Slide-in animation wrapper
// ---------------------------------------------------------------------------

function SlideIn({ children, stepKey }: { children: React.ReactNode; stepKey: string | number }) {
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

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function SeekerDiscoveryForm() {
  const router = useRouter();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "seeker-client-id-fallback"
  );

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 0 fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState("");

  // Logistics collected in reflection step
  const [travelDates, setTravelDates] = useState("");
  const [travelDatesFlexible, setTravelDatesFlexible] = useState(false);
  const [destinationRegion, setDestinationRegion] = useState("");

  // Single-value answers
  const [answers, setAnswers] = useState<SevenAnswers>({ ...emptyAnswers });
  // Multi-value answers (practices)
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({ practices: [] });

  // Reflection
  const [reflectionIntention, setReflectionIntention] = useState("");
  const [reflectionGreatRetreat, setReflectionGreatRetreat] = useState("");
  const [reflectionSpecialRequests, setReflectionSpecialRequests] = useState("");

  const questionIndex = step - 1;
  const currentQuestion = QUESTIONS[questionIndex] as QuestionDef | undefined;

  const goForward = useCallback(() => {
    setDirection("forward");
    setStep((s) => clamp(s + 1, 0, TOTAL_STEPS));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    setDirection("back");
    setStep((s) => clamp(s - 1, 0, TOTAL_STEPS));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function selectSingle(key: keyof SevenAnswers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTimeout(() => goForward(), 280);
  }

  function toggleMulti(key: string, value: string) {
    setMultiAnswers((m) => {
      const cur = m[key] ?? [];
      return {
        ...m,
        [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      };
    });
  }

  // SCOPE-050: submit `practices` as a real array (not a joined string) so the
  // answers jsonb stores it as a proper, queryable list.
  function buildFinalAnswers(): Omit<SevenAnswers, "practices"> & {
    practices: string[];
  } {
    return {
      ...answers,
      practices: multiAnswers.practices,
    };
  }

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Please tell us your name";
    if (!email.trim()) e.email = "We need your email to send the matches";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "That email doesn't look right";
    return e;
  }

  function validateQuestion(q: QuestionDef): Record<string, string> {
    const e: Record<string, string> = {};
    if (q.kind === "tiles" && q.multi) {
      if ((multiAnswers[q.key as string] ?? []).length === 0) e[q.key] = "Choose at least one";
    } else if (q.kind === "tiles") {
      if (!answers[q.key]) e[q.key] = "Please pick one to continue";
    } else {
      if (!answers[q.key].trim()) e[q.key] = "Please share a few words";
    }
    return e;
  }

  function handleStep0Continue() {
    const e = validateStep0();
    if (Object.keys(e).length) { setErrors(e); return; }
    goForward();
  }

  function handleQuestionContinue() {
    if (!currentQuestion) return;
    const e = validateQuestion(currentQuestion);
    if (Object.keys(e).length) { setErrors(e); return; }
    goForward();
  }

  async function submit() {
    const finalAnswers = buildFinalAnswers();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/seeker-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phoneWhatsapp: phoneWhatsapp.trim() || null,
          travelDates: travelDates.trim() || null,
          travelDatesFlexible,
          destinationRegion: destinationRegion.trim() || null,
          budgetRange: finalAnswers.budget || null,
          purpose: finalAnswers.mainIntention || null,
          answers: finalAnswers,
          reflectionIntention: reflectionIntention.trim() || null,
          reflectionGreatRetreat: reflectionGreatRetreat.trim() || null,
          reflectionSpecialRequests: reflectionSpecialRequests.trim() || null,
          idempotencyKey,
          company: (honeypotRef.current?.value || "").trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: json.error || "Something went wrong. Please try again." });
        setSubmitting(false);
        return;
      }
      router.push("/thank-you?source=discovery");
    } catch {
      setErrors({ form: "Failed to send. Please try again." });
      setSubmitting(false);
    }
  }

  const stepKey = `step-${step}-${direction}`;

  return (
    <div>
      {/* Honeypot */}
      <input
        ref={honeypotRef}
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        defaultValue=""
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {/* Progress bar */}
      {step > 0 && step < TOTAL_STEPS && (
        <ProgressBar current={step} total={TOTAL_STEPS - 1} />
      )}

      {/* Error alert */}
      {errors.form && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      {/* ── STEP 0: Quick start ─────────────────────────────────────────── */}
      {step === 0 && (
        <SlideIn stepKey={stepKey}>
          <div className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="seeker-fullName" className="block text-sm font-semibold text-stone-700">
                Your name
              </label>
              <input
                id="seeker-fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStep0Continue()}
                placeholder="First name is fine"
                aria-invalid={errors.fullName ? true : undefined}
                className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3.5 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="seeker-email" className="block text-sm font-semibold text-stone-700">
                Email — for your matches
              </label>
              <input
                id="seeker-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStep0Continue()}
                placeholder="you@example.com"
                aria-invalid={errors.email ? true : undefined}
                className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3.5 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="seeker-phoneWhatsapp" className="block text-sm font-semibold text-stone-700">
                WhatsApp / mobile{" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                id="seeker-phoneWhatsapp"
                name="phoneWhatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phoneWhatsapp}
                onChange={(e) => setPhoneWhatsapp(e.target.value)}
                placeholder="+1 555 000 0000"
                className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3.5 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleStep0Continue}
              className="mt-2 w-full rounded-xl bg-forest px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#345834] hover:shadow-md active:scale-[0.99]"
            >
              Start — let&apos;s find your retreat →
            </button>

            <p className="text-center text-xs text-stone-400">
              No spam. We send your matches and nothing else.
            </p>
          </div>
        </SlideIn>
      )}

      {/* ── STEPS 1–7: One question per screen ──────────────────────────── */}
      {step >= 1 && step <= QUESTIONS.length && currentQuestion && (
        <SlideIn stepKey={stepKey}>
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
                {currentQuestion.heading}
              </h2>
              {currentQuestion.sub && (
                <p className="mt-2 text-sm text-stone-500">{currentQuestion.sub}</p>
              )}
            </div>

            {currentQuestion.kind === "tiles" && (
              <>
                <div
                  role="group"
                  aria-label={currentQuestion.heading}
                  className={[
                    "grid gap-3",
                    currentQuestion.options.length <= 4
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3",
                  ].join(" ")}
                >
                  {currentQuestion.options.map((opt) => {
                    const isMulti = currentQuestion.multi;
                    const selected = isMulti
                      ? (multiAnswers[currentQuestion.key] ?? []).includes(opt.value)
                      : answers[currentQuestion.key] === opt.value;
                    return (
                      <Tile
                        key={opt.value}
                        option={opt}
                        selected={selected}
                        onClick={() =>
                          isMulti
                            ? toggleMulti(currentQuestion.key, opt.value)
                            : selectSingle(currentQuestion.key, opt.value)
                        }
                      />
                    );
                  })}
                </div>

                {errors[currentQuestion.key] && (
                  <p className="text-sm text-red-500">{errors[currentQuestion.key]}</p>
                )}

                {currentQuestion.multi && (
                  <button
                    type="button"
                    onClick={handleQuestionContinue}
                    className="w-full rounded-xl bg-forest px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[#345834] hover:shadow-md active:scale-[0.99]"
                  >
                    {(() => {
                      const n = (multiAnswers[currentQuestion.key] ?? []).length;
                      return n > 0 ? `Continue (${n} selected) →` : "Continue →";
                    })()}
                  </button>
                )}
              </>
            )}

            {currentQuestion.kind === "textarea" && (
              <div className="space-y-3">
                <textarea
                  id={`seeker-q-${currentQuestion.key}`}
                  name={currentQuestion.key}
                  rows={4}
                  autoFocus
                  autoComplete="off"
                  value={answers[currentQuestion.key]}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [currentQuestion.key]: e.target.value }))
                  }
                  placeholder={(currentQuestion as { placeholder: string }).placeholder}
                  aria-invalid={errors[currentQuestion.key] ? true : undefined}
                  className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3.5 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                />
                {errors[currentQuestion.key] && (
                  <p className="text-sm text-red-500">{errors[currentQuestion.key]}</p>
                )}
                <button
                  type="button"
                  onClick={handleQuestionContinue}
                  className="w-full rounded-xl bg-forest px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[#345834] hover:shadow-md active:scale-[0.99]"
                >
                  Continue →
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={goBack}
                className="text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
              >
                ← Back
              </button>
              {currentQuestion.kind === "tiles" && !currentQuestion.multi && (
                <p className="text-xs text-stone-400">Tap a card to continue</p>
              )}
            </div>
          </div>
        </SlideIn>
      )}

      {/* ── STEP 8: Reflection ──────────────────────────────────────────── */}
      {step === QUESTIONS.length + 1 && (
        <SlideIn stepKey={stepKey}>
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
                Almost done — a few final details
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Optional but they help us match you well.
              </p>
            </div>

            {/* Logistics */}
            <div className="space-y-4 rounded-2xl border border-beige bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                Logistics
              </p>
              <div className="space-y-1">
                <label htmlFor="seeker-travelDates" className="block text-sm font-semibold text-stone-700">
                  Approximate travel dates
                </label>
                <input
                  id="seeker-travelDates"
                  name="travelDates"
                  type="text"
                  autoComplete="off"
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. September 2026, or open"
                  className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-stone-500">
                  <input
                    type="checkbox"
                    checked={travelDatesFlexible}
                    onChange={(e) => setTravelDatesFlexible(e.target.checked)}
                    className="accent-forest"
                  />
                  My dates are flexible
                </label>
              </div>
              <div className="space-y-1">
                <label htmlFor="seeker-destinationRegion" className="block text-sm font-semibold text-stone-700">
                  Specific country or region{" "}
                  <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <input
                  id="seeker-destinationRegion"
                  name="destinationRegion"
                  type="text"
                  autoComplete="address-level1"
                  value={destinationRegion}
                  onChange={(e) => setDestinationRegion(e.target.value)}
                  placeholder="e.g. Bali, Peru, Spain"
                  className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Reflection */}
            <div className="space-y-4 rounded-2xl border border-beige bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                Reflection
              </p>
              <div className="space-y-1">
                <label htmlFor="seeker-reflection-intention" className="block text-sm font-semibold text-stone-700">
                  What intention are you bringing?
                </label>
                <textarea
                  id="seeker-reflection-intention"
                  rows={3}
                  autoComplete="off"
                  value={reflectionIntention}
                  onChange={(e) => setReflectionIntention(e.target.value)}
                  placeholder="In your own words — what is this retreat really about for you?"
                  className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="seeker-reflection-great" className="block text-sm font-semibold text-stone-700">
                  What would make this a truly great retreat?
                </label>
                <textarea
                  id="seeker-reflection-great"
                  rows={3}
                  autoComplete="off"
                  value={reflectionGreatRetreat}
                  onChange={(e) => setReflectionGreatRetreat(e.target.value)}
                  placeholder="Any specific wishes, must-haves, or things to avoid"
                  className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="seeker-reflection-special" className="block text-sm font-semibold text-stone-700">
                  Special requirements{" "}
                  <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <textarea
                  id="seeker-reflection-special"
                  rows={2}
                  autoComplete="off"
                  value={reflectionSpecialRequests}
                  onChange={(e) => setReflectionSpecialRequests(e.target.value)}
                  placeholder="Dietary, physical, religious, or accessibility needs"
                  className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="w-full rounded-xl bg-warm-brown px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-warm-brown/90 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? "Finding your matches…" : "Send — match me with retreats"}
            </button>

            <p className="text-center text-xs text-stone-400">
              By submitting you agree to our{" "}
              <a href="/privacy" className="underline hover:text-stone-600">
                privacy policy
              </a>
              . We use your answers only to match you with relevant retreats.
            </p>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
              >
                ← Back
              </button>
              <p className="text-xs text-stone-400">We respond within 24 h</p>
            </div>
          </div>
        </SlideIn>
      )}

      {step < TOTAL_STEPS && (
        <p className="mt-10 text-center text-xs text-stone-400">
          Prefer to browse?{" "}
          <Link href="/retreat-listings" className="font-medium text-warm-brown hover:underline">
            View all listings
          </Link>
        </p>
      )}
    </div>
  );
}
