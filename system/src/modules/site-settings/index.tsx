import { useState } from "react";
import { FileText, LayoutGrid, Settings2, Building2, Share2, Wrench } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import PagesTab from "./PagesTab";
import ModulesTab from "./ModulesTab";
import SystemTab from "./SystemTab";
import SiteInfoTab from "./SiteInfoTab";
import SocialLinksTab from "./SocialLinksTab";
import MaintenanceTab from "./MaintenanceTab";

type Tab = "pages" | "modules" | "system" | "site-info" | "social-links" | "maintenance";

const TAB_DEFS: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: "pages", label: "Pages", icon: FileText },
  { key: "modules", label: "Modules", icon: LayoutGrid },
  { key: "system", label: "System", icon: Settings2 },
  { key: "site-info", label: "Site Info", icon: Building2 },
  { key: "social-links", label: "Social Links", icon: Share2 },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
];

export default function SiteSettings() {
  const [tab, setTab] = useState<Tab>("pages");

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-heading mb-1">Site Settings</h1>
      <p className="text-body mb-6">Control what the public site shows and how the system behaves</p>

      <div className="flex flex-wrap gap-1 mb-6">
        {TAB_DEFS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? "border-brand-orange text-heading" : "border-border/10 text-body hover:text-heading"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "pages" && <PagesTab />}
      {tab === "modules" && <ModulesTab />}
      {tab === "system" && <SystemTab />}
      {tab === "site-info" && <SiteInfoTab />}
      {tab === "social-links" && <SocialLinksTab />}
      {tab === "maintenance" && <MaintenanceTab />}
    </DashboardLayout>
  );
}
