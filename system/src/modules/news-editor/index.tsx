import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Newspaper, X, ArrowUp, ArrowDown } from "lucide-react";
import { api } from "../../lib/api";
import DashboardLayout from "../../components/DashboardLayout";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useEscapeKey } from "../../lib/useEscapeKey";

interface MediaItem {
  media_type: "image" | "video";
  url: string;
  order: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: "malaysia" | "global";
  published: boolean;
  media: MediaItem[];
}

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "malaysia" as "malaysia" | "global",
  published: false,
  media: [] as MediaItem[],
};

export default function NewsEditor() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [originalForm, setOriginalForm] = useState(emptyForm);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const toast = useToast();

  const hasFormChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  function attemptCloseForm() {
    if (hasFormChanges) {
      setConfirmDiscard(true);
    } else {
      setShowForm(false);
    }
  }

  function discardAndClose() {
    setConfirmDiscard(false);
    setShowForm(false);
  }

  useEscapeKey(() => {
    if (confirmDiscard) return;
    if (showForm) attemptCloseForm();
  });

  async function load() {
    setLoading(true);
    try {
      setArticles(await api.getAllNews());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOriginalForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(article: Article) {
    setEditing(article);
    const initial = {
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content,
      category: article.category,
      published: article.published,
      media: [...article.media].sort((a, b) => a.order - b.order),
    };
    setForm(initial);
    setOriginalForm(initial);
    setError(null);
    setShowForm(true);
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingMedia(true);
    try {
      const { url } = await api.uploadNewsMedia(file);
      const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      setForm((prev) => ({
        ...prev,
        media: [...prev.media, { media_type: mediaType, url, order: prev.media.length }],
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  }

  function removeMedia(index: number) {
    const updated = form.media.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i }));
    setForm({ ...form, media: updated });
  }

  function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.media.length) return;
    const updated = [...form.media];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setForm({ ...form, media: updated.map((m, i) => ({ ...m, order: i })) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await api.updateNews(editing.id, form);
        toast.success("Article updated");
      } else {
        await api.createNews(form);
        toast.success("Article created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function confirmDelete() {
    if (!deletingArticle) return;
    try {
      await api.deleteNews(deletingArticle.id);
      toast.success("Article deleted");
      setDeletingArticle(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete article");
      setDeletingArticle(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-navy">News Editor</h1>
          <p className="text-body mt-1">Publish and manage articles on the public news portal</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      {loading ? (
        <p className="text-body">Loading...</p>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-black/10">
          <Newspaper size={32} className="text-body/40 mb-3" />
          <p className="text-body">No articles yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-black/10 divide-y divide-black/5">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
              <div>
                <p className="font-medium text-brand-navy">{a.title}</p>
                <p className="text-sm text-body">
                  <span className="capitalize">{a.category}</span> &middot;{" "}
                  {a.published ? "Published" : "Draft"} &middot; {a.media.length} media item{a.media.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(a)} className="flex items-center gap-1.5 text-sm text-brand-navy hover:underline">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => setDeletingArticle(a)} className="flex items-center gap-1.5 text-sm text-red-600 hover:underline">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-brand-navy">
                {editing ? "Edit Article" : "New Article"}
              </h2>
              <button onClick={attemptCloseForm}>
                <X size={20} className="text-body" />
              </button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
              />
              <input
                placeholder="Excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
              />
              <textarea
                required
                rows={6}
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-md border border-black/10 px-4 py-2.5 text-sm"
              />

              <div>
                <label className="text-sm text-body block mb-2">Media (images and video, shown as a slideshow)</label>
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                    className="w-full text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand-navy file:text-white file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer disabled:opacity-50"
                  />
                  {uploadingMedia && <p className="text-xs text-body mt-1">Uploading...</p>}
                  {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                  <p className="text-xs text-body/60 mt-1">JPG, PNG, WebP, or MP4. Max 2MB each.</p>
                </div>

                {form.media.length > 0 && (
                  <div className="space-y-2">
                    {form.media.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-md px-3 py-2 text-sm">
                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-200 shrink-0">
                          {item.media_type === "image" ? (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.url} muted className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="flex-1 truncate text-body">{item.media_type === "image" ? "Image" : "Video"} {i + 1}</span>
                        <button type="button" onClick={() => moveMedia(i, -1)} disabled={i === 0} className="disabled:opacity-30">
                          <ArrowUp size={14} />
                        </button>
                        <button type="button" onClick={() => moveMedia(i, 1)} disabled={i === form.media.length - 1} className="disabled:opacity-30">
                          <ArrowDown size={14} />
                        </button>
                        <button type="button" onClick={() => removeMedia(i)} className="text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as "malaysia" | "global" })}
                  className="rounded-md border border-black/10 px-4 py-2.5 text-sm bg-white"
                >
                  <option value="malaysia">Malaysia</option>
                  <option value="global">Global</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-body">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Published
                </label>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-brand-orange px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {editing ? "Save Changes" : "Create Article"}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmDiscard && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved changes to this article. Closing now will discard them."
          confirmLabel="Discard"
          onConfirm={discardAndClose}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}

      {deletingArticle && (
        <ConfirmDialog
          title="Delete article"
          message={`Delete "${deletingArticle.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingArticle(null)}
        />
      )}
    </DashboardLayout>
  );
}
