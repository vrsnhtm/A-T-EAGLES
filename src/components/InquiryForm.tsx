import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Clock3, Loader2, LockKeyhole, Send } from "lucide-react";
import {
  collectFieldErrors,
  inquirySchema,
  SERVICE_OPTIONS,
  type InquiryFieldErrors,
} from "../lib/validation";
import SuccessMessage from "./SuccessMessage";

/* ------------------------------------------------------------------ */
/* Types and constants                                                 */
/* ------------------------------------------------------------------ */

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  targetDate: string;
  service: string;
  businessAddress: string;
  details: string;
  consent: boolean;
  /** Honeypot — must stay empty. */
  companyWebsite: string;
};

const INITIAL_VALUES: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  targetDate: "",
  service: "",
  businessAddress: "",
  details: "",
  consent: false,
  companyWebsite: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/** Shape of the JSON returned by /api/send-inquiry. */
type ApiResponse = {
  success?: boolean;
  message?: string;
};

type TextFieldName =
  | "fullName"
  | "email"
  | "phone"
  | "targetDate"
  | "businessAddress"
  | "details";

const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40";

function inputClasses(hasError: boolean): string {
  return `${inputBase} ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-slate-300 focus:border-gold"
  }`;
}

/** Build the payload that the server validates (honeypot excluded). */
function toPayload(values: FormValues) {
  return {
    fullName: values.fullName,
    email: values.email,
    phone: values.phone,
    targetDate: values.targetDate,
    service: values.service,
    businessAddress: values.businessAddress,
    details: values.details,
    consent: values.consent,
  };
}

/** Only point at an element that is actually rendered. */
function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint/error wrapper used by every field. */
function FieldShell({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {label}
        {required && (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-start gap-1 text-xs font-medium text-red-600"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function InquiryForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  const isSubmitting = status === "submitting";

  /** Re-run validation on change once the user has tried to submit. */
  function revalidate(next: FormValues) {
    if (!hasAttempted) return;
    const parsed = inquirySchema.safeParse(toPayload(next));
    setErrors(parsed.success ? {} : collectFieldErrors(parsed.error));
  }

  function handleTextChange(field: TextFieldName) {
    return (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      revalidate(next);
    };
  }

  function handleServiceChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = { ...values, service: event.target.value };
    setValues(next);
    revalidate(next);
  }

  function handleConsentChange(event: ChangeEvent<HTMLInputElement>) {
    const next = { ...values, consent: event.target.checked };
    setValues(next);
    revalidate(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasAttempted(true);
    setServerMessage("");

    const parsed = inquirySchema.safeParse(toPayload(values));
    if (!parsed.success) {
      const fieldErrors = collectFieldErrors(parsed.error);
      setErrors(fieldErrors);
      setStatus("idle");

      const firstInvalid = Object.keys(fieldErrors)[0];
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus();
      }
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/send-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        setStatus("error");
        setServerMessage(
          data.message ??
            "We could not send your inquiry right now. Please try again.",
        );
        return;
      }

      // Keep the name for the thank-you message, then clear the form.
      setSubmittedName(values.fullName.trim());
      setValues(INITIAL_VALUES);
      setErrors({});
      setHasAttempted(false);
      setStatus("success");
    } catch {
      setStatus("error");
      setServerMessage(
        "A network error stopped your inquiry from sending. Please check your connection and try again.",
      );
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-navy py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="container-page relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Free consultation
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Tell us what you need filed — we will take it from there.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-200">
            Share a few details and an accountant will review your situation. No
            obligation, no sales pressure, and no fee for the first conversation.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3 text-sm text-slate-200">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-white">
                  Replies within one business day
                </span>
                Monday to Friday, 9:00 AM to 6:00 PM (PHT).
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-200">
              <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-white">
                  Confidential by default
                </span>
                Handled under the Data Privacy Act of 2012 (RA 10173).
              </span>
            </li>
          </ul>

          <p className="mt-8 text-sm text-slate-300">
            Prefer to talk now? Email{" "}
            <a
              href="mailto:onlineateagles@gmail.com"
              className="font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
            >
              onlineateagles@gmail.com
            </a>
            .
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-banner sm:p-8">
          {status === "success" ? (
            <SuccessMessage
              fullName={submittedName}
              onReset={() => {
                setStatus("idle");
                setSubmittedName("");
              }}
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="text-lg font-bold text-navy">Request a consultation</h3>
              <p className="mt-1 text-sm text-slate-500">
                Fields marked <span className="text-red-600">*</span> are required.
              </p>

              {status === "error" && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <p className="flex items-start gap-2 text-sm font-medium text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {serverMessage}
                  </p>
                  <button
                    type="submit"
                    className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FieldShell
                  id="fullName"
                  label="Full Name / Authorized Representative"
                  required
                  error={errors.fullName}
                >
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={handleTextChange("fullName")}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={describedBy("fullName", errors.fullName)}
                    className={inputClasses(Boolean(errors.fullName))}
                    placeholder="Juan Dela Cruz"
                  />
                </FieldShell>

                <FieldShell
                  id="email"
                  label="Business Email Address"
                  required
                  error={errors.email}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleTextChange("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describedBy("email", errors.email)}
                    className={inputClasses(Boolean(errors.email))}
                    placeholder="juan@company.ph"
                  />
                </FieldShell>

                <FieldShell
                  id="phone"
                  label="Direct Phone / Viber / WhatsApp"
                  required
                  hint="e.g. 09171234567 or +639171234567"
                  error={errors.phone}
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={handleTextChange("phone")}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={describedBy("phone", errors.phone, "e.g. 09171234567 or +639171234567")}
                    className={inputClasses(Boolean(errors.phone))}
                    placeholder="09171234567"
                  />
                </FieldShell>

                <FieldShell
                  id="targetDate"
                  label="Fiscal Year-End / Target Filing Date"
                  error={errors.targetDate}
                >
                  <input
                    id="targetDate"
                    name="targetDate"
                    type="date"
                    value={values.targetDate}
                    onChange={handleTextChange("targetDate")}
                    aria-invalid={Boolean(errors.targetDate)}
                    aria-describedby={describedBy("targetDate", errors.targetDate)}
                    className={inputClasses(Boolean(errors.targetDate))}
                  />
                </FieldShell>

                <FieldShell
                  id="service"
                  label="Accounting Service Needed"
                  required
                  error={errors.service}
                  className="sm:col-span-2"
                >
                  <select
                    id="service"
                    name="service"
                    value={values.service}
                    onChange={handleServiceChange}
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={describedBy("service", errors.service)}
                    className={inputClasses(Boolean(errors.service))}
                  >
                    <option value="">Select a service</option>
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell
                  id="businessAddress"
                  label="Business Address / Tax Jurisdiction (RDO)"
                  required
                  error={errors.businessAddress}
                  className="sm:col-span-2"
                >
                  <input
                    id="businessAddress"
                    name="businessAddress"
                    type="text"
                    autoComplete="street-address"
                    value={values.businessAddress}
                    onChange={handleTextChange("businessAddress")}
                    aria-invalid={Boolean(errors.businessAddress)}
                    aria-describedby={describedBy(
                      "businessAddress",
                      errors.businessAddress,
                    )}
                    className={inputClasses(Boolean(errors.businessAddress))}
                    placeholder="Unit 000, Building, City, Metro Manila — RDO 000"
                  />
                </FieldShell>

                <FieldShell
                  id="details"
                  label="Business Details & Specific Needs"
                  hint="Optional. Minimum 10 characters if you add one."
                  error={errors.details}
                  className="sm:col-span-2"
                >
                  <textarea
                    id="details"
                    name="details"
                    rows={5}
                    value={values.details}
                    onChange={handleTextChange("details")}
                    aria-invalid={Boolean(errors.details)}
                    aria-describedby={describedBy("details", errors.details, "Minimum 10 characters.")}
                    className={`${inputClasses(Boolean(errors.details))} resize-y`}
                    placeholder="Business type, number of employees, existing books, and any notices you have received from the BIR."
                  />
                </FieldShell>

                {/* Honeypot: hidden from people, tempting to bots. */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="companyWebsite">Company website</label>
                  <input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.companyWebsite}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        companyWebsite: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      checked={values.consent}
                      onChange={handleConsentChange}
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={describedBy("consent", errors.consent)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-navy focus:ring-2 focus:ring-gold/50"
                    />
                    <label htmlFor="consent" className="text-sm leading-relaxed text-slate-600">
                      I agree to be contacted and consent to processing of my data
                      under the Data Privacy Act of 2012
                      <span className="ml-0.5 text-red-600" aria-hidden="true">
                        *
                      </span>
                    </label>
                  </div>
                  {errors.consent && (
                    <p
                      id="consent-error"
                      className="mt-1.5 flex items-start gap-1 text-xs font-medium text-red-600"
                    >
                      <AlertCircle
                        className="mt-px h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {errors.consent}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-6 w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending your inquiry…
                  </>
                ) : (
                  <>
                    Send my inquiry
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                We use your details only to respond to this inquiry. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
