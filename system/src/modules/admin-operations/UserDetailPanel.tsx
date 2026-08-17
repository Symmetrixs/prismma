import { useState, useEffect } from "react";
import { X, Unlock, Ban, ShieldOff, Copy } from "lucide-react";
import { api } from "../../lib/api";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useEscapeKey } from "../../lib/useEscapeKey";

interface Props {
  userId: number;
  isSuperadmin: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export default function UserDetailPanel({ userId, isSuperadmin, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [departments, setDepartments] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [grantModuleId, setGrantModuleId] = useState("");
  const [granting, setGranting] = useState(false);
  const toast = useToast();

  useEscapeKey(() => {
    if (!pendingRole) onClose();
  });

  async function load() {
    setLoading(true);
    const [d, depts, mods] = await Promise.all([api.getUserDetail(userId), api.getDepartments(), api.getModules()]);
    setDetail(d);
    setDepartments(depts);
    setModules(mods.filter((m: any) => m.slug !== "admin-operations"));
    setForm({
      name: d.name,
      employee_id: d.employee_id || "",
      phone_number: d.phone_number || "",
      department_id: d.department_id || "",
      job_title: d.job_title || "",
    });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [userId]);

  async function saveEdits() {
    setSaving(true);
    try {
      await api.updateUser(userId, {
        name: form.name,
        employee_id: form.employee_id || null,
        phone_number: form.phone_number || null,
        department_id: form.department_id ? Number(form.department_id) : null,
        job_title: form.job_title || null,
      });
      setEditing(false);
      toast.success("Details updated");
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  async function disable() {
    try {
      await api.disableUser(userId);
      toast.success("Account disabled");
      onChanged();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disable account");
    }
  }

  async function unlock() {
    try {
      await api.unlockUser(userId);
      toast.success("Account unlocked");
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not unlock account");
    }
  }

  async function toggleBlock() {
    try {
      await api.setBlockStatus(userId, !detail.is_blocked);
      toast.success(detail.is_blocked ? "Account unblocked" : "Account blocked");
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update block status");
    }
  }

  async function confirmRoleChange() {
    if (!pendingRole) return;
    try {
      await api.changeRole(userId, pendingRole);
      toast.success("Role updated");
      setPendingRole(null);
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change role");
      setPendingRole(null);
    }
  }

  async function revokeAccess(accessId: number) {
    try {
      await api.revokeModuleAccess(accessId);
      toast.success("Module access revoked");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke access");
    }
  }

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  }

  async function grantAccess() {
    if (!grantModuleId) return;
    setGranting(true);
    try {
      await api.grantModuleAccess(userId, Number(grantModuleId));
      toast.success("Module access granted");
      setGrantModuleId("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not grant access");
    } finally {
      setGranting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl border border-black/10 max-w-lg w-full shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h3 className="font-display text-lg font-semibold text-brand-navy">User Details</h3>
          <button onClick={onClose} className="text-body hover:text-brand-navy">
            <X size={18} />
          </button>
        </div>

        {loading || !detail ? (
          <p className="text-sm text-body py-10 text-center">Loading...</p>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium text-brand-navy text-lg">{detail.name}</p>
                <p className="text-sm text-body flex items-center gap-1.5">
                  {detail.email}
                  <button onClick={() => copyToClipboard(detail.email, "Email")} className="text-body/50 hover:text-brand-navy" title="Copy email">
                    <Copy size={12} />
                  </button>
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  detail.account_status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {detail.account_status}
                {detail.account_locked ? " (locked)" : ""}
                {detail.is_blocked ? " (blocked)" : ""}
              </span>
            </div>

            {editing ? (
              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
                <input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="Employee ID" className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
                <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="Phone number" className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
                <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm bg-white">
                  <option value="">No department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Job title" className="w-full rounded-md border border-black/10 px-3 py-2.5 text-sm" />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditing(false)} className="text-sm text-body px-4 py-2 rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button disabled={saving} onClick={saveEdits} className="text-sm font-medium text-white bg-brand-orange px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-body text-xs">Employee ID</p>
                  <p className="text-brand-navy flex items-center gap-1.5">
                    {detail.employee_id || "—"}
                    {detail.employee_id && (
                      <button onClick={() => copyToClipboard(detail.employee_id, "Employee ID")} className="text-body/50 hover:text-brand-navy" title="Copy employee ID">
                        <Copy size={12} />
                      </button>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-body text-xs">Phone</p>
                  <p className="text-brand-navy">{detail.phone_number || "—"}</p>
                </div>
                <div>
                  <p className="text-body text-xs">Department</p>
                  <p className="text-brand-navy">{detail.department_name || "—"}</p>
                </div>
                <div>
                  <p className="text-body text-xs">Job title</p>
                  <p className="text-brand-navy">{detail.job_title || "—"}</p>
                </div>
                <button onClick={() => setEditing(true)} className="col-span-2 text-sm text-brand-orange font-medium text-left hover:underline">
                  Edit details
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-black/5">
              <button onClick={disable} className="text-xs text-red-600 hover:underline">
                Disable account
              </button>
              {detail.account_locked && (
                <button onClick={unlock} className="flex items-center gap-1 text-xs text-brand-orange hover:underline">
                  <Unlock size={12} /> Unlock
                </button>
              )}
              <button onClick={toggleBlock} className="flex items-center gap-1 text-xs text-body hover:underline">
                <Ban size={12} /> {detail.is_blocked ? "Unblock" : "Block"}
              </button>
              {isSuperadmin && detail.role !== "superadmin" && (
                <select
                  value={detail.role}
                  onChange={(e) => setPendingRole(e.target.value)}
                  className="text-xs border border-black/10 rounded px-2 py-1 bg-white text-brand-navy"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                <p className="text-sm font-medium text-brand-navy">Module Access</p>
                {(() => {
                  const grantable = modules.filter(
                    (m) => !detail.module_access.some((a: any) => a.module_id === m.id && (a.status === "approved" || a.status === "pending"))
                  );
                  if (grantable.length === 0) return null;
                  return (
                    <div className="flex items-center gap-2">
                      <select
                        value={grantModuleId}
                        onChange={(e) => setGrantModuleId(e.target.value)}
                        className="text-xs border border-black/10 rounded px-2 py-1.5 bg-white text-brand-navy"
                      >
                        <option value="">Grant access to...</option>
                        {grantable.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={grantAccess}
                        disabled={!grantModuleId || granting}
                        className="text-xs font-medium text-white bg-brand-navy px-3 py-1.5 rounded disabled:opacity-40"
                      >
                        {granting ? "Granting..." : "Grant"}
                      </button>
                    </div>
                  );
                })()}
              </div>
              {detail.module_access.length === 0 ? (
                <p className="text-xs text-body">No module access on record</p>
              ) : (
                <div className="space-y-2">
                  {detail.module_access.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2 text-sm">
                      <div>
                        <p className="text-brand-navy">{m.module_name}</p>
                        <p className="text-xs text-body capitalize">{m.status}</p>
                      </div>
                      {m.status === "approved" && (
                        <button onClick={() => revokeAccess(m.id)} className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                          <ShieldOff size={12} /> Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {pendingRole && (
        <ConfirmDialog
          title="Change role"
          message={`Change ${detail?.name}'s role from ${detail?.role} to ${pendingRole}?`}
          confirmLabel="Change role"
          onConfirm={confirmRoleChange}
          onCancel={() => setPendingRole(null)}
        />
      )}
    </div>
  );
}
