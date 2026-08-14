import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalBackground from "@/components/GlobalBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prismma Express - Moving the way, you want!",
  description:
    "We specialize in providing reliable and cost-effective logistics and courier solutions to businesses and individuals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <GlobalBackground />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
