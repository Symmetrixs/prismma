"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "prismma-dismissed-announcement";

export default function AnnouncementBanner({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setDismissed(stored === message);
  }, [message]);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, message);
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="bg-brand-orange text-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 py-2.5 flex items-center justify-center gap-3">
        <p className="text-sm text-center">{message}</p>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 hover:opacity-80">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
