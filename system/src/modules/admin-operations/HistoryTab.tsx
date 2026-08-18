import { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Download } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import { downloadCsv } from "../../lib/csv";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "registration_approved", label: "Registration approved" },
  { value: "registration_rejected", label: "Registration rejected" },
  { value: "disabled", label: "Account disabled" },
  { value: "enabled", label: "Account enabled" },
  { value: "blocked", label: "Account blocked" },
  { value: "unblocked", label: "Account unblocked" },
  { value: "role_change", label: "Role changed" },
  { value: "module_access_approved", label: "Module access approved" },
  { value: "module_access_rejected", label: "Module access rejected" },
  { value: "module_access_revoked", label: "Module access revoked" },
  { value: "password_reset_approved", label: "Password reset approved" },
];

export default function HistoryTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setEntries(await api.getHistory());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function reEnable(targetId: number) {
    try {
      await api.enableUser(targetId);
      toast.success("Account re-enabled");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not re-enable account");
    }
  }

  const departments = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.target_department && set.add(e.target_department));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = entries.filter((e) => {
      if (type && e.type !== type) return false;
      if (department && e.target_department !== department) return false;
      if (!q) return true;
      return (
        e.target_name?.toLowerCase().includes(q) ||
        e.actor_name?.toLowerCase().includes(q) ||
        String(e.target_id).includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      const av = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bv = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDesc ? bv - av : av - bv;
    });
    return list;
  }, [entries, search, type, department, sortDesc]);

  if (loading) return <LoadingSpinner />;

  function exportCsv() {
    const headers = ["Type", "Target", "Actor", "Department", "Detail", "Date"];
    const csvRows = filtered.map((e) => [
      e.label,
      e.target_name,
      e.actor_name || "System",
      e.target_department || "",
      e.detail || "",
      e.created_at ? new Date(e.created_at).toLocaleString() : "",
    ]);
    downloadCsv(`history-${new Date().toISOString().slice(0, 10)}.csv`, headers, csvRows);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-body" />
          <input
            placeholder="Search by name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border/10 pl-9 pr-3 py-2.5 text-sm bg-surface text-body"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface">
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDesc(!sortDesc)}
          className="text-sm text-body px-3 py-2.5 rounded-md border border-border/10 hover:bg-surface-alt"
        >
          {sortDesc ? "Newest first" : "Oldest first"}
        </button>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-md border border-border/10 px-4 py-2.5 text-sm text-body hover:bg-surface-alt"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-body py-10 text-center">No matching history</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="bg-surface rounded-xl border border-border/10 p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-medium text-heading">
                  {e.label}: {e.target_name}
                </p>
                <p className="text-xs text-body">
                  {e.actor_name ? `By ${e.actor_name}` : "System"}
                  {e.target_department ? ` · ${e.target_department}` : ""}
                  {e.detail ? ` · ${e.detail}` : ""}
                  {e.created_at ? ` · ${new Date(e.created_at).toLocaleString()}` : ""}
                </p>
              </div>
              {e.type === "disabled" && (
                <button
                  onClick={() => reEnable(e.target_id)}
                  className="flex items-center gap-1.5 rounded-md bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:opacity-90"
                >
                  <RotateCcw size={12} /> Re-enable
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
