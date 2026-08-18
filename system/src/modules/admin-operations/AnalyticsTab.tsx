import { useState, useEffect, useMemo } from "react";
import { Search, Download } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { downloadCsv } from "../../lib/csv";

type SortKey = "department_name" | "total" | "active" | "pending" | "disabled";

export default function AnalyticsTab({ isSuperadmin }: { isSuperadmin: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("department_name");
  const [sortDesc, setSortDesc] = useState(false);

  useEffect(() => {
    api.getUserAnalytics().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  function sortBy(key: SortKey) {
    if (key === sortKey) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q ? rows.filter((r) => r.department_name.toLowerCase().includes(q)) : rows;
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });
    return list;
  }, [rows, search, sortKey, sortDesc]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          total: acc.total + r.total,
          active: acc.active + r.active,
          pending: acc.pending + r.pending,
          disabled: isSuperadmin ? acc.disabled + (r.disabled || 0) : 0,
        }),
        { total: 0, active: 0, pending: 0, disabled: 0 }
      ),
    [rows, isSuperadmin]
  );

  if (loading) return <LoadingSpinner />;

  const columns: { key: SortKey; label: string }[] = [
    { key: "department_name", label: "Department" },
    { key: "total", label: "Total" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
  ];
  if (isSuperadmin) columns.push({ key: "disabled", label: "Disabled" });

  function exportCsv() {
    const headers = columns.map((c) => c.label);
    const csvRows = filtered.map((r) => columns.map((c) => r[c.key] ?? 0));
    downloadCsv(`department-analytics-${new Date().toISOString().slice(0, 10)}.csv`, headers, csvRows);
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface rounded-xl border border-border/10 p-4">
          <p className="text-xs text-body">Total</p>
          <p className="text-2xl font-display font-semibold text-heading">{totals.total}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border/10 p-4">
          <p className="text-xs text-body">Active</p>
          <p className="text-2xl font-display font-semibold text-green-600">{totals.active}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border/10 p-4">
          <p className="text-xs text-body">Pending</p>
          <p className="text-2xl font-display font-semibold text-amber-600">{totals.pending}</p>
        </div>
        {isSuperadmin && (
          <div className="bg-surface rounded-xl border border-border/10 p-4">
            <p className="text-xs text-body">Disabled</p>
            <p className="text-2xl font-display font-semibold text-gray-500">{totals.disabled}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-body" />
          <input
            placeholder="Search department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border/10 pl-9 pr-3 py-2.5 text-sm bg-surface text-body"
          />
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-md border border-border/10 px-4 py-2.5 text-sm text-body hover:bg-surface-alt"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-surface-alt text-left text-body">
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => sortBy(c.key)} className="px-4 py-3 cursor-pointer select-none hover:text-heading">
                  {c.label}
                  {sortKey === c.key ? (sortDesc ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.department_id ?? "none"} className="border-t border-border/10">
                <td className="px-4 py-3 font-medium text-heading">{r.department_name}</td>
                <td className="px-4 py-3">{r.total}</td>
                <td className="px-4 py-3">{r.active}</td>
                <td className="px-4 py-3">{r.pending}</td>
                {isSuperadmin && <td className="px-4 py-3">{r.disabled ?? 0}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
