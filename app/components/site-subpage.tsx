import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/app/components/brand-logo";
import { FluidNav } from "@/app/components/fluid-nav";

type SiteSubpageProps = {
  currentPage: "about" | "contact";
  children: ReactNode;
};

export function SiteSubpage({ currentPage, children }: SiteSubpageProps) {
  return (
    <>
      <a
        href="#main-content"
        className="focus-ring fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-[#181818] px-3 py-2 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus:translate-y-0"
      >
        Skip to content
      </a>
      <FluidNav currentPage={currentPage} />
      <main id="main-content" className="bg-[#f7f3ea] text-[#181818]">
        {children}
      </main>
      <footer className="bg-[#181818] px-4 py-12 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" aria-label="MFS Services home" className="focus-ring inline-flex rounded-lg bg-white">
            <BrandLogo variant="solid" className="h-10 w-auto rounded-lg" />
          </Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-4 text-sm font-semibold text-white/70">
            <Link href="/about" className="focus-ring link-motion rounded-lg hover:text-white">
              About us
            </Link>
            <Link href="/contact" className="focus-ring link-motion rounded-lg hover:text-white">
              Contact
            </Link>
            <Link href="/privacy" className="focus-ring link-motion rounded-lg hover:text-white">
              Privacy policy
            </Link>
            <Link href="/terms" className="focus-ring link-motion rounded-lg hover:text-white">
              Terms of service
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-xs text-white/45">
          © 2026 MFS Services. All rights reserved.
        </p>
      </footer>
    </>
  );
}
