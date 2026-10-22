"use client";

import {
  ArrowClockwise,
  MagnifyingGlass,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ServicesApiError,
  servicesApi,
  type CatalogueService,
} from "@/app/lib/services-api";

type LoadState = "loading" | "ready" | "error";

const groups = [
  {
    id: "vehicle-documents",
    number: "01",
    title: "Vehicle documents",
    intro: "Registration, licences, ownership and other vehicle papers.",
    image: "/home-paperwork.webp",
    imageAlt: "Vehicle paperwork and a car key resting on a dashboard",
    imageSide: "left",
    codes: [
      "NEW_REGISTRATION",
      "VEHICLE_LICENCE",
      "ROAD_WORTHINESS_PROOF_OF_OWNERSHIP",
      "C_OF_O_CHANGE_OF_OWNERSHIP",
      "EXISTING_C_OF_O",
      "PLATE_REPRINT",
      "AUTOVIN",
      "ECMR",
    ],
  },
  {
    id: "drivers-licences",
    number: "02",
    title: "Driver’s licences",
    intro: "New, renewal and international licence options.",
    image: "/services-driver.webp",
    imageAlt: "Illustrative portrait of a driver seated in a car",
    imageSide: "right",
    codes: [
      "NEW_DRIVERS_LICENSE",
      "DRIVERS_LICENSE_RENEWAL",
      "INTERNATIONAL_DVL",
    ],
  },
  {
    id: "insurance",
    number: "03",
    title: "Insurance",
    intro: "Explore the cover types listed by MFS.",
    image: "/services-insurance.webp",
    imageAlt: "Lagos traffic reflected in a car side mirror",
    imageSide: "left",
    codes: ["INSURANCE_THIRD_PARTY", "INSURANCE_COMPREHENSIVE"],
  },
  {
    id: "permits-paperwork",
    number: "04",
    title: "Permits & other paperwork",
    intro: "Looking for a particular permit or report? Browse the options below.",
    image: "/home-delivery.webp",
    imageAlt: "A plain document envelope being handed to someone in a parked car",
    imageSide: "right",
    codes: [
      "HACKNEY_PERMIT",
      "L_G_PAPERS",
      "STAGE_CARRIAGE",
      "TINTED_PERMIT",
      "DOCTORS_REPORT",
      "POLICE_REPORT_AND_AFFIDAVIT",
    ],
  },
] as const;

const fallbackGroup = {
  id: "other-services",
  number: "05",
  title: "Other services",
  intro: "More options from the current MFS catalogue.",
  image: null,
  imageAlt: "",
  imageSide: "left",
  codes: [],
} as const;

const knownCodes: Set<string> = new Set(groups.flatMap((group) => group.codes));

// Editorial navigation copy only. The API remains the source of service names,
// variants and any future, business-approved descriptions.
const shortCopy: Record<string, string> = {
  NEW_REGISTRATION: "For a new vehicle registration.",
  VEHICLE_LICENCE: "For your vehicle licence paperwork.",
  ROAD_WORTHINESS_PROOF_OF_OWNERSHIP: "Road worthiness and ownership documents.",
  C_OF_O_CHANGE_OF_OWNERSHIP: "For change of ownership paperwork.",
  EXISTING_C_OF_O: "Questions about an existing C of O?",
  PLATE_REPRINT: "For a plate reprint enquiry.",
  AUTOVIN: "Explore AutoVIN with MFS.",
  ECMR: "Explore ECMR with MFS.",
  NEW_DRIVERS_LICENSE: "Explore new licence options.",
  DRIVERS_LICENSE_RENEWAL: "Explore renewal options.",
  INTERNATIONAL_DVL: "Explore the international licence option.",
  INSURANCE_THIRD_PARTY: "Explore third party cover.",
  INSURANCE_COMPREHENSIVE: "Explore comprehensive cover.",
  HACKNEY_PERMIT: "Ask MFS about a Hackney Permit.",
  L_G_PAPERS: "Ask MFS about L.G. Papers.",
  STAGE_CARRIAGE: "Ask MFS about Stage Carriage.",
  TINTED_PERMIT: "Ask MFS about a Tinted Permit.",
  DOCTORS_REPORT: "Ask MFS about a Doctor’s Report.",
  POLICE_REPORT_AND_AFFIDAVIT: "Ask MFS about Police Report and Affidavit.",
};

type Group = (typeof groups)[number] | typeof fallbackGroup;

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
    <div role="status" aria-label="Loading service catalogue" className="py-12">
      <span className="sr-only">Loading service catalogue…</span>
      {[0, 1].map((item) => (
        <div key={item} aria-hidden="true" className="grid gap-12 border-t border-black/10 py-16 lg:grid-cols-2">
          <div>
            <div className="h-4 w-8 animate-pulse rounded bg-black/10" />
            <div className="mt-6 h-10 w-48 animate-pulse rounded bg-black/10" />
            <div className="mt-8 aspect-[4/3] max-w-sm animate-pulse rounded-sm bg-black/5" />
          </div>
          <div className="space-y-8">
            {[0, 1, 2].map((row) => (
              <div key={row} className="border-b border-black/10 pb-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-black/10" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-black/5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceRows({ services }: { services: CatalogueService[] }) {
  return (
    <div className="border-t border-black/10">
      {services.map((service) => (
        <article key={service.code} className="border-b border-black/10 py-6">
          <h3 className="text-balance text-xl font-semibold tracking-tight text-[#181818]">
            {service.name}
          </h3>
          <p className="mt-2 text-pretty text-sm text-[#5d6466]">
            {service.description?.trim() || shortCopy[service.code] || `Ask MFS about ${service.name}.`}
          </p>
          {service.variants.length > 0 && (
            <ul
              aria-label={`${service.name} options`}
              className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-[#087eaf]"
            >
              {service.variants.map((variant) => (
                <li key={variant.code}>{variant.name}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

function GroupHeading({ group }: { group: Group }) {
  return (
    <header>
      <p className="text-base font-semibold tabular-nums text-[#e94132]">{group.number}</p>
      <h2 id={`${group.id}-title`} className="mt-3 max-w-xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        {group.title}
      </h2>
      <p className="mt-4 max-w-md text-pretty text-base text-[#5d6466]">{group.intro}</p>
    </header>
  );
}

function GroupPhoto({ group }: { group: Group }) {
  if (!group.image) return null;
  return (
    <div className={`relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#ece7de] ${group.imageSide === "right" ? "lg:mt-0" : "lg:mt-12"}`}>
      <Image
        src={group.image}
        alt={group.imageAlt}
        fill
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function CatalogueGroup({ group, services }: { group: Group; services: CatalogueService[] }) {
  const photoOnRight = group.imageSide === "right";
  return (
    <section id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-32 border-t border-black/10 py-16 md:py-20">
      <div className={`grid gap-12 lg:gap-16 ${photoOnRight ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.78fr_1.22fr]"}`}>
        {photoOnRight ? (
          <div>
            <GroupHeading group={group} />
            <div className="mt-10">
              <ServiceRows services={services} />
            </div>
          </div>
        ) : (
          <div>
            <GroupHeading group={group} />
            <GroupPhoto group={group} />
          </div>
        )}
        {photoOnRight ? (
          <div className="lg:self-center">
            <GroupPhoto group={group} />
          </div>
        ) : (
          <div className="lg:pt-8">
            <ServiceRows services={services} />
          </div>
        )}
      </div>
    </section>
  );
}

export function ServicesCatalogue() {
  const [state, setState] = useState<LoadState>("loading");
  const [services, setServices] = useState<CatalogueService[]>([]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string>(groups[0].id);

  const load = useCallback((signal: AbortSignal) => {
    const request = async (retry: boolean) => {
      try {
        const items = await servicesApi.list(signal);
        if (signal.aborted) return;
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

  const visibleGroups = useMemo(() => {
    const known = groups.map((group) => {
      const orderedCodes: readonly string[] = group.codes;
      return {
        group,
        items: filtered
          .filter((service) => orderedCodes.includes(service.code))
          .sort((a, b) => orderedCodes.indexOf(a.code) - orderedCodes.indexOf(b.code)),
      };
    });
    const other = filtered.filter((service) => !knownCodes.has(service.code));
    return [
      ...known.filter(({ items }) => items.length > 0),
      ...(other.length > 0 ? [{ group: fallbackGroup, items: other }] : []),
    ];
  }, [filtered]);

  useEffect(() => {
    if (state !== "ready" || query.trim() || !services.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveGroup(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    for (const { group } of visibleGroups) {
      const section = document.getElementById(group.id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [query, services.length, state, visibleGroups]);

  return (
    <section aria-labelledby="catalogue-heading" className="bg-[#faf9f4] px-6 pb-8 pt-16 sm:px-12 md:pt-20 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <div>
          <h2 id="catalogue-heading" className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Find your service.
          </h2>
          <label className="relative mt-8 block w-full">
            <span className="sr-only">Search services</span>
            <MagnifyingGlass
              aria-hidden="true"
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#626b70]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a service, e.g. vehicle licence"
              disabled={state !== "ready" || services.length === 0}
              className="focus-ring min-h-12 w-full rounded-full border border-black/15 bg-transparent py-3 pl-12 pr-12 text-base text-[#181818] outline-none placeholder:text-[#858b8d] disabled:cursor-not-allowed disabled:opacity-60"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear service search"
                onClick={() => setQuery("")}
                className="focus-ring absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#626b70] hover:bg-black/5"
              >
                <X aria-hidden="true" size={16} weight="bold" />
              </button>
            )}
          </label>
        </div>

        {state === "ready" && services.length > 0 && (
          <p className="mt-6 text-sm font-semibold text-[#626b70]" aria-live="polite">
            {query.trim()
              ? `${filtered.length} of ${services.length} services`
              : `${services.length} services`}
          </p>
        )}

        {state === "ready" && !query.trim() && services.length > 0 && (
          <nav aria-label="Service categories" className="mt-6 flex gap-8 overflow-x-auto border-b border-black/10">
            {visibleGroups.map(({ group }) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                aria-current={activeGroup === group.id ? "location" : undefined}
                onClick={() => setActiveGroup(group.id)}
                className={`focus-ring shrink-0 border-b-2 px-1 pb-4 text-sm font-semibold transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  activeGroup === group.id
                    ? "border-[#0797cb] text-[#087eaf]"
                    : "border-transparent text-[#40484a] hover:text-[#087eaf]"
                }`}
              >
                {group.title}
              </a>
            ))}
          </nav>
        )}

        {state === "loading" && <CatalogueSkeleton />}

        {state === "error" && (
          <div role="alert" className="py-24 text-center">
            <WarningCircle aria-hidden="true" size={36} className="mx-auto text-[#b52d21]" />
            <h3 className="mt-6 text-2xl font-semibold">Catalogue unavailable.</h3>
            <p className="mx-auto mt-3 max-w-md text-pretty text-[#626b70]">{message}</p>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setMessage("");
                setAttempt((value) => value + 1);
              }}
              className="focus-ring button-motion mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#181818] px-4 py-2 font-semibold text-white hover:bg-[#313131]"
            >
              <ArrowClockwise aria-hidden="true" size={18} weight="bold" />
              Try again
            </button>
          </div>
        )}

        {state === "ready" && services.length === 0 && (
          <div role="status" className="py-24 text-center">
            <h3 className="text-2xl font-semibold">No services are listed right now.</h3>
            <p className="mt-3 text-[#626b70]">Please check again later.</p>
          </div>
        )}

        {state === "ready" && services.length > 0 && filtered.length === 0 && (
          <div role="status" className="py-24 text-center">
            <MagnifyingGlass aria-hidden="true" size={36} className="mx-auto text-[#087eaf]" />
            <h3 className="mt-6 text-2xl font-semibold">No matching services.</h3>
            <p className="mt-3 text-[#626b70]">Try another service name.</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="focus-ring mt-6 rounded-sm font-semibold text-[#087eaf] underline underline-offset-4"
            >
              Clear search
            </button>
          </div>
        )}

        {state === "ready" && filtered.length > 0 && (
          <div>
            {visibleGroups.map(({ group, items }) => (
              <CatalogueGroup key={group.id} group={group} services={items} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
