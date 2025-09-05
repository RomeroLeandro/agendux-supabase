// import { EnvVarWarning } from "@/components/env-var-warning";
// import { AuthButton } from "@/components/auth-button";
// import { hasEnvVars } from "@/lib/utils";
import { ForWhomSection } from "@/components/landing/for-whom/for-whom-section";
import { HeroSection } from "@/components/landing/hero/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works/how-it-works";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <HeroSection />
      <ForWhomSection />
      <HowItWorksSection />
    </main>
  );
}
