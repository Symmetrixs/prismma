import Image from "next/image";

export default function MaintenancePage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="text-center max-w-md">
        <Image
          src="/assets/logos/prismma_main_logo.png"
          alt="Prismma Express"
          width={205}
          height={35}
          className="mx-auto mb-8"
        />
        <h1 className="font-display text-2xl font-semibold text-brand-navy mb-3">
          We'll be right back
        </h1>
        <p className="text-body">{message}</p>
      </div>
    </div>
  );
}
