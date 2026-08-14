import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/assets/logos/prismma_main_logo.png" alt="Prismma Express" className="h-9 mb-6" />
          <h1 className="font-display text-2xl font-semibold text-brand-navy">Prismma System</h1>
          <p className="mt-2 text-body">Sign in with your email or employee ID</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur rounded-xl border border-black/10 shadow-sm p-8 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-body block mb-1">Email or Employee ID</label>
            <input
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <LogIn size={16} />
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-body">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-orange font-medium hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
