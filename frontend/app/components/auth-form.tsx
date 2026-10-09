"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/app/components/auth-provider";
import {
  AuthApiError,
  authApi,
  authErrorMessage,
  type AuthField,
  type FieldErrors,
} from "@/app/lib/auth-api";
import { validateAuthInput } from "@/app/lib/auth-validation";

const inputClassName =
  "focus-ring mt-2 h-12 w-full rounded-lg border border-black/10 bg-[#f7f7f5] px-3 text-sm text-[#181818] placeholder:text-[#9a9d99] disabled:cursor-not-allowed aria-invalid:border-[#b52d21]";
const buttonClassName =
  "focus-ring button-motion mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#181818] px-3 py-2 text-base font-semibold text-white hover:bg-[#313131] disabled:cursor-wait disabled:bg-[#aeb3af]";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const auth = useAuth();
  const router = useRouter();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [registrationAccepted, setRegistrationAccepted] = useState(false);
  const isLogin = mode === "login" || registrationAccepted;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const loading = pending || auth.busy !== null || auth.phase === "checking";

  function showFields(form: HTMLFormElement, fields: FieldErrors) {
    setErrors(fields);
    const first = Object.keys(fields)[0];
    if (first)
      requestAnimationFrame(() =>
        (form.elements.namedItem(first) as HTMLElement | null)?.focus(),
      );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (name: string) => String(data.get(name) ?? "");
    const input = {
      firstName: read("firstName").trim(),
      lastName: read("lastName").trim(),
      email: read("email").trim().toLowerCase(),
      phone: read("phone").trim(),
      // Never trim, normalize, or truncate the password.
      password: read("password"),
    };
    const fields = validateAuthInput(
      isLogin ? "login" : "signup",
      input,
      data.get("agree") === "on",
    );
    setError(null);
    showFields(form, fields);
    if (Object.keys(fields).length) return;
    submitting.current = true;
    setPending(true);
    try {
      if (!isLogin) {
        await authApi.register(input);
        // Acceptance is generic, not proof of a new account. Authenticate with
        // the supplied credentials, and retry only login if this step fails.
        setRegistrationAccepted(true);
      }
      await auth.login({ email: input.email, password: input.password });
      form.reset();
      router.replace("/");
    } catch (failure) {
      setError(authErrorMessage(failure));
      if (failure instanceof AuthApiError) showFields(form, failure.fields);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const fieldError = (field: AuthField) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-2 text-sm text-[#b52d21]">
        {errors[field]}
      </p>
    ) : null;
  const accessibility = (field: AuthField) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  if (auth.user) {
    return (
      <div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          You’re signed in.
        </h1>
        <p className="mt-3 text-pretty text-sm text-[#686d69]">
          {auth.user.firstName}, you can return to the MFS home page.
        </p>
        <Link href="/" className={buttonClassName}>
          Back home
        </Link>
        <button
          type="button"
          onClick={() => void auth.logout()}
          disabled={auth.busy !== null}
          className="focus-ring button-motion mt-4 min-h-12 w-full rounded-lg bg-[#f7f7f5] px-3 text-sm font-semibold hover:bg-[#eceeeb] disabled:cursor-wait"
        >
          {auth.busy === "logout" ? "Logging out…" : "Log out"}
        </button>
        {auth.error && (
          <p role="alert" className="mt-4 text-sm text-[#b52d21]">
            {auth.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        {isLogin ? "Log in to your account." : "Create your account."}
      </h1>
      <p className="mt-3 text-pretty text-sm text-[#686d69]">
        {isLogin
          ? "Your vehicle services, all in one place."
          : "Keep your vehicle documents within reach."}
      </p>

      {registrationAccepted && !pending && (
        <p role="status" className="mt-4 text-pretty text-sm text-[#686d69]">
          Registration request received. Log in to continue.
        </p>
      )}
      <form
        className="mt-8"
        onSubmit={submit}
        noValidate
        aria-busy={loading}
        onChange={(event) => {
          const target: EventTarget = event.target;
          if (!(target instanceof HTMLInputElement)) return;
          const field = target.name as AuthField;
          setErrors((current) => ({ ...current, [field]: undefined }));
          setError(null);
        }}
      >
        {(error || auth.error) && (
          <div role="alert" className="mb-4 text-pretty text-sm text-[#b52d21]">
            <p>{error || auth.error}</p>
            {auth.phase === "error" && !error && (
              <button
                type="button"
                onClick={() => void auth.restore()}
                className="focus-ring mt-2 rounded font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
        )}
        <fieldset disabled={loading}>
          <legend className="sr-only">{isLogin ? "Log in" : "Sign up"}</legend>
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
                  required
                  placeholder="First name"
                  className={inputClassName}
                  {...accessibility("firstName")}
                />
                {fieldError("firstName")}
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
                  required
                  placeholder="Last name"
                  className={inputClassName}
                  {...accessibility("lastName")}
                />
                {fieldError("lastName")}
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
              required
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              className={inputClassName}
              {...accessibility("email")}
            />
            {fieldError("email")}
          </div>
          {!isLogin && (
            <div className="mt-4">
              <label htmlFor="phone" className="text-sm font-semibold">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="Your phone number"
                className={inputClassName}
                {...accessibility("phone")}
              />
              {fieldError("phone")}
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Enter your password"
              className={inputClassName}
              {...accessibility("password")}
              aria-describedby={
                errors.password
                  ? "password-error"
                  : !isLogin
                    ? "password-help"
                    : undefined
              }
            />
            {!isLogin && (
              <p id="password-help" className="mt-2 text-sm text-[#686d69]">
                Use 8–128 characters.
              </p>
            )}
            {fieldError("password")}
          </div>
          {!isLogin && (
            <>
              <div className="mt-4 flex items-start gap-3">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  required
                  aria-label="Agree to the terms and privacy policy"
                  {...accessibility("agree")}
                  className="focus-ring mt-1 h-4 w-4 shrink-0 rounded border-black/20 disabled:cursor-not-allowed"
                />
                <p className="text-pretty text-xs text-[#686d69]">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="focus-ring underline underline-offset-2"
                  >
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="focus-ring underline underline-offset-2"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
              {fieldError("agree")}
            </>
          )}
          <button type="submit" disabled={loading} className={buttonClassName}>
            {auth.phase === "checking" && !pending
              ? "Checking session…"
              : pending
                ? isLogin
                  ? "Logging in…"
                  : "Submitting…"
                : isLogin
                  ? "Log in"
                  : "Create account"}
          </button>
        </fieldset>
      </form>
      <p className="mt-6 text-center text-sm text-[#686d69]">
        {isLogin ? "New to MFS?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/auth/signup" : "/auth/login"}
          onClick={() => {
            setRegistrationAccepted(false);
            setError(null);
            setErrors({});
          }}
          className="focus-ring rounded font-semibold text-[#181818] underline underline-offset-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#e94132]"
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </>
  );
}
