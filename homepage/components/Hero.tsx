"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const modes = [
  {
    key: "air",
    label: "Air",
    description:
      "We work with international affiliated carriers and maintain strategic offices at every destination, both local and international, so freight moves quickly regardless of distance.",
  },
  {
    key: "sea",
    label: "Sea",
    description:
      "Leveraging our extensive network of ocean shipping lines, Prismma Express offers global sea freight services for both FCL and LCL shipments, ensuring timely deliveries to domestic and international seaports.",
  },
  {
    key: "land",
    label: "Land",
    description:
      "Our dedicated fleet of trucks serves customers across Malaysia, covering routes from the north to the south of the peninsula, extending to cross border trucking from Singapore through to China.",
  },
];

export default function Hero() {
  const [active, setActive] = useState("sea");
  const current = modes.find((m) => m.key === active)!;

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => {
        const currentIndex = modes.findIndex((m) => m.key === prev);
        const nextIndex = (currentIndex + 1) % modes.length;
        return modes[nextIndex].key;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative">
      <div className="relative pt-32 md:pt-44 pb-20 md:pb-28 px-6 overflow-hidden">
        <div className="relative mx-auto max-w-4xl text-center">
          <ScrollReveal>
            <span className="inline-block text-sm font-medium tracking-[0.2em] uppercase text-brand-orange mb-5">
              Est. 2011 &middot; Pulau Pinang, Malaysia
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-medium text-brand-navy leading-[1.05] tracking-tight">
              Your Reliable Logistics Solutions Provider
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/services"
                className="rounded-md bg-brand-orange px-8 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity"
              >
                Get Transporting
              </Link>
              <a
                href="https://youtu.be/ojirQaRSKQk"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-brand-navy px-8 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity"
              >
                Corporate Video
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="mt-12 italic text-2xl text-body">Moving the way, you want.</p>
          </ScrollReveal>
        </div>
      </div>

      <div className="relative h-[560px] sm:h-[520px] md:h-[620px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/assets/images/video-banner-bg.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/video/Prismma-loop-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/50 to-brand-navy/25" />

        <div className="relative h-full flex items-center px-6">
          <div className="mx-auto max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start md:items-center py-10 md:py-0">
            <div>
              <p className="text-white/70 text-lg mb-2">We move by</p>
              <div className="space-y-1">
                {modes.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setActive(mode.key)}
                    className={`block font-display text-4xl md:text-5xl font-medium transition-colors text-left ${
                      active === mode.key ? "text-white" : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    {mode.label}
                    {active === mode.key && (
                      <span className="block w-16 h-1 bg-brand-orange mt-2 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 md:mt-0 md:border-l md:border-white/20 md:pl-8 min-h-[100px] md:min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-white/90 text-lg leading-relaxed"
                >
                  {current.description}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
