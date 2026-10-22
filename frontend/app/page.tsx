import type { Metadata } from "next";
import {
  ArrowRight,
  BellRinging,
  ClockCountdown,
  Package,
  WhatsappLogo,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { FluidNav } from "@/app/components/fluid-nav";
import { HeroCarousel } from "@/app/components/hero-carousel";
import { Reveal, TaglineReveal } from "@/app/components/reveal";
import { SiteFooter } from "@/app/components/site-footer";
import { CONTACT, WHATSAPP_REGISTRATION_URL } from "@/app/lib/contact";

export const metadata: Metadata = {
  title: "Vehicle Registration and Renewal in Lagos | MFS Services",
  description:
    "MFS helps Lagos vehicle owners with registration, renewals, insurance and permits, including pickup and delivery of documents.",
  alternates: { canonical: "/" },
};

const serviceHighlights = [
  {
    number: "01",
    title: "New Registration",
    copy: "Get a new vehicle registered without carrying the paperwork yourself.",
  },
  {
    number: "02",
    title: "Vehicle Licence",
    copy: "Sort out an expiring or expired vehicle licence with MFS.",
  },
  {
    number: "03",
    title: "Motor insurance",
    copy: "Explore third party and comprehensive cover for your vehicle.",
  },
  {
    number: "04",
    title: "Road worthiness and permits",
    copy: "Find the road worthiness, ownership and permit services you need.",
  },
];

const process = [
  {
    number: "01",
    title: "Tell us what you need",
    copy: "Start a WhatsApp chat and tell us which vehicle document you need help with.",
  },
  {
    number: "02",
    title: "We confirm the details",
    copy: "We check the requirements, review your vehicle details and explain the expected cost.",
  },
  {
    number: "03",
    title: "Get your documents",
    copy: "MFS handles the process and arranges pickup or delivery when they are ready.",
  },
];

const faqs = [
  {
    question: "What do I need to get started?",
    answer:
      "Tell MFS which service you need and share a few details about your vehicle. The team will confirm the exact documents required before processing begins.",
  },
  {
    question: "How long does new vehicle registration take?",
    answer:
      "For standard new registration, allow up to 24 hours after payment. Timelines for other services depend on the request.",
  },
  {
    question: "How much will my vehicle documents cost?",
    answer:
      "Cost depends on the vehicle and the documents you need. Start a WhatsApp chat and MFS will review your request before confirming a cost.",
  },
  {
    question: "Can MFS pick up and deliver my documents?",
    answer:
      "Pickup and delivery are available in Lagos. The team will confirm availability and any delivery fee for your location.",
  },
  {
    question: "Will you remind me before my documents expire?",
    answer:
      "MFS offers renewal reminders two weeks before expiry so you have time to plan the next step.",
  },
  {
    question: "Is MFS authorised to process vehicle documents?",
    answer:
      "MFS is an authorised agent of the Lagos State Motor Vehicle Administration Agency and a licensed AutoReg partner.",
  },
];

function PrimaryCta() {
  return (
    <a
      href={WHATSAPP_REGISTRATION_URL}
      target="_blank"
      rel="noreferrer"
      className="focus-ring button-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#077eaf] px-3 py-2 text-base font-semibold text-white hover:bg-[#006e9e]"
    >
      <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
      Start on WhatsApp
      <ArrowRight aria-hidden="true" size={18} weight="bold" />
    </a>
  );
}

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "MFS Services",
    url: "https://mfsservicesng.com/",
    telephone: CONTACT.phones.map((phone) => phone.international),
    email: CONTACT.email,
    sameAs: [CONTACT.socials.instagram.url, CONTACT.socials.tiktok.url],
    description:
      "Vehicle registration, licence renewal, insurance and vehicle documentation services in Lagos, Nigeria.",
    address: CONTACT.locations.map((location) => ({
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: "Lagos",
      addressCountry: "NG",
    })),
    openingHours: "Mo-Fr 08:00-17:00",
  };

  return (
    <>
      <a
        href="#main-content"
        className="focus-ring fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-[#181818] px-3 py-2 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus:translate-y-0"
      >
        Skip to content
      </a>
      <FluidNav />

      <main id="main-content" className="overflow-hidden bg-[#faf9f4] text-[#181818]">
        <section aria-label="MFS vehicle services">
          <HeroCarousel />
          <div className="bg-[#f4f1e9] px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl divide-y divide-black/10 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  icon: ClockCountdown,
                  title: "New registration in 24 hours",
                  detail: "For standard requests after payment",
                },
                {
                  icon: Package,
                  title: "Pickup and delivery in Lagos",
                  detail: "Less running around for your documents",
                },
                {
                  icon: BellRinging,
                  title: "Renewal reminders",
                  detail: "A heads up before your documents expire",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 py-6 md:px-6 md:first:pl-0 md:last:pr-0">
                    <Icon aria-hidden="true" size={24} weight="regular" className="mt-1 shrink-0 text-[#126ca0]" />
                    <div>
                      <p className="text-sm font-semibold text-[#181818]">{item.title}</p>
                      <p className="mt-1 text-pretty text-xs text-[#5c6262]">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#e8e3d9]">
                <Image
                  src="/home-handoff.webp"
                  alt="Illustrative scene of a vehicle owner receiving a document folder beside her car"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-sm font-semibold text-[#126ca0]">A little less running around</p>
              <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Your day has better places to be.
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-lg text-[#555d5e]">
                Queues, unclear requirements and return visits can turn a simple
                renewal into a full day. MFS coordinates the paperwork with the
                right agencies and keeps you informed while it moves.
              </p>
              <Link
                href="/about"
                className="focus-ring link-motion mt-8 inline-flex items-center gap-2 rounded-full text-base font-semibold text-[#126ca0]"
              >
                Get to know MFS
                <ArrowRight aria-hidden="true" size={18} weight="bold" />
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="bg-white px-6 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#e8e3d9]">
                <Image
                  src="/home-paperwork.webp"
                  alt="Illustrative vehicle paperwork and car key on a dashboard"
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-8 text-sm font-semibold text-[#126ca0]">Services</p>
              <h2 className="mt-4 max-w-md text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                What do you need handled?
              </h2>
              <p className="mt-6 max-w-md text-pretty text-base text-[#555d5e]">
                From a first registration to the documents that keep your vehicle
                on the road, MFS can help you find the right next step.
              </p>
              <Link
                href="/services"
                className="focus-ring link-motion mt-8 inline-flex items-center gap-2 rounded-full text-base font-semibold text-[#126ca0]"
              >
                Browse all services
                <ArrowRight aria-hidden="true" size={18} weight="bold" />
              </Link>
            </Reveal>

            <div className="self-center border-t border-black/15">
              {serviceHighlights.map((service, index) => (
                <Reveal key={service.number} delay={index * 60}>
                  <Link
                    href="/services"
                    className="focus-ring group grid grid-cols-[auto_1fr_auto] gap-6 border-b border-black/15 py-8 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f4f8fa] md:gap-8"
                  >
                    <span className="text-lg font-semibold tabular-nums text-[#ed603e]">
                      {service.number}
                    </span>
                    <span>
                      <span className="block text-xl font-semibold tracking-tight md:text-2xl">
                        {service.title}
                      </span>
                      <span className="mt-2 block max-w-md text-pretty text-sm text-[#555d5e]">
                        {service.copy}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      size={20}
                      weight="bold"
                      className="mt-1 text-[#ed603e] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr_1fr] lg:items-end">
              <Reveal className="pb-4">
                <p className="text-sm font-semibold text-[#126ca0]">How it works</p>
                <h2 className="mt-4 max-w-md text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                  A chat. A clear plan. Back to your day.
                </h2>
                <p className="mt-6 max-w-sm text-pretty text-base text-[#555d5e]">
                  Tell us what you need. We will confirm the requirements before
                  processing starts.
                </p>
              </Reveal>
              <Reveal delay={80}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#e8e3d9]">
                  <Image
                    src="/home-chat.webp"
                    alt="Illustrative scene of a vehicle owner starting a chat on his phone"
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#e8e3d9]">
                  <Image
                    src="/home-delivery.webp"
                    alt="Illustrative handoff of a document folder beside a vehicle"
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
              {process.map((step, index) => (
                <Reveal key={step.number} delay={index * 80}>
                  <div className="border-t border-black/15 pt-6">
                    <p className="text-lg font-semibold tabular-nums text-[#ed603e]">{step.number}</p>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-3 max-w-sm text-pretty text-base text-[#555d5e]">
                      {step.copy}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f1eee7] px-6 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <p aria-hidden="true" className="text-6xl font-semibold text-[#ed603e]">“</p>
              <blockquote className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                Your kind of service puts customers in the safest experience.
              </blockquote>
              <p className="mt-8 text-sm font-semibold text-[#555d5e]">Engr. Omotayo, MFS customer</p>
            </Reveal>
            <Reveal delay={100}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#e8e3d9]">
                <Image
                  src="/lexus.webp"
                  alt="Black vehicle on a Lagos bridge"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-[72%_center]"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-white px-6 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal>
              <p className="text-sm font-semibold text-[#126ca0]">FAQs</p>
              <h2 className="mt-4 max-w-md text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                A few answers before we start.
              </h2>
              <p className="mt-6 max-w-md text-pretty text-base text-[#555d5e]">
                If your situation is different, tell us what you need on WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="border-t border-black/15">
                {faqs.map((faq, index) => (
                  <details key={faq.question} className="faq-item border-b border-black/15" open={index === 0}>
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-6 text-base font-semibold md:text-lg">
                      {faq.question}
                      <span aria-hidden="true" className="faq-plus shrink-0 text-2xl font-normal text-[#ed603e]">+</span>
                    </summary>
                    <p className="max-w-2xl pb-6 text-pretty text-base text-[#555d5e]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative isolate min-h-[560px] overflow-hidden bg-[#e7e1d5] px-6 py-24 lg:px-8">
          <Image
            src="/home-lagos-road.webp"
            alt="Illustrative Lagos road with vehicles and a bridge in the distance"
            fill
            sizes="100vw"
            className="-z-20 object-cover object-[65%_center]"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#f7f3ea]/50" />
          <Reveal className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold text-[#126ca0]">Ready when you are</p>
            <h2 className="sr-only">Less paperwork. More moving.</h2>
            <div className="mt-6 max-w-[680px]">
              <TaglineReveal text="Less paperwork. More moving." tone="dark" />
            </div>
            <p className="mt-6 max-w-md text-pretty text-base text-[#303638]">
              Tell MFS what your vehicle needs. We will confirm the requirements
              and help you take the next step.
            </p>
            <div className="mt-8"><PrimaryCta /></div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
