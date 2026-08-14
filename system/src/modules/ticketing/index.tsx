import { Wrench } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

export default function Ticketing() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange mb-5">
          <Wrench size={28} />
        </div>
        <h1 className="font-display text-xl font-medium text-brand-navy">In Progress</h1>
        <p className="mt-2 text-body max-w-sm">
          The ticketing system is being built. This module will be available in a future update.
        </p>
      </div>
    </DashboardLayout>
  );
}
