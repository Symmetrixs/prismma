import { useState, useEffect } from "react";
import { UserCheck, ShieldCheck, Users, Building2, LayoutGrid, KeyRound, Check, X, Lock, Unlock, Ban } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";

type Tab = "registrations" | "module-requests" | "users" | "departments" | "modules" | "password-resets";

export default function AdminOperations() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const [tab, setTab] = useState<Tab>("registrations");

  const tabs: { key: Tab; label: string; icon: typeof UserCheck; superadminOnly?: boolean }[] = [
    { key: "registrations", label: "Registrations", icon: UserCheck },
    { key: "module-requests", label: "Module Requests", icon: ShieldCheck },
    { key: "users", label: "Users", icon: Users },
    { key: "departments", label: "Departments", icon: Building2, superadminOnly: true },
    { key: "modules", label: "Modules", icon: LayoutGrid, superadminOnly: true },
    { key: "password-resets", label: "Password Resets", icon: KeyRound },
  ];

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-brand-navy mb-1">Admin Operations</h1>
      <p className="text-body mb-6">Manage accounts, requests, and system configuration</p>

      <div className="flex flex-wrap gap-2 border-b border-black/10 mb-6">
        {tabs.map((t) => {
          if (t.superadminOnly && !isSuperadmin) return null;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? "border-brand-orange text-brand-navy" : "border-transparent text-body hover:text-brand-navy"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "registrations" && <RegistrationsTab />}
      {tab === "module-requests" && <ModuleRequestsTab />}
      {tab === "users" && <UsersTab isSuperadmin={isSuperadmin} />}
      {tab === "departments" && isSuperadmin && <DepartmentsTab />}
      {tab === "modules" && isSuperadmin && <ModulesTab />}
      {tab === "password-resets" && <PasswordResetsTab />}
    </DashboardLayout>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-body py-10 text-center">{label}</p>;
}

function RegistrationsTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  async function load() {
    setLoading(true);
    setUsers(await api.getPendingRegistrations());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    await api.approveRegistration(id);
    load();
  }

  async function reject(id: number) {
    await api.rejectRegistration(id, reason || "No reason given");
    setRejectingId(null);
    setReason("");
    load();
  }

  if (loading) return null;
  if (users.length === 0) return <EmptyState label="No pending registrations" />;

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u.id} className="bg-white rounded-xl border border-black/10 p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-medium text-brand-navy">{u.name}</p>
            <p className="text-sm text-body">{u.email} &middot; ID {u.employee_id}</p>
          </div>
          {rejectingId === u.id ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                placeholder="Reason for rejection"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-md border border-black/10 px-3 py-2 text-sm"
              />
              <button onClick={() => reject(u.id)} className="text-sm text-red-600 font-medium">Confirm</button>
              <button onClick={() => setRejectingId(null)} className="text-sm text-body">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => approve(u.id)} className="flex items-center gap-1.5 rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                <Check size={14} /> Approve
              </button>
              <button onClick={() => setRejectingId(u.id)} className="flex items-center gap-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-medium hover:bg-red-100">
                <X size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ModuleRequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  async function load() {
    setLoading(true);
    setRequests(await api.getPendingModuleRequests());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    await api.approveModuleRequest(id);
    load();
  }

  async function reject(id: number) {
    await api.rejectModuleRequest(id, reason || "No reason given");
    setRejectingId(null);
    setReason("");
    load();
  }

  if (loading) return null;
  if (requests.length === 0) return <EmptyState label="No pending module requests" />;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="bg-white rounded-xl border border-black/10 p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-medium text-brand-navy">User #{r.user_id} requesting Module #{r.module_id}</p>
            <p className="text-sm text-body">Requested {new Date(r.requested_at).toLocaleString()}</p>
          </div>
          {rejectingId === r.id ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                placeholder="Reason for rejection"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-md border border-black/10 px-3 py-2 text-sm"
              />
              <button onClick={() => reject(r.id)} className="text-sm text-red-600 font-medium">Confirm</button>
              <button onClick={() => setRejectingId(null)} className="text-sm text-body">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => approve(r.id)} className="flex items-center gap-1.5 rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                <Check size={14} /> Approve
              </button>
              <button onClick={() => setRejectingId(r.id)} className="flex items-center gap-1.5 rounded-md bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-medium hover:bg-red-100">
                <X size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UsersTab({ isSuperadmin }: { isSuperadmin: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setUsers(await api.getUsers());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(u: any) {
    if (u.account_status === "disabled") {
      await api.enableUser(u.id);
    } else {
      await api.disableUser(u.id);
    }
    load();
  }

  async function unlock(u: any) {
    await api.unlockUser(u.id);
    load();
  }

  async function toggleBlock(u: any) {
    await api.setBlockStatus(u.id, !u.is_blocked);
    load();
  }

  async function promote(u: any, role: string) {
    await api.changeRole(u.id, role);
    load();
  }

  if (loading) return null;
  if (users.length === 0) return <EmptyState label="No users found" />;

  return (
    <div className="bg-white rounded-xl border border-black/10 overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-gray-50 text-left text-body">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-black/5">
              <td className="px-4 py-3">
                <p className="font-medium text-brand-navy">{u.name}</p>
                <p className="text-xs text-body">{u.email}</p>
              </td>
              <td className="px-4 py-3 capitalize">{u.role}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  u.account_status === "active" ? "bg-green-100 text-green-700" :
                  u.account_status === "disabled" ? "bg-gray-100 text-gray-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {u.account_status}{u.account_locked ? " (locked)" : ""}{u.is_blocked ? " (blocked)" : ""}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={() => toggleStatus(u)} className="text-xs text-brand-navy hover:underline">
                    {u.account_status === "disabled" ? "Enable" : "Disable"}
                  </button>
                  {u.account_locked && (
                    <button onClick={() => unlock(u)} className="flex items-center gap-1 text-xs text-brand-orange hover:underline">
                      <Unlock size={12} /> Unlock
                    </button>
                  )}
                  <button onClick={() => toggleBlock(u)} className="flex items-center gap-1 text-xs text-body hover:underline">
                    <Ban size={12} /> {u.is_blocked ? "Unblock" : "Block"}
                  </button>
                  {isSuperadmin && u.role !== "superadmin" && (
                    <select
                      value={u.role}
                      onChange={(e) => promote(u, e.target.value)}
                      className="text-xs border border-black/10 rounded px-2 py-1 bg-white text-brand-navy"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DepartmentsTab() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setDepartments(await api.getDepartments());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createDepartment(name.trim());
    setName("");
    load();
  }

  async function remove(id: number) {
    await api.deleteDepartment(id);
    load();
  }

  if (loading) return null;

  return (
    <div>
      <form onSubmit={add} className="flex gap-3 mb-6">
        <input
          placeholder="New department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-black/10 px-4 py-2.5 text-sm"
        />
        <button className="rounded-md bg-brand-orange text-white px-5 py-2.5 text-sm font-medium hover:opacity-90">Add</button>
      </form>
      <div className="bg-white rounded-xl border border-black/10 divide-y divide-black/5">
        {departments.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-brand-navy">{d.name}</span>
            <button onClick={() => remove(d.id)} className="text-xs text-red-600 hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModulesTab() {
  const [modules, setModules] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", status: "coming_soon" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setModules(await api.getModules());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.createModule(form);
    setForm({ name: "", description: "", status: "coming_soon" });
    load();
  }

  async function remove(id: number) {
    await api.deleteModule(id);
    load();
  }

  if (loading) return null;

  return (
    <div>
      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-black/10 px-4 py-2.5 text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-md border border-black/10 px-4 py-2.5 text-sm" />
        <button className="rounded-md bg-brand-orange text-white px-5 py-2.5 text-sm font-medium hover:opacity-90">Add Module</button>
      </form>
      <p className="text-xs text-body mb-4">
        The module's URL slug is generated automatically from its name. Adding a module here registers it in the
        system, its actual screen still needs a matching folder in <code className="bg-gray-100 px-1 rounded">modules/</code> wired into the registry.
      </p>
      <div className="bg-white rounded-xl border border-black/10 divide-y divide-black/5">
        {modules.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <span className="text-sm font-medium text-brand-navy">{m.name}</span>
              <span className="text-xs text-body ml-2">({m.status})</span>
            </div>
            <button onClick={() => remove(m.id)} className="text-xs text-red-600 hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordResetsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setRequests(await api.getPendingPasswordResets());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    await api.approvePasswordReset(id);
    load();
  }

  if (loading) return null;
  if (requests.length === 0) return <EmptyState label="No pending password reset requests" />;

  return (
    <div className="space-y-3">
      {requests.map((r: any) => (
        <div key={r.id} className="bg-white rounded-xl border border-black/10 p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-brand-navy">User #{r.user_id}</p>
            <p className="text-sm text-body">Requested {new Date(r.requested_at).toLocaleString()}</p>
          </div>
          <button onClick={() => approve(r.id)} className="flex items-center gap-1.5 rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
            <Lock size={14} /> Approve Reset
          </button>
        </div>
      ))}
    </div>
  );
}
