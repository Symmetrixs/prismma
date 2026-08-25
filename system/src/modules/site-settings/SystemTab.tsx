import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

const FIELD_CLASS = "w-full rounded-md border border-border/10 px-3 py-2.5 text-sm bg-surface text-body";

export default function SystemTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingRegistration, setTogglingRegistration] = useState(false);
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

  function set(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function toggleRegistration() {
    const next = settings["system.registration_enabled"] === "true" ? "false" : "true";
    setTogglingRegistration(true);
    try {
      await api.updateSiteConfig({ "system.registration_enabled": next });
      set("system.registration_enabled", next);
      toast.success(next === "true" ? "Registration is now open" : "Registration is now closed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this");
    } finally {
      setTogglingRegistration(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateSiteConfig({
        "system.inactivity_timeout_minutes": settings["system.inactivity_timeout_minutes"],
        "system.inactivity_warning_seconds": settings["system.inactivity_warning_seconds"],
        "system.login_max_attempts": settings["system.login_max_attempts"],
        "system.lockout_stage1_minutes": settings["system.lockout_stage1_minutes"],
        "system.lockout_stage2_minutes": settings["system.lockout_stage2_minutes"],
      });
      toast.success("System settings updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="text-sm font-semibold text-heading mb-3">Self-registration</p>
        <div className="flex items-center justify-between rounded-lg border border-border/10 bg-surface px-4 py-3">
          <div>
            <p className="text-sm text-heading">Allow new registrations</p>
            <p className="text-xs text-muted">When off, the register page turns anyone away, new accounts must be created directly by an admin</p>
          </div>
          <button
            onClick={toggleRegistration}
            disabled={togglingRegistration}
            className={`relative w-11 h-6 rounded-full shrink-0 ml-3 transition-colors disabled:opacity-60 ${
              settings["system.registration_enabled"] === "true" ? "bg-brand-orange" : "bg-border/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                settings["system.registration_enabled"] === "true" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-heading mb-3">Inactivity logout</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Idle timeout (minutes)</label>
            <input
              type="number"
              min={1}
              value={settings["system.inactivity_timeout_minutes"] || ""}
              onChange={(e) => set("system.inactivity_timeout_minutes", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Warning countdown (seconds)</label>
            <input
              type="number"
              min={1}
              value={settings["system.inactivity_warning_seconds"] || ""}
              onChange={(e) => set("system.inactivity_warning_seconds", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-heading mb-3">Login lockout</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Attempts before lockout</label>
            <input
              type="number"
              min={1}
              value={settings["system.login_max_attempts"] || ""}
              onChange={(e) => set("system.login_max_attempts", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">First lockout (minutes)</label>
            <input
              type="number"
              min={1}
              value={settings["system.lockout_stage1_minutes"] || ""}
              onChange={(e) => set("system.lockout_stage1_minutes", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Repeat lockout (minutes)</label>
            <input
              type="number"
              min={1}
              value={settings["system.lockout_stage2_minutes"] || ""}
              onChange={(e) => set("system.lockout_stage2_minutes", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
        </div>
        <p className="text-xs text-muted mt-2">
          A third round of failed attempts locks the account entirely, only a superadmin can re-enable it from there.
        </p>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
