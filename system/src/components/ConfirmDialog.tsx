import { useEscapeKey } from "../lib/useEscapeKey";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }: ConfirmDialogProps) {
  useEscapeKey(onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl border border-black/10 p-6 max-w-sm w-full shadow-lg">
        <h3 className="font-display text-lg font-semibold text-brand-navy mb-2">{title}</h3>
        <p className="text-sm text-body mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="text-sm text-body px-4 py-2 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium text-white bg-brand-orange px-4 py-2 rounded-md hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
