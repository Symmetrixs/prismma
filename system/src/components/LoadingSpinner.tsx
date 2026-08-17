import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16 text-body">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
}
