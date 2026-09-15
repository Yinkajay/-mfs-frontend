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
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  SteeringWheel,
  WhatsappLogo,
} from "@phosphor-icons/react/ssr";
import { FluidNav } from "@/app/components/fluid-nav";
import { BrandLogo } from "@/app/components/brand-logo";
import { Reveal, TaglineReveal } from "@/app/components/reveal";

const whatsappUrl =
  "https://wa.me/2349032243284?text=Hello%20MFS%2C%20I%20want%20to%20start%20my%20vehicle%20registration.";

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
    title: "Registration in two days",
    copy: "New vehicle registration takes two days, with a special weekend service available when timing is tight.",
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
      "The standard timeline stated by MFS is two days. Timing for other documents depends on the specific request and supporting information.",
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
      href={whatsappUrl}
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

function HeroVisual() {
  const timeline = [
    ["Request received", "Complete"],
    ["Documents verified", "Complete"],
    ["Processing with agency", "Current"],
    ["Ready for delivery", "Next"],
  ];

  return (
    <aside
      aria-label="Vehicle registration request preview"
      className="relative mx-auto w-full max-w-xl pb-12 md:pb-16"
    >
      <div className="rounded-3xl bg-[#181818] p-2 shadow-[0_32px_80px_rgba(24,24,24,0.24)]">
        <div className="overflow-hidden rounded-2xl bg-[#f7f3ea] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#777b78]">MFS request desk</p>
              <p className="mt-1 text-lg font-semibold text-[#181818]">
                Vehicle licence renewal
              </p>
            </div>
            <span className="rounded-full bg-[#dff5e8] px-3 py-2 text-xs font-semibold text-[#17663b]">
              In progress
            </span>
          </div>

          <div className="my-8 flex items-center justify-center bg-white p-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#fff0ed] text-[#ff4f3d]">
              <CarProfile aria-hidden="true" size={60} weight="duotone" />
            </div>
          </div>

          <div className="space-y-6">
            {timeline.map(([label, status], index) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index < 2
                      ? "bg-[#181818] text-white"
                      : index === 2
                        ? "bg-[#ff4f3d] text-white"
                        : "border border-black/10 bg-white text-[#777b78]"
                  }`}
                >
                  {index < 2 ? (
                    <CheckCircle aria-hidden="true" size={16} weight="fill" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="flex-1 text-sm font-semibold text-[#303532]">
                  {label}
                </span>
                <span className="text-xs font-semibold text-[#8b8f8c]">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -left-4 bottom-0 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_24px_48px_rgba(24,24,24,0.14)] sm:left-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0ed] text-[#ff4f3d]">
            <Certificate aria-hidden="true" size={24} weight="duotone" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[#898d89]">Authorization</p>
            <p className="text-sm font-semibold text-[#181818]">Lagos State MVAA</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-2 bottom-4 rounded-2xl bg-[#ff4f3d] p-4 text-white shadow-[0_24px_48px_rgba(255,79,61,0.28)] sm:right-6">
        <div className="flex items-center gap-3">
          <BellRinging aria-hidden="true" size={24} weight="duotone" />
          <div>
            <p className="text-xs font-semibold text-white/70">Renewal reminder</p>
            <p className="text-sm font-semibold">Two weeks early</p>
          </div>
        </div>
      </div>
    </aside>
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
    telephone: "+2349060008491",
    description:
      "Vehicle registration, licence renewal, insurance and vehicle documentation services in Lagos, Nigeria.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "14 Lanre Awolokun Street, Gbagada Phase II",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
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
        <section className="px-4 pb-24 pt-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="max-w-[680px]">
                <h1 className="hero-heading text-balance text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                  Get genuine vehicle documents
                  <br />
                  without the runaround.
                </h1>
                <p className="mt-6 max-w-[680px] text-pretty text-lg text-[#5d625f] md:text-xl">
                  From new registration and licence renewals to insurance,
                  roadworthiness and permits, MFS handles the process for Lagos
                  vehicle owners and fleets.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <PrimaryCta />
                  <p className="flex max-w-sm items-center gap-2 text-sm font-semibold text-[#555a57]">
                    <ShieldCheck
                      aria-hidden="true"
                      size={20}
                      weight="duotone"
                      className="shrink-0 text-[#ff4f3d]"
                    />
                    Authorized by Lagos State MVAA and licensed through AutoReg
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <HeroVisual />
            </Reveal>
          </div>

          <Reveal className="mx-auto mt-20 max-w-7xl" delay={220}>
            <div className="grid gap-2 rounded-3xl bg-white p-2 sm:grid-cols-3">
              {[
                ["2 days", "Standard new registration"],
                ["2 weeks", "Advance renewal reminder"],
                ["Lagos", "Pickup and delivery service"],
              ].map(([value, label]) => (
                <div key={label} className="px-6 py-6 text-center sm:text-left">
                  <p className="text-3xl font-semibold tracking-tight text-[#181818]">
                    {value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#777b78]">{label}</p>
                </div>
              ))}
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
                href={whatsappUrl}
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

      <footer className="bg-[#181818] px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <a
                href="#main-content"
                aria-label="MFS Services home"
                className="focus-ring inline-flex rounded-lg bg-white"
              >
                <BrandLogo variant="solid" className="h-10 w-auto rounded-lg" />
              </a>
              <p className="mt-6 max-w-xs text-pretty text-sm text-white/55">
                Genuine vehicle registration, renewals, insurance and compliance
                documents for individuals and organizations in Lagos.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white/40">Visit</p>
              <a
                href="https://maps.google.com/?q=14+Lanre+Awolokun+Street+Gbagada+Lagos"
                target="_blank"
                rel="noreferrer"
                className="focus-ring link-motion mt-4 flex max-w-xs items-start gap-3 rounded-xl text-sm font-semibold text-white/85"
              >
                <MapPin aria-hidden="true" size={20} weight="duotone" className="shrink-0" />
                14 Lanre Awolokun Street, Gbagada Phase II, Lagos
              </a>
              <p className="mt-4 text-sm text-white/50">
                Monday to Friday, 8:00 AM to 5:00 PM
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white/40">Contact</p>
              <a
                href="tel:+2349060008491"
                className="focus-ring link-motion mt-4 flex items-center gap-3 rounded-xl text-sm font-semibold text-white/85"
              >
                <Phone aria-hidden="true" size={20} weight="duotone" />
                0906 000 8491
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring link-motion mt-4 flex items-center gap-3 rounded-xl text-sm font-semibold text-white/85"
              >
                <WhatsappLogo aria-hidden="true" size={20} weight="duotone" />
                WhatsApp MFS
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold text-white/40">Follow</p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://www.instagram.com/mfsservicesng/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="MFS Services on Instagram"
                  className="focus-ring icon-link flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
                >
                  <InstagramLogo aria-hidden="true" size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/in/mfs-services/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="MFS Services on LinkedIn"
                  className="focus-ring icon-link flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
                >
                  <LinkedinLogo aria-hidden="true" size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border border-white/10 p-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MFS Services. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privacy" className="focus-ring link-motion rounded-lg">
                Privacy policy
              </a>
              <a href="/terms" className="focus-ring link-motion rounded-lg">
                Terms of service
              </a>
            </div>
          </div>
        </div>
      </footer>

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
