import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
}

export default function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-surface rounded-xl border border-border/10">
      <Icon size={32} className="text-muted mb-3" />
      <p className="text-body">{message}</p>
    </div>
  );
}
