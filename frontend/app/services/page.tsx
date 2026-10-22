import type { Metadata } from "next";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { ServicesCatalogue } from "@/app/components/services-catalogue";
import { SiteSubpage } from "@/app/components/site-subpage";
import { WHATSAPP_HELP_URL } from "@/app/lib/contact";

export const metadata: Metadata = {
  title: "Vehicle services | MFS Services",
  description:
    "Explore MFS vehicle documents, driver’s licences, insurance and permits. Find the service you need and start a conversation with MFS.",
  alternates: { canonical: "/services" },
};

function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_HELP_URL}
      target="_blank"
      rel="noreferrer"
      className="focus-ring button-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#087eaf] px-3 py-2 text-base font-semibold text-white hover:bg-[#006e9e]"
    >
      <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
      Start on WhatsApp
      <ArrowRight aria-hidden="true" size={18} weight="bold" />
    </a>
  );
}

export default function ServicesPage() {
  return (
    <SiteSubpage currentPage="services">
      <section className="relative isolate overflow-hidden bg-[#f7f3ea]" aria-labelledby="services-hero-title">
        <Image
          src="/services-hero.webp"
          alt="Two people exchange a plain envelope beside a parked car"
          fill
          preload
          sizes="100vw"
          className="hidden object-cover object-center xl:block"
        />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center px-6 pb-12 pt-36 sm:px-12 xl:min-h-[640px] xl:px-16 xl:pb-16 xl:pt-32">
          <div className="max-w-xl">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-[#626b70]">
              <Link href="/" className="focus-ring rounded-sm hover:text-[#087eaf]">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Services</span>
            </nav>
            <h1
              id="services-hero-title"
              className="hero-heading max-w-[680px] text-balance text-5xl font-semibold tracking-tight md:text-6xl"
            >
              What do you<br />need sorted?
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-lg text-[#30383b]">
              From first registration to your next renewal, find the paperwork
              you need help with.
            </p>
            <div className="mt-8">
              <WhatsAppButton />
            </div>
          </div>
        </div>
        <div className="relative aspect-[5/3] w-full sm:aspect-[12/5] xl:hidden">
          <Image
            src="/services-hero.webp"
            alt="Two people exchange a plain envelope beside a parked car"
            fill
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>
      </section>

      <ServicesCatalogue />

      <section className="relative isolate overflow-hidden bg-[#f5f1e9]" aria-labelledby="services-cta-title">
        <Image
          src="/services-cta.webp"
          alt="A woman checks her phone beside a parked car in Lagos"
          fill
          sizes="100vw"
          className="hidden object-cover object-center xl:block"
        />
        <div className="relative z-10 mx-auto flex max-w-7xl items-center px-6 py-16 sm:px-12 xl:min-h-[430px] xl:px-16 xl:py-20">
          <div className="max-w-xl">
            <h2 id="services-cta-title" className="max-w-[680px] text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Not sure where<br />to start?
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-lg text-[#30383b]">
              Tell us about the paperwork you need. We’ll help you find the right service.
            </p>
            <div className="mt-8">
              <WhatsAppButton />
            </div>
          </div>
        </div>
        <div className="relative aspect-[5/3] w-full sm:aspect-[12/5] xl:hidden">
          <Image
            src="/services-cta.webp"
            alt="A woman checks her phone beside a parked car in Lagos"
            fill
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>
      </section>
    </SiteSubpage>
  );
}
