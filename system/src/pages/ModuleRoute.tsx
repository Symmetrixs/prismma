import { useParams } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { moduleRegistry } from "../modules/registry";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { ModuleDef, AccessRecord } from "../lib/modules";

export default function ModuleRoute() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      if (!slug) {
        setChecking(false);
        return;
      }

      if (user?.role === "superadmin") {
        if (active) {
          setAllowed(true);
          setChecking(false);
        }
        return;
      }

      if (slug === "admin-operations") {
        if (active) {
          setAllowed(user?.role === "admin");
          setChecking(false);
        }
        return;
      }

      const [modules, access]: [ModuleDef[], AccessRecord[]] = await Promise.all([
        api.getModules(),
        api.getMyModuleAccess(),
      ]);
      const targetModule = modules.find((m) => m.slug === slug);
      const hasAccess =
        !!targetModule && access.some((a) => a.module_id === targetModule.id && a.status === "approved");

      if (active) {
        setAllowed(hasAccess);
        setChecking(false);
      }
    }

    check();
    return () => {
      active = false;
    };
  }, [slug, user]);

  const Component = slug ? moduleRegistry[slug] : undefined;

  if (checking) {
    return (
      <DashboardLayout>
        <p className="text-body">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!Component) {
    return (
      <DashboardLayout>
        <p className="text-body">Module not found.</p>
      </DashboardLayout>
    );
  }

  if (!allowed) {
    return (
      <DashboardLayout>
        <div className="bg-surface rounded-xl border border-border/10 p-10 text-center max-w-md mx-auto">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500">
            <ShieldOff size={22} />
          </div>
          <h2 className="font-display text-lg font-medium text-heading mb-2">Access required</h2>
          <p className="text-body text-sm">
            You don't currently have access to this module. Head to Module Access to request it.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <p className="text-body">Loading...</p>
        </DashboardLayout>
      }
    >
      <Component />
    </Suspense>
  );
}
