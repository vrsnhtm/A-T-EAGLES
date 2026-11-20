import {
  CalendarClock,
  FileSpreadsheet,
  LockKeyhole,
  MessagesSquare,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const BENEFITS: readonly Benefit[] = [
  {
    icon: Target,
    title: "Accuracy you can audit",
    description:
      "Every return and report is prepared, then reviewed by a second accountant before it reaches you.",
  },
  {
    icon: CalendarClock,
    title: "Deadlines we track for you",
    description:
      "A filing calendar is set up for your business, with reminders ahead of every BIR due date.",
  },
  {
    icon: FileSpreadsheet,
    title: "SLSP, eFPS and eBIRForms expertise",
    description:
      "Hands-on experience with the Summary List of Sales and Purchases and the BIR's online filing systems.",
  },
  {
    icon: LockKeyhole,
    title: "Data privacy by design",
    description:
      "Your records are handled under RA 10173 (Data Privacy Act), with access limited to your engagement team.",
  },
  {
    icon: Wallet,
    title: "Pricing that makes sense",
    description:
      "Fixed monthly retainers and clearly quoted project fees — no hourly surprises or hidden charges.",
  },
  {
    icon: MessagesSquare,
    title: "One accountant, direct access",
    description:
      "Message the person who actually handles your account, not a rotating call center queue.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-white py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow">Why choose us</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              A Philippine accounting partner built around compliance.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              We work with SMEs, freelancers and growing companies that need
              filings done correctly and on time — without hiring a full in-house
              finance department.
            </p>
            <div className="mt-8 rounded-xl border-l-4 border-gold bg-mist p-5">
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-navy">Confidentiality first.</span>{" "}
                Documents are shared through secure channels, and we follow the
                Data Privacy Act of 2012 (RA 10173) in everything we process.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-gold/50 hover:shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy-soft group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
