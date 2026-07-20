"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type BarberSectionRevealOptions = {
  rootMargin?: string;
  threshold?: number;
};

export function useBarberSectionReveal({
  rootMargin = "0px 0px -12% 0px",
  threshold = 0.18,
}: BarberSectionRevealOptions = {}) {
  const sectionRef =
    useRef<HTMLElement>(
      null
    );

  const [
    isRevealed,
    setIsRevealed,
  ] =
    useState(
      false
    );

  useEffect(
    () => {
      const section =
        sectionRef.current;

      if (
        !section ||
        isRevealed
      ) {
        return;
      }

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      if (
        reducedMotion ||
        !(
          "IntersectionObserver" in
          window
        )
      ) {
        setIsRevealed(
          true
        );

        return;
      }

      const observer =
        new IntersectionObserver(
          (
            entries
          ) => {
            const entry =
              entries[0];

            if (
              !entry?.isIntersecting
            ) {
              return;
            }

            setIsRevealed(
              true
            );

            observer.disconnect();
          },
          {
            rootMargin,
            threshold,
          }
        );

      observer.observe(
        section
      );

      return () => {
        observer.disconnect();
      };
    },
    [
      isRevealed,
      rootMargin,
      threshold,
    ]
  );

  return {
    isRevealed,
    sectionRef,
  };
}
