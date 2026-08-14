"use client";

import { useEffect, useRef } from "react";

interface BlobConfig {
  color: string;
  size: number;
  opacity: number;
}

const blobs: BlobConfig[] = [
  { color: "#FF6600", size: 420, opacity: 0.19 },
  { color: "#000066", size: 460, opacity: 0.17 },
  { color: "#FF6600", size: 340, opacity: 0.16 },
  { color: "#000066", size: 300, opacity: 0.15 },
];

export default function GlobalBackground() {
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const activeCount = isMobile ? 2 : blobs.length;
    const sizeScale = isMobile ? 0.65 : 1;

    elRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i >= activeCount) {
        el.style.display = "none";
      } else if (isMobile) {
        const size = Math.round(blobs[i].size * sizeScale);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      }
    });

    const w = window.innerWidth;
    const h = window.innerHeight;

    const state = blobs.slice(0, activeCount).map((b) => {
      const size = isMobile ? b.size * sizeScale : b.size;
      return {
        x: Math.random() * Math.max(w - size, 1),
        y: Math.random() * Math.max(h - size, 1),
        vx: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.35),
        vy: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.35),
        size,
      };
    });

    let frameId: number;

    function tick() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      state.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;

        if (s.x <= 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        } else if (s.x >= width - s.size) {
          s.x = width - s.size;
          s.vx = -Math.abs(s.vx);
        }

        if (s.y <= 0) {
          s.y = 0;
          s.vy = Math.abs(s.vy);
        } else if (s.y >= height - s.size) {
          s.y = height - s.size;
          s.vy = -Math.abs(s.vy);
        }

        const el = elRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        }
      });

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {blobs.map((blob, i) => (
        <div
          key={i}
          ref={(el) => {
            elRefs.current[i] = el;
          }}
          className="absolute rounded-full blur-xl"
          style={{
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            opacity: blob.opacity,
            top: 0,
            left: 0,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
