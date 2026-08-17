import { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { api } from "../../lib/api";
import UserDetailPanel from "./UserDetailPanel";
import { useToast } from "../../context/ToastContext";

interface CreateForm {
  name: string;
  email: string;
  password: string;
  employee_id: string;
  phone_number: string;
  department_id: string;
  job_title: string;
  role: string;
}

const EMPTY_FORM: CreateForm = {
  name: "",
  email: "",
  password: "",
  employee_id: "",
  phone_number: "",
  department_id: "",
  job_title: "",
  role: "staff",
};

export default function UsersTab({ isSuperadmin }: { isSuperadmin: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const toast = useToast();

  async function load() {
    setLoading(true);
    const [u, d] = await Promise.all([api.getUsers(), api.getDepartments()]);
    setUsers(u);
    setDepartments(d);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => users.filter((u) => u.account_status === "active" || u.account_status === "pending"),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.employee_id?.toLowerCase().includes(q)
    );
  }, [visible, search]);

  function departmentName(id: number | null) {
    if (!id) return "—";
    return departments.find((d) => d.id === id)?.name || "—";
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        employee_id: form.employee_id,
        phone_number: form.phone_number || undefined,
        department_id: form.department_id ? Number(form.department_id) : undefined,
        job_title: form.job_title || undefined,
      };
      if (isSuperadmin) payload.role = form.role;
      await api.createUser(payload);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      toast.success("Account created");
      load();
    } catch (err: any) {
      setCreateError(err.message || "Could not create account");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-body" />
          <input
            placeholder="Search by name, email, or employee ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-black/10 pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-brand-orange text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
        >
          <Plus size={14} /> Add User
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-body py-10 text-center">No users found</p>
      ) : (
        <div className="bg-white rounded-xl border border-black/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 text-left text-body">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className="border-t border-black/5 cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy">{u.name}</p>
                    <p className="text-xs text-body">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">{departmentName(u.department_id)}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.account_status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {u.account_status}
                      {u.account_locked ? " (locked)" : ""}
                      {u.is_blocked ? " (blocked)" : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl border border-black/10 p-6 max-w-md w-full shadow-lg">
            <h3 className="font-display text-lg font-semibold text-brand-navy mb-4">Add User</h3>
            <form onSubmit={submitCreate} className="space-y-3">
              <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
              <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
              <input required placeholder="Employee ID" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
              <input placeholder="Phone number" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm bg-white">
                <option value="">No department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <input placeholder="Job title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
              {isSuperadmin && (
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm bg-white">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              )}
              {createError && <p className="text-sm text-red-600">{createError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setForm(EMPTY_FORM);
                    setCreateError("");
                  }}
                  className="text-sm text-body px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button disabled={creating} type="submit" className="text-sm font-medium text-white bg-brand-orange px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60">
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUserId !== null && (
        <UserDetailPanel
          userId={selectedUserId}
          isSuperadmin={isSuperadmin}
          onClose={() => setSelectedUserId(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
