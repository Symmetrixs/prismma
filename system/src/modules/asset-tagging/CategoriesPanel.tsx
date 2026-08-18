import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useEscapeKey } from "../../lib/useEscapeKey";

interface Props {
  onClose: () => void;
  onChanged: () => void;
}

export default function CategoriesPanel({ onClose, onChanged }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEscapeKey(onClose);

  async function load() {
    setLoading(true);
    setCategories(await api.getAssetCategories());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createAssetCategory(name.trim());
      setName("");
      toast.success("Category added");
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add category");
    }
  }

  async function remove(id: number) {
    try {
      await api.deleteAssetCategory(id);
      toast.success("Category removed");
      load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove category");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-xl border border-border/10 max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          <h3 className="font-display text-lg font-semibold text-heading">Categories</h3>
          <button onClick={onClose} className="text-body hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={add} className="flex gap-2 mb-4">
            <input
              placeholder="New category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border border-border/10 px-3 py-2 text-sm bg-surface text-body"
            />
            <button className="rounded-md bg-brand-orange text-white px-4 py-2 text-sm font-medium hover:opacity-90">
              Add
            </button>
          </form>

          {loading ? (
            <p className="text-sm text-body">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted">No categories yet</p>
          ) : (
            <div className="space-y-1">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-alt">
                  <span className="text-sm text-heading">{c.name}</span>
                  <button onClick={() => remove(c.id)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
