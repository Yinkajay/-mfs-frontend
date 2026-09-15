"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function TaglineReveal({ text }: { text: string }) {
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const words = text.split(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("tagline-word-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 0.5 },
    );

    wordRefs.current.forEach((word) => {
      if (word) {
        observer.observe(word);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <p className="max-w-[680px] text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            ref={(element) => {
              wordRefs.current[index] = element;
            }}
            className="tagline-word"
            style={{ transitionDelay: `${Math.min(index * 35, 700)}ms` }}
          >
            {word}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}
