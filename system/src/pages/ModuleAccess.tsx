import { useState, useEffect } from "react";
import { Package, Clock, Check, RotateCcw } from "lucide-react";
import { api } from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import { moduleIconMap } from "../lib/modules";
import type { ModuleDef, AccessRecord } from "../lib/modules";
import { useToast } from "../context/ToastContext";

export default function ModuleAccess() {
  const [modules, setModules] = useState<ModuleDef[]>([]);
  const [access, setAccess] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<number | null>(null);
  const toast = useToast();

  async function load() {
    const [mods, acc] = await Promise.all([api.getModules(), api.getMyModuleAccess()]);
    setModules(mods.filter((m: ModuleDef) => m.slug !== "admin-operations"));
    setAccess(acc);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function accessFor(moduleId: number) {
    return access.find((a) => a.module_id === moduleId)?.status ?? null;
  }

  function rejectionReasonFor(moduleId: number) {
    return access.find((a) => a.module_id === moduleId)?.rejection_reason ?? null;
  }

  async function handleRequest(moduleId: number) {
    setRequestingId(moduleId);
    try {
      await api.requestModuleAccess(moduleId);
      await load();
      toast.success("Access requested");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setRequestingId(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-body">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-brand-navy mb-1">Module Access</h1>
      <p className="text-body mb-8">Request access to modules you don't currently have</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const status = accessFor(mod.id);
          const Icon = moduleIconMap[mod.slug] ?? Package;
          const isComingSoon = mod.status === "coming_soon";

          return (
            <div key={mod.id} className="rounded-xl bg-white border border-black/10 p-6">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange mb-4">
                <Icon size={22} />
              </div>
              <h3 className="font-display font-medium text-brand-navy">{mod.name}</h3>
              <p className="text-sm text-body mt-1">{mod.description}</p>

              {status === "approved" ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-600 mt-4">
                  <Check size={14} /> Access granted
                </span>
              ) : status === "pending" ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-body mt-4">
                  <Clock size={14} /> Request pending
                </span>
              ) : status === "rejected" ? (
                <div className="mt-4">
                  <button
                    onClick={() => handleRequest(mod.id)}
                    disabled={requestingId === mod.id}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Rejected, request again
                  </button>
                  {rejectionReasonFor(mod.id) && (
                    <p className="text-xs text-body/70 mt-1">Reason: {rejectionReasonFor(mod.id)}</p>
                  )}
                </div>
              ) : status === "revoked" ? (
                <button
                  onClick={() => handleRequest(mod.id)}
                  disabled={requestingId === mod.id}
                  className="flex items-center gap-1.5 text-sm text-amber-600 mt-4 hover:underline disabled:opacity-50"
                >
                  <RotateCcw size={14} /> Access revoked, request again
                </button>
              ) : (
                <button
                  onClick={() => handleRequest(mod.id)}
                  disabled={requestingId === mod.id || isComingSoon}
                  className="text-sm text-brand-navy font-medium mt-4 hover:underline disabled:opacity-50"
                >
                  {requestingId === mod.id ? "Requesting..." : "Request Access"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
