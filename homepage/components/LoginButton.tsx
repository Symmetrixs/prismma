"use client";

import { LogIn } from "lucide-react";

interface LoginButtonProps {
  size?: "default" | "large";
}

export default function LoginButton({ size = "default" }: LoginButtonProps) {
  const systemUrl = process.env.NEXT_PUBLIC_SYSTEM_URL || "http://localhost:5173";
  const isLarge = size === "large";

  return (
    <a
      href={`${systemUrl}/login`}
      className={`inline-flex items-center gap-2 rounded-md border border-brand-navy font-medium text-brand-navy hover:bg-brand-navy hover:text-white transition-colors ${
        isLarge ? "px-6 py-3 text-sm" : "px-5 py-2.5 text-sm"
      }`}
    >
      <LogIn size={16} />
      Employee Login
    </a>
  );
}
