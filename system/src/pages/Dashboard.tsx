import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { moduleIconMap, type ModuleDef, type AccessRecord } from "../lib/modules";
import { Package } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleDef[]>([]);
  const [access, setAccess] = useState<AccessRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdminTier = user?.role === "admin" || user?.role === "superadmin";
  const isSuperadmin = user?.role === "superadmin";

  useEffect(() => {
    async function load() {
      const calls: Promise<any>[] = [api.getModules(), api.getMyModuleAccess()];
      if (isAdminTier) {
        calls.push(api.getPendingRegistrations());
        calls.push(api.getPendingPasswordResets());
        if (isSuperadmin) calls.push(api.getPendingModuleRequests());
      }
      const results = await Promise.all(calls);
      setModules(results[0]);
      setAccess(results[1]);
      if (isAdminTier) {
        const pendingLists = results.slice(2) as any[][];
        setPendingCount(pendingLists.reduce((sum, list) => sum + list.length, 0));
      }
      setLoading(false);
    }
    load();
  }, [isAdminTier, isSuperadmin]);

  const approvedModules = modules.filter((mod) => {
    if (mod.slug === "admin-operations") return false;
    return access.some((a) => a.module_id === mod.id && a.status === "approved");
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-body">
          <Loader2 className="animate-spin" size={24} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-brand-navy mb-1">
        Welcome, {user?.name}
      </h1>
      <p className="text-body mb-1">Your modules</p>
      {user?.last_login_at && (
        <p className="text-xs text-body/60 mb-8">
          Last signed in {new Date(user.last_login_at).toLocaleString()}
        </p>
      )}
      {!user?.last_login_at && <div className="mb-8" />}

      {approvedModules.length === 0 && !isAdminTier ? (
        <div className="bg-white rounded-xl border border-black/10 p-10 text-center">
          <p className="text-body">You don't have access to any modules yet.</p>
          <button
            onClick={() => navigate("/module-access")}
            className="inline-block mt-4 text-sm text-brand-orange font-medium hover:underline"
          >
            Request access to a module
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isAdminTier && (
            <button
              onClick={() => navigate("/modules/admin-operations")}
              className="relative text-left rounded-xl bg-white border border-black/10 p-6 hover:shadow-md transition-shadow"
            >
              {pendingCount > 0 && (
                <span className="absolute top-4 right-4 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-medium">
                  {pendingCount}
                </span>
              )}
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-navy/10 text-brand-navy mb-4">
                <Shield size={22} />
              </div>
              <h3 className="font-display font-medium text-brand-navy">Admin Operations</h3>
              <p className="text-sm text-body mt-1">
                {pendingCount > 0 ? `${pendingCount} item${pendingCount !== 1 ? "s" : ""} need attention` : "Manage users, approvals, and modules"}
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-brand-orange font-medium mt-4">
                Open <ArrowRight size={14} />
              </span>
            </button>
          )}

          {approvedModules.map((mod) => {
            const Icon = moduleIconMap[mod.slug] ?? Package;
            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/modules/${mod.slug}`)}
                className="text-left rounded-xl bg-white border border-black/10 p-6 hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-orange/10 text-brand-orange mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-display font-medium text-brand-navy">{mod.name}</h3>
                <p className="text-sm text-body mt-1">{mod.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-brand-orange font-medium mt-4">
                  Open <ArrowRight size={14} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
