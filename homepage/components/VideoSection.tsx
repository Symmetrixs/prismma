"use client";

import { Play } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function VideoSection() {
  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-4xl text-center mb-14">
        <ScrollReveal>
          <span className="text-sm font-medium tracking-[0.2em] uppercase text-brand-orange">Behind The Scenes</span>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-medium text-brand-navy leading-tight">
            World-Class Logistics
          </h2>
          <p className="mt-6 text-lg text-body">
            Our corporate video showcases our dedication to providing the highest quality service,
            backed by advanced technology and a team of professionals with years of experience in
            the industry.
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <a
          href="https://youtu.be/ojirQaRSKQk"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block mx-auto max-w-4xl rounded-xl overflow-hidden"
        >
          <img
            src="/assets/images/video-banner-bg.jpg"
            alt="Prismma Express corporate video"
            className="w-full h-[360px] md:h-[480px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 group-hover:scale-110 transition-transform">
              <Play size={32} className="text-brand-navy ml-1" fill="currentColor" />
            </div>
          </div>
        </a>
      </ScrollReveal>
    </section>
  );
}
