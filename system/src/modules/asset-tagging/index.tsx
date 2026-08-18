import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Tag, History, Sun, Moon } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ModuleLogViewer from "../../components/ModuleLogViewer";
import { STATUS_META, STATUS_OPTIONS } from "./statusMeta";
import CategoriesPanel from "./CategoriesPanel";
import CreateAssetForm from "./CreateAssetForm";
import AssetDetailPanel from "./AssetDetailPanel";

type SortKey = "name" | "category_name" | "status" | "created_at";

export default function AssetTagging() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isAssetAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperadmin = user?.role === "superadmin";

  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDesc, setSortDesc] = useState(true);

  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showLog, setShowLog] = useState(false);

  async function load() {
    setLoading(true);
    const [a, c] = await Promise.all([api.getAssets(), api.getAssetCategories()]);
    setAssets(a);
    setCategories(c);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function sortBy(key: SortKey) {
    if (key === sortKey) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = assets.filter((a) => {
      if (categoryFilter && String(a.category_id) !== categoryFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (!q) return true;
      return a.name.toLowerCase().includes(q) || a.tag_id.toLowerCase().includes(q) || a.serial_code.toLowerCase().includes(q);
    });
    list = [...list].sort((a, b) => {
      let av = a[sortKey] ?? "";
      let bv = b[sortKey] ?? "";
      if (sortKey === "created_at") {
        av = a.created_at ? new Date(a.created_at).getTime() : 0;
        bv = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortDesc ? bv - av : av - bv;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDesc ? -cmp : cmp;
    });
    return list;
  }, [assets, search, categoryFilter, statusFilter, sortKey, sortDesc]);

  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "category_name", label: "Category" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Added" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-surface border-b border-border/10 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-body hover:text-heading">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-xl font-semibold text-heading">Asset Tagging</h1>
            <p className="text-xs text-muted">{assets.length} asset{assets.length !== 1 ? "s" : ""} tracked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-md text-body hover:bg-surface-alt"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isSuperadmin && (
            <>
              <button
                onClick={() => setShowLog(true)}
                className="flex items-center gap-1.5 rounded-md border border-border/10 px-3 py-2 text-sm text-body hover:bg-surface-alt"
              >
                <History size={14} /> Log
              </button>
              <button
                onClick={() => setShowCategories(true)}
                className="flex items-center gap-1.5 rounded-md border border-border/10 px-3 py-2 text-sm text-body hover:bg-surface-alt"
              >
                <Tag size={14} /> Categories
              </button>
            </>
          )}
          {isAssetAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-md bg-brand-orange text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              <Plus size={14} /> Add Asset
            </button>
          )}
        </div>
      </header>

      <main className="px-6 py-8 max-w-6xl mx-auto">
        {loading ? (
          <LoadingSpinner />
        ) : assets.length === 0 ? (
          <EmptyState icon={Tag} message="No assets tracked yet" />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  placeholder="Search by name, tag ID, or serial code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border/10 pl-9 pr-3 py-2.5 text-sm bg-surface text-body"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-body py-10 text-center">No matching assets</p>
            ) : (
              <div className="bg-surface rounded-xl border border-border/10 overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-surface-alt text-left text-body">
                    <tr>
                      {columns.map((c) => (
                        <th key={c.key} onClick={() => sortBy(c.key)} className="px-4 py-3 cursor-pointer select-none hover:text-heading">
                          {c.label}{sortKey === c.key ? (sortDesc ? " ↓" : " ↑") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const statusInfo = STATUS_META[a.status];
                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedAssetId(a.id)}
                          className="border-t border-border/10 cursor-pointer hover:bg-surface-alt"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-heading">{a.name}</p>
                            <p className="text-xs text-muted">{a.tag_id}</p>
                          </td>
                          <td className="px-4 py-3 text-body">{a.category_name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusInfo?.className ?? ""}`}>
                              {statusInfo?.label ?? a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-body">
                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {selectedAssetId !== null && (
        <AssetDetailPanel
          assetId={selectedAssetId}
          isAssetAdmin={isAssetAdmin}
          onClose={() => setSelectedAssetId(null)}
          onChanged={load}
          onNavigateToAsset={(id) => setSelectedAssetId(id)}
        />
      )}

      {showCreate && (
        <CreateAssetForm
          onClose={() => setShowCreate(false)}
          onCreated={load}
          onNavigateToAsset={(id) => {
            setShowCreate(false);
            setSelectedAssetId(id);
          }}
        />
      )}

      {showCategories && (
        <CategoriesPanel onClose={() => setShowCategories(false)} onChanged={load} />
      )}

      {showLog && (
        <ModuleLogViewer moduleSlug="asset-tagging" title="Asset Tagging Log" onClose={() => setShowLog(false)} />
      )}
    </div>
  );
}
