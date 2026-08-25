import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

export default function ModulesTab() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setModules(await api.getModules());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id: number, status: string) {
    try {
      await api.updateModuleStatus(id, status);
      toast.success("Module status updated");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  async function remove(id: number) {
    try {
      await api.deleteModule(id);
      toast.success("Module removed");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove module");
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-start gap-3 bg-brand-navy/5 border border-brand-navy/10 rounded-md px-4 py-3 mb-6">
        <Info size={16} className="text-heading mt-0.5 shrink-0" />
        <p className="text-sm text-body">
          New modules aren't created from this screen. Each one is built as its own folder under{" "}
          <code className="bg-surface px-1 rounded">system/src/modules/</code>, then registered here as part of
          that work. This list reflects what currently exists, you can toggle a module active once it's ready
          for staff to request, or remove one that's no longer needed.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border/10 divide-y divide-black/5">
        {modules.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
            <div>
              <span className="text-sm font-medium text-heading">{m.name}</span>
              {m.description && <p className="text-xs text-body mt-0.5">{m.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={m.status}
                onChange={(e) => changeStatus(m.id, e.target.value)}
                className="text-xs border border-border/10 rounded px-2 py-1.5 bg-surface text-heading"
              >
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="disabled">Disabled (maintenance)</option>
              </select>
              <button onClick={() => remove(m.id)} className="text-xs text-red-600 hover:underline">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
