import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { api } from "../../lib/api";

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

  if (loading) return null;

  const columns: { key: SortKey; label: string }[] = [
    { key: "department_name", label: "Department" },
    { key: "total", label: "Total" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
  ];
  if (isSuperadmin) columns.push({ key: "disabled", label: "Disabled" });

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-black/10 p-4">
          <p className="text-xs text-body">Total</p>
          <p className="text-2xl font-display font-semibold text-brand-navy">{totals.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-black/10 p-4">
          <p className="text-xs text-body">Active</p>
          <p className="text-2xl font-display font-semibold text-green-600">{totals.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-black/10 p-4">
          <p className="text-xs text-body">Pending</p>
          <p className="text-2xl font-display font-semibold text-amber-600">{totals.pending}</p>
        </div>
        {isSuperadmin && (
          <div className="bg-white rounded-xl border border-black/10 p-4">
            <p className="text-xs text-body">Disabled</p>
            <p className="text-2xl font-display font-semibold text-gray-500">{totals.disabled}</p>
          </div>
        )}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-body" />
        <input
          placeholder="Search department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-black/10 pl-9 pr-3 py-2.5 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-black/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-gray-50 text-left text-body">
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => sortBy(c.key)} className="px-4 py-3 cursor-pointer select-none hover:text-brand-navy">
                  {c.label}
                  {sortKey === c.key ? (sortDesc ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.department_id ?? "none"} className="border-t border-black/5">
                <td className="px-4 py-3 font-medium text-brand-navy">{r.department_name}</td>
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
