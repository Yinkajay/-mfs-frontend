import type { ReactNode } from "react";
import { FluidNav } from "@/app/components/fluid-nav";
import { SiteFooter } from "@/app/components/site-footer";

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
      <SiteFooter />
    </>
  );
}
