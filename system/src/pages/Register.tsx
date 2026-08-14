import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import PasswordStrength, { isPasswordStrong } from "../components/PasswordStrength";
import { api } from "../lib/api";

interface Department {
  id: number;
  name: string;
}

export default function Register() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employee_id: "",
    phone_number: "",
    department_id: "",
    job_title: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isPasswordStrong(form.password)) {
      setError("Password does not meet the minimum requirements");
      return;
    }
    setLoading(true);
    try {
      await api.register({
        ...form,
        department_id: form.department_id ? Number(form.department_id) : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white/95 backdrop-blur rounded-xl border border-black/10 shadow-sm p-8">
          <h1 className="font-display text-2xl font-semibold text-brand-navy">Registration Submitted</h1>
          <p className="mt-3 text-body">
            An admin will review your account. You'll be able to sign in once approved.
          </p>
          <Link to="/login" className="inline-block mt-6 text-brand-orange font-medium hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-brand-navy">Create Account</h1>
          <p className="mt-2 text-body">Every new account needs admin approval before it's active</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur rounded-xl border border-black/10 shadow-sm p-8 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-body block mb-1">Full Name</label>
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
            <label className="text-sm text-body block mb-1">Password</label>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
            <PasswordStrength password={form.password} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-body block mb-1">Employee ID</label>
              <input
                required
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
            <div>
              <label className="text-sm text-body block mb-1">Phone Number</label>
              <input
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Job Title</label>
            <input
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              placeholder="e.g. Logistics Coordinator"
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <UserPlus size={16} />
            {loading ? "Submitting..." : "Register"}
          </button>

          <p className="text-center text-sm text-body">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-orange font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
