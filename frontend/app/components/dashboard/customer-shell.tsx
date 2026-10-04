"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  CarProfile,
  House,
  Lifebuoy,
  SignOut,
  SquaresFour,
  Tray,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/components/auth-provider";
import { BrandLogo } from "@/app/components/brand-logo";
import styles from "./customer-shell.module.css";

const pages = [
  { label: "Overview", href: "/dashboard", icon: House },
  { label: "Vehicles", href: "/dashboard/vehicles", icon: CarProfile },
  { label: "Services", href: "/dashboard/services", icon: SquaresFour },
  { label: "Requests", href: "/dashboard/requests", icon: Tray },
  { label: "Account", href: "/dashboard/account", icon: UserCircle },
] as const;

const motion =
  "transition-[color,background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]";

function CustomerNavigation({
  pathname,
  onNavigate,
  onClose,
}: {
  pathname: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const auth = useAuth();

  return (
    <div className="flex min-h-full flex-col p-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="MFS Services home"
          onClick={onNavigate}
          className="focus-ring rounded-lg"
        >
          <BrandLogo className="h-8 w-auto brightness-0 invert" />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white hover:bg-[#313131] ${motion}`}
          >
            <X aria-hidden="true" size={20} />
          </button>
        )}
      </div>
      <nav aria-label="Main navigation" className="mt-12">
        <ul className="space-y-2">
          {pages.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${motion} ${
                    active
                      ? "bg-[#ff4f3d] text-[#181818]"
                      : "text-white/80 hover:bg-[#313131] hover:text-white"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={20}
                    weight={active ? "fill" : "regular"}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-12">
        <div className="rounded-xl bg-[#272727] p-4">
          <Lifebuoy aria-hidden="true" size={24} className="text-[#ff9286]" />
          <p className="mt-3 text-sm font-semibold text-white">Need a hand?</p>
          <p className="mt-2 text-pretty text-sm text-white/70">
            Talk to us about your paperwork.
          </p>
          <Link
            href="/contact"
            onClick={onNavigate}
            className={`focus-ring mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg text-sm font-semibold text-white hover:text-[#ff9286] ${motion}`}
          >
            Contact MFS
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className={`focus-ring mt-4 flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-[#313131] hover:text-white ${motion}`}
        >
          <ArrowLeft aria-hidden="true" size={20} />
          Back to website
        </Link>
        <button
          type="button"
          disabled={auth.busy !== null}
          onClick={() => void auth.logout()}
          className={`focus-ring flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/75 hover:bg-[#313131] hover:text-white disabled:cursor-wait disabled:opacity-60 ${motion}`}
        >
          <SignOut aria-hidden="true" size={20} />
          {auth.busy === "logout" ? "Logging out…" : "Log out"}
        </button>
        {auth.error && onClose && (
          <p role="alert" className="mt-3 text-pretty text-sm text-[#ffb3aa]">
            {auth.error} You can try logging out again.
          </p>
        )}
      </div>
    </div>
  );
}

function SessionSkeleton() {
  return (
    <div
      role="status"
      aria-label="Checking your session"
      aria-busy="true"
      className="min-h-dvh bg-[#f7f7f5] lg:grid lg:grid-cols-[256px_minmax(0,1fr)]"
    >
      <span className="sr-only">Checking your account…</span>
      <div aria-hidden="true" className="hidden bg-[#181818] p-6 lg:block">
        <BrandLogo className="h-8 w-auto brightness-0 invert" />
        <div className={`mt-16 space-y-4 ${styles.skeleton}`}>
          {pages.map(({ href }) => (
            <div key={href} className="h-12 rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
      <div aria-hidden="true">
        <div className="flex h-20 items-center justify-between bg-white px-6 sm:px-8">
          <div className="h-4 w-24 rounded bg-[#eceeeb]" />
          <div className="h-10 w-10 rounded-full bg-[#eceeeb]" />
        </div>
        <div className={`p-6 sm:p-8 lg:p-10 ${styles.skeleton}`}>
          <div className="h-8 w-3/4 max-w-md rounded bg-[#e5e7e3]" />
          <div className="mt-4 h-4 w-1/2 rounded bg-[#e5e7e3]" />
          <div className="mt-8 h-80 rounded-xl bg-white" />
          <div className="mt-6 h-48 rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function SessionUnavailable() {
  const auth = useAuth();

  return (
    <main className="flex min-h-dvh flex-col bg-[#f7f7f5] px-6 py-8 sm:px-12">
      <Link
        href="/"
        aria-label="MFS Services home"
        className="focus-ring w-fit rounded-lg"
      >
        <BrandLogo className="h-8 w-auto" />
      </Link>
      <section className="m-auto w-full max-w-md py-12">
        <UserCircle aria-hidden="true" size={48} className="text-[#9b281e]" />
        <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight">
          Let’s reconnect.
        </h1>
        <p className="mt-4 text-pretty text-base text-[#686d69]">
          We couldn’t load your account. Please try again.
        </p>
        <button
          type="button"
          onClick={() => void auth.restore()}
          className="focus-ring button-motion mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#181818] px-3 py-2 text-base font-semibold text-white hover:bg-[#313131]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="focus-ring link-motion ml-6 inline-flex min-h-12 items-center rounded-lg text-sm font-semibold"
        >
          Back home
        </Link>
      </section>
    </main>
  );
}

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(/\/$/, "");
  const currentPage = pages.find((page) => page.href === pathname) ?? pages[0];
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (auth.phase === "signed-out") router.replace("/auth/login");
  }, [auth.phase, router]);

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  if (auth.phase === "signed-out") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f7f7f5] p-6">
        <p role="status" className="text-sm text-[#686d69]">
          Taking you to log in…{" "}
          <Link href="/auth/login" className="focus-ring rounded underline">
            Continue to log in
          </Link>
        </p>
      </main>
    );
  }
  if (!auth.user) {
    return auth.phase === "error" ? (
      <SessionUnavailable />
    ) : (
      <SessionSkeleton />
    );
  }

  const user = auth.user;
  const initials = `${Array.from(user.firstName)[0] ?? ""}${Array.from(user.lastName)[0] ?? ""}`;

  function closeMenu() {
    dialog.current?.close();
  }

  return (
    <div className="min-h-dvh bg-[#f7f7f5] text-[#181818] lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <a
        href="#customer-main"
        className="focus-ring fixed top-4 left-4 z-50 -translate-y-24 rounded-lg bg-white px-3 py-2 text-base font-semibold focus:translate-y-0"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh overflow-y-auto bg-[#181818] text-white lg:block">
        <CustomerNavigation pathname={pathname} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 bg-white px-6 py-4 shadow-[0_1px_0_rgba(24,24,24,0.06)] sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <button
              ref={menuButton}
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="customer-menu"
              onClick={() => {
                dialog.current?.showModal();
                setMobileOpen(true);
              }}
              className="focus-ring relative h-12 w-12 shrink-0 rounded-lg bg-[#181818] hover:bg-[#313131] lg:hidden"
            >
              <span
                aria-hidden="true"
                className={`absolute left-4 h-0.5 w-4 bg-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-4"}`}
              />
              <span
                aria-hidden="true"
                className={`absolute left-4 h-0.5 w-4 bg-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${mobileOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-4"}`}
              />
            </button>
            <p className="truncate text-sm font-semibold">{currentPage.label}</p>
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <Link
              href="/contact"
              className={`focus-ring hidden min-h-12 items-center gap-2 rounded-lg text-sm font-semibold text-[#686d69] hover:text-[#181818] sm:inline-flex ${motion}`}
            >
              <Lifebuoy aria-hidden="true" size={20} />
              Get help
            </Link>
            <Link
              href="/dashboard/account"
              aria-label="Open your account"
              className={`focus-ring flex min-h-12 items-center gap-3 rounded-lg hover:bg-[#f7f7f5] ${motion}`}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0eb] text-sm font-semibold text-[#9b281e] uppercase"
              >
                {initials}
              </span>
              <span className="hidden max-w-48 truncate text-sm font-semibold md:block">
                {user.firstName} {user.lastName}
              </span>
            </Link>
          </div>
          {auth.phase === "checking" && (
            <span role="status" className="sr-only">
              Refreshing your account…
            </span>
          )}
        </header>

        <main
          id="customer-main"
          tabIndex={-1}
          className="focus-ring mx-auto w-full max-w-7xl p-6 sm:p-8 lg:p-10"
        >
          {auth.phase === "error" && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#e8d6cf] bg-[#fff0eb] p-4 text-sm text-[#7b3025]"
            >
              <p className="max-w-2xl text-pretty">
                {auth.error ??
                  "We couldn’t refresh your account. You’re seeing the last details we loaded."}
              </p>
              <button
                type="button"
                disabled={auth.busy !== null}
                onClick={() =>
                  void (auth.error ? auth.logout() : auth.restore())
                }
                className={`focus-ring min-h-12 rounded-lg px-3 py-2 font-semibold underline underline-offset-4 disabled:cursor-wait ${motion}`}
              >
                {auth.error ? "Try logging out again" : "Try again"}
              </button>
            </div>
          )}
          <div key={pathname} className={styles.pageEnter}>
            {children}
          </div>
          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 text-xs text-[#686d69]">
            <p>MFS Services · Vehicle paperwork, made painless.</p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className={`focus-ring inline-flex min-h-12 items-center rounded hover:text-[#181818] ${motion}`}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={`focus-ring inline-flex min-h-12 items-center rounded hover:text-[#181818] ${motion}`}
              >
                Terms
              </Link>
            </div>
          </footer>
        </main>
      </div>

      <dialog
        ref={dialog}
        id="customer-menu"
        aria-label="Navigation menu"
        onClose={() => {
          setMobileOpen(false);
          menuButton.current?.focus();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const stops = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "a[href], button:not([disabled]), [tabindex='0']",
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = stops[0];
          const last = stops.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              closeMenu();
          }
        }}
        className="fixed inset-y-0 left-0 m-0 hidden h-dvh max-h-none w-72 max-w-[calc(100%_-_32px)] overflow-y-auto border-0 bg-[#181818] p-0 text-white backdrop:bg-black/50 open:block"
      >
        <CustomerNavigation
          pathname={pathname}
          onNavigate={closeMenu}
          onClose={closeMenu}
        />
      </dialog>
    </div>
  );
}
