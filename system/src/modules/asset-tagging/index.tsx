import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, UserPlus2, ClipboardList, ClipboardCheck, Users2, History, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ModuleLogViewer from "../../components/ModuleLogViewer";
import ManageAssetsSection from "./ManageAssetsSection";
import AssignSection from "./AssignSection";
import SubmissionsSection from "./SubmissionsSection";
import ReviewSection from "./ReviewSection";
import UsersSection from "./UsersSection";

type SectionKey = "manage" | "assign" | "submissions" | "review" | "users" | "log";

export default function AssetTagging() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isAssetAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperadmin = user?.role === "superadmin";
  const [section, setSection] = useState<SectionKey>("manage");

  const navItems: { key: SectionKey; label: string; icon: typeof Package; visible: boolean }[] = [
    { key: "manage", label: "Manage Assets", icon: Package, visible: true },
    { key: "assign", label: "Assign", icon: UserPlus2, visible: isAssetAdmin },
    { key: "submissions", label: "Submissions", icon: ClipboardList, visible: isAssetAdmin },
    { key: "review", label: "Review", icon: ClipboardCheck, visible: isSuperadmin },
    { key: "users", label: "Users", icon: Users2, visible: true },
    { key: "log", label: "Log", icon: History, visible: isSuperadmin },
  ];

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-56 shrink-0 bg-surface border-r border-border/10 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/10">
          <button onClick={() => navigate("/")} className="text-body hover:text-heading">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="font-display text-sm font-semibold text-heading">Asset Tagging</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.filter((n) => n.visible).map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                onClick={() => setSection(n.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  section === n.key ? "bg-brand-orange/10 text-brand-orange" : "text-body hover:bg-surface-alt hover:text-heading"
                }`}
              >
                <Icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border/10">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-body hover:bg-surface-alt hover:text-heading"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 max-w-6xl">
        {section === "manage" && <ManageAssetsSection isAssetAdmin={isAssetAdmin} isSuperadmin={isSuperadmin} />}
        {section === "assign" && isAssetAdmin && <AssignSection />}
        {section === "submissions" && isAssetAdmin && <SubmissionsSection />}
        {section === "review" && isSuperadmin && <ReviewSection />}
        {section === "users" && <UsersSection />}
        {section === "log" && isSuperadmin && (
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl font-semibold text-heading mb-1">Log</h1>
            <p className="text-body mb-6">Every action taken within Asset Tagging</p>
            <ModuleLogViewer moduleSlug="asset-tagging" title="Asset Tagging Log" inline />
          </div>
        )}
      </main>
    </div>
  );
}
