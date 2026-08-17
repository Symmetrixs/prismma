"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "prismma-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-brand-navy text-white px-6 py-4">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-3 max-w-2xl">
          <Cookie size={20} className="text-brand-orange shrink-0 mt-0.5" />
          <p className="text-sm text-white/85">
            This site uses cookies to keep the contact and enquiry forms working correctly. By continuing to browse,
            you agree to this in line with our handling of your personal data under Malaysia's Personal Data
            Protection Act.
          </p>
        </div>
        <button
          onClick={accept}
          className="shrink-0 rounded-md bg-brand-orange px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
