import Link from "next/link";
import { ArrowLeft, MapPin } from "@phosphor-icons/react/ssr";
import { BrandLogo } from "@/app/components/brand-logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-[#181818] px-4 py-16 text-white lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <Link
            href="/"
            className="focus-ring inline-flex rounded-lg bg-white"
          >
            <BrandLogo variant="solid" className="h-10 w-auto rounded-lg" preload />
          </Link>
          <p className="mt-24 text-sm font-semibold text-[#ff7466]">Page not found</p>
          <h1 className="mt-4 max-w-[680px] text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            This route does not lead to your documents.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-white/60">
            The page may have moved, but your way back to MFS is right here.
          </p>
          <Link
            href="/"
            className="focus-ring button-motion mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4f3d] px-3 py-2 text-base font-semibold text-white"
          >
            <ArrowLeft aria-hidden="true" size={18} weight="bold" />
            Return to MFS Services
          </Link>
        </div>

        <div className="flex items-center justify-center rounded-3xl bg-[#1f1f1f] p-8 md:p-16">
          <div className="text-center">
            <MapPin aria-hidden="true" size={96} weight="duotone" className="mx-auto text-[#ff4f3d]" />
            <p className="mt-8 text-8xl font-semibold tracking-tight">404</p>
          </div>
        </div>
      </div>
    </main>
  );
}
