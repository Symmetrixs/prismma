import { useState } from "react";
import { Package, Plus, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

interface Asset {
  id: number;
  tagId: string;
  name: string;
  status: "in_use" | "in_storage" | "under_repair";
  assignedTo: string;
}

export default function AssetTagging() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tagId: "", name: "", assignedTo: "" });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAssets((prev) => [
      ...prev,
      { id: Date.now(), tagId: form.tagId, name: form.name, status: "in_use", assignedTo: form.assignedTo },
    ]);
    setForm({ tagId: "", name: "", assignedTo: "" });
    setShowForm(false);
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-navy">Asset Tagging</h1>
          <p className="text-body mt-1">Track and tag company assets</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Asset
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 mb-6 text-sm text-amber-800">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>
          This is a starting placeholder, not connected to the database yet. Actual fields and
          workflow still need to be defined.
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-black/10 p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            required
            placeholder="Tag ID"
            value={form.tagId}
            onChange={(e) => setForm({ ...form, tagId: e.target.value })}
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
          <input
            required
            placeholder="Asset Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
          <input
            placeholder="Assigned To"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
          <button
            type="submit"
            className="sm:col-span-3 rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Save Asset
          </button>
        </form>
      )}

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-black/10">
          <Package size={32} className="text-body/40 mb-3" />
          <p className="text-body">No assets tagged yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-body">
              <tr>
                <th className="px-4 py-3">Tag ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-medium text-brand-navy">{a.tagId}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.assignedTo || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
