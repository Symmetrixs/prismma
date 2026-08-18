import { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const base =
    "w-full rounded-md border border-border/10 pr-11 bg-surface text-body focus:outline-none focus:ring-2 focus:ring-brand-orange/40";
  const sizing = className || "px-4 py-2.5 text-base";

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${base} ${sizing}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
