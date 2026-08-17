import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange">
          <Compass size={32} />
        </div>
        <p className="font-display italic text-lg text-brand-orange">Off course</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-navy">Page not found</h1>
        <p className="mt-4 text-body">
          The page you're looking for doesn't exist or may have moved. Let's get you back on track.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-brand-navy px-8 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity"
        >
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
