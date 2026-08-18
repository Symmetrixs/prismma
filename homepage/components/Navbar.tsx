"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Info, Package, Handshake, Newspaper, Mail, Route, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import LoginButton from "./LoginButton";

const navLinks = [
  { href: "/about", label: "About", icon: Info },
  { href: "/services", label: "Services", icon: Package },
  { href: "/our-partners", label: "Our Partners", icon: Handshake },
  { href: "/track-shipment", label: "Track Shipment", icon: Route },
  { href: "/latest-news", label: "Latest News", icon: Newspaper },
  { href: "/contact", label: "Contact", icon: Mail },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled || mobileOpen ? "bg-white/85 backdrop-blur-md shadow-sm" : "bg-white/65 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 h-24 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
          <Image
            src="/assets/logos/prismma_main_logo.png"
            alt="Prismma Express"
            width={205}
            height={35}
            priority
          />
        </Link>

        <nav className="hidden 2xl:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-2 text-base text-body hover:text-brand-navy transition-colors whitespace-nowrap group"
              >
                <Icon size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                {link.label}
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-brand-orange transition-all group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        <div className="hidden 2xl:flex items-center gap-4 shrink-0">
          <Link
            href="/get-a-quote"
            className="rounded-md bg-brand-orange px-5 py-3 text-base font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Get a Quote
          </Link>
          <LoginButton label="Login" size="large" />
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="2xl:hidden flex items-center justify-center w-10 h-10 rounded-md text-brand-navy shrink-0"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-brand-orange via-brand-orange/40 to-brand-navy/60" />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="2xl:hidden bg-white border-t border-black/5 shadow-lg"
          >
            <nav className="flex flex-col px-6 py-4">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-3.5 text-base text-brand-navy border-b border-black/5 last:border-b-0"
                    >
                      <Icon size={18} className="text-brand-orange" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="pt-4 space-y-3">
                <Link
                  href="/get-a-quote"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-md bg-brand-orange px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Get a Quote
                </Link>
                <LoginButton />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
