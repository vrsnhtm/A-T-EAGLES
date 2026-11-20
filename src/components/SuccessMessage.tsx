import { ArrowRight, CheckCircle2 } from "lucide-react";

type SuccessMessageProps = {
  /** Name submitted with the inquiry, used for a personal confirmation. */
  fullName: string;
  /** Returns the form to its initial state so a new inquiry can be sent. */
  onReset: () => void;
};

export default function SuccessMessage({ fullName, onReset }: SuccessMessageProps) {
  const firstName = fullName.trim().split(/\s+/)[0] ?? "there";

  return (
    <div role="status" aria-live="polite" className="animate-fade-up">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
        <CheckCircle2 className="h-8 w-8 text-gold-dark" aria-hidden="true" />
      </span>

      <h3 className="mt-5 text-2xl font-bold text-navy">
        Thank you, {firstName}. Your inquiry is on its way.
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        A copy of your submission is being sent to your business email. One of our
        accountants will review your details and reply{" "}
        <span className="font-semibold text-navy">within one business day</span>{" "}
        (Monday to Friday).
      </p>

      <ul className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-mist p-5 text-sm text-slate-700">
        <li className="flex gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          We confirm which BIR filings and reports apply to your business.
        </li>
        <li className="flex gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          We schedule your free consultation at a time that works for you.
        </li>
        <li className="flex gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          You receive a clear scope of work and a fixed quote.
        </li>
      </ul>

      <button type="button" onClick={onReset} className="btn-navy mt-6 w-full">
        Send another inquiry
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
