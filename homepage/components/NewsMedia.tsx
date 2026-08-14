"use client";

import { useState, useEffect, useRef } from "react";
import { ImageOff } from "lucide-react";
import type { NewsMediaItem } from "@/lib/types";

interface NewsMediaProps {
  media: NewsMediaItem[];
  className?: string;
  intervalMs?: number;
}

export default function NewsMedia({ media, className = "", intervalMs = 3500 }: NewsMediaProps) {
  const sorted = [...media].sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sorted.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % sorted.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [sorted.length, intervalMs]);

  if (sorted.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <ImageOff size={28} className="text-body/30" />
      </div>
    );
  }

  const current = sorted[index];

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {current.media_type === "video" ? (
        inView ? (
          <video
            key={current.url}
            src={current.url}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        )
      ) : (
        <img
          key={current.url}
          src={current.url}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
      )}

      {sorted.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {sorted.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
