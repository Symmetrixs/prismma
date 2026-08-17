import { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import UserDetailPanel from "./UserDetailPanel";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useEscapeKey } from "../../lib/useEscapeKey";

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

type SortKey = "name" | "department" | "role" | "status";

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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDesc, setSortDesc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeptId, setBulkDeptId] = useState("");
  const [confirmBulkDisable, setConfirmBulkDisable] = useState(false);
  const toast = useToast();

  const hasFormChanges = JSON.stringify(form) !== JSON.stringify(EMPTY_FORM);

  function attemptCloseCreate() {
    if (hasFormChanges) {
      setConfirmDiscard(true);
    } else {
      setShowCreate(false);
    }
  }

  function discardAndClose() {
    setConfirmDiscard(false);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setCreateError("");
  }

  useEscapeKey(() => {
    if (confirmDiscard) return;
    if (showCreate) attemptCloseCreate();
  });

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

  function departmentName(id: number | null) {
    if (!id) return "—";
    return departments.find((d) => d.id === id)?.name || "—";
  }

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q
      ? visible.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.employee_id?.toLowerCase().includes(q)
        )
      : visible;

    list = [...list].sort((a, b) => {
      let av: string;
      let bv: string;
      if (sortKey === "name") {
        av = a.name || "";
        bv = b.name || "";
      } else if (sortKey === "department") {
        av = departmentName(a.department_id);
        bv = departmentName(b.department_id);
      } else if (sortKey === "role") {
        av = a.role || "";
        bv = b.role || "";
      } else {
        av = a.account_status || "";
        bv = b.account_status || "";
      }
      const cmp = av.localeCompare(bv);
      return sortDesc ? -cmp : cmp;
    });

    return list;
  }, [visible, search, sortKey, sortDesc, departments]);

  function toggleSelect(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)));
    }
  }

  async function bulkDisable() {
    setConfirmBulkDisable(false);
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(ids.map((id) => api.disableUser(id)));
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = ids.length - failed;
    if (succeeded > 0) toast.success(`${succeeded} account${succeeded !== 1 ? "s" : ""} disabled`);
    if (failed > 0) toast.error(`${failed} could not be disabled`);
    setSelectedIds(new Set());
    load();
  }

  async function bulkReassign() {
    if (!bulkDeptId) return;
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((id) => api.updateUser(id, { department_id: Number(bulkDeptId) }))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = ids.length - failed;
    if (succeeded > 0) toast.success(`${succeeded} account${succeeded !== 1 ? "s" : ""} reassigned`);
    if (failed > 0) toast.error(`${failed} could not be reassigned`);
    setSelectedIds(new Set());
    setBulkDeptId("");
    load();
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

  if (loading) return <LoadingSpinner />;

  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "department", label: "Department" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];

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

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-brand-navy/5 border border-brand-navy/10 rounded-md px-4 py-3 flex-wrap">
          <span className="text-sm text-brand-navy font-medium">{selectedIds.size} selected</span>
          <button onClick={() => setConfirmBulkDisable(true)} className="text-sm text-red-600 hover:underline">
            Disable Selected
          </button>
          <div className="flex items-center gap-2">
            <select
              value={bulkDeptId}
              onChange={(e) => setBulkDeptId(e.target.value)}
              className="text-sm border border-black/10 rounded px-2 py-1.5 bg-white"
            >
              <option value="">Reassign to department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button
              onClick={bulkReassign}
              disabled={!bulkDeptId}
              className="text-sm text-brand-navy font-medium disabled:opacity-40"
            >
              Apply
            </button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-body ml-auto hover:underline">
            Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-body py-10 text-center">No users found</p>
      ) : (
        <div className="bg-white rounded-xl border border-black/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-left text-body">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} onClick={() => sortBy(c.key)} className="px-4 py-3 cursor-pointer select-none hover:text-brand-navy">
                    {c.label}
                    {sortKey === c.key ? (sortDesc ? " ↓" : " ↑") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className="border-t border-black/5 cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3" onClick={(e) => toggleSelect(u.id, e)}>
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => {}} />
                  </td>
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
                <button type="button" onClick={attemptCloseCreate} className="text-sm text-body px-4 py-2 rounded-md hover:bg-gray-50">
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

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved information in this form. Closing now will discard it."
          confirmLabel="Discard"
          onConfirm={discardAndClose}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}

      {confirmBulkDisable && (
        <ConfirmDialog
          title="Disable selected accounts?"
          message={`This will disable ${selectedIds.size} account${selectedIds.size !== 1 ? "s" : ""}. They will lose access until re-enabled by a superadmin.`}
          confirmLabel="Disable"
          onConfirm={bulkDisable}
          onCancel={() => setConfirmBulkDisable(false)}
        />
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
