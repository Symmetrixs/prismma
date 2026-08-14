import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import PasswordStrength, { isPasswordStrong } from "../components/PasswordStrength";

interface Department {
  id: number;
  name: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    department_id: "",
    job_title: "",
    profile_picture_url: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setSaved(false);
    setUploadingPicture(true);
    try {
      const { url } = await api.uploadProfilePicture(file);
      await api.updateMyProfile({ profile_picture_url: url });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingPicture(false);
      e.target.value = "";
    }
  }

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {});
    if (user) {
      setForm({
        name: user.name || "",
        phone_number: user.phone_number || "",
        department_id: user.department_id ? String(user.department_id) : "",
        job_title: user.job_title || "",
        profile_picture_url: user.profile_picture_url || "",
      });
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await api.updateMyProfile({
        ...form,
        department_id: form.department_id ? Number(form.department_id) : null,
      });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSaved(false);
    if (!isPasswordStrong(pwForm.new_password)) {
      setPwError("New password does not meet the minimum requirements");
      return;
    }
    try {
      await api.changePassword(pwForm.current_password, pwForm.new_password);
      setPwForm({ current_password: "", new_password: "" });
      setPwSaved(true);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
    }
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-brand-navy mb-1">Profile</h1>
      <p className="text-body mb-8">Manage your personal details</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-black/10 p-6 space-y-4">
          <h2 className="font-display text-lg font-medium text-brand-navy">Personal Details</h2>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
          )}
          {saved && (
            <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">Profile updated</div>
          )}

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-black/10 shrink-0">
              {form.profile_picture_url ? (
                <img src={form.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-navy font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm text-body block mb-1">Profile Picture</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePictureUpload}
                disabled={uploadingPicture}
                className="w-full text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand-orange file:text-white file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer disabled:opacity-50"
              />
              {uploadingPicture && <p className="text-xs text-body mt-1">Uploading...</p>}
              {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
              <p className="text-xs text-body/60 mt-1">JPG, PNG, or WebP. Max 2MB.</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Phone Number</label>
            <input
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm bg-white"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-body block mb-1">Job Title</label>
            <input
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Save size={16} />
            Save Changes
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-black/10 p-6 space-y-4 h-fit">
          <h2 className="font-display text-lg font-medium text-brand-navy">Change Password</h2>

          {pwError && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{pwError}</div>
          )}
          {pwSaved && (
            <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">Password updated</div>
          )}

          <div>
            <label className="text-sm text-body block mb-1">Current Password</label>
            <input
              required
              type="password"
              value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-body block mb-1">New Password</label>
            <input
              required
              type="password"
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
            />
            <PasswordStrength password={pwForm.new_password} />
          </div>

          <button
            type="submit"
            className="rounded-md bg-brand-navy px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Update Password
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
