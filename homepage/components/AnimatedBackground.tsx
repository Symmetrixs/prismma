interface AnimatedBackgroundProps {
  variant?: "light" | "dark";
  intensity?: "moderate" | "strong";
}

export default function AnimatedBackground({ variant = "light", intensity = "moderate" }: AnimatedBackgroundProps) {
  const primary = "bg-brand-orange";
  const secondary = variant === "dark" ? "bg-white" : "bg-brand-navy";
  const [o1, o2, o3] = intensity === "moderate" ? [0.16, 0.13, 0.11] : [0.35, 0.28, 0.25];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute top-10 left-10 w-80 h-80 rounded-full ${primary} blur-2xl animate-float-slow`}
        style={{ opacity: o1 }}
      />
      <div
        className={`absolute top-1/3 right-10 w-96 h-96 rounded-full ${secondary} blur-2xl animate-float-slower`}
        style={{ opacity: o2 }}
      />
      <div
        className={`absolute bottom-10 left-1/3 w-80 h-80 rounded-full ${primary} blur-2xl animate-float-slow`}
        style={{ opacity: o3 }}
      />
    </div>
  );
}
