import {
  ClipboardList,
  FileCheck2,
  FolderOpen,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: readonly Step[] = [
  {
    icon: ClipboardList,
    title: "Submit your inquiry",
    description:
      "Tell us your business type, the service you need, and your target filing date.",
  },
  {
    icon: MessagesSquare,
    title: "Free consultation",
    description:
      "We review your situation, confirm what is due, and send a clear scope and quote.",
  },
  {
    icon: FolderOpen,
    title: "Document collection",
    description:
      "Share your sales, purchases and receipts through a secure checklist we provide.",
  },
  {
    icon: FileCheck2,
    title: "We file and report",
    description:
      "Returns and SLSP are prepared, reviewed and filed, with confirmation sent to you.",
  },
];

export default function Process() {
  return (
    <section id="process" className="bg-mist py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            From first message to filed returns in four steps.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            No lengthy onboarding calls, no unclear deliverables. Here is exactly
            what working with us looks like.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:border-gold/50 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy-soft group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-3xl font-extrabold tracking-tight text-navy/10">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
