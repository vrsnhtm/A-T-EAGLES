import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  Building2,
  FileSpreadsheet,
  SearchCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SERVICE_OPTIONS, type ServiceOption } from "../lib/validation";

type ServiceDetail = {
  icon: LucideIcon;
  description: string;
};

/**
 * Descriptions are keyed by the exact service names used in the inquiry form,
 * so the grid and the dropdown can never drift apart.
 */
const SERVICE_DETAILS: Record<ServiceOption, ServiceDetail> = {
  "Monthly Bookkeeping & Financial Reporting": {
    icon: BookOpenCheck,
    description:
      "Clean, reconciled books every month with financial statements and management reports you can actually read.",
  },
  "Tax Preparation & Compliance Filing": {
    icon: FileSpreadsheet,
    description:
      "BIR returns prepared, reviewed and filed on time — withholding tax, VAT, percentage tax and income tax.",
  },
  "Business Registration & Permit Renewal": {
    icon: Building2,
    description:
      "DTI or SEC registration, BIR and Mayor's permit processing, and annual renewals without the queue.",
  },
  "Payroll Management & Remittances": {
    icon: Wallet,
    description:
      "Payroll runs, payslips, and SSS, PhilHealth, Pag-IBIG and withholding tax remittances handled accurately.",
  },
  "Financial Audit & Advisory": {
    icon: SearchCheck,
    description:
      "Independent audits and practical advisory support for financing, expansion or year-end reporting.",
  },
  "Full-Service Retainer": {
    icon: Briefcase,
    description:
      "One team for bookkeeping, tax, payroll and compliance, with a fixed monthly fee and a dedicated accountant.",
  },
};

export default function Services() {
  return (
    <section id="services" className="bg-white py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Our services</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Accounting and BIR compliance, handled end to end.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Whether you need one filing or a full finance team, each engagement is
            scoped clearly, priced up front, and delivered by accountants who work
            with the BIR every day.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_OPTIONS.map((service) => {
            const { icon: Icon, description } = SERVICE_DETAILS[service];
            return (
              <article
                key={service}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-gold/50 hover:shadow-card-hover"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-gold">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-bold leading-snug text-navy">
                  {service}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-gold-dark"
                >
                  Inquire about this
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
