"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const ok = await submitContactForm(form);
    setStatus(ok ? "sent" : "error");
    if (ok) setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-body block mb-1">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        />
      </div>
      <div>
        <label className="text-sm text-body block mb-1">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        />
      </div>
      <div>
        <label className="text-sm text-body block mb-1">Phone (optional)</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        />
      </div>
      <div>
        <label className="text-sm text-body block mb-1">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>

      {status === "sent" && (
        <p className="text-sm text-green-600">Message sent, we will be in touch shortly.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong, please try again.</p>
      )}
    </form>
  );
}
