"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  label: string;
  continuous?: boolean;
}

export default function AnimatedCounter({ value, label, continuous = false }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = value > 1000 ? 3200 : 2000;
    const startTime = performance.now();
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else if (continuous) {
        startTicker();
      }
    }

    function startTicker() {
      const interval = setInterval(() => {
        setDisplay((prev) => prev + Math.floor(Math.random() * 3) + 1);
      }, 2500);
      return () => clearInterval(interval);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, continuous]);

  return (
    <div ref={ref} className="text-center px-1 shrink-0">
      <p className="font-display text-2xl md:text-4xl font-semibold text-brand-navy tabular-nums whitespace-nowrap">
        {display.toLocaleString()}
      </p>
      <p className="mt-2 text-sm md:text-base text-body uppercase tracking-wide whitespace-nowrap">{label}</p>
    </div>
  );
}
