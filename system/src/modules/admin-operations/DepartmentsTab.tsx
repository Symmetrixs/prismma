import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setDepartments(await api.getDepartments());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createDepartment(name.trim());
    setName("");
    load();
  }

  async function remove(id: number) {
    await api.deleteDepartment(id);
    load();
  }

  if (loading) return null;

  return (
    <div>
      <form onSubmit={add} className="flex gap-3 mb-6">
        <input
          placeholder="New department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-black/10 px-4 py-2.5 text-sm"
        />
        <button className="rounded-md bg-brand-orange text-white px-5 py-2.5 text-sm font-medium hover:opacity-90">Add</button>
      </form>
      <div className="bg-white rounded-xl border border-black/10 divide-y divide-black/5">
        {departments.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-brand-navy">{d.name}</span>
            <button onClick={() => remove(d.id)} className="text-xs text-red-600 hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
