import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import Lightbox from "../../components/Lightbox";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
}

export default function PhotoManager({ photos, onChange, label = "Photos (optional)" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await api.uploadAssetPhoto(file);
        uploaded.push(url);
      }
      onChange([...photos, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="text-xs text-muted mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={i} className="relative group">
            <img
              src={url}
              alt=""
              onClick={() => setLightboxSrc(url)}
              className="w-16 h-16 rounded-md object-cover cursor-pointer"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-16 h-16 rounded-md border border-dashed border-border/30 flex items-center justify-center text-muted hover:text-heading hover:border-border/50 disabled:opacity-50"
        >
          <Camera size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
      {uploading && <p className="text-xs text-muted mt-1">Uploading...</p>}

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
