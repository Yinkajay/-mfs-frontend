"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CarProfile,
  FileText,
  SquaresFour,
  Tray,
  UserCircle,
  WhatsappLogo,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useAuth } from "@/app/components/auth-provider";
import { CONTACT, WHATSAPP_HELP_URL } from "@/app/lib/contact";

function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-pretty text-base text-[#686d69]">{description}</p>
    </div>
  );
}

function ChatLink({ label = "Chat with MFS" }: { label?: string }) {
  return (
    <a
      href={WHATSAPP_HELP_URL}
      target="_blank"
      rel="noreferrer"
      className="focus-ring button-motion inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-lg bg-[#181818] px-3 py-2 text-base font-semibold text-white hover:bg-[#313131]"
    >
      <WhatsappLogo aria-hidden="true" size={20} className="shrink-0" />
      <span className="min-w-0">{label}</span>
      <ArrowUpRight aria-hidden="true" size={16} className="shrink-0" />
    </a>
  );
}

const serviceLinks = [
  {
    label: "Vehicles",
    href: "/dashboard/vehicles",
    icon: CarProfile,
    description: "Get help with your vehicle details and documents.",
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: SquaresFour,
    description: "Find the right help for your paperwork.",
  },
  {
    label: "Requests",
    href: "/dashboard/requests",
    icon: Tray,
    description: "Get an update on your service requests.",
  },
];

export function DashboardOverview() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeading
        title="Let’s sort your vehicle paperwork."
        description="Get help with registration, renewals, and other vehicle paperwork."
      />
      <section
        aria-labelledby="next-step-title"
        className="grid overflow-hidden rounded-xl bg-white lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <div className="p-6 sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0eb] px-3 py-2 text-xs font-semibold text-[#9b281e]">
            <FileText aria-hidden="true" size={16} />
            Your next step
          </span>
          <h2
            id="next-step-title"
            className="mt-6 max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Registration, renewal, or something else?
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-base text-[#686d69]">
            Tell MFS what you need. We’ll help you confirm the service,
            documents, and next steps.
          </p>
          <div className="mt-6">
            <ChatLink />
          </div>
        </div>
        <div className="flex flex-col justify-center bg-[#f7f3ea] p-6 sm:p-8">
          <CarProfile
            aria-hidden="true"
            size={48}
            weight="light"
            className="text-[#9b281e]"
          />
          <h3 className="mt-6 text-balance text-lg font-semibold">
            A little preparation helps.
          </h3>
          <p className="mt-3 text-pretty text-sm text-[#686d69]">
            Have your vehicle details handy when you chat. Our team will confirm
            what’s needed for your service.
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="vehicle-services-title"
          className="rounded-xl bg-white p-6 sm:p-8"
        >
          <h2
            id="vehicle-services-title"
            className="text-xl font-semibold tracking-tight"
          >
            Your vehicle paperwork
          </h2>
          <p className="mt-2 text-pretty text-sm text-[#686d69]">
            Find help with your vehicles, services, and requests.
          </p>
          <ul className="mt-6 space-y-2">
            {serviceLinks.map(({ label, href, icon: Icon, description }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="focus-ring flex min-h-16 items-center gap-4 rounded-lg py-3 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f7f7f5] active:scale-[0.98]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f5]">
                    <Icon aria-hidden="true" size={24} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-1 block text-pretty text-sm text-[#686d69]">
                      {description}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    size={20}
                    className="shrink-0 text-[#686d69]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section
          aria-labelledby="account-summary-title"
          className="min-w-0 self-start rounded-xl bg-white p-6 sm:p-8"
        >
          <UserCircle
            aria-hidden="true"
            size={32}
            weight="light"
            className="text-[#9b281e]"
          />
          <h2
            id="account-summary-title"
            className="mt-4 text-xl font-semibold tracking-tight"
          >
            Your account
          </h2>
          <p className="mt-4 text-pretty text-base font-semibold break-words">
            {user.firstName} {user.lastName}
          </p>
          <p className="mt-2 text-sm break-all text-[#686d69]">{user.email}</p>
          <Link
            href="/dashboard/account"
            className="focus-ring link-motion mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg text-sm font-semibold"
          >
            View account <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}

// Informational content only. A future API response must drive real lists,
// service availability, prices, requirements and request progress.
const emptyPages = {
  vehicles: {
    title: "Vehicles",
    description: "Keep your vehicle details close at hand.",
    icon: CarProfile,
    heading: "Your garage will live here.",
    copy: "Vehicle management is coming soon. For now, MFS can help with registration, renewals, and your vehicle details.",
    action: "Chat with MFS",
    detailsHeading: "What this space will bring together",
    details: [
      {
        title: "Vehicle details",
        copy: "A place for your vehicle’s make, model, and registration details.",
      },
      {
        title: "Vehicle documents",
        copy: "Keep the paperwork associated with each vehicle together.",
      },
      {
        title: "Reusable information",
        copy: "Use saved vehicle details for future service requests.",
      },
    ],
  },
  services: {
    title: "Services",
    description: "Find the right support for your vehicle paperwork.",
    icon: SquaresFour,
    heading: "Your next service starts here.",
    copy: "Online service selection is coming soon. Need help choosing a service today? Talk to MFS about your vehicle and the paperwork you need.",
    action: "Chat with MFS",
    detailsHeading: "Our team can help you get started",
    details: [
      {
        title: "Choose the right service",
        copy: "Tell us what you need so we can help you find the right service.",
      },
      {
        title: "Confirm the details",
        copy: "MFS can confirm the requirements and current price before you proceed.",
      },
    ],
  },
  requests: {
    title: "Requests",
    description: "Follow your vehicle paperwork from one place.",
    icon: Tray,
    heading: "Request tracking is on its way.",
    copy: "Online request tracking is coming soon. If you’re already speaking with MFS about a service, contact the team for an update.",
    action: "Ask MFS for an update",
    detailsHeading: "What you’ll find here",
    details: [
      {
        title: "Your service requests",
        copy: "A home for the requests you make through your MFS account.",
      },
      {
        title: "Updates from MFS",
        copy: "Follow customer updates when online tracking becomes available.",
      },
    ],
  },
};

export function DashboardEmptyPage({
  section,
}: {
  section: keyof typeof emptyPages;
}) {
  const page = emptyPages[section];
  const Icon = page.icon;

  return (
    <>
      <PageHeading title={page.title} description={page.description} />
      <section
        aria-labelledby="empty-state-title"
        className="rounded-xl bg-white p-6 sm:p-8 lg:p-10"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center sm:py-12">
          <div
            aria-hidden="true"
            className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f7f3ea] text-[#9b281e]"
          >
            <Icon size={48} weight="light" />
          </div>
          <p className="mt-6 text-xs font-semibold tracking-widest text-[#686d69] uppercase">
            Coming soon
          </p>
          <h2
            id="empty-state-title"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {page.heading}
          </h2>
          <p className="mt-4 text-pretty text-base text-[#686d69]">
            {page.copy}
          </p>
          <div className="mt-6 max-w-full">
            <ChatLink label={page.action} />
          </div>
        </div>
      </section>
      <section aria-labelledby="empty-state-details" className="mt-8">
        <h2 id="empty-state-details" className="text-lg font-semibold">
          {page.detailsHeading}
        </h2>
        <div
          className={`mt-6 grid gap-6 ${page.details.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {page.details.map(({ title, copy }) => (
            <div key={title} className="max-w-md">
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-pretty text-sm text-[#686d69]">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function DashboardAccount() {
  const { user } = useAuth();
  if (!user) return null;
  const fields = [
    { label: "First name", value: user.firstName },
    { label: "Last name", value: user.lastName },
    { label: "Email address", value: user.email },
    { label: "Phone number", value: user.phone },
  ];

  return (
    <>
      <PageHeading
        title="Account"
        description="The details on your MFS account."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section
          aria-labelledby="personal-details-title"
          className="rounded-xl bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <UserCircle aria-hidden="true" size={24} />
            <h2
              id="personal-details-title"
              className="text-xl font-semibold tracking-tight"
            >
              Personal details
            </h2>
          </div>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {fields.map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="text-sm text-[#686d69]">{label}</dt>
                <dd className="mt-2 text-base font-medium break-words">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <aside
          aria-labelledby="account-help-title"
          className="self-start rounded-xl bg-[#f7f3ea] p-6 sm:p-8"
        >
          <h2
            id="account-help-title"
            className="text-balance text-xl font-semibold tracking-tight"
          >
            Need help with your details?
          </h2>
          <p className="mt-4 text-pretty text-sm text-[#686d69]">
            Contact MFS for help with your account details.
          </p>
          <Link
            href="/contact"
            className="focus-ring link-motion mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg text-sm font-semibold"
          >
            Contact MFS <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <a
            href={CONTACT.emailHref}
            className="focus-ring link-motion mt-3 block w-fit rounded text-sm break-all text-[#686d69]"
          >
            {CONTACT.email}
          </a>
        </aside>
      </div>
    </>
  );
}
