import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { BrandLogo } from "@/app/components/brand-logo";

const whatsappUrl =
  "https://wa.me/2349060004617?text=Hello%20MFS%2C%20I%20need%20help%20with%20my%20vehicle%20documents.";

type AuthPageProps = {
  mode: "login" | "signup";
};

const inputClassName =
  "mt-2 h-12 w-full rounded-lg border border-black/10 bg-[#f7f7f5] px-3 text-sm text-[#181818] placeholder:text-[#9a9d99] disabled:cursor-not-allowed";

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";

  return (
    <main className="grid min-h-dvh bg-white text-[#181818] lg:grid-cols-2">
      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-12 lg:px-16">
        <nav aria-label="Page navigation" className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="MFS Services home" className="focus-ring rounded-lg">
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
              <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                {isLogin ? "Log in to your account." : "Create your account."}
              </h1>
              <p className="mt-3 text-pretty text-sm text-[#686d69]">
                {isLogin
                  ? "Your vehicle services, all in one place."
                  : "Keep your vehicle documents within reach."}
              </p>

              <form className="mt-8">
                <fieldset disabled>
                  <legend className="sr-only">
                    {isLogin ? "Log in" : "Sign up"}
                  </legend>

                  {!isLogin && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="first-name" className="text-sm font-semibold">
                          First name
                        </label>
                        <input
                          id="first-name"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          placeholder="First name"
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label htmlFor="last-name" className="text-sm font-semibold">
                          Last name
                        </label>
                        <input
                          id="last-name"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          placeholder="Last name"
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  )}

                  <div className={isLogin ? "" : "mt-4"}>
                    <label htmlFor="email" className="text-sm font-semibold">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClassName}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      placeholder="Enter your password"
                      className={inputClassName}
                    />
                  </div>

                  {!isLogin && (
                    <div className="mt-4 flex items-start gap-3">
                      <input
                        id="agree"
                        name="agree"
                        type="checkbox"
                        aria-label="Agree to the terms and privacy policy"
                        className="mt-1 h-4 w-4 shrink-0 rounded border-black/20 disabled:cursor-not-allowed"
                      />
                      <p className="text-pretty text-xs text-[#686d69]">
                        I agree to the{" "}
                        <Link href="/terms" className="focus-ring underline underline-offset-2">
                          terms of service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="focus-ring underline underline-offset-2">
                          privacy policy
                        </Link>
                        .
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled
                    className="mt-6 flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#aeb3af] px-3 py-2 text-base font-semibold text-white"
                  >
                    {isLogin ? "Log in" : "Create account"}
                  </button>
                </fieldset>
              </form>

              <p className="mt-6 text-center text-sm text-[#686d69]">
                {isLogin ? "New to MFS?" : "Already have an account?"}{" "}
                <Link
                  href={isLogin ? "/auth/signup" : "/auth/login"}
                  className="focus-ring rounded font-semibold text-[#181818] underline underline-offset-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#e94132]"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </Link>
              </p>

              <div className="mt-8 text-center">
                <a
                  href={whatsappUrl}
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
          <p className="text-sm font-semibold text-white/65">A word from an MFS customer</p>
          <div>
            <blockquote className="max-w-md text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              “Your kind of service puts customers in the safest experience.”
            </blockquote>
            <p className="mt-6 text-sm font-semibold text-white/80">Engr. Omotayo</p>
          </div>
          <p className="text-sm text-white/65">
            Vehicle registration and renewals in Lagos.
          </p>
        </div>
      </aside>
    </main>
  );
}
