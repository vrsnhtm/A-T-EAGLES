import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Insights", href: "#insights" },
  { label: "Why Us", href: "#why-us" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Sticky navigation. On mobile it collapses into a toggleable panel.
 * Every link is a same-page anchor, so no router is needed.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close the mobile panel with Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="container-page flex h-16 items-center justify-between gap-4 sm:h-20"
      >
        <a href="#top" onClick={closeMenu} className="flex items-center gap-3">
          <img
            src="/images/brand/eagle-mark.webp"
            alt=""
            aria-hidden="true"
            width={1600}
            height={1577}
            className="h-11 w-11 shrink-0 object-contain"
          />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold leading-tight text-navy">
              A &amp; T Eagles
            </span>
            <span className="hidden text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-500 sm:block">
              Marketing and Consultancy Services OPC
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="btn-primary hidden py-2.5 md:inline-flex"
        >
          Get a Free Consultation
        </a>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy/15 text-navy transition-colors hover:bg-mist md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-navy/10 bg-white md:hidden">
          <div className="container-page py-4">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-mist hover:text-navy"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={closeMenu}
              className="btn-primary mt-3 w-full"
            >
              Get a Free Consultation
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
