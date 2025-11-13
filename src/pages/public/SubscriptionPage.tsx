import { CtaTrialBanner } from "@/components/home/CtaTrialBanner";
import { PricingSection } from "@/components/home/PricingSection"; // phần chọn plan
import { PlanComparisonTable } from "@/components/subscription/PlanComparisonTable";

export default function SubscriptionPage() {
  return (
    <>
      <div className="mb-16"></div>
      <PricingSection />
      <PlanComparisonTable />
      <CtaTrialBanner />
    </>
  );
}
