import type { Metadata } from "next";
import { ArrowUpRight, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { SiteSubpage } from "@/app/components/site-subpage";

const whatsappUrl =
  "https://wa.me/2349060004617?text=Hello%20MFS%2C%20I%20need%20help%20with%20my%20vehicle%20documents.";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact MFS Services about vehicle registration, renewals, insurance and permits in Lagos. Call, WhatsApp or visit the Gbagada office.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteSubpage currentPage="contact">
      <section className="grid lg:grid-cols-2">
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
              href={whatsappUrl}
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

        <div className="flex min-h-80 items-center bg-[#181818] px-6 py-24 text-white sm:px-12 lg:min-h-dvh lg:px-16">
          <div className="w-full max-w-xl">
            <p className="mb-12 text-sm font-semibold text-[#ff7466]">Other ways to reach us</p>
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 text-white/55">
                  <Phone aria-hidden="true" size={24} weight="duotone" />
                  <p className="text-sm font-semibold">Call</p>
                </div>
                <a
                  href="tel:+2349060004617"
                  className="focus-ring link-motion mt-4 inline-flex rounded-lg text-2xl font-semibold text-white hover:text-[#ff7466]"
                >
                  +234 906 000 4617
                </a>
              </div>
              <div>
                <div className="flex items-center gap-3 text-white/55">
                  <MapPin aria-hidden="true" size={24} weight="duotone" />
                  <p className="text-sm font-semibold">Visit</p>
                </div>
                <a
                  href="https://maps.google.com/?q=14+Lanre+Awolokun+Street+Gbagada+Lagos"
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring link-motion mt-4 inline-flex max-w-md rounded-lg text-pretty text-2xl font-semibold text-white hover:text-[#ff7466]"
                >
                  14 Lanre Awolokun Street, Gbagada Phase II, Lagos
                </a>
                <p className="mt-4 text-sm text-white/55">Monday to Friday, 8:00 AM to 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteSubpage>
  );
}
