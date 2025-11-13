import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { CtaTrialBanner } from "@/components/home/CtaTrialBanner";
import { DeviceSection } from "@/components/home/DeviceSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PricingSection } from "@/components/home/PricingSection";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <CategoryCarousel />
      <DeviceSection />
      <FaqSection />
      <PricingSection />
      <CtaTrialBanner />
    </>
  );
}
