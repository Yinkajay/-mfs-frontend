"use client";

import { ArrowUpRight, WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/app/components/brand-logo";

const whatsappUrl =
  "https://wa.me/2349032243284?text=Hello%20MFS%2C%20I%20want%20to%20start%20my%20vehicle%20registration.";

const links = [
  { label: "Overview", href: "#main-content", current: true },
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#process" },
  { label: "Reviews", href: "#proof" },
  { label: "FAQs", href: "#faq" },
];

export function FluidNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Primary navigation"
          className="pointer-events-auto mx-auto mt-6 flex w-[calc(100%_-_32px)] items-center justify-between gap-8 rounded-full border border-black/10 bg-white/85 px-3 py-2 shadow-[0_16px_48px_rgba(24,24,24,0.12)] backdrop-blur-xl md:w-max"
        >
          <a
            href="#main-content"
            aria-label="MFS Services home"
            aria-current="page"
            className="focus-ring flex rounded-full"
            onClick={() => setOpen(false)}
          >
            <BrandLogo className="h-10 w-auto" preload />
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                className="focus-ring nav-link rounded-full text-sm font-semibold text-[#5d625f]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden min-h-10 items-center gap-2 rounded-full bg-[#181818] px-3 py-2 text-sm font-semibold text-white md:flex"
          >
            Start on WhatsApp
            <ArrowUpRight aria-hidden="true" size={16} weight="bold" />
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((current) => !current)}
            className="focus-ring relative h-10 w-10 rounded-full bg-[#181818] md:hidden"
          >
            <span
              className={`absolute left-3 h-0.5 w-4 bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open
                  ? "top-1/2 -translate-y-1/2 rotate-45"
                  : "top-3 rotate-0"
              }`}
            />
            <span
              className={`absolute left-3 h-0.5 w-4 bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open
                  ? "top-1/2 -translate-y-1/2 -rotate-45"
                  : "bottom-3 rotate-0"
              }`}
            />
          </button>
        </nav>
      </header>

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex items-end bg-[#181818]/95 p-6 pb-16 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="w-full">
          <p className="mb-6 text-sm font-semibold text-white/50">Explore MFS</p>
          <div className="flex flex-col gap-2">
            {links.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                aria-current={link.current ? "page" : undefined}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${100 + index * 50}ms` : "0ms" }}
                className={`focus-ring rounded-xl py-2 text-4xl font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            tabIndex={open ? 0 : -1}
            className={`focus-ring mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff4f3d] px-3 py-2 text-base font-semibold text-white transition-all delay-300 duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
            Start my registration
          </a>
        </div>
      </div>
    </>
  );
}
