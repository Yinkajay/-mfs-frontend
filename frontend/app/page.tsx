import type { Metadata } from "next";
import {
  ArrowRight,
  BellRinging,
  CarProfile,
  Certificate,
  CheckCircle,
  ClockCountdown,
  FileText,
  IdentificationCard,
  Package,
  ShieldCheck,
  SteeringWheel,
  WhatsappLogo,
} from "@phosphor-icons/react/ssr";
import { FluidNav } from "@/app/components/fluid-nav";
import { HeroCarousel } from "@/app/components/hero-carousel";
import { Reveal, TaglineReveal } from "@/app/components/reveal";
import { SiteFooter } from "@/app/components/site-footer";
import { CONTACT, WHATSAPP_REGISTRATION_URL } from "@/app/lib/contact";

export const metadata: Metadata = {
  title: "Vehicle Registration and Renewal in Lagos | MFS Services",
  description:
    "Get genuine vehicle registration, licence renewal, insurance, permits and roadworthiness documents in Lagos with pickup and delivery.",
  alternates: { canonical: "/" },
};

const benefits = [
  {
    icon: Certificate,
    title: "Documents you can trust",
    copy: "MFS is authorized by the Lagos State MVAA and licensed through AutoReg to issue and renew genuine vehicle documents.",
  },
  {
    icon: ClockCountdown,
    title: "New registration in 24 hours",
    copy: "We complete standard new vehicle registrations within 24 hours of payment. Weekend service is available when timing is tight.",
  },
  {
    icon: Package,
    title: "Pickup and delivery",
    copy: "Spend less time in queues. MFS can collect what is needed and return your completed documents to you.",
  },
  {
    icon: BellRinging,
    title: "Renew before expiry",
    copy: "Automated reminders reach you two weeks before expiry, so your vehicle stays compliant and ready for the road.",
  },
];

const services = [
  {
    icon: CarProfile,
    title: "New vehicle registration",
    copy: "Complete first registration for privately owned and commercial vehicles.",
  },
  {
    icon: FileText,
    title: "Vehicle licence renewal",
    copy: "Renew expired or expiring vehicle licences without the usual runaround.",
  },
  {
    icon: ShieldCheck,
    title: "Motor insurance",
    copy: "Choose authentic third party or comprehensive insurance cover.",
  },
  {
    icon: CheckCircle,
    title: "Roadworthiness certification",
    copy: "Process the required certification for vehicles operating in Lagos.",
  },
  {
    icon: IdentificationCard,
    title: "Hackney permits",
    copy: "Issue or renew permits for taxis, buses, trucks and other commercial vehicles.",
  },
  {
    icon: SteeringWheel,
    title: "Ownership and permits",
    copy: "Handle change of ownership, conversion, tinted permits and local government papers.",
  },
];

const process = [
  {
    number: "01",
    title: "Tell us what you need",
    copy: "Start a WhatsApp chat and share the vehicle document or renewal you want to process.",
  },
  {
    number: "02",
    title: "Confirm your requirements",
    copy: "We review the vehicle details, explain the required documents and confirm the expected cost.",
  },
  {
    number: "03",
    title: "Receive your documents",
    copy: "MFS processes the request and arranges pickup or delivery when your documents are ready.",
  },
];

const testimonials = [
  {
    quote: "Your kind of service puts customers in the safest experience.",
    name: "Engr. Omotayo",
  },
  {
    quote: "Thanks so much. You guys are amazing. I love the prompt service.",
    name: "Verified MFS customer",
  },
  {
    quote: "Thank God. Your service is good.",
    name: "Mrs. Okunsanya",
  },
];

const faqs = [
  {
    question: "Is MFS authorized to process vehicle documents?",
    answer:
      "Yes. MFS is an authorized agent of the Lagos State Motor Vehicle Administration Agency and a licensed AutoReg partner.",
  },
  {
    question: "How long does new vehicle registration take?",
    answer:
      "For standard new registration, allow up to 24 hours after payment. Timelines for other documents vary by request.",
  },
  {
    question: "What do I need for a new vehicle registration?",
    answer:
      "You will typically need the customs papers, passport photographs, engine number and a valid means of identification. The team will confirm the exact list for your vehicle.",
  },
  {
    question: "How much does vehicle registration cost?",
    answer:
      "The cost depends on the vehicle make, model, engine capacity and the documents required. Start a WhatsApp chat for a request specific estimate.",
  },
  {
    question: "Do you offer express pickup services?",
    answer:
      "Yes. Pickup and delivery are available, and MFS also offers a special weekend service. Availability and delivery fees depend on your location.",
  },
  {
    question: "Will you remind me before my documents expire?",
    answer:
      "Yes. The renewal management service sends an automated reminder two weeks before the expiry date.",
  },
  {
    question: "What happens if I lose my vehicle documents?",
    answer:
      "Contact the MFS team. They will review what was lost and guide you through the appropriate recovery or replacement process.",
  },
  {
    question: "Can MFS arrange a customized number plate?",
    answer:
      "Yes. Customized number plates are available. The team will confirm the current requirements, availability and price.",
  },
  {
    question: "What other services does MFS provide?",
    answer:
      "MFS also provides driver licence advisory, local government papers, tinted permits, health insurance management and credential verification.",
  },
];

function PrimaryCta({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      href={WHATSAPP_REGISTRATION_URL}
      target="_blank"
      rel="noreferrer"
      className={`focus-ring button-motion inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-3 py-2 text-base font-semibold ${
        inverse
          ? "bg-white text-[#181818] hover:bg-[#f7f3ea]"
          : "bg-[#ff4f3d] text-white hover:bg-[#e94132]"
      }`}
    >
      <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
      Start my registration
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

      <main id="main-content" className="overflow-hidden bg-[#f7f3ea] text-[#181818]">
        <section>
          <HeroCarousel />

          <Reveal>
            <div className="bg-white px-4 py-8 lg:px-8">
              <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4">
                {[
                  ["24 hours", "From payment to registration"],
                  ["2 weeks", "Advance renewal reminder"],
                  ["Lagos", "Pickup and delivery service"],
                ].map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-semibold tracking-tight text-[#181818] md:text-3xl">
                      {value}
                    </p>
                    <p className="mt-2 text-pretty text-xs font-semibold text-[#777b78] md:text-sm">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="bg-[#181818] px-4 py-24 text-white lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="mb-6 text-sm font-semibold text-[#ff7466]">The problem</p>
              <h2 className="max-w-xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Vehicle paperwork should not cost you a day at an office.
              </h2>
            </Reveal>
            <Reveal delay={120} className="flex items-end">
              <div className="max-w-xl">
                <p className="text-pretty text-lg text-white/65">
                  Expired papers create unnecessary risk. Unclear requirements,
                  queues and repeated visits make a simple renewal harder than it
                  should be.
                </p>
                <p className="mt-6 text-pretty text-lg text-white/90">
                  MFS coordinates the process with the appropriate agencies, keeps
                  you informed and returns genuine documents without the usual
                  runaround.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="services" className="scroll-mt-24 bg-white px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-[#e94132]">Why MFS</p>
              <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Stay compliant without carrying the process yourself.
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-4 md:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <Reveal key={benefit.title} delay={index * 80}>
                    <article className="benefit-card h-full rounded-3xl bg-[#f7f3ea] p-8">
                      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#181818] text-white">
                        <Icon aria-hidden="true" size={26} weight="duotone" />
                      </div>
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {benefit.title}
                      </h3>
                      <p className="mt-4 max-w-lg text-pretty text-base text-[#686d69]">
                        {benefit.copy}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#ff4f3d] px-4 py-24 text-white lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-8 text-sm font-semibold text-white/70">The MFS promise</p>
            <TaglineReveal text="From the first registration to every renewal, your vehicle stays ready for the road." />
          </div>
        </section>

        <section className="bg-[#f7f3ea] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-semibold text-[#e94132]">What we process</p>
                <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                  The documents your vehicle needs, handled in one place.
                </h2>
              </div>
              <a
                href={WHATSAPP_REGISTRATION_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ring link-motion inline-flex items-center gap-2 rounded-full text-base font-semibold text-[#181818]"
              >
                Ask about another document
                <ArrowRight aria-hidden="true" size={18} weight="bold" />
              </a>
            </Reveal>

            <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => {
                const Icon = service.icon;

                return (
                  <Reveal key={service.title} delay={(index % 3) * 80}>
                    <article className="service-card h-full rounded-2xl border border-black/10 bg-white p-6">
                      <Icon
                        aria-hidden="true"
                        size={32}
                        weight="duotone"
                        className="mb-8 text-[#ff4f3d]"
                      />
                      <h3 className="text-xl font-semibold tracking-tight">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-pretty text-base text-[#686d69]">
                        {service.copy}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 bg-white px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold text-[#e94132]">How it works</p>
              <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Start in a chat. Finish with genuine documents.
              </h2>
              <p className="mt-6 max-w-2xl text-pretty text-lg text-[#686d69]">
                Begin with a requirements check. We confirm what you need and the
                expected cost before processing starts.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-4 lg:grid-cols-3">
              {process.map((step, index) => (
                <Reveal key={step.number} delay={index * 100}>
                  <article className="h-full rounded-3xl bg-[#181818] p-8 text-white">
                    <p className="mb-16 text-sm font-semibold text-[#ff7466]">
                      {step.number}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-pretty text-base text-white/60">
                      {step.copy}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="scroll-mt-24 bg-[#f7f3ea] px-4 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="mb-4 text-sm font-semibold text-[#e94132]">Customer proof</p>
                <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                  A safer, simpler experience for vehicle owners.
                </h2>
              </div>
              <p className="max-w-xl text-pretty text-lg text-[#686d69] lg:justify-self-end">
                MFS puts clear communication, authentic documents and prompt
                service at the center of every request.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-4 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial.name} delay={index * 90}>
                  <figure className="flex h-full flex-col justify-between rounded-3xl bg-white p-8">
                    <div aria-label="Five out of five stars" className="text-sm text-[#ff4f3d]">
                      ★ ★ ★ ★ ★
                    </div>
                    <blockquote className="my-12 text-pretty text-2xl font-semibold tracking-tight text-[#252a27]">
                      “{testimonial.quote}”
                    </blockquote>
                    <figcaption className="text-sm font-semibold text-[#777b78]">
                      {testimonial.name}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-white px-4 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.75fr_1.25fr]">
            <Reveal>
              <div className="max-w-md lg:sticky lg:top-24">
                <p className="mb-4 text-sm font-semibold text-[#e94132]">Common questions</p>
                <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                  Know what to expect before you start.
                </h2>
                <p className="mt-6 text-pretty text-base text-[#686d69]">
                  Need an answer specific to your vehicle? The MFS team can review
                  it on WhatsApp.
                </p>
                <div className="mt-8">
                  <PrimaryCta />
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details
                    key={faq.question}
                    className="faq-item group rounded-2xl border border-black/10 bg-[#f7f3ea] px-6"
                    open={index === 0}
                  >
                    <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 rounded-xl py-6 text-lg font-semibold">
                      {faq.question}
                      <span
                        aria-hidden="true"
                        className="faq-plus shrink-0 text-2xl font-normal text-[#ff4f3d]"
                      >
                        +
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-6 text-pretty text-base text-[#686d69]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#ff4f3d] px-4 py-24 text-white lg:px-8">
          <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-6 text-sm font-semibold text-white/70">Ready when you are</p>
              <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Get your vehicle documents moving today.
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-lg text-white/80">
                Tell us what you need. We will confirm the requirements and guide
                you through the next step.
              </p>
            </div>
            <PrimaryCta inverse />
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
