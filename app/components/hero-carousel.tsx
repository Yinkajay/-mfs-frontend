"use client";

import {
  ArrowRight,
  WhatsappLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const whatsappUrl =
  "https://wa.me/2349032243284?text=Hello%20MFS%2C%20I%20want%20to%20start%20my%20vehicle%20registration.";

const slides = [
  {
    src: "/lexus.webp",
    position: "object-[62%_center] md:object-center",
  },
  {
    src: "/family.webp",
    position: "object-[54%_center] md:object-center",
  },
  {
    src: "/danfo.webp",
    position: "object-[76%_center] md:object-center",
  },
  {
    src: "/man.webp",
    position: "object-[68%_center] md:object-center",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rotationPaused = hovered || focused || reducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.src = slides[(current + 1) % slides.length].src;
  }, [current]);

  useEffect(() => {
    if (previous === null) return;

    const timeout = window.setTimeout(() => setPrevious(null), 1100);
    return () => window.clearTimeout(timeout);
  }, [current, previous]);

  useEffect(() => {
    if (rotationPaused) return;

    const timeout = window.setTimeout(() => {
      setPrevious(current);
      setCurrent((current + 1) % slides.length);
    }, 6500);

    return () => window.clearTimeout(timeout);
  }, [current, rotationPaused]);

  const activeSlide = slides[current];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Life on Lagos roads"
      className="relative min-h-[720px] overflow-hidden bg-[#181818] md:min-h-[760px] lg:min-h-[800px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      {previous !== null ? (
        <Image
          src={slides[previous].src}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover ${slides[previous].position}`}
          draggable={false}
        />
      ) : null}

      <Image
        key={activeSlide.src}
        src={activeSlide.src}
        alt=""
        fill
        sizes="100vw"
        preload={current === 0}
        className={`hero-slide-enter object-cover ${activeSlide.position}`}
        draggable={false}
      />

      <div aria-hidden="true" className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-end px-6 pb-24 pt-40 md:min-h-[760px] md:px-12 md:pb-16 lg:min-h-[800px] lg:px-16">
        <div className="hero-copy-enter max-w-[680px]">
          <h1 className="photo-hero-heading text-balance text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            Vehicle documents
            <br />
            without the runaround.
          </h1>
          <p className="mt-6 max-w-[680px] text-pretty text-lg text-white/80 md:text-xl">
            MFS handles registrations, renewals, insurance and permits, with
            pickup and delivery for Lagos vehicle owners and fleets.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring button-motion mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-base font-semibold text-[#181818] hover:bg-[#f7f3ea]"
          >
            <WhatsappLogo aria-hidden="true" size={20} weight="fill" />
            Start on WhatsApp
            <ArrowRight aria-hidden="true" size={18} weight="bold" />
          </a>
        </div>
      </div>

    </div>
  );
}
