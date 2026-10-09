"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconYoga, IconLotus, IconHerb, IconSoundWave, IconBody,
  IconSpa, IconCompass, IconBolt, IconBrush, IconSparkles,
  IconMountains, IconOcean, IconJungle, IconCactus, IconTemple, IconHills, IconMap,
  IconSunrise, IconCalendar, IconMoonStar, IconInfinity, IconLeaf,
  IconPerson, IconCouple, IconGroup, IconUsers, IconPeople,
  IconCircle, IconGem, IconDiamond, IconCrown, IconSpiral,
} from "@/components/ui/icons/retreat-icons";
import { RETREAT_CATEGORY_TILE_OPTIONS } from "@/lib/retreat-categories";

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

const ic = "h-6 w-6";

const CATEGORY_ICON: Record<string, React.ReactElement> = {
  yoga: <IconYoga className={ic} />,
  meditation: <IconLotus className={ic} />,
  plant: <IconHerb className={ic} />,
  sound_healing: <IconSoundWave className={ic} />,
  somatic: <IconBody className={ic} />,
  wellness: <IconSpa className={ic} />,
  adventure: <IconCompass className={ic} />,
  leadership: <IconBolt className={ic} />,
  creative: <IconBrush className={ic} />,
  spiritual: <IconSparkles className={ic} />,
};

const categoryTileOptions: TileOption[] = RETREAT_CATEGORY_TILE_OPTIONS.filter(
  (t) => !["plant", "spiritual"].includes(t.value)
).map((t) => ({
  value: t.value,
  label: t.label.replace(/ Retreat$/, ""),
  icon: CATEGORY_ICON[t.value] ?? <IconSparkles className={ic} />,
  sub: t.sub,
}));

const QUESTIONS: QuestionDef[] = [
  {
    kind: "tiles",
    key: "ownerType",
    heading: "How do you operate your retreat?",
    sub: "Venue-only hosts space; program operators run the full experience.",
    options: [
      { value: "venue_only", label: "Venue only", icon: <IconTemple className={ic} />, sub: "Space & hospitality" },
      { value: "program_operator", label: "Program operator", icon: <IconSparkles className={ic} />, sub: "Full programme & facilitation" },
    ],
  },
  {
    kind: "tiles",
    key: "category",
    heading: "What type of retreat are you offering?",
    sub: "Choose all that describe your retreat.",
    multi: true,
    options: categoryTileOptions,
  },
  {
    kind: "tiles",
    key: "environment",
    heading: "Where is your retreat located?",
    sub: "The landscape shapes the experience.",
    options: [
      { value: "mountains", label: "Mountains",       icon: <IconMountains className={ic} />, sub: "Altitude & silence" },
      { value: "ocean",     label: "Ocean & beach",   icon: <IconOcean className={ic} />,     sub: "Salt air & waves" },
      { value: "jungle",    label: "Jungle & forest", icon: <IconJungle className={ic} />,    sub: "Wild & verdant" },
      { value: "desert",    label: "Desert",          icon: <IconCactus className={ic} />,    sub: "Vast & ancient" },
      { value: "sacred",    label: "Sacred site",     icon: <IconTemple className={ic} />,    sub: "Temples & centers" },
      { value: "country",   label: "Countryside",     icon: <IconHills className={ic} />,     sub: "Pastoral & slow" },
      { value: "anywhere",  label: "Multiple / other", icon: <IconMap className={ic} />,      sub: "Various locations" },
    ],
  },
  {
    kind: "tiles",
    key: "duration",
    heading: "How long is the retreat?",
    options: [
      { value: "weekend",  label: "Weekend",    icon: <IconSunrise className={ic} />,  sub: "2–3 days" },
      { value: "week",     label: "One week",   icon: <IconCalendar className={ic} />, sub: "5–7 days" },
      { value: "twoweeks", label: "Two weeks",  icon: <IconMoonStar className={ic} />, sub: "10–14 days" },
      { value: "month",    label: "A month +",  icon: <IconLeaf className={ic} />,     sub: "Deep immersion" },
      { value: "flexible", label: "Variable",   icon: <IconInfinity className={ic} />, sub: "Multiple lengths" },
    ],
  },
  {
    kind: "tiles",
    key: "capacity",
    heading: "How many guests can you host?",
    sub: "Maximum capacity per retreat.",
    options: [
      { value: "intimate", label: "Intimate",      icon: <IconPerson className={ic} />,  sub: "1–6 guests" },
      { value: "small",    label: "Small group",   icon: <IconCouple className={ic} />,  sub: "6–14 guests" },
      { value: "medium",   label: "Medium group",  icon: <IconGroup className={ic} />,   sub: "14–30 guests" },
      { value: "large",    label: "Large group",   icon: <IconUsers className={ic} />,   sub: "30–60 guests" },
      { value: "grand",    label: "Grand event",   icon: <IconPeople className={ic} />,  sub: "60+ guests" },
    ],
  },
  {
    kind: "tiles",
    key: "priceRange",
    heading: "What's the price per person?",
    sub: "All-inclusive per guest.",
    options: [
      { value: "under1000", label: "Under $1,000",     icon: <IconCircle className={ic} />,  sub: "Accessible" },
      { value: "1000-2500", label: "$1,000 – $2,500",  icon: <IconGem className={ic} />,     sub: "Mid-range" },
      { value: "2500-5000", label: "$2,500 – $5,000",  icon: <IconDiamond className={ic} />, sub: "Premium" },
      { value: "5000plus",  label: "$5,000+",           icon: <IconCrown className={ic} />,   sub: "Luxury immersion" },
      { value: "custom",    label: "Custom / variable", icon: <IconSpiral className={ic} />,  sub: "Contact for pricing" },
    ],
  },
  {
    kind: "details",
    heading: "Almost there — the final details",
    sub: "Tell us more about your retreat so we can list it accurately.",
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
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-10">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-stone-400 tabular-nums">
          {current} of {total}
        </span>
        <span className="text-xs font-medium text-warm-brown tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
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

// ---------------------------------------------------------------------------
// Slide-in animation wrapper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function RetreatIntakeForm() {
  const router = useRouter();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 0 — contact
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

  // Tile answers
  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({
    category: [],
  });

  // Step 6 — details
  const [retreatTitle, setRetreatTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [facilitatorNotes, setFacilitatorNotes] = useState("");
  const [categoryOther, setCategoryOther] = useState("");

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

  function selectSingle(key: string, value: string) {
    setSingleAnswers((a) => ({ ...a, [key]: value }));
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

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!contactName.trim()) e.contactName = "Please tell us your name";
    if (!email.trim()) e.email = "We need your email to follow up";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "That email doesn't look right";
    return e;
  }

  function validateQuestion(q: QuestionDef): Record<string, string> {
    if (q.kind === "details") {
      const e: Record<string, string> = {};
      if (!retreatTitle.trim()) e.retreatTitle = "Retreat title is required";
      return e;
    }
    const e: Record<string, string> = {};
    if (q.kind === "tiles" && q.multi) {
      if ((multiAnswers[q.key] ?? []).length === 0)
        e[q.key] = "Choose at least one";
    } else if (q.kind === "tiles") {
      if (!singleAnswers[q.key]) e[q.key] = "Please pick one to continue";
    }
    return e;
  }

  function handleStep0Continue() {
    const e = validateStep0();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    goForward();
  }

  function handleQuestionContinue() {
    if (!currentQuestion) return;
    const e = validateQuestion(currentQuestion);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    goForward();
  }

  async function submit() {
    if (!currentQuestion || currentQuestion.kind !== "details") return;
    const e = validateQuestion(currentQuestion);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const payload = {
      contactName: contactName.trim(),
      email: email.trim(),
      company: (honeypotRef.current?.value || "").trim(),
      retreatTitle: retreatTitle.trim(),
      location: location.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
      description: description.trim() || null,
      capacity:
        singleAnswers.capacity
          ? { intimate: 6, small: 14, medium: 30, large: 60, grand: 100 }[
              singleAnswers.capacity
            ] ?? null
          : null,
      priceRange: singleAnswers.priceRange ?? null,
      facilitatorNotes: facilitatorNotes.trim() || null,
      ownerType:     singleAnswers.ownerType ?? null,
      category:    multiAnswers.category ?? [],
      categoryOther:
        (multiAnswers.category ?? []).includes("other")
          ? categoryOther.trim() || null
          : null,
      environment: singleAnswers.environment ?? null,
      duration:    singleAnswers.duration ?? null,
    };

    try {
      const res = await fetch("/api/retreat-submission", {
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
      router.push("/thank-you?source=retreat-intake");
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  const stepKey = `step-${step}-${direction}`;

  // ── Success state ──────────────────────────────────────────────────────────
  // (handled by router.push to /thank-you)

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
        <div
          role="alert"
          className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errors.form}
        </div>
      )}

      {/* ── STEP 0: Contact ──────────────────────────────────────────────── */}
      {step === 0 && (
        <SlideIn stepKey={stepKey}>
          <div className="space-y-5">
            <div className="space-y-1">
              <label
                htmlFor="ri-contactName"
                className="block text-sm font-semibold text-stone-700"
              >
                Your name
              </label>
              <input
                id="ri-contactName"
                name="contactName"
                type="text"
                autoComplete="name"
                autoFocus
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStep0Continue()}
                placeholder="First name is fine"
                aria-invalid={errors.contactName ? true : undefined}
                className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3.5 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
              />
              {errors.contactName && (
                <p className="text-sm text-red-500">{errors.contactName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="ri-email"
                className="block text-sm font-semibold text-stone-700"
              >
                Email — for listing updates
              </label>
              <input
                id="ri-email"
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
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="ri-description"
                className="block text-sm font-semibold text-stone-700"
              >
                Tell us about your retreat{" "}
                <span className="font-normal text-stone-400">
                  (optional — you can refine it later)
                </span>
              </label>
              <textarea
                id="ri-description"
                name="description"
                rows={4}
                autoComplete="off"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The experience, what guests will feel and take away, the arc of the days…"
                className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleStep0Continue}
              className="mt-2 w-full rounded-xl bg-forest px-6 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#345834] hover:shadow-md active:scale-[0.99]"
            >
              Start — list your retreat →
            </button>

            <p className="text-center text-xs text-stone-400">
              Takes about 2 minutes. We review all submissions personally.
            </p>
          </div>
        </SlideIn>
      )}

      {/* ── STEPS 1–6: Questions ─────────────────────────────────────────── */}
      {step >= 1 && step <= QUESTIONS.length && currentQuestion && (
        <SlideIn stepKey={stepKey}>
          <div className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
                {currentQuestion.heading}
              </h2>
              {currentQuestion.sub && (
                <p className="mt-2 text-sm text-stone-500">
                  {currentQuestion.sub}
                </p>
              )}
            </div>

            {/* ── Tile question ─────────────────────────────────────────── */}
            {currentQuestion.kind === "tiles" && (
              <>
                <div
                  role="group"
                  aria-label={currentQuestion.heading}
                  className={[
                    "grid gap-3",
                    currentQuestion.options.length <= 4
                      ? "grid-cols-2"
                      : currentQuestion.options.length <= 5
                      ? "grid-cols-2 sm:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3",
                  ].join(" ")}
                >
                  {currentQuestion.options.map((opt) => {
                    const isMulti = currentQuestion.multi;
                    const selected = isMulti
                      ? (multiAnswers[currentQuestion.key] ?? []).includes(
                          opt.value
                        )
                      : singleAnswers[currentQuestion.key] === opt.value;
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
                  <p className="text-sm text-red-500">
                    {errors[currentQuestion.key]}
                  </p>
                )}

                {currentQuestion.key === "category" &&
                  (multiAnswers.category ?? []).includes("other") && (
                    <div className="space-y-1">
                      <label
                        htmlFor="ri-categoryOther"
                        className="block text-sm font-semibold text-stone-700"
                      >
                        Describe your retreat type
                      </label>
                      <input
                        id="ri-categoryOther"
                        type="text"
                        value={categoryOther}
                        onChange={(e) => setCategoryOther(e.target.value)}
                        placeholder="e.g. Ayahuasca integration, men's circle"
                        className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 focus:border-forest focus:outline-none"
                      />
                    </div>
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

            {/* ── Details question (last step) ─────────────────────────── */}
            {currentQuestion.kind === "details" && (
              <div className="space-y-5">
                {/* Core info */}
                <div className="space-y-4 rounded-2xl border border-beige bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Core info
                  </p>

                  <div className="space-y-1">
                    <label
                      htmlFor="ri-retreatTitle"
                      className="block text-sm font-semibold text-stone-700"
                    >
                      Retreat title *
                    </label>
                    <input
                      id="ri-retreatTitle"
                      name="retreatTitle"
                      type="text"
                      autoComplete="off"
                      autoFocus
                      value={retreatTitle}
                      onChange={(e) => setRetreatTitle(e.target.value)}
                      placeholder="e.g. Sacred Valley Ayahuasca Retreat"
                      aria-invalid={errors.retreatTitle ? true : undefined}
                      className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                    />
                    {errors.retreatTitle && (
                      <p className="text-sm text-red-500">
                        {errors.retreatTitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="ri-location"
                      className="block text-sm font-semibold text-stone-700"
                    >
                      Location{" "}
                      <span className="font-normal text-stone-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="ri-location"
                      name="location"
                      type="text"
                      autoComplete="address-level2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Ubud, Bali, Indonesia"
                      className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 placeholder:text-stone-300 focus:border-forest focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4 rounded-2xl border border-beige bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Dates
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="ri-startDate"
                        className="block text-sm font-semibold text-stone-700"
                      >
                        Start date
                      </label>
                      <input
                        id="ri-startDate"
                        name="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 focus:border-forest focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="ri-endDate"
                        className="block text-sm font-semibold text-stone-700"
                      >
                        End date
                      </label>
                      <input
                        id="ri-endDate"
                        name="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-full rounded-xl border-2 border-beige bg-white px-4 py-3 text-stone-900 focus:border-forest focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Facilitator */}
                <div className="space-y-4 rounded-2xl border border-beige bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Facilitator
                  </p>
                  <div className="space-y-1">
                    <label
                      htmlFor="ri-facilitatorNotes"
                      className="block text-sm font-semibold text-stone-700"
                    >
                      Facilitator notes{" "}
                      <span className="font-normal text-stone-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="ri-facilitatorNotes"
                      name="facilitatorNotes"
                      rows={3}
                      autoComplete="off"
                      value={facilitatorNotes}
                      onChange={(e) => setFacilitatorNotes(e.target.value)}
                      placeholder="Who leads this, their background, any certifications or lineage"
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
                  {submitting ? "Submitting your retreat…" : "Submit for review →"}
                </button>

                <p className="text-center text-xs text-stone-400">
                  Submissions are reviewed within 48 h. We&apos;ll follow up by
                  email. By submitting you agree to our{" "}
                  <a href="/privacy" className="underline hover:text-stone-600">
                    privacy policy
                  </a>
                  .
                </p>
              </div>
            )}

            {/* Nav row */}
            {currentQuestion.kind !== "details" && (
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
            )}

            {currentQuestion.kind === "details" && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        </SlideIn>
      )}

      {step < TOTAL_STEPS && (
        <p className="mt-10 text-center text-xs text-stone-400">
          Already listed?{" "}
          <Link
            href="/why-work-with-us"
            className="font-medium text-river-teal hover:underline"
          >
            Back to Why list with us
          </Link>
        </p>
      )}
    </div>
  );
}
