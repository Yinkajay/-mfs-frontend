"use client";

import { ArrowUpRight, CaretDown, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/app/components/brand-logo";
import { useAuth } from "@/app/components/auth-provider";
import { WHATSAPP_REGISTRATION_URL } from "@/app/lib/contact";

const links = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#process" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type FluidNavProps = {
  currentPage?: "home" | "about" | "contact";
};

export function FluidNav({ currentPage = "home" }: FluidNavProps) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (currentPage !== "home") return;

    const sentinel = document.getElementById("home-nav-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      setScrolled(!entry.isIntersecting);
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [currentPage]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setAccountOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const overHero = currentPage === "home" && !scrolled;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <nav
          aria-label="Primary navigation"
          className={`pointer-events-auto mx-auto flex items-center justify-between gap-6 border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            overHero
              ? "mt-0 w-full max-w-7xl rounded-none border-transparent bg-transparent px-6 py-6 shadow-none backdrop-blur-none sm:px-12 xl:px-16"
              : "mt-6 w-[calc(100%_-_32px)] max-w-5xl rounded-full border-black/10 bg-white/85 px-3 py-2 shadow-[0_16px_48px_rgba(24,24,24,0.12)] backdrop-blur-xl"
          }`}
        >
          <Link
            href="/"
            aria-label="MFS Services home"
            aria-current={currentPage === "home" ? "page" : undefined}
            className="focus-ring flex rounded-full"
            onClick={() => setOpen(false)}
          >
            <BrandLogo
              className={`h-10 w-auto transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${overHero ? "brightness-0 invert" : ""}`}
              preload
            />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  link.href === `/${currentPage}` ? "page" : undefined
                }
                className={`focus-ring rounded-full px-3 py-2 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${overHero ? "" : "nav-link"} ${
                  link.href === `/${currentPage}`
                    ? "bg-[#fff0eb] text-[#9b281e]"
                    : overHero
                      ? "text-white/90 hover:bg-white/10 hover:text-white"
                      : "text-[#5d625f] hover:bg-[#f7f3ea] hover:text-[#181818]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
              onFocus={() => setAccountOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setAccountOpen(false);
                }
              }}
            >
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-controls="account-navigation"
                onClick={() => setAccountOpen(true)}
                className={`focus-ring button-motion inline-flex min-h-10 items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  overHero
                    ? "border-white/60 bg-white/10 text-white hover:bg-white/20"
                    : "border-transparent bg-[#181818] text-white hover:bg-[#313131]"
                }`}
              >
                {auth.user
                  ? "Account"
                  : auth.phase === "checking"
                    ? "Checking…"
                    : "Sign in"}
                <CaretDown
                  aria-hidden="true"
                  size={14}
                  weight="bold"
                  className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                id="account-navigation"
                aria-hidden={!accountOpen}
                className={`absolute left-1/2 top-full z-50 w-44 -translate-x-1/2 pt-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  accountOpen
                    ? "visible pointer-events-auto translate-y-0 opacity-100"
                    : "invisible pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <div className="rounded-2xl border border-black/10 bg-white p-2 shadow-[0_16px_48px_rgba(24,24,24,0.12)]">
                  {auth.user ? (
                    <>
                      <p className="truncate px-3 py-2 text-sm font-semibold text-[#686d69]">
                        {auth.user.firstName}
                      </p>
                      <Link
                        href="/dashboard"
                        tabIndex={accountOpen ? 0 : -1}
                        onClick={() => setAccountOpen(false)}
                        className="focus-ring block rounded-lg px-3 py-2 text-sm font-semibold text-[#181818] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f7f3ea] active:scale-[0.98]"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        tabIndex={accountOpen ? 0 : -1}
                        disabled={auth.busy !== null}
                        onClick={() => void auth.logout()}
                        className="focus-ring button-motion block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#181818] hover:bg-[#f7f3ea] disabled:cursor-wait"
                      >
                        {auth.busy === "logout" ? "Logging out…" : "Log out"}
                      </button>
                    </>
                  ) : auth.phase === "checking" ? (
                    <p
                      role="status"
                      className="px-3 py-2 text-sm text-[#686d69]"
                    >
                      Checking session…
                    </p>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        tabIndex={accountOpen ? 0 : -1}
                        onClick={() => setAccountOpen(false)}
                        className="focus-ring block rounded-lg px-3 py-2 text-sm font-semibold text-[#181818] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f7f3ea] active:scale-[0.98]"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/signup"
                        tabIndex={accountOpen ? 0 : -1}
                        onClick={() => setAccountOpen(false)}
                        className="focus-ring block rounded-lg px-3 py-2 text-sm font-semibold text-[#181818] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f7f3ea] active:scale-[0.98]"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                  {auth.error && (
                    <div
                      role="alert"
                      className="px-3 py-2 text-sm text-[#b52d21]"
                    >
                      <p>{auth.error}</p>
                      {!auth.user && (
                        <button
                          type="button"
                          tabIndex={accountOpen ? 0 : -1}
                          onClick={() => void auth.restore()}
                          className="focus-ring mt-2 rounded font-semibold underline underline-offset-2"
                        >
                          Try again
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <a
            href={WHATSAPP_REGISTRATION_URL}
            target="_blank"
            rel="noreferrer"
            className={`focus-ring button-motion hidden min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:flex ${
              overHero
                ? "border-white bg-white text-[#181818] hover:bg-white/90"
                : "border-transparent bg-[#ff4f3d] text-white hover:bg-[#e94132]"
            }`}
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
            className={`focus-ring relative h-10 w-10 rounded-full border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
              overHero
                ? "border-white/60 bg-white/10"
                : "border-transparent bg-[#181818]"
            }`}
          >
            <span
              className={`absolute left-3 h-0.5 w-4 bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-3 rotate-0"
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
        className={`fixed inset-0 z-40 flex items-end overflow-y-auto bg-[#181818]/95 p-6 pb-16 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="w-full">
          <p className="mb-6 text-sm font-semibold text-white/50">
            Explore MFS
          </p>
          <div className="flex flex-col gap-2">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                tabIndex={open ? 0 : -1}
                aria-current={
                  link.href === `/${currentPage}` ? "page" : undefined
                }
                onClick={() => setOpen(false)}
                style={{
                  transitionDelay: open ? `${100 + index * 50}ms` : "0ms",
                }}
                className={`focus-ring rounded-xl py-2 text-4xl font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                } ${
                  link.href === `/${currentPage}`
                    ? "text-[#ff7466]"
                    : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <p className="mb-2 text-sm font-semibold text-white/60">
              {auth.user ? auth.user.firstName : "Sign in"}
            </p>
            <div className="flex gap-6">
              {auth.user ? (
                <>
                  <Link
                    href="/dashboard"
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-lg py-2 text-lg font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#ff7466] active:scale-[0.98]"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    tabIndex={open ? 0 : -1}
                    disabled={auth.busy !== null}
                    onClick={() => void auth.logout()}
                    className="focus-ring button-motion rounded-lg py-2 text-lg font-semibold text-white hover:text-[#ff7466] disabled:cursor-wait"
                  >
                    {auth.busy === "logout" ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : auth.phase === "checking" ? (
                <p role="status" className="py-2 text-sm text-white/60">
                  Checking session…
                </p>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-lg py-2 text-lg font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#ff7466] active:scale-[0.98]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-lg py-2 text-lg font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#ff7466] active:scale-[0.98]"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
            {auth.error && (
              <div role="alert" className="mt-2 text-sm text-[#ffb3aa]">
                <p>{auth.error}</p>
                {!auth.user && (
                  <button
                    type="button"
                    tabIndex={open ? 0 : -1}
                    onClick={() => void auth.restore()}
                    className="focus-ring mt-2 rounded font-semibold underline underline-offset-2"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>
          <a
            href={WHATSAPP_REGISTRATION_URL}
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
