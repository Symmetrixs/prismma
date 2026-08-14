import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import CompanyIntro from "@/components/CompanyIntro";
import ServicesGrid from "@/components/ServicesGrid";
import GlobalReach from "@/components/GlobalReach";
import VideoSection from "@/components/VideoSection";
import PartnersLogos from "@/components/PartnersLogos";
import Testimonials from "@/components/Testimonials";
import NewsPreview from "@/components/NewsPreview";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <CompanyIntro />
      <ServicesGrid />
      <GlobalReach />
      <VideoSection />
      <PartnersLogos />
      <Testimonials />
      <NewsPreview />
      <CTASection />
    </>
  );
}
