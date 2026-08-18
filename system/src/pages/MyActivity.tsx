import { useState, useEffect, useMemo } from "react";
import { History, Search } from "lucide-react";
import { api } from "../lib/api";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

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

export default function MyActivity() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    api.getMyActivity().then((r) => {
      setEntries(r);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = entries.filter((e) => {
      if (type && e.type !== type) return false;
      if (!q) return true;
      return (
        e.label?.toLowerCase().includes(q) ||
        e.actor_name?.toLowerCase().includes(q) ||
        e.detail?.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      const av = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bv = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDesc ? bv - av : av - bv;
    });
    return list;
  }, [entries, search, type, sortDesc]);

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-heading mb-1">My Activity</h1>
      <p className="text-body mb-6">A timeline of decisions made on your account</p>

      {loading ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <EmptyState icon={History} message="Nothing on record yet" />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-body" />
              <input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border/10 pl-9 pr-3 py-2.5 text-sm bg-surface text-body"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="text-sm text-body px-3 py-2.5 rounded-md border border-border/10 hover:bg-surface-alt"
            >
              {sortDesc ? "Newest first" : "Oldest first"}
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-body py-10 text-center">No matching activity</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((e) => (
                <div key={e.id} className="bg-surface rounded-xl border border-border/10 p-4">
                  <p className="text-sm font-medium text-heading">{e.label}</p>
                  <p className="text-xs text-body mt-1">
                    {e.actor_name ? `By ${e.actor_name}` : "System"}
                    {e.detail ? ` · ${e.detail}` : ""}
                    {e.created_at ? ` · ${new Date(e.created_at).toLocaleString()}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
