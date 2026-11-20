import { ArrowRight, CalendarCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "BIR-compliant" },
  { icon: CalendarCheck2, label: "On-time filing" },
  { icon: LockKeyhole, label: "Confidential" },
] as const;

const HIGHLIGHTS = [
  "Monthly, Quarterly and Annual BIR Returns",
  "SLSP and Books Reconciled before Filing",
  "A Dedicated Accountant for your Business",
] as const;

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-mist">
      {/* Decorative background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-navy/5 blur-3xl"
      />

      <div className="container-page relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        {/* Firm logo, sitting inside the hero container above the headline.
            mix-blend-multiply drops the artwork's white background into the mist
            section so no box edge shows around it. It stays outside the animated
            column because that transform would isolate the blend. */}
        <div className="flex justify-center lg:col-span-2">
          <img
            src="/images/brand/a-and-t-eagles-logo.webp"
            alt="A & T Eagles Marketing and Consultancy Services OPC"
            width={1600}
            height={356}
            loading="eager"
            decoding="async"
            className="h-auto w-full max-w-[380px] select-none mix-blend-multiply sm:max-w-[540px] lg:max-w-[660px]"
          />
        </div>

        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy">
            <ShieldCheck className="h-4 w-4 text-gold-dark" aria-hidden="true" />
            Philippine accounting &amp; tax compliance
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy sm:text-5xl">
            Hassle-Free{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">BIR tax Filing</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 z-0 h-2.5 rounded-sm bg-gold/40"
              />
            </span>
            , and Bookkeeping for Philippine Businesses
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            We handle the returns, the Summary List of Sales and Purchases, and the
            books you would rather not chase — so you can focus on running the
            business. Clear pricing, no surprise BIR notices.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="btn-primary">
              Get a Free Consultation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#services"
              className="btn border border-navy/15 bg-white text-navy hover:border-navy/35 hover:bg-white"
            >
              Explore our Services
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Icon className="h-4 w-4 text-gold-dark" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Navy summary panel */}
        <div className="relative">
          <div className="rounded-2xl bg-navy p-7 text-white shadow-banner sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              Compliance Snapshot
            </p>
            <h2 className="mt-3 text-xl font-bold leading-snug text-white sm:text-2xl">
              Your Filings, Mapped and Monitored for the Whole Year.
            </h2>

            <ul className="mt-6 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-navy">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-300">
                  Response time
                </dt>
                <dd className="mt-1 text-lg font-bold text-gold">1 Business Day</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-300">
                  Coverage
                </dt>
                <dd className="mt-1 text-lg font-bold text-gold">Nationwide</dd>
              </div>
            </dl>
          </div>

          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-3 hidden h-24 w-24 rounded-2xl border-2 border-gold/50 sm:block"
          />
        </div>
      </div>
    </section>
  );
}
