import { Mail, MapPin, Phone } from "lucide-react";

const QUICK_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-[#081C36] text-slate-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <a href="#top" className="flex items-center gap-3">
            {/* The mark is navy and gold on white, so it sits on a white tile
                to stay legible against the dark footer. */}
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
              <img
                src="/images/brand/eagle-mark.webp"
                alt=""
                aria-hidden="true"
                width={1600}
                height={1577}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold text-white">A &amp; T Eagles</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Marketing and Consultancy Services OPC
              </span>
            </span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            BIR tax filing, SLSP preparation, bookkeeping and compliance support for
            Philippine businesses. Accurate filings, on time, every time.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            Contact
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" aria-hidden="true" />
              <span className="text-slate-400">
                264 Gov. Pascual Ave, Catmon
                <br />
                Malabon, Metro Manila
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold/80" aria-hidden="true" />
              <a
                href="tel:+639283506526"
                className="text-slate-400 transition-colors hover:text-white"
              >
                09-- ---- ---
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold/80" aria-hidden="true" />
              <a
                href="mailto:onlineateagles@gmail.com"
                className="break-all text-slate-400 transition-colors hover:text-white"
              >
                onlineateagles@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-7 text-xs leading-relaxed text-slate-500 sm:flex-row sm:items-start sm:justify-between">
          <p>
            © {new Date().getFullYear()} A &amp; T Eagles Marketing and Consultancy
            Services OPC. All rights reserved.
          </p>
          <p className="max-w-xl">
            Personal data submitted through this site is processed in accordance
            with the Data Privacy Act of 2012 (RA 10173) and used only to respond to
            your inquiry. To access, correct or withdraw your information, email{" "}
            <a
              href="mailto:onlineateagles@gmail.com"
              className="text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-white"
            >
              onlineateagles@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
