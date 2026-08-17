import { useState } from "react";
import { UserCheck, ShieldCheck, Users, Building2, LayoutGrid, KeyRound, BarChart3, History as HistoryIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import RegistrationsTab from "./RegistrationsTab";
import ModuleRequestsTab from "./ModuleRequestsTab";
import UsersTab from "./UsersTab";
import DepartmentsTab from "./DepartmentsTab";
import ModulesTab from "./ModulesTab";
import PasswordResetsTab from "./PasswordResetsTab";
import AnalyticsTab from "./AnalyticsTab";
import HistoryTab from "./HistoryTab";

type Tab =
  | "registrations"
  | "module-requests"
  | "users"
  | "analytics"
  | "departments"
  | "modules"
  | "password-resets"
  | "history";

export default function AdminOperations() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const [tab, setTab] = useState<Tab>("registrations");

  const tabs: { key: Tab; label: string; icon: typeof UserCheck; superadminOnly?: boolean }[] = [
    { key: "registrations", label: "Registrations", icon: UserCheck },
    { key: "module-requests", label: "Module Requests", icon: ShieldCheck, superadminOnly: true },
    { key: "users", label: "Users", icon: Users },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "departments", label: "Departments", icon: Building2, superadminOnly: true },
    { key: "modules", label: "Modules", icon: LayoutGrid, superadminOnly: true },
    { key: "password-resets", label: "Password Resets", icon: KeyRound },
    { key: "history", label: "History", icon: HistoryIcon, superadminOnly: true },
  ];

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-brand-navy mb-1">Admin Operations</h1>
      <p className="text-body mb-6">Manage accounts, requests, and system configuration</p>

      <div className="flex flex-wrap gap-2 border-b border-black/10 mb-6">
        {tabs.map((t) => {
          if (t.superadminOnly && !isSuperadmin) return null;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? "border-brand-orange text-brand-navy" : "border-transparent text-body hover:text-brand-navy"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "registrations" && <RegistrationsTab />}
      {tab === "module-requests" && isSuperadmin && <ModuleRequestsTab />}
      {tab === "users" && <UsersTab isSuperadmin={isSuperadmin} />}
      {tab === "analytics" && <AnalyticsTab isSuperadmin={isSuperadmin} />}
      {tab === "departments" && isSuperadmin && <DepartmentsTab />}
      {tab === "modules" && isSuperadmin && <ModulesTab />}
      {tab === "password-resets" && <PasswordResetsTab />}
      {tab === "history" && isSuperadmin && <HistoryTab />}
    </DashboardLayout>
  );
}
