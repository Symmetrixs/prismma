import { useState, useEffect, useMemo } from "react";
import { Search, Users2, X, Package } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { STATUS_META } from "./statusMeta";

type SortKey = "user_name" | "department_name" | "asset_count";

export default function UsersSection() {
  const [rows, setRows] = useState<any[]>([]);
  const [allAssets, setAllAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("asset_count");
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    Promise.all([api.getUsersSummary(), api.getAssets()]).then(([summary, assets]) => {
      setRows(summary);
      setAllAssets(assets);
      setLoading(false);
    });
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
    let list = q ? rows.filter((r) => r.user_name.toLowerCase().includes(q)) : rows;
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === "number" && typeof bv === "number") return sortDesc ? bv - av : av - bv;
      const cmp = String(av).localeCompare(String(bv));
      return sortDesc ? -cmp : cmp;
    });
    return list;
  }, [rows, search, sortKey, sortDesc]);

  const userAssets = useMemo(
    () => (selectedUser ? allAssets.filter((a) => a.assigned_person_id === selectedUser.id) : []),
    [allAssets, selectedUser]
  );

  const columns: { key: SortKey; label: string }[] = [
    { key: "user_name", label: "Name" },
    { key: "department_name", label: "Department" },
    { key: "asset_count", label: "Assets Held" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-heading mb-1">Users</h1>
      <p className="text-body mb-6">Who currently has what, and how much</p>

      {loading ? (
        <LoadingSpinner />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users2} message="Nobody currently has an asset assigned to them" />
      ) : (
        <>
          <div className="relative max-w-sm mb-5">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border/10 pl-9 pr-3 py-2.5 text-sm bg-surface text-body"
            />
          </div>

          <div className="bg-surface rounded-xl border border-border/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
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
                {filtered.map((r) => (
                  <tr
                    key={r.user_id}
                    onClick={() => setSelectedUser({ id: r.user_id, name: r.user_name })}
                    className="border-t border-border/10 cursor-pointer hover:bg-surface-alt"
                  >
                    <td className="px-4 py-3 font-medium text-heading">{r.user_name}</td>
                    <td className="px-4 py-3 text-body">{r.department_name || "—"}</td>
                    <td className="px-4 py-3 text-body">{r.asset_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface rounded-xl border border-border/10 max-w-md w-full shadow-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
              <h3 className="font-display text-lg font-semibold text-heading">{selectedUser.name}'s Assets</h3>
              <button onClick={() => setSelectedUser(null)} className="text-body hover:text-heading">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {userAssets.length === 0 ? (
                <EmptyState icon={Package} message="Nothing currently assigned" />
              ) : (
                <div className="space-y-2">
                  {userAssets.map((a) => {
                    const statusInfo = STATUS_META[a.status];
                    return (
                      <div key={a.id} className="rounded-md border border-border/10 px-3 py-2.5 text-sm flex items-center justify-between">
                        <div>
                          <p className="font-medium text-heading">{a.name}</p>
                          <p className="text-xs text-muted">{a.tag_id} · {a.category_name}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo?.className ?? ""}`}>
                          {statusInfo?.label ?? a.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
