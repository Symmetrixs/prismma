import { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Download, ChevronDown, ChevronUp, UserCog, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import { downloadCsv } from "../../lib/csv";

const ACCOUNT_TYPES = new Set([
  "created", "registration_approved", "registration_rejected",
  "disabled", "enabled", "unlocked", "blocked", "unblocked",
  "role_change", "password_reset_approved",
]);

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "created", label: "Account created" },
  { value: "registration_approved", label: "Registration approved" },
  { value: "registration_rejected", label: "Registration rejected" },
  { value: "disabled", label: "Account disabled" },
  { value: "enabled", label: "Account enabled" },
  { value: "unlocked", label: "Account unlocked" },
  { value: "blocked", label: "Account blocked" },
  { value: "unblocked", label: "Account unblocked" },
  { value: "role_change", label: "Role changed" },
  { value: "password_reset_approved", label: "Password reset approved" },
  { value: "module_access_approved", label: "Module access approved" },
  { value: "module_access_rejected", label: "Module access rejected" },
  { value: "module_access_revoked", label: "Module access revoked" },
];

function EntryRow({ entry, onReEnable }: { entry: any; onReEnable: (id: number) => void }) {
  return (
    <div className="bg-surface rounded-xl border border-border/10 p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-sm font-medium text-heading">
          {entry.label}: {entry.target_name}
        </p>
        <p className="text-xs text-body">
          {entry.actor_name ? `By ${entry.actor_name}` : "System"}
          {entry.target_department ? ` · ${entry.target_department}` : ""}
          {entry.detail ? ` · ${entry.detail}` : ""}
          {entry.created_at ? ` · ${new Date(entry.created_at).toLocaleString()}` : ""}
        </p>
      </div>
      {entry.type === "disabled" && (
        <button
          onClick={() => onReEnable(entry.target_id)}
          className="flex items-center gap-1.5 rounded-md bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:opacity-90"
        >
          <RotateCcw size={12} /> Re-enable
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  entries,
  onReEnable,
}: {
  title: string;
  icon: typeof UserCog;
  entries: any[];
  onReEnable: (id: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const PAGE_SIZE = 8;
  const visibleEntries = expanded ? entries : entries.slice(0, PAGE_SIZE);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-1 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-heading">
          <Icon size={16} className="text-brand-orange" />
          {title}
          <span className="text-xs font-normal text-muted bg-surface-alt px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        </span>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      {open && (
        entries.length === 0 ? (
          <p className="text-sm text-body py-6 text-center">Nothing here</p>
        ) : (
          <div className="space-y-2 mt-1">
            {visibleEntries.map((e) => (
              <EntryRow key={e.id} entry={e} onReEnable={onReEnable} />
            ))}
            {entries.length > PAGE_SIZE && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-brand-orange font-medium hover:underline py-2"
              >
                {expanded ? "Show less" : `Show all ${entries.length}`}
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default function HistoryTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    const fromTime = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTime = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;

    let list = entries.filter((e) => {
      if (type && e.type !== type) return false;
      if (department && e.target_department !== department) return false;
      if (e.created_at) {
        const t = new Date(e.created_at).getTime();
        if (fromTime !== null && t < fromTime) return false;
        if (toTime !== null && t > toTime) return false;
      }
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
  }, [entries, search, type, department, dateFrom, dateTo, sortDesc]);

  const accountEntries = useMemo(() => filtered.filter((e) => ACCOUNT_TYPES.has(e.type)), [filtered]);
  const moduleEntries = useMemo(() => filtered.filter((e) => !ACCOUNT_TYPES.has(e.type)), [filtered]);

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
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body">
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
          />
          <span className="text-muted text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body"
          />
        </div>
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
        <>
          <Section title="Account Activity" icon={UserCog} entries={accountEntries} onReEnable={reEnable} />
          <Section title="Module Access" icon={ShieldCheck} entries={moduleEntries} onReEnable={reEnable} />
        </>
      )}
    </div>
  );
}
