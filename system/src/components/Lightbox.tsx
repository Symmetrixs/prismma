import { X } from "lucide-react";
import { useEscapeKey } from "../lib/useEscapeKey";

export default function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEscapeKey(onClose);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
        <X size={28} />
      </button>
      <img src={src} alt="" className="max-w-full max-h-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
