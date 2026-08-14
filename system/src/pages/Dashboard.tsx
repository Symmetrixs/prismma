import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Ticket, Shield, ArrowRight, Loader2, Newspaper } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

interface ModuleDef {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
}

interface AccessRecord {
  module_id: number;
  status: string;
}

const iconMap: Record<string, typeof Package> = {
  "asset-tagging": Package,
  ticketing: Ticket,
  "news-editor": Newspaper,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleDef[]>([]);
  const [access, setAccess] = useState<AccessRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [mods, acc] = await Promise.all([api.getModules(), api.getMyModuleAccess()]);
      setModules(mods);
      setAccess(acc);
      setLoading(false);
    }
    load();
  }, []);

  const isAdminTier = user?.role === "admin" || user?.role === "superadmin";

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
      <p className="text-body mb-8">Your modules</p>

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
              className="text-left rounded-xl bg-white border border-black/10 p-6 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-navy/10 text-brand-navy mb-4">
                <Shield size={22} />
              </div>
              <h3 className="font-display font-medium text-brand-navy">Admin Operations</h3>
              <p className="text-sm text-body mt-1">Manage users, approvals, and modules</p>
              <span className="inline-flex items-center gap-1 text-sm text-brand-orange font-medium mt-4">
                Open <ArrowRight size={14} />
              </span>
            </button>
          )}

          {approvedModules.map((mod) => {
            const Icon = iconMap[mod.slug] ?? Package;
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
