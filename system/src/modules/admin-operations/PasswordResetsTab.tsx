import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function PasswordResetsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setRequests(await api.getPendingPasswordResets());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    try {
      await api.approvePasswordReset(id);
      toast.success("Password reset approved");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve reset");
    }
  }

  if (loading) return null;
  if (requests.length === 0) return <p className="text-sm text-body py-10 text-center">No pending password reset requests</p>;

  return (
    <div className="space-y-3">
      {requests.map((r: any) => (
        <div key={r.id} className="bg-white rounded-xl border border-black/10 p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-brand-navy">{r.user_name}</p>
            <p className="text-sm text-body">{r.user_email} &middot; Requested {new Date(r.requested_at).toLocaleString()}</p>
          </div>
          <button onClick={() => approve(r.id)} className="flex items-center gap-1.5 rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
            <Lock size={14} /> Approve Reset
          </button>
        </div>
      ))}
    </div>
  );
}
