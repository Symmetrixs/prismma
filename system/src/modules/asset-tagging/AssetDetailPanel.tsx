import { useState, useEffect } from "react";
import { X, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useEscapeKey } from "../../lib/useEscapeKey";
import ConfirmDialog from "../../components/ConfirmDialog";
import { STATUS_META, STATUS_OPTIONS } from "./statusMeta";

interface Props {
  assetId: number;
  isAssetAdmin: boolean;
  onClose: () => void;
  onChanged: () => void;
  onNavigateToAsset: (id: number) => void;
}

export default function AssetDetailPanel({ assetId, isAssetAdmin, onClose, onChanged, onNavigateToAsset }: Props) {
  const { user } = useAuth();
  const toast = useToast();

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [pendingNoteAction, setPendingNoteAction] = useState<{ type: "edit" | "delete"; noteId: number } | null>(null);

  useEscapeKey(() => {
    if (!pendingNoteAction) onClose();
  });

  async function load() {
    setLoading(true);
    const [a, cats, u, depts] = await Promise.all([
      api.getAsset(assetId),
      api.getAssetCategories(),
      api.getUsers(),
      api.getDepartments(),
    ]);
    setAsset(a);
    setCategories(cats);
    setUsers(u);
    setDepartments(depts);
    setForm({
      name: a.name,
      category_id: a.category_id,
      serial_code: a.serial_code,
      status: a.status,
      location: a.location || "",
      assigned_person_id: a.assigned_person_id || "",
      assigned_department_id: a.assigned_department_id || "",
    });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [assetId]);

  async function saveEdits() {
    setSaving(true);
    setSaveError(null);
    try {
      await api.updateAsset(assetId, {
        name: form.name,
        category_id: Number(form.category_id),
        serial_code: form.serial_code,
        status: form.status,
        location: form.location || null,
        assigned_person_id: form.assigned_person_id ? Number(form.assigned_person_id) : null,
        assigned_department_id: form.assigned_department_id ? Number(form.assigned_department_id) : null,
      });
      toast.success("Asset updated");
      setEditing(false);
      load();
      onChanged();
    } catch (err: any) {
      if (err?.detail?.conflicting_asset_id) {
        setSaveError(err.detail.message);
      } else {
        setSaveError(err instanceof Error ? err.message : "Could not save changes");
      }
    } finally {
      setSaving(false);
    }
  }

  async function submitNewNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.addAssetNote(assetId, newNote.trim());
      setNewNote("");
      toast.success("Note added");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add note");
    } finally {
      setAddingNote(false);
    }
  }

  function startEditNote(note: any) {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
  }

  function requestSaveNoteEdit() {
    if (!editingNoteId) return;
    setPendingNoteAction({ type: "edit", noteId: editingNoteId });
  }

  function requestDeleteNote(noteId: number) {
    setPendingNoteAction({ type: "delete", noteId });
  }

  async function confirmNoteAction() {
    if (!pendingNoteAction) return;
    const { type, noteId } = pendingNoteAction;
    setPendingNoteAction(null);
    try {
      if (type === "edit") {
        await api.editAssetNote(noteId, editNoteContent);
        toast.success("Note updated");
        setEditingNoteId(null);
      } else {
        await api.deleteAssetNote(noteId);
        toast.success("Note deleted");
      }
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update note");
    }
  }

  const statusInfo = asset ? STATUS_META[asset.status] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-xl border border-border/10 max-w-lg w-full shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <h3 className="font-display text-lg font-semibold text-heading">Asset Details</h3>
          <button onClick={onClose} className="text-body hover:text-heading">
            <X size={18} />
          </button>
        </div>

        {loading || !asset ? (
          <p className="text-sm text-body py-10 text-center">Loading...</p>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium text-heading text-lg">{asset.name}</p>
                <p className="text-sm text-muted">{asset.tag_id}</p>
              </div>
              {statusInfo && (
                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                />
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  value={form.serial_code}
                  onChange={(e) => setForm({ ...form, serial_code: e.target.value })}
                  placeholder="Serial code"
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Location (e.g. Store Room 4)"
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                />
                <select
                  value={form.assigned_person_id}
                  onChange={(e) => setForm({ ...form, assigned_person_id: e.target.value, assigned_department_id: "" })}
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                >
                  <option value="">Not assigned to a person</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <select
                  value={form.assigned_department_id}
                  onChange={(e) => setForm({ ...form, assigned_department_id: e.target.value, assigned_person_id: "" })}
                  className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
                >
                  <option value="">Not assigned to a department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

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
                  <p className="text-muted text-xs">Category</p>
                  <p className="text-heading">{asset.category_name}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Serial Code</p>
                  <p className="text-heading">{asset.serial_code}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Location</p>
                  <p className="text-heading">{asset.location || "—"}</p>
                </div>
                <div>
                  <p className="text-muted text-xs">Assigned To</p>
                  <p className="text-heading">
                    {asset.assigned_person_name || asset.assigned_department_name || "Unassigned"}
                  </p>
                </div>
                {isAssetAdmin && (
                  <button onClick={() => setEditing(true)} className="col-span-2 flex items-center gap-1.5 text-sm text-brand-orange font-medium hover:underline">
                    <Pencil size={14} /> Edit details
                  </button>
                )}
              </div>
            )}

            <div className="border-t border-border/10 pt-4">
              <p className="text-sm font-medium text-heading mb-3">Notes</p>

              <form onSubmit={submitNewNote} className="flex gap-2 mb-4">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note"
                  className="flex-1 rounded-md border border-border/10 px-3 py-2 text-sm bg-surface text-body"
                />
                <button disabled={addingNote} className="rounded-md bg-brand-orange text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                  Add
                </button>
              </form>

              {asset.notes.length === 0 ? (
                <p className="text-xs text-muted">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {asset.notes.map((n: any) => {
                    const isOwner = n.author_id === user?.id;
                    const canEdit = isOwner || isAssetAdmin;
                    return (
                      <div key={n.id} className="rounded-md border border-border/10 px-3 py-2.5 text-sm">
                        {editingNoteId === n.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editNoteContent}
                              onChange={(e) => setEditNoteContent(e.target.value)}
                              rows={3}
                              className="w-full rounded-md border border-border/10 px-3 py-2 text-sm bg-surface text-body"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingNoteId(null)} className="text-xs text-body hover:underline">
                                Cancel
                              </button>
                              <button onClick={requestSaveNoteEdit} className="text-xs font-medium text-brand-orange hover:underline">
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-body whitespace-pre-wrap">{n.content}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <p className="text-xs text-muted">
                                {n.author_name} · {new Date(n.created_at).toLocaleString()}
                                {n.edited ? " · edited" : ""}
                              </p>
                              {canEdit && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => startEditNote(n)} className="text-muted hover:text-heading">
                                    <Pencil size={12} />
                                  </button>
                                  {isAssetAdmin && (
                                    <button onClick={() => requestDeleteNote(n.id)} className="text-muted hover:text-red-600">
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {pendingNoteAction && (
        <ConfirmDialog
          title={pendingNoteAction.type === "edit" ? "Save changes to this note?" : "Delete this note?"}
          message="You're changing information on this asset that others may currently be relying on. If this note contains login details or similar, double-check accuracy before continuing, an incorrect change here could lock the next person out."
          confirmLabel={pendingNoteAction.type === "edit" ? "Save" : "Delete"}
          onConfirm={confirmNoteAction}
          onCancel={() => setPendingNoteAction(null)}
        />
      )}
    </div>
  );
}
