import type { Metadata } from "next";
import {
  ArrowUpRight,
  EnvelopeSimple,
  InstagramLogo,
  MapPin,
  Phone,
  TiktokLogo,
  WhatsappLogo,
} from "@phosphor-icons/react/ssr";
import { SiteSubpage } from "@/app/components/site-subpage";
import { CONTACT, WHATSAPP_HELP_URL } from "@/app/lib/contact";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact MFS Services about vehicle registration, renewals, insurance and permits in Lagos. Call, email, WhatsApp or visit either Gbagada office.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteSubpage currentPage="contact">
      <section className="grid lg:min-h-dvh lg:grid-cols-2">
        <div className="flex min-h-dvh items-center px-6 pb-24 pt-24 sm:px-12 lg:px-16">
          <div className="max-w-[680px]">
            <p className="mb-6 text-sm font-semibold text-[#e94132]">Contact MFS Services</p>
            <h1 className="hero-heading text-balance text-5xl font-semibold tracking-tight md:text-6xl">
              Tell us what your vehicle needs.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-[#686d69]">
              Tell us which document you need, or where you are in the process.
              We will confirm the requirements and the next step.
            </p>
            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noreferrer"
              className="focus-ring button-motion mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4f3d] px-3 py-2 text-base font-semibold text-white hover:bg-[#e94132]"
            >
              <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
              Chat with MFS
              <ArrowUpRight aria-hidden="true" size={18} weight="bold" />
            </a>
          </div>
        </div>

        <div className="flex items-center bg-[#181818] px-6 py-24 text-white sm:px-12 lg:px-16">
          <div className="w-full max-w-xl">
            <p className="text-sm font-semibold text-[#ff7466]">Call or email</p>
            <div className="mt-12 grid gap-12 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-3 text-white/55">
                  <Phone aria-hidden="true" size={24} weight="duotone" />
                  <h2 className="text-sm font-semibold">Phone lines</h2>
                </div>
                <div className="mt-6 grid gap-4">
                  {CONTACT.phones.map((phone) => (
                    <a
                      key={phone.href}
                      href={phone.href}
                      className="focus-ring link-motion w-fit rounded-lg text-xl font-semibold text-white hover:text-[#ff7466]"
                    >
                      {phone.display}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 text-white/55">
                  <EnvelopeSimple aria-hidden="true" size={24} weight="duotone" />
                  <h2 className="text-sm font-semibold">Email</h2>
                </div>
                <a
                  href={CONTACT.emailHref}
                  className="focus-ring link-motion mt-6 block break-all rounded-lg text-xl font-semibold text-white hover:text-[#ff7466]"
                >
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold text-[#e94132]">Find MFS</p>
            <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Visit an office or follow us online.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {CONTACT.locations.map((location) => (
              <div key={location.label}>
                <MapPin aria-hidden="true" size={32} weight="duotone" className="text-[#ff4f3d]" />
                <h3 className="mt-8 text-xl font-semibold">{location.label}</h3>
                <p className="mt-4 max-w-sm text-pretty text-base text-[#686d69]">
                  {location.address}
                </p>
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring link-motion mt-6 inline-flex items-center gap-2 rounded-lg text-base font-semibold text-[#181818]"
                >
                  Open in Google Maps
                  <ArrowUpRight aria-hidden="true" size={18} weight="bold" />
                </a>
              </div>
            ))}

            <div>
              <InstagramLogo aria-hidden="true" size={32} className="text-[#ff4f3d]" />
              <h3 className="mt-8 text-xl font-semibold">Follow MFS</h3>
              <div className="mt-4 grid gap-4">
                <a
                  href={CONTACT.socials.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring link-motion flex w-fit items-center gap-3 rounded-lg text-base font-semibold text-[#181818]"
                >
                  <InstagramLogo aria-hidden="true" size={20} />
                  {CONTACT.socials.instagram.handle}
                </a>
                <a
                  href={CONTACT.socials.tiktok.url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring link-motion flex w-fit items-center gap-3 rounded-lg text-base font-semibold text-[#181818]"
                >
                  <TiktokLogo aria-hidden="true" size={20} />
                  {CONTACT.socials.tiktok.handle}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteSubpage>
  );
}
