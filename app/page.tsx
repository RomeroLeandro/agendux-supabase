// import { EnvVarWarning } from "@/components/env-var-warning";
// import { AuthButton } from "@/components/auth-button";
// import { hasEnvVars } from "@/lib/utils";
import { ForWhomSection } from "@/components/landing/for-whom/for-whom-section";
import { HeroSection } from "@/components/landing/hero/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works/how-it-works";
import { FeaturesSection } from "@/components/landing/feature/feature-section";
import { BenefitsSection } from "@/components/landing/benefit/benefit-section";
import { AutoSchedulingSection } from "@/components/landing/auto-scheduling/auto-scheduling-section";
import { PricingSection } from "@/components/landing/pricing/pricing-section";
import { FaqSection } from "@/components/landing/faq/faq-section";
import { WhatsAppSection } from "@/components/landing/whatsapp-cta/whatsapp-cta";
import { ContactSection } from "@/components/landing/contact/contact-section";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <HeroSection />
      <ForWhomSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BenefitsSection />
      <AutoSchedulingSection />
      <PricingSection />
      <FaqSection />
      <WhatsAppSection />
      <ContactSection />
    </main>
  );
}
