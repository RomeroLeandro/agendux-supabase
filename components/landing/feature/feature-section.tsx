import { Typography } from "@/components/ui/typography";
import { featuresData } from "@/config/landing";
import { FeatureCard } from "./feature-card";
import { CtaBanner } from "@/components/landing/feature/cta-banner";

export function FeaturesSection() {
  return (
    <section id="funciones" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <Typography
            variant="heading-lg"
            as="h2"
            className="font-adineue text-foreground"
          >
            ¿Cómo funciona Agendux?
          </Typography>
          <Typography variant="body-lg" className="mt-4 text-muted-foreground">
            Descubre todas las funcionalidades que hacen de Agendux la
            herramienta
            <span className="text-primary font-medium">
              {" "}
              perfecta para gestionar tu agenda profesional{" "}
            </span>
            de manera eficiente.
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              colors={feature.colors}
            />
          ))}
        </div>

        <div className="mt-16">
          <CtaBanner />
        </div>
      </div>
    </section>
  );
}