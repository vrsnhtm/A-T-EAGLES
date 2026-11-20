import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import { ArrowLeft, ArrowRight, Check, Pause, Play, Sparkles } from "lucide-react";

/** How long each slide stays before the deck advances on its own. */
const AUTOPLAY_MS = 6000;

type InsightSlide = {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  takeaways: string[];
  ctaLabel: string;
  image: string;
  alt: string;
};

/**
 * The firm's social infographics, re-cut as an interactive slide deck.
 * Artwork lives in /public/images/insights/ — swap a file to change a slide.
 */
const SLIDES: InsightSlide[] = [
  {
    id: "bookkeeping",
    kicker: "Compliance 101",
    title: "Bookkeeping is the foundation every filing stands on",
    summary:
      "Clean records are not paperwork — they are the evidence behind every BIR return, loan application and investor conversation. Startups that keep books from day one spend less on catch-up work later.",
    takeaways: [
      "Stay compliant with BIR and local requirements",
      "Always know your real cash flow",
      "Be ready for taxes, audits and financing",
    ],
    ctaLabel: "Start with monthly bookkeeping",
    image: "/images/insights/01-bookkeeping-tips.webp",
    alt: "Infographic: why bookkeeping matters for startups and SMEs, with five compliance tips",
  },
  {
    id: "services",
    kicker: "One partner",
    title: "Accounting and tax handled by one team, not three",
    summary:
      "Bookkeeping, BIR schedules, payroll and advisory pull on the same numbers. Keeping them with one team removes the hand-offs where deadlines and reconciliations usually slip.",
    takeaways: [
      "Books of accounts set up and kept BIR-compliant",
      "1601-C, 1601-E, 1603, 1604-CF, 0619-E, 1701 and 1702 prepared",
      "VAT and withholding reconciled before filing",
    ],
    ctaLabel: "See the full service list",
    image: "/images/insights/02-accounting-tax-services.webp",
    alt: "Infographic: A&T Eagles accounting and tax services, who they serve, and contact details",
  },
  {
    id: "registration",
    kicker: "Feature Friday",
    title: "BIR complete registration, without the queue",
    summary:
      "New business, branch or new tax type — registration is the step where most owners lose a week to queues and re-submissions. We prepare the requirements, file them, and hand you the certificates and books ready to use.",
    takeaways: [
      "TIN application and business name registration",
      "Authority to Print (ATP) and registration of books of accounts",
      "BIR Forms 1901 and 0605, plus other related requirements",
    ],
    ctaLabel: "Register my business with the BIR",
    image: "/images/insights/08-bir-registration.webp",
    alt: "Infographic: Feature Friday — BIR complete registration, with the inclusions listed",
  },
  {
    id: "dti-fees",
    kicker: "Business Bytes",
    title: "Your DTI business name fee depends on how far it reaches",
    summary:
      "Registering a business name is priced by territorial scope, and the choice is easy to get wrong: pay for national coverage when you only trade in one city and the extra cost buys nothing. Here is the fee ladder so you can budget before you file.",
    takeaways: [
      "Barangay ₱200 · City or municipality ₱500",
      "Regional ₱1,000 · National ₱2,000",
      "A ₱30 documentary stamp tax is required on top",
    ],
    ctaLabel: "Register my business name",
    image: "/images/insights/09-dti-registration-fees.webp",
    alt: "Infographic: Business Bytes — DTI business name registration fees by barangay, city, regional and national scope",
  },
  {
    id: "retention",
    kicker: "Retention strategy",
    title: "Your next client is probably already on your list",
    summary:
      "Chasing new business while neglecting existing customers is the most common growth mistake we see. Retention is cheaper than acquisition — and it compounds.",
    takeaways: [
      "Follow up with a check-in, not just an invoice",
      "Give loyal clients service that feels personal",
      "Give them a reason to stay, not just a price",
    ],
    ctaLabel: "Talk about your client retention",
    image: "/images/insights/03-retaining-existing-clients.webp",
    alt: "Infographic: common business mistakes to avoid when neglecting existing customers",
  },
  {
    id: "alignment",
    kicker: "Growth operations",
    title: "Sales and marketing work best as one team",
    summary:
      "When the two sides compete, leads leak, messaging drifts and budget is spent twice. Shared targets and a clear handoff turn the same spend into booked consultations.",
    takeaways: [
      "Define shared targets instead of separate scoreboards",
      "Agree a clear lead handoff process",
      "Use one consistent message across every channel",
    ],
    ctaLabel: "Review your growth process",
    image: "/images/insights/04-sales-marketing-alignment.webp",
    alt: "Infographic: common business mistakes to avoid when sales and marketing work as competitors",
  },
  {
    id: "tax",
    kicker: "Tax risk",
    title: "Small tax mistakes become expensive penalties",
    summary:
      "Interest and compromise penalties usually start with a missed registration update or a reconciliation left until the deadline. Compliance is a routine, not a year-end scramble.",
    takeaways: [
      "Keep business and tax registration current",
      "File and pay on time, every period",
      "Reconcile sales, expenses and bank records monthly",
    ],
    ctaLabel: "Get a compliance review",
    image: "/images/insights/05-avoid-tax-issues.webp",
    alt: "Infographic: Tax Tips Tuesday — how to avoid small business tax issues in the Philippines",
  },
  {
    id: "client-success",
    kicker: "Client-first mindset",
    title: "A strong business grows the right way",
    summary:
      "Growth that ignores the client experience is just volume. The firms that last ask a better question: what else can we do to help this business succeed?",
    takeaways: [
      "Measure success by client outcomes, not billings",
      "Build partnerships on trust and service",
      "Turn one engagement into a long-term relationship",
    ],
    ctaLabel: "Tell us what your business needs",
    image: "/images/insights/06-client-success-reflection.webp",
    alt: "Infographic: Weekly Business Reflection — what more can we do for our clients",
  },
  {
    id: "capital",
    kicker: "Cash & capital",
    title: "Strengthen capitalization before you need it",
    summary:
      "Working capital is built in ordinary months: reinvesting part of the profit, collecting on time, and keeping personal and business money separate. Financing is easier when the books already prove the story.",
    takeaways: [
      "Reinvest a share of profits instead of withdrawing everything",
      "Tighten collections and control unnecessary spending",
      "Keep bookkeeping current so lenders can see the real numbers",
    ],
    ctaLabel: "Plan your capital strategy",
    image: "/images/insights/07-improve-capitalization.webp",
    alt: "Infographic: Business Bytes — how to improve business capitalization, in Filipino",
  },
];

const PAIN_POINTS = [
  {
    id: "books",
    label: "My books are behind or messy",
    recommendation:
      "Accounting records clean-up and catch-up, then monthly bookkeeping so the books never fall behind again.",
  },
  {
    id: "filings",
    label: "I am not sure which BIR returns are due",
    recommendation:
      "A compliance review of your registration and filing calendar, then preparation and filing of every return due.",
  },
  {
    id: "payroll",
    label: "Payroll and remittances eat my time",
    recommendation:
      "Payroll processing with payslips and statutory remittances handled on schedule, every cut-off.",
  },
  {
    id: "growth",
    label: "I am planning to expand or raise capital",
    recommendation:
      "Financial statement preparation and advisory so your numbers are lender-ready and investor-ready.",
  },
] as const;

export default function InsightsDeck() {
  const [index, setIndex] = useState(0);
  const [painPoint, setPainPoint] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);

  const total = SLIDES.length;
  const slide = SLIDES[index];
  const selected = PAIN_POINTS.find((point) => point.id === painPoint) ?? null;

  const goTo = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Arrow keys work while the deck region has focus.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) next();
    else prev();
  };

  // Preload the neighbouring artwork so arrow presses feel instant.
  useEffect(() => {
    const neighbours = [SLIDES[index - 1], SLIDES[index + 1]].filter(Boolean);
    neighbours.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, [index]);

  // Respect the visitor's reduced-motion setting: no automatic sliding for them.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) setIsPlaying(false);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsPlaying(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Only advance while the deck is actually visible on screen.
  useEffect(() => {
    const node = deckRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Automatic sliding: pauses on hover, focus, manual toggle, or off-screen.
  useEffect(() => {
    if (!isPlaying || isPaused || !isOnScreen) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [isPlaying, isPaused, isOnScreen, index, total]);

  const progress = ((index + 1) / total) * 100;

  return (
    <section id="insights" className="border-y border-navy/10 bg-white py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Business Insights Series · 9 slides</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            A 60-second business check-up for growing companies.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            The lessons we share with clients every week, collected into one deck.
            Move through it at your own pace — every slide ends with the move we
            would make next, and the last panel points you to the service that
            fits your situation.
          </p>
        </div>

        {/* Deck */}
        <div
          ref={deckRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="A&T Business Insights slide deck"
          aria-live={isPlaying && !isPaused ? "off" : "polite"}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          className="mt-10 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card focus-visible:ring-2 focus-visible:ring-gold"
        >
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Artwork */}
            <div className="relative order-1 bg-mist p-4 sm:p-6">
              <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
                <img
                  key={slide.id}
                  src={slide.image}
                  alt={slide.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-auto w-full animate-fade-up object-cover"
                  width={1254}
                  height={1254}
                />
              </div>
              <span className="absolute left-7 top-7 rounded-full bg-navy/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-white sm:left-9 sm:top-9">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            {/* Copy */}
            <div className="order-2 flex flex-col justify-center p-6 sm:p-9">
              <p className="eyebrow">{slide.kicker}</p>
              <h3 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-navy sm:text-[28px]">
                {slide.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                {slide.summary}
              </p>

              <ul className="mt-6 space-y-2.5">
                {slide.takeaways.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#contact" className="btn-primary">
                  {slide.ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <button type="button" onClick={next} className="btn border border-navy/15 text-navy hover:bg-mist">
                  Next insight
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-t border-navy/10 bg-mist/60 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:border-gold hover:bg-gold/10"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:border-gold hover:bg-gold/10"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((playing) => !playing)}
                aria-label={isPlaying ? "Pause automatic slideshow" : "Play automatic slideshow"}
                aria-pressed={isPlaying}
                title={isPlaying ? "Pause automatic slideshow" : "Play automatic slideshow"}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:border-gold hover:bg-gold/10"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5">
                {SLIDES.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(itemIndex)}
                    aria-label={`Go to slide ${itemIndex + 1}: ${item.title}`}
                    aria-current={itemIndex === index ? "true" : undefined}
                    title={item.kicker}
                    className={`h-2 shrink-0 rounded-full transition-all ${
                      itemIndex === index ? "w-8 bg-gold" : "w-2 bg-navy/20 hover:bg-navy/40"
                    }`}
                  />
                ))}
              </div>

              <p className="hidden shrink-0 text-xs font-medium text-slate-500 sm:block">
                {isPlaying ? "Auto-playing" : "Paused"} · ← → keys
              </p>
            </div>

            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-navy/10">
              <div
                className="h-full rounded-full bg-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail rail */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {SLIDES.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(itemIndex)}
              aria-label={`Open slide ${itemIndex + 1}: ${item.title}`}
              className={`group relative w-24 shrink-0 overflow-hidden rounded-lg border bg-white transition-all ${
                itemIndex === index
                  ? "border-gold ring-2 ring-gold/40"
                  : "border-navy/10 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={item.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-20 w-full object-cover"
              />
              <span className="block truncate px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {item.kicker}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive self-check */}
        <div className="mt-10 rounded-2xl border border-navy/10 bg-navy p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-gold">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Interactive check · 1 question
            </p>
          </div>
          <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
            What is costing your business the most right now?
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            Pick the one that sounds closest. We will point you to the engagement
            that usually fixes it first.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {PAIN_POINTS.map((point) => {
              const active = point.id === painPoint;
              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setPainPoint(active ? null : point.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-gold bg-gold text-navy"
                      : "border-white/25 bg-white/5 text-white hover:border-gold/60 hover:bg-white/10"
                  }`}
                >
                  {point.label}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" className="mt-5 min-h-[76px]">
            {selected ? (
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                  Recommended starting point
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">
                  {selected.recommendation}
                </p>
                <a
                  href="#contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
                >
                  Book a free consultation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Choose an option above to see the recommended service.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
