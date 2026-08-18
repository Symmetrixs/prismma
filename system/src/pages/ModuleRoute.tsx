import { useParams } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { ShieldOff, Wrench } from "lucide-react";
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
  const [unavailable, setUnavailable] = useState(false);
  const [moduleName, setModuleName] = useState("");

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
        if (user?.role !== "admin") {
          if (active) {
            setAllowed(false);
            setChecking(false);
          }
          return;
        }
        const modules: ModuleDef[] = await api.getModules();
        const adminOpsModule = modules.find((m) => m.slug === "admin-operations");
        if (active) {
          if (adminOpsModule && adminOpsModule.status === "disabled") {
            setUnavailable(true);
            setModuleName(adminOpsModule.name);
          } else {
            setAllowed(true);
          }
          setChecking(false);
        }
        return;
      }

      const [modules, access]: [ModuleDef[], AccessRecord[]] = await Promise.all([
        api.getModules(),
        api.getMyModuleAccess(),
      ]);
      const targetModule = modules.find((m) => m.slug === slug);

      if (targetModule && targetModule.status !== "active") {
        if (active) {
          setUnavailable(true);
          setModuleName(targetModule.name);
          setChecking(false);
        }
        return;
      }

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

  if (unavailable) {
    return (
      <DashboardLayout>
        <div className="bg-surface rounded-xl border border-border/10 p-10 text-center max-w-md mx-auto">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Wrench size={22} />
          </div>
          <h2 className="font-display text-lg font-medium text-heading mb-2">Temporarily unavailable</h2>
          <p className="text-body text-sm">
            {moduleName} is currently unavailable, likely for maintenance. Your access hasn't been removed, it'll come back once this module is active again.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!allowed) {
    return (
      <DashboardLayout>
        <div className="bg-surface rounded-xl border border-border/10 p-10 text-center max-w-md mx-auto">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/20 text-red-500 dark:text-red-400">
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
