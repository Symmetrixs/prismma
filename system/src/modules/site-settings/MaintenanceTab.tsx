import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function MaintenanceTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmEnable, setConfirmEnable] = useState(false);
  const toast = useToast();

  async function load() {
    setLoading(true);
    const r = await api.getSiteConfig();
    setSettings(r.settings);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const enabled = settings["maintenance.enabled"] === "true";

  async function apply(nextEnabled: boolean) {
    setSaving(true);
    try {
      await api.updateSiteConfig({
        "maintenance.enabled": nextEnabled ? "true" : "false",
        "maintenance.message": settings["maintenance.message"] || "",
      });
      toast.success(nextEnabled ? "Maintenance mode is now on" : "Maintenance mode is now off");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg space-y-4">
      <div className={`rounded-lg border p-4 ${enabled ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/40" : "bg-surface border-border/10"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-heading">Maintenance mode</p>
            <p className="text-xs text-muted mt-0.5">
              {enabled ? "The public site is currently down for everyone" : "The public site is live"}
            </p>
          </div>
          <button
            onClick={() => (enabled ? apply(false) : setConfirmEnable(true))}
            disabled={saving}
            className={`relative w-11 h-6 rounded-full shrink-0 ml-3 transition-colors disabled:opacity-60 ${enabled ? "bg-red-600" : "bg-border/30"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1">Message shown to visitors</label>
        <textarea
          value={settings["maintenance.message"] || ""}
          onChange={(e) => setSettings((s) => ({ ...s, "maintenance.message": e.target.value }))}
          rows={3}
          className="w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body resize-y"
        />
      </div>

      <button
        onClick={() => apply(enabled)}
        disabled={saving}
        className="w-full rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Message"}
      </button>

      {confirmEnable && (
        <ConfirmDialog
          title="Turn on maintenance mode?"
          message="The entire public homepage goes down immediately for every visitor, right now, not after a rebuild. This is genuinely live."
          confirmLabel="Turn it on"
          onConfirm={() => {
            setConfirmEnable(false);
            apply(true);
          }}
          onCancel={() => setConfirmEnable(false)}
        />
      )}
    </div>
  );
}
