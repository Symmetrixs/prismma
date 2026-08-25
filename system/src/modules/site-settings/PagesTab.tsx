import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

export default function PagesTab() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setLoading(true);
    setPages(await api.getSitePages());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: number, visible: boolean) {
    try {
      await api.updateSitePage(id, visible);
      toast.success(visible ? "Page is now visible" : "Page is now hidden");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this page");
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <p className="text-sm text-body mb-4">
        Turn a page off and it disappears from the navigation and footer, direct links to it keep working either way.
      </p>
      <div className="bg-surface rounded-xl border border-border/10 divide-y divide-border/10">
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-heading">{p.label}</span>
            <button
              onClick={() => toggle(p.id, !p.visible)}
              className={`relative w-11 h-6 rounded-full transition-colors ${p.visible ? "bg-brand-orange" : "bg-border/30"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  p.visible ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
