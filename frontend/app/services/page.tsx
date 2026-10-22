import type { Metadata } from "next";
import { ServicesCatalogue } from "@/app/components/services-catalogue";
import { SiteSubpage } from "@/app/components/site-subpage";

export const metadata: Metadata = {
  title: "Vehicle services",
  description:
    "Browse the active MFS Services catalogue and available licence duration options.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <SiteSubpage currentPage="services">
      <header className="px-6 pb-16 pt-40 sm:px-12 md:pb-20 md:pt-48 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-[#e94132]">MFS service catalogue</p>
          <h1 className="hero-heading mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            Browse our vehicle services.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[#686d69]">
            View the services currently listed by MFS, including available licence duration options.
          </p>
        </div>
      </header>
      <ServicesCatalogue />
    </SiteSubpage>
  );
}
