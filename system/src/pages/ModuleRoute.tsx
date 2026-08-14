import { useParams } from "react-router-dom";
import { Suspense } from "react";
import { moduleRegistry } from "../modules/registry";
import DashboardLayout from "../components/DashboardLayout";

export default function ModuleRoute() {
  const { slug } = useParams<{ slug: string }>();
  const Component = slug ? moduleRegistry[slug] : undefined;

  if (!Component) {
    return (
      <DashboardLayout>
        <p className="text-body">Module not found.</p>
      </DashboardLayout>
    );
  }

  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <p className="text-body">Loading...</p>
        </DashboardLayout>
      }
    >
      <Component />
    </Suspense>
  );
}
