import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface ToastItem {
  id: number;
  type: "success" | "error";
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: "success" | "error", message: string) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => push("success", message), [push]);
  const error = useCallback((message: string) => push("error", message), [push]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm ${
              t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
