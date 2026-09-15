import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "@phosphor-icons/react/ssr";
import { BrandLogo } from "@/app/components/brand-logo";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f3ea] px-4 py-16 text-[#181818] lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Page navigation" className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="focus-ring link-motion inline-flex rounded-lg"
          >
            <BrandLogo className="h-10 w-auto" preload />
          </Link>
          <Link
            href="/"
            className="focus-ring button-motion inline-flex min-h-10 items-center gap-2 rounded-full bg-[#181818] px-3 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft aria-hidden="true" size={16} weight="bold" />
            Back home
          </Link>
        </nav>

        <header className="pb-16 pt-24">
          <p className="mb-4 text-sm font-semibold text-[#e94132]">{eyebrow}</p>
          <h1 className="max-w-[680px] text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-[#686d69]">{intro}</p>
          <p className="mt-4 text-sm font-semibold text-[#777b78]">
            Last updated September 15, 2026
          </p>
        </header>

        <article className="legal-content rounded-3xl bg-white p-8 md:p-12">
          {children}
        </article>

        <footer className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#181818] p-8 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-semibold">Have a question about this page?</p>
            <p className="mt-2 text-sm text-white/55">Speak with the MFS team.</p>
          </div>
          <a
            href="tel:+2349060004617"
            className="focus-ring button-motion inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4f3d] px-3 py-2 text-base font-semibold text-white"
          >
            <Phone aria-hidden="true" size={20} weight="duotone" />
            Call 0906 000 4617
          </a>
        </footer>
      </div>
    </main>
  );
}
