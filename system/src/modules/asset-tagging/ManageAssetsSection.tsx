import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Tag, Download } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { downloadXlsx } from "../../lib/xlsx";
import { useToast } from "../../context/ToastContext";
import { STATUS_META, STATUS_OPTIONS } from "./statusMeta";
import CategoriesPanel from "./CategoriesPanel";
import CreateAssetForm from "./CreateAssetForm";
import AssetDetailPanel from "./AssetDetailPanel";

type SortKey = "name" | "category_name" | "status" | "created_at";

export default function ManageAssetsSection({ isAssetAdmin, isSuperadmin }: { isAssetAdmin: boolean; isSuperadmin: boolean }) {
  const toast = useToast();
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

  async function exportCsv() {
    const headers = ["Tag ID", "Name", "Category", "Serial Code", "Status", "Location", "Assigned Person", "Assigned Department", "Added"];
    const csvRows = filtered.map((a) => [
      a.tag_id,
      a.name,
      a.category_name,
      a.serial_code,
      STATUS_META[a.status]?.label ?? a.status,
      a.location || "",
      a.assigned_person_name || "",
      a.assigned_department_name || "",
      a.created_at ? new Date(a.created_at).toLocaleDateString() : "",
    ]);
    try {
      await downloadXlsx({
        filename: `assets-${new Date().toISOString().slice(0, 10)}.xlsx`,
        headers,
        rows: csvRows,
        textColumns: [0, 3],
        columnWidths: [14, 22, 14, 16, 16, 18, 18, 18, 12],
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-heading">Manage Assets</h1>
          <p className="text-body">{assets.length} asset{assets.length !== 1 ? "s" : ""} tracked</p>
        </div>
        <div className="flex items-center gap-2">
          {isAssetAdmin && (
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-md border border-border/10 px-3 py-2 text-sm text-body hover:bg-surface-alt"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          {isAssetAdmin && (
            <button
              onClick={() => setShowCategories(true)}
              className="flex items-center gap-1.5 rounded-md border border-border/10 px-3 py-2 text-sm text-body hover:bg-surface-alt"
            >
              <Tag size={14} /> Categories
            </button>
          )}
          {isSuperadmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-md bg-brand-orange text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              <Plus size={14} /> Add Asset
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
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
                            <div className="flex items-center gap-2.5">
                              {a.photos?.[0] ? (
                                <img src={a.photos[0]} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-surface-alt shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-heading">{a.name}</p>
                                <p className="text-xs text-muted">{a.tag_id}</p>
                              </div>
                            </div>
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
      </div>

      {selectedAssetId !== null && (
        <AssetDetailPanel
          assetId={selectedAssetId}
          isAssetAdmin={isAssetAdmin}
          isSuperadmin={isSuperadmin}
          onClose={() => setSelectedAssetId(null)}
          onChanged={load}
          onNavigateToAsset={(id) => setSelectedAssetId(id)}
        />
      )}

      {showCreate && (
        <CreateAssetForm
          onClose={() => setShowCreate(false)}
          onCreated={(newAssetId) => {
            load();
            if (newAssetId) setSelectedAssetId(newAssetId);
          }}
          onNavigateToAsset={(id) => {
            setShowCreate(false);
            setSelectedAssetId(id);
          }}
        />
      )}

      {showCategories && <CategoriesPanel onClose={() => setShowCategories(false)} onChanged={load} />}
    </div>
  );
}
