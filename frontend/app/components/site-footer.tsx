import Link from "next/link";
import {
  EnvelopeSimple,
  InstagramLogo,
  MapPin,
  Phone,
  TiktokLogo,
  WhatsappLogo,
} from "@phosphor-icons/react/ssr";
import { BrandLogo } from "@/app/components/brand-logo";
import { CONTACT, WHATSAPP_HELP_URL } from "@/app/lib/contact";

export function SiteFooter() {
  return (
    <footer className="bg-[#181818] px-4 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              aria-label="MFS Services home"
              className="focus-ring inline-flex rounded-lg bg-white"
            >
              <BrandLogo variant="solid" className="h-10 w-auto rounded-lg" />
            </Link>
            <p className="mt-6 max-w-xs text-pretty text-sm text-white/55">
              Genuine vehicle registration, renewals, insurance and compliance
              documents for individuals and organisations in Lagos.
            </p>
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-white/40">
              <MapPin aria-hidden="true" size={18} weight="duotone" />
              Visit
            </p>
            <div className="mt-4 space-y-4">
              {CONTACT.locations.map((location) => (
                <a
                  key={location.label}
                  href={location.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring link-motion block max-w-xs rounded-lg text-sm font-semibold text-white/85"
                >
                  <span className="block text-xs text-white/45">{location.label}</span>
                  <span className="mt-1 block text-pretty">{location.address}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-white/40">
              <Phone aria-hidden="true" size={18} weight="duotone" />
              Call
            </p>
            <div className="mt-4 grid gap-3">
              {CONTACT.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="focus-ring link-motion w-fit rounded-lg text-sm font-semibold text-white/85"
                >
                  {phone.display}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/40">Connect</p>
            <a
              href={CONTACT.emailHref}
              className="focus-ring link-motion mt-4 flex items-start gap-3 rounded-lg text-sm font-semibold text-white/85"
            >
              <EnvelopeSimple aria-hidden="true" size={20} weight="duotone" className="shrink-0" />
              <span className="break-all">{CONTACT.email}</span>
            </a>
            <a
              href={WHATSAPP_HELP_URL}
              target="_blank"
              rel="noreferrer"
              className="focus-ring link-motion mt-4 flex items-center gap-3 rounded-lg text-sm font-semibold text-white/85"
            >
              <WhatsappLogo aria-hidden="true" size={20} weight="duotone" />
              WhatsApp MFS
            </a>
            <div className="mt-6 flex gap-3">
              <a
                href={CONTACT.socials.instagram.url}
                target="_blank"
                rel="noreferrer"
                aria-label="MFS Services on Instagram"
                className="focus-ring icon-link flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
              >
                <InstagramLogo aria-hidden="true" size={20} />
              </a>
              <a
                href={CONTACT.socials.tiktok.url}
                target="_blank"
                rel="noreferrer"
                aria-label="MFS Services on TikTok"
                className="focus-ring icon-link flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white"
              >
                <TiktokLogo aria-hidden="true" size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MFS Services. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="focus-ring link-motion rounded-lg">
              Privacy policy
            </Link>
            <Link href="/terms" className="focus-ring link-motion rounded-lg">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
