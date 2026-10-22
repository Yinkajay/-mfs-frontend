"use client";

import {
  ArrowClockwise,
  MagnifyingGlass,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ServicesApiError,
  servicesApi,
  type CatalogueService,
} from "@/app/lib/services-api";

type LoadState = "loading" | "ready" | "error";

function retryPause(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, 1200);
    signal.addEventListener("abort", finish, { once: true });
  });
}

function CatalogueSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading service catalogue"
      className="grid gap-x-10 md:grid-cols-2 xl:grid-cols-3"
    >
      <span className="sr-only">Loading service catalogue…</span>
      {Array.from({ length: 9 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="min-h-44 border-t border-black/10 py-6"
        >
          <div className="h-3 w-10 animate-pulse rounded-full bg-black/10" />
          <div className="mt-8 h-6 w-4/5 animate-pulse rounded-full bg-black/10" />
          <div className="mt-4 h-4 w-2/5 animate-pulse rounded-full bg-black/5" />
        </div>
      ))}
    </div>
  );
}

function CatalogueCard({
  service,
  index,
}: {
  service: CatalogueService;
  index: number;
}) {
  return (
    <article className="group min-h-44 border-t border-black/15 py-6 transition-colors duration-500 hover:border-[#ff4f3d]">
      <p className="text-xs font-semibold tabular-nums text-[#a34a40]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="mt-7 max-w-sm text-balance text-xl font-semibold leading-snug tracking-tight text-[#181818] md:text-2xl">
        {service.name}
      </h2>
      {service.description && (
        <p className="mt-4 max-w-md text-pretty text-sm leading-6 text-[#686d69]">
          {service.description}
        </p>
      )}
      {service.variants.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#858985]">
            Options
          </p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${service.name} options`}>
            {service.variants.map((variant) => (
              <li
                key={variant.code}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-[#4f5450]"
              >
                {variant.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function ServicesCatalogue() {
  const [state, setState] = useState<LoadState>("loading");
  const [services, setServices] = useState<CatalogueService[]>([]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);

  const load = useCallback((signal: AbortSignal) => {
    const request = async (retry: boolean) => {
      try {
        const items = await servicesApi.list(signal);
        setServices(items);
        setState("ready");
      } catch (error: unknown) {
        if (signal.aborted) return;
        if (
          retry &&
          error instanceof ServicesApiError &&
          (error.status === 0 || error.status >= 500)
        ) {
          await retryPause(signal);
          if (!signal.aborted) await request(false);
          return;
        }
        setServices([]);
        setMessage(
          error instanceof ServicesApiError
            ? error.message
            : "We couldn’t load the service catalogue. Please try again.",
        );
        setState("error");
      }
    };
    void request(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [attempt, load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("en-NG");
    if (!term) return services;
    return services.filter((service) =>
      [service.name, ...service.variants.map(({ name }) => name)].some((value) =>
        value.toLocaleLowerCase("en-NG").includes(term),
      ),
    );
  }, [query, services]);

  return (
    <section aria-labelledby="catalogue-heading" className="bg-[#f7f3ea] px-4 pb-24 lg:px-8 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#e94132]">Catalogue</p>
            <h2
              id="catalogue-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl"
            >
              Find a service.
            </h2>
          </div>

          <label className="relative block w-full md:max-w-md">
            <span className="sr-only">Search services</span>
            <MagnifyingGlass
              aria-hidden="true"
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#686d69]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services"
              disabled={state !== "ready" || services.length === 0}
              className="focus-ring min-h-12 w-full rounded-full border border-black/15 bg-white py-3 pl-12 pr-12 text-base text-[#181818] outline-none placeholder:text-[#8b8f8b] disabled:cursor-not-allowed disabled:opacity-60"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear service search"
                onClick={() => setQuery("")}
                className="focus-ring icon-link absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#686d69]"
              >
                <X aria-hidden="true" size={16} weight="bold" />
              </button>
            )}
          </label>
        </div>

        {state === "ready" && services.length > 0 && (
          <p className="py-5 text-sm font-semibold text-[#686d69]" aria-live="polite">
            {query.trim()
              ? `${filtered.length} of ${services.length} services`
              : `${services.length} services`}
          </p>
        )}

        {state === "loading" && <div className="pt-6"><CatalogueSkeleton /></div>}

        {state === "error" && (
          <div role="alert" className="py-20 text-center">
            <WarningCircle
              aria-hidden="true"
              size={36}
              weight="duotone"
              className="mx-auto text-[#b52d21]"
            />
            <h3 className="mt-6 text-2xl font-semibold">Catalogue unavailable.</h3>
            <p className="mx-auto mt-3 max-w-md text-pretty text-[#686d69]">{message}</p>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setMessage("");
                setAttempt((value) => value + 1);
              }}
              className="focus-ring button-motion mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#181818] px-4 py-2 font-semibold text-white hover:bg-[#313131]"
            >
              <ArrowClockwise aria-hidden="true" size={18} weight="bold" />
              Try again
            </button>
          </div>
        )}

        {state === "ready" && services.length === 0 && (
          <div role="status" className="py-20 text-center">
            <h3 className="text-2xl font-semibold">No services are listed right now.</h3>
            <p className="mt-3 text-[#686d69]">Please check again later.</p>
          </div>
        )}

        {state === "ready" && services.length > 0 && filtered.length === 0 && (
          <div role="status" className="py-20 text-center">
            <MagnifyingGlass
              aria-hidden="true"
              size={36}
              className="mx-auto text-[#a34a40]"
            />
            <h3 className="mt-6 text-2xl font-semibold">No matching services.</h3>
            <p className="mt-3 text-[#686d69]">Try another service name.</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="focus-ring mt-6 rounded-lg font-semibold underline decoration-[#ff4f3d] decoration-2 underline-offset-4"
            >
              Clear search
            </button>
          </div>
        )}

        {state === "ready" && filtered.length > 0 && (
          <div className="grid gap-x-10 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => (
              <CatalogueCard
                key={service.code}
                service={service}
                index={services.indexOf(service)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
