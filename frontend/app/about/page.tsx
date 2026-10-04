import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { SiteSubpage } from "@/app/components/site-subpage";
import { Reveal, TaglineReveal } from "@/app/components/reveal";
import { WHATSAPP_HELP_URL } from "@/app/lib/contact";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Get to know MFS Services, a Lagos vehicle documentation team helping individuals and organisations handle registration, renewals and permits.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <SiteSubpage currentPage="about">
      <section className="grid lg:grid-cols-2">
        <div className="flex min-h-dvh items-center px-6 pb-24 pt-24 sm:px-12 lg:px-16">
          <div className="max-w-[680px]">
            <p className="mb-6 text-sm font-semibold text-[#e94132]">About MFS Services</p>
            <h1 className="hero-heading text-balance text-5xl font-semibold tracking-tight md:text-6xl">
              Vehicle paperwork, handled with care.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-[#686d69]">
              We help vehicle owners and organisations in Lagos get genuine
              registration, renewals, insurance and permits without carrying the
              process alone.
            </p>
            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noreferrer"
              className="focus-ring button-motion mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4f3d] px-3 py-2 text-base font-semibold text-white hover:bg-[#e94132]"
            >
              <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
              Talk to MFS
              <ArrowUpRight aria-hidden="true" size={18} weight="bold" />
            </a>
          </div>
        </div>
        <div className="relative min-h-80 lg:min-h-dvh">
          <Image
            src="/family.webp"
            alt="Family travelling together in a car"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            preload
            className="object-cover object-center"
          />
        </div>
      </section>

      <section className="bg-white px-4 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="mb-4 text-sm font-semibold text-[#e94132]">What we do</p>
            <h2 className="max-w-[680px] text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              The right documents, with a clear process behind them.
            </h2>
          </Reveal>
          <Reveal delay={120} className="flex items-end">
            <div className="max-w-xl space-y-6 text-pretty text-lg text-[#686d69]">
              <p>
                MFS Services is an authorized agent of the Lagos State Motor Vehicle
                Administration Agency and a licensed AutoReg partner.
              </p>
              <p>
                We confirm what each request needs, coordinate the paperwork and
                keep customers informed from first registration through every
                renewal. Pickup and delivery are available in Lagos.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#181818] px-4 py-24 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-sm font-semibold text-[#ff7466]">The MFS approach</p>
          <TaglineReveal text="Know what your vehicle needs. Keep the process moving. Get back to your day." />
        </div>
      </section>
    </SiteSubpage>
  );
}
