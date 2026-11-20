import { Eye, HeartHandshake, ListChecks, Target, type LucideIcon } from "lucide-react";

type Pillar = {
  icon: LucideIcon;
  title: string;
  body?: string;
  points?: readonly string[];
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
  {
    icon: ListChecks,
    title: "Our Business Objectives",
    points: [
      "Improve the accuracy and reliability of financial reporting processes within the accounting function.",
      "Make financial success accessible.",
      "Build trust through transparency and personalized financial solutions.",
      "Enhance financial performance and the organization's cash flow management.",
      "Ensure robust adherence to regulatory and compliance standards within the accounting and business function.",
    ],
  },
  {
    icon: HeartHandshake,
    title: "Our Business Values",
    points: [
      "We are honest and passionate in our auditing, tax and consulting work as we seek our client's need for real change and success.",
      "We have excellent ethical behavior and honesty in providing business services.",
      "We provide quality and accurate results that are necessary in business improvement.",
      "We are open to all of our clients' concerns and needs.",
    ],
  },
];

/**
 * About Us, built on the same card language as the Services grid:
 * white cards, navy icon tile that fills in on hover, gold accent.
 */
export default function AboutUs() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">About us</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            A&T Eagles Marketing and Consultancy Services OPC
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            We focus on what matters most to you and provide a service to meet and
            consistently exceed your expectations — for individuals, SMEs and large
            businesses across a wide range of industries and professions.
          </p>
        </div>

        <div className="mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
          <p>
            Our business is based in Malabon, Philippines and provides audit, tax,
            business consulting and human resources services to a wide range of
            clients. We are committed to providing the highest level of professional
            and personalized services in a cost effective manner—from individual tax
            planning services to complex corporate audits and consulting
            engagements.
          </p>
          <p>
            We pride ourselves on building long-term relationships with our clients.
            This means regular contact. This is not once a year, but throughout the
            year, so you can be confident about receiving the right advice and the
            right service at the right time to help you reach your goals.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, body, points }) => (
            <article
              key={title}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy-soft group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-bold leading-snug text-navy">
                {title}
              </h3>

              {body && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {body}
                </p>
              )}

              {points && (
                <ul className="mt-3 flex-1 space-y-2.5">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
