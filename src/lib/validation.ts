import { z } from "zod";

/**
 * Single source of truth for the inquiry form values.
 * Used by the React form (client validation) and by the Vercel function
 * (server validation) so both always agree.
 */

export const SERVICE_OPTIONS = [
  "Monthly Bookkeeping & Financial Reporting",
  "Tax Preparation & Compliance Filing",
  "Business Registration & Permit Renewal",
  "Payroll Management & Remittances",
  "Financial Audit & Advisory",
  "Full-Service Retainer",
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

/** Philippine mobile formats: 09XXXXXXXXX or +639XXXXXXXXX. */
export const PH_PHONE_PATTERN = /^(?:\+63|0)9\d{9}$/;

/** Remove spaces, dashes, dots and parentheses before validating a phone number. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s().-]/g, "");
}

export function isValidPhilippinePhone(value: string): boolean {
  return PH_PHONE_PATTERN.test(normalizePhone(value));
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True when the value is a real calendar date in YYYY-MM-DD form. */
function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
  );
}

const serviceValues = SERVICE_OPTIONS as unknown as [
  ServiceOption,
  ...ServiceOption[],
];

export const inquirySchema = z.object({
  fullName: z
    .string({ required_error: "Please enter your full name." })
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Please keep your name under 120 characters."),
  email: z
    .string({ required_error: "Please enter your business email address." })
    .trim()
    .min(1, "Please enter your business email address.")
    .email("Please enter a valid email address.")
    .max(160, "Please keep your email under 160 characters."),
  phone: z
    .string({ required_error: "Please enter a phone number." })
    .trim()
    .min(1, "Please enter a phone or Viber / WhatsApp number.")
    .refine(
      isValidPhilippinePhone,
      "Use a PH mobile number, e.g. 09171234567 or +639171234567.",
    ),
  targetDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine(
      (value) => value === "" || isValidIsoDate(value),
      "Please choose a valid date.",
    ),
  service: z.enum(serviceValues, {
    errorMap: () => ({ message: "Please select the accounting service you need." }),
  }),
  businessAddress: z
    .string({ required_error: "Please enter your business address or RDO." })
    .trim()
    .min(4, "Please enter your business address or RDO.")
    .max(220, "Please keep this under 220 characters."),
  details: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine(
      (value) => value === "" || value.length >= 10,
      "Please share at least 10 characters so we can prepare.",
    )
    .refine(
      (value) => value.length <= 2000,
      "Please keep your message under 2000 characters.",
    ),
  consent: z
    .boolean({ required_error: "Please accept the data privacy consent." })
    .refine((value) => value === true, {
      message: "Please accept the data privacy consent to continue.",
    }),
});

export type InquiryPayload = z.infer<typeof inquirySchema>;
export type InquiryField = keyof InquiryPayload;
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>;

/** Reduce a ZodError to one friendly message per field. */
export function collectFieldErrors(error: z.ZodError): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as InquiryField] = issue.message;
    }
  }
  return errors;
}

/** Format a YYYY-MM-DD value without timezone drift. */
export function formatTargetDate(value: string): string {
  if (!isValidIsoDate(value)) return value;
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-PH", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
