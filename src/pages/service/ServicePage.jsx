import HowItWorksSection from "../../components/Service-Page/HowItWorksSection";
import ServiceCategoriesSection from "../../components/Service-Page/ServiceCategoriesSection";
import ServiceCtaSection from "../../components/Service-Page/ServiceCtaSection";
import ServiceHeroSection from "../../components/Service-Page/ServiceHeroSection";

export default function ServicePage() {
  return (
    <div className="bg-[#F8F9FC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-20">
        <ServiceHeroSection />
        <ServiceCategoriesSection />
        <HowItWorksSection />
        <ServiceCtaSection />
      </div>
    </div>
  );
}
