import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function ModulesTab() {
  const [modules, setModules] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", description: "", status: "coming_soon" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setModules(await api.getModules());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api.createModule(form);
    setForm({ name: "", description: "", status: "coming_soon" });
    load();
  }

  async function remove(id: number) {
    await api.deleteModule(id);
    load();
  }

  if (loading) return null;

  return (
    <div>
      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-black/10 px-4 py-2.5 text-sm" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-md border border-black/10 px-4 py-2.5 text-sm" />
        <button className="rounded-md bg-brand-orange text-white px-5 py-2.5 text-sm font-medium hover:opacity-90">Add Module</button>
      </form>
      <p className="text-xs text-body mb-4">
        The module's URL slug is generated automatically from its name. Adding a module here registers it in the
        system, its actual screen still needs a matching folder in <code className="bg-gray-100 px-1 rounded">modules/</code> wired into the registry.
      </p>
      <div className="bg-white rounded-xl border border-black/10 divide-y divide-black/5">
        {modules.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <span className="text-sm font-medium text-brand-navy">{m.name}</span>
              <span className="text-xs text-body ml-2">({m.status})</span>
            </div>
            <button onClick={() => remove(m.id)} className="text-xs text-red-600 hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
