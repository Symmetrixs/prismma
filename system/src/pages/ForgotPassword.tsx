import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await api.requestPasswordReset(email);
      setMessage(res.message || "If that account exists, a reset request has been submitted for review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/assets/logos/prismma_main_logo.png" alt="Prismma Express" className="h-9 mb-6" />
          <h1 className="font-display text-2xl font-semibold text-heading">Reset your password</h1>
          <p className="mt-2 text-body">Enter your account email and an admin will review your request</p>
        </div>

        <div className="bg-surface/95 backdrop-blur rounded-xl border border-border/10 shadow-sm p-8 space-y-4">
          {message ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
                <KeyRound size={22} />
              </div>
              <p className="text-body text-sm">{message}</p>
              <Link to="/login" className="inline-block text-brand-orange font-medium hover:underline text-sm">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="text-sm text-body block mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border/10 px-4 py-2.5 text-base bg-surface text-body focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <p className="text-center text-sm text-body">
                <Link to="/login" className="text-brand-orange font-medium hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
