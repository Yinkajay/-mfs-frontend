import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  WhatsappLogo,
} from "@phosphor-icons/react/ssr";
import { BrandLogo } from "@/app/components/brand-logo";
import { AuthForm } from "@/app/components/auth-form";
import { WHATSAPP_HELP_URL } from "@/app/lib/contact";

type AuthPageProps = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  return (
    <main className="grid min-h-dvh bg-white text-[#181818] lg:grid-cols-2">
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-12 lg:px-16">
        <nav
          aria-label="Page navigation"
          className="flex items-center justify-between gap-4"
        >
          <Link
            href="/"
            aria-label="MFS Services home"
            className="focus-ring rounded-lg"
          >
            <BrandLogo className="h-8 w-auto sm:h-10" preload />
          </Link>
          <Link
            href="/"
            className="focus-ring button-motion inline-flex min-h-10 items-center gap-2 rounded-full bg-[#f7f7f5] px-3 py-2 text-sm font-semibold text-[#181818] hover:bg-[#eceeeb]"
          >
            <ArrowLeft aria-hidden="true" size={16} weight="bold" />
            Back home
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-16">
          <div className="w-full max-w-md">
            <AuthForm key={mode} mode={mode} />

            <div className="mt-8 text-center">
              <a
                href={WHATSAPP_HELP_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ring link-motion inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#181818]"
              >
                <WhatsappLogo aria-hidden="true" size={18} weight="fill" />
                Need help now? Chat with MFS
                <ArrowUpRight aria-hidden="true" size={16} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <aside className="relative hidden bg-[#181818] text-white lg:block lg:min-h-dvh">
        <Image
          src="/lexus.webp"
          alt=""
          fill
          sizes="50vw"
          className="object-cover object-[68%_center]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full min-h-80 flex-col justify-between p-8 sm:p-12 lg:p-16">
          <p className="text-sm font-semibold text-white/65">
            A word from an MFS customer
          </p>
          <div>
            <blockquote className="max-w-md text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              “Your kind of service puts customers in the safest experience.”
            </blockquote>
            <p className="mt-6 text-sm font-semibold text-white/80">
              Engr. Omotayo
            </p>
          </div>
          <p className="text-sm text-white/65">
            Vehicle registration and renewals in Lagos.
          </p>
        </div>
      </aside>
    </main>
  );
}
