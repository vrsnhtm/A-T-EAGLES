import { Eye, HeartHandshake, ListChecks, Target, type LucideIcon } from "lucide-react";

type Pillar = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const PILLARS: readonly Pillar[] = [
  {
    icon: Eye,
    title: "Vision",
    body:
      "Like the eagle with high level perspectives—our vision is for businesses small and large who are utilizing our consultancy and marketing services to feel empowered knowing that whatever wide variety of services that are needed are in the competent care of A&T Eagles Marketing and Consultancy Services OPC.",
  },
  {
    icon: Target,
    title: "Mission",
    body:
      "Our mission is to facilitate seamlessly efficient business operations for our clients through professional, trustworthy, and responsive consultancy services paying utmost attention to accuracy and compliance.",
  },
];

const OBJECTIVES: readonly string[] = [
  "Improve the accuracy and reliability of financial reporting processes within the accounting function.",
  "Make financial success accessible.",
  "Build trust through transparency and personalized financial solutions.",
  "Enhance financial performance and the organization's cash flow management.",
  "Ensure robust adherence to regulatory and compliance standards within the accounting and business function.",
];

const VALUES: readonly string[] = [
  "We are honest and passionate in our auditing, tax and consulting work as we seek our client's need for real change and success.",
  "We have excellent ethical behavior and honesty in providing business services.",
  "We provide quality and accurate results that are necessary in business improvement.",
  "We are open to all of our clients' concerns and needs.",
];

/**
 * About Us: the whole story sits inside one navy panel with gold accents,
 * so the copy reads as white text on the brand background.
 */
export default function AboutUs() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-light to-navy-soft p-7 shadow-banner sm:p-10 lg:p-12">
          {/* Decorative brand accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              About Us
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl">
              A&T Eagles Marketing and Consultancy Services OPC
            </h2>

            <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-200 sm:text-base">
              <p>
                At A&T Eagles Marketing and Consultancy Services OPC, we focus on
                what matters most to you and provide a service to meet and
                consistently exceed your expectations. Our business is based in
                Malabon, Philippines and provides audit, tax, business consulting
                and human resources services to a wide range of clients including
                individuals, SMEs and large businesses.
              </p>
              <p>
                We serve a wide range of industries and professions. We are
                committed to providing the highest level of professional and
                personalized services in a cost effective manner—from individual
                tax planning services to complex corporate audits and consulting
                engagements.
              </p>
              <p>
                We pride ourselves on building long-term relationships with our
                clients. This means regular contact. This is not once a year, but
                throughout the year, so you can be confident about receiving the
                right advice and the right service at the right time to help you
                reach your goals.
              </p>
            </div>

            {/* Vision and Mission */}
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-navy">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-gold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            {/* Objectives and Values */}
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-navy">
                  <ListChecks className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-gold">
                  Our Business Objectives
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {OBJECTIVES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-200"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-navy">
                  <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-gold">
                  Our Business Values
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {VALUES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-200"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
