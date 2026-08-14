"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Info, Package, Handshake, Newspaper, Mail, Menu, X } from "lucide-react";
import LoginButton from "./LoginButton";

const navLinks = [
  { href: "/about", label: "About", icon: Info },
  { href: "/services", label: "Services", icon: Package },
  { href: "/our-partners", label: "Our Partners", icon: Handshake },
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
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <Image
            src="/assets/logos/prismma_main_logo.png"
            alt="Prismma Express"
            width={190}
            height={32}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-1.5 text-[15px] text-body hover:text-brand-navy transition-colors group"
              >
                <Icon size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                {link.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-brand-orange transition-all group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <LoginButton />
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-brand-navy"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div className="h-0.5 w-full bg-gradient-to-r from-brand-orange via-brand-orange/40 to-brand-navy/60" />

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-black/5 shadow-lg">
          <nav className="flex flex-col px-6 py-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-3.5 text-base text-brand-navy border-b border-black/5 last:border-b-0"
                >
                  <Icon size={18} className="text-brand-orange" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4">
              <LoginButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
