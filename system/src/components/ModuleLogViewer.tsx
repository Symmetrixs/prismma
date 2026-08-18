import { useState, useEffect } from "react";
import { X, History } from "lucide-react";
import { api } from "../lib/api";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import { useEscapeKey } from "../lib/useEscapeKey";

interface Props {
  moduleSlug: string;
  title: string;
  onClose: () => void;
}

export default function ModuleLogViewer({ moduleSlug, title, onClose }: Props) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEscapeKey(onClose);

  useEffect(() => {
    api.getModuleLog(moduleSlug).then((r) => {
      setEntries(r);
      setLoading(false);
    });
  }, [moduleSlug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-xl border border-border/10 max-w-lg w-full shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <h3 className="font-display text-lg font-semibold text-heading">{title}</h3>
          <button onClick={onClose} className="text-body hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : entries.length === 0 ? (
            <EmptyState icon={History} message="Nothing recorded yet" />
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
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
        </div>
      </div>
    </div>
  );
}
