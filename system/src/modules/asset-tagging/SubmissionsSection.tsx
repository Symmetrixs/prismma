import { useState, useEffect } from "react";
import { ClipboardList, Plus, X, Camera } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { STATUS_META, STATUS_OPTIONS } from "./statusMeta";

export default function SubmissionsSection() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | "pending" | "reviewed">("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const r = await api.getSubmissions(filter || undefined);
    setSubmissions(r);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <div>
          <h1 className="font-display text-2xl font-semibold text-heading">Submissions</h1>
          <p className="text-body">Report a return, or see what's still waiting on review</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-brand-orange text-white px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          <Plus size={14} /> New Submission
        </button>
      </div>

      <div className="flex items-center gap-2 my-5">
        {(["", "pending", "reviewed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              filter === f ? "bg-brand-orange text-white" : "text-body hover:bg-surface-alt"
            }`}
          >
            {f === "" ? "All" : f === "pending" ? "Pending" : "Reviewed"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : submissions.length === 0 ? (
        <EmptyState icon={ClipboardList} message="No submissions yet" />
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => {
            const proposedInfo = STATUS_META[s.proposed_status];
            return (
              <div key={s.id} className="bg-surface rounded-xl border border-border/10 p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-heading">{s.asset_name} <span className="text-muted text-xs font-normal">{s.asset_tag_id}</span></p>
                    <p className="text-xs text-muted mt-0.5">
                      Returned by {s.returned_by_person_name || s.returned_by_department_name || "Unknown"} · Submitted by {s.submitted_by_name} · {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  {s.status === "pending" ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Pending review
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_META[s.final_status]?.className ?? ""}`}>
                      Finalized: {STATUS_META[s.final_status]?.label ?? s.final_status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-body mt-2">
                  Proposed: <span className={`text-xs px-1.5 py-0.5 rounded ${proposedInfo?.className ?? ""}`}>{proposedInfo?.label ?? s.proposed_status}</span>
                </p>
                {s.detail && <p className="text-sm text-body mt-1">{s.detail}</p>}
                {s.photo_url && <img src={s.photo_url} alt="" className="mt-2 rounded-md max-h-32 object-cover" />}
                {s.status === "reviewed" && (
                  <p className="text-xs text-muted mt-2">
                    Reviewed by {s.reviewed_by_name} · {new Date(s.reviewed_at).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateSubmissionForm
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            load();
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function CreateSubmissionForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [assetId, setAssetId] = useState("");
  const [proposedStatus, setProposedStatus] = useState("under_repair");
  const [detail, setDetail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    api.getAssets().then((all) => {
      const inUse = all.filter((a: any) => a.assigned_person_id || a.assigned_department_id);
      setAssets(inUse);
    });
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { url } = await api.uploadAssetPhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetId) return;
    setError(null);
    setSaving(true);
    try {
      await api.createSubmission(Number(assetId), {
        proposed_status: proposedStatus,
        detail: detail || undefined,
        photo_url: photoUrl || undefined,
      });
      toast.success("Submission created, waiting on superadmin review");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create submission");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-xl border border-border/10 max-w-md w-full shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <h3 className="font-display text-lg font-semibold text-heading">New Submission</h3>
          <button onClick={onClose} className="text-body hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {assets.length === 0 ? (
            <p className="text-sm text-muted">No assets are currently in use, so there's nothing to report a return for right now.</p>
          ) : (
            <>
              <select
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
              >
                <option value="" disabled>Select the asset being returned</option>
                {assets.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.tag_id}), with {a.assigned_person_name || a.assigned_department_name}
                  </option>
                ))}
              </select>
              <select
                value={proposedStatus}
                onChange={(e) => setProposedStatus(e.target.value)}
                className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="What condition did it come back in?"
                rows={2}
                className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body resize-y"
              />
              <div className="flex items-center gap-3">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-surface-alt" />
                )}
                <label className="flex items-center gap-1.5 text-xs text-body border border-border/10 rounded-md px-3 py-1.5 hover:bg-surface-alt cursor-pointer">
                  <Camera size={12} /> {uploadingPhoto ? "Uploading..." : "Add Photo (optional)"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={saving || !assetId}
                className="w-full text-sm font-medium text-white bg-brand-orange px-4 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Submit"}
              </button>
              <p className="text-xs text-muted text-center">This goes to Review before the status actually changes.</p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
