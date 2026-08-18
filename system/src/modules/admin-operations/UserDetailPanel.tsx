import { useState, useEffect } from "react";
import { X, Unlock, Ban, ShieldOff, Copy, ShieldCheck, AlertTriangle, RotateCcw } from "lucide-react";
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

const fieldClass =
  "w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body";

export default function UserDetailPanel({ userId, isSuperadmin, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [departments, setDepartments] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [grantModuleId, setGrantModuleId] = useState("");
  const [granting, setGranting] = useState(false);
  const toast = useToast();

  useEscapeKey(() => {
    if (!pendingRole && !confirmDisable) onClose();
  });

  async function load() {
    setLoading(true);
    const [d, depts, mods] = await Promise.all([api.getUserDetail(userId), api.getDepartments(), api.getModules()]);
    setDetail(d);
    setDepartments(depts);
    setModules(mods.filter((m: any) => m.slug !== "admin-operations"));
    setForm({
      name: d.name,
      email: d.email,
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
    setSaveError(null);
    try {
      await api.updateUser(userId, {
        name: form.name,
        email: form.email,
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
      setSaveError(err instanceof Error ? err.message : "Could not save changes");
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

  async function reEnable() {
    try {
      await api.enableUser(userId);
      toast.success("Account re-enabled");
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not re-enable account");
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

  const viewingSuperadmin = detail?.role === "superadmin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-xl border border-border/10 max-w-lg w-full shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <h3 className="font-display text-lg font-semibold text-heading">User Details</h3>
          <button onClick={onClose} className="text-body hover:text-heading">
            <X size={18} />
          </button>
        </div>

        {loading || !detail ? (
          <p className="text-sm text-body py-10 text-center">Loading...</p>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium text-heading text-lg">{detail.name}</p>
                <p className="text-sm text-body flex items-center gap-1.5">
                  {detail.email}
                  <button onClick={() => copyToClipboard(detail.email, "Email")} className="text-muted hover:text-heading" title="Copy email">
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

            {/* Profile details */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Profile</p>
              {editing ? (
                <div className="space-y-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className={fieldClass} />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className={fieldClass} />
                  <input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="Employee ID" className={fieldClass} />
                  <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="Phone number" className={fieldClass} />
                  <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className={fieldClass}>
                    <option value="">No department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Job title" className={fieldClass} />

                  {saveError && (
                    <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setEditing(false); setSaveError(null); }} className="text-sm text-body px-4 py-2 rounded-md hover:bg-surface-alt">
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
                    <p className="text-muted text-xs">Employee ID</p>
                    <p className="text-heading flex items-center gap-1.5">
                      {detail.employee_id || "—"}
                      {detail.employee_id && (
                        <button onClick={() => copyToClipboard(detail.employee_id, "Employee ID")} className="text-muted hover:text-heading" title="Copy employee ID">
                          <Copy size={12} />
                        </button>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Phone</p>
                    <p className="text-heading">{detail.phone_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Department</p>
                    <p className="text-heading">{detail.department_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs">Job title</p>
                    <p className="text-heading">{detail.job_title || "—"}</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="col-span-2 text-sm text-brand-orange font-medium text-left hover:underline">
                    Edit details
                  </button>
                </div>
              )}
            </div>

            {/* Account status controls, grouped together */}
            <div className="rounded-lg border border-border/10 bg-surface-alt p-4">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">Account Status</p>
              <div className="flex flex-wrap items-center gap-4">
                {detail.account_status === "disabled" ? (
                  isSuperadmin ? (
                    <button onClick={reEnable} className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                      <RotateCcw size={14} /> Re-enable account
                    </button>
                  ) : (
                    <span className="text-sm text-muted">Disabled, only a superadmin can re-enable it</span>
                  )
                ) : (
                  <button onClick={() => setConfirmDisable(true)} className="text-sm text-red-600 hover:underline">
                    Disable account
                  </button>
                )}
                <button onClick={toggleBlock} className="flex items-center gap-1.5 text-sm text-body hover:underline" title="Prevents spamming password reset and module access requests, does not affect login">
                  <Ban size={14} /> {detail.is_blocked ? "Unblock" : "Block"}
                </button>
                {detail.account_locked && (
                  <button onClick={unlock} className="flex items-center gap-1.5 text-sm text-brand-orange hover:underline">
                    <Unlock size={14} /> Unlock
                  </button>
                )}
                {isSuperadmin && detail.role !== "superadmin" && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted">Role</span>
                    <select
                      value={detail.role}
                      onChange={(e) => setPendingRole(e.target.value)}
                      className="text-sm border border-border/10 rounded px-2 py-1.5 bg-surface text-heading"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Module access */}
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Module Access</p>
              {viewingSuperadmin ? (
                <div className="flex items-center gap-2 text-sm text-body bg-surface-alt rounded-md px-3 py-2.5">
                  <ShieldCheck size={16} className="text-brand-navy shrink-0" />
                  Superadmin automatically has access to every active module, there's nothing to grant here.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
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
                            className="text-xs border border-border/10 rounded px-2 py-1.5 bg-surface text-heading"
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
                        <div key={m.id} className="flex items-center justify-between rounded-md border border-border/10 px-3 py-2 text-sm">
                          <div>
                            <p className="text-heading">{m.module_name}</p>
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
                </>
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

      {confirmDisable && (
        <ConfirmDialog
          title="Disable this account?"
          message={
            viewingSuperadmin
              ? `${detail?.name} is a superadmin. Disabling this account removes their access immediately, and only another superadmin can re-enable it. Are you sure?`
              : `${detail?.name} will lose access immediately. This can be reversed later by re-enabling the account.`
          }
          confirmLabel="Disable"
          onConfirm={() => {
            setConfirmDisable(false);
            disable();
          }}
          onCancel={() => setConfirmDisable(false)}
        />
      )}
    </div>
  );
}
