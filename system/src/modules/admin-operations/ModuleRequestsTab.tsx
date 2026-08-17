import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function ModuleRequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const toast = useToast();

  async function load() {
    setLoading(true);
    setRequests(await api.getPendingModuleRequests());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    try {
      await api.approveModuleRequest(id);
      toast.success("Module access approved");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve request");
    }
  }

  async function reject(id: number) {
    try {
      await api.rejectModuleRequest(id, reason || "No reason given");
      toast.success("Module access rejected");
      setRejectingId(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reject request");
    }
  }

  if (loading) return null;
  if (requests.length === 0) return <p className="text-sm text-body py-10 text-center">No pending module requests</p>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="bg-white rounded-xl border border-black/10 p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-medium text-brand-navy">{r.user_name} requesting {r.module_name}</p>
            <p className="text-sm text-body">{r.user_email} &middot; Requested {new Date(r.requested_at).toLocaleString()}</p>
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
