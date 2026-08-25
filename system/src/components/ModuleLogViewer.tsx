import { useState, useEffect, useMemo } from "react";
import { X, History, Search } from "lucide-react";
import { api } from "../lib/api";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { useEscapeKey } from "../lib/useEscapeKey";

interface CategoryGroup {
  label: string;
  matchPrefixes: string[];
}

interface Props {
  moduleSlug: string;
  title: string;
  onClose?: () => void;
  inline?: boolean;
  categoryGroups?: CategoryGroup[];
}

export default function ModuleLogViewer({ moduleSlug, title, onClose, inline = false, categoryGroups }: Props) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  useEscapeKey(() => {
    if (!inline && onClose) onClose();
  });

  useEffect(() => {
    api.getModuleLog(moduleSlug).then((r) => {
      setEntries(r);
      setLoading(false);
    });
  }, [moduleSlug]);

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.action));
    return Array.from(set).sort();
  }, [entries]);

  const actorOptions = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.actor_name && set.add(e.actor_name));
    return Array.from(set).sort();
  }, [entries]);

  function categoryOf(action: string): string | null {
    if (!categoryGroups) return null;
    const match = categoryGroups.find((g) => g.matchPrefixes.some((p) => action.startsWith(p)));
    return match?.label ?? null;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = entries.filter((e) => {
      if (actionFilter && e.action !== actionFilter) return false;
      if (actorFilter && e.actor_name !== actorFilter) return false;
      if (categoryFilter && categoryOf(e.action) !== categoryFilter) return false;
      if (!q) return true;
      return (
        e.target_label?.toLowerCase().includes(q) ||
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
  }, [entries, search, actionFilter, actorFilter, categoryFilter, sortDesc]);

  const controls = entries.length > 0 && (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border/10 pl-8 pr-3 py-2 text-sm bg-surface text-body"
        />
      </div>
      {categoryGroups && (
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-border/10 px-2 py-2 text-sm bg-surface text-body"
        >
          <option value="">All types</option>
          {categoryGroups.map((g) => (
            <option key={g.label} value={g.label}>{g.label}</option>
          ))}
        </select>
      )}
      <select
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        className="rounded-md border border-border/10 px-2 py-2 text-sm bg-surface text-body"
      >
        <option value="">All actions</option>
        {actionOptions.map((a) => (
          <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
        ))}
      </select>
      {actorOptions.length > 0 && (
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="rounded-md border border-border/10 px-2 py-2 text-sm bg-surface text-body"
        >
          <option value="">Everyone</option>
          {actorOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      )}
      <button
        onClick={() => setSortDesc(!sortDesc)}
        className="text-sm text-body px-2.5 py-2 rounded-md border border-border/10 hover:bg-surface-alt"
      >
        {sortDesc ? "Newest first" : "Oldest first"}
      </button>
    </div>
  );

  const content = (
    <>
      {controls}
      {loading ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <EmptyState icon={History} message="Nothing recorded yet" />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-body py-6 text-center">No matching entries</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-md border border-border/10 px-3 py-2.5 text-sm">
              <p className="text-heading font-medium">
                {e.action.replace(/_/g, " ")}: {e.target_label}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {e.actor_name ? `By ${e.actor_name}` : "System"}
                {e.created_at ? ` · ${new Date(e.created_at).toLocaleString()}` : ""}
              </p>
              {e.detail && (
                <p className="text-xs text-body mt-1 whitespace-pre-wrap border-t border-border/10 pt-1.5">
                  {e.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (inline) {
    return <div>{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-xl border border-border/10 max-w-lg w-full shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <h3 className="font-display text-lg font-semibold text-heading">{title}</h3>
          <button onClick={onClose} className="text-body hover:text-heading">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{content}</div>
      </div>
    </div>
  );
}
