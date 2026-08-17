"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/api";

const FREIGHT_TYPES = ["Air Freight", "Sea Freight", "Land Transport", "Warehouse & Distribution", "Not sure yet"];

export default function QuoteForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    freight_type: FREIGHT_TYPES[0],
    origin: "",
    destination: "",
    cargo_details: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const ok = await submitContactForm({
      ...form,
      subject: `New Quote Request from ${form.name}`,
    });
    setStatus(ok ? "sent" : "error");
    if (ok) {
      setForm({
        name: "",
        email: "",
        phone: "",
        freight_type: FREIGHT_TYPES[0],
        origin: "",
        destination: "",
        cargo_details: "",
        message: "",
      });
    }
  }

  const inputClass =
    "w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-body block mb-1">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-body block mb-1">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-body block mb-1">Phone (optional)</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-body block mb-1">Freight type</label>
          <select
            value={form.freight_type}
            onChange={(e) => setForm({ ...form, freight_type: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            {FREIGHT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-body block mb-1">Origin</label>
          <input required value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className={inputClass} placeholder="City or country" />
        </div>
        <div>
          <label className="text-sm text-body block mb-1">Destination</label>
          <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputClass} placeholder="City or country" />
        </div>
      </div>

      <div>
        <label className="text-sm text-body block mb-1">Cargo details</label>
        <input
          value={form.cargo_details}
          onChange={(e) => setForm({ ...form, cargo_details: e.target.value })}
          className={inputClass}
          placeholder="Weight, volume, packaging type"
        />
      </div>

      <div>
        <label className="text-sm text-body block mb-1">Anything else we should know</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-brand-orange px-6 py-3 text-base font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Request Quote"}
      </button>

      {status === "sent" && <p className="text-sm text-green-600">Request sent, our team will get back to you shortly.</p>}
      {status === "error" && <p className="text-sm text-red-600">Something went wrong, please try again.</p>}
    </form>
  );
}
