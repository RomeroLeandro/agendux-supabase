import { Typography } from "@/components/ui/typography";
import { benefitsData } from "@/config/landing";
import { BenefitCard } from "./benefit-card";

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* --- Cabecera de la Sección --- */}
        <div className="text-center max-w-3xl mx-auto">
          <Typography variant="badge">VENTAJAS</Typography>

          <Typography
            variant="heading-lg"
            as="h2"
            className="font-adineue-bold mt-4"
          >
            Beneficios de utilizar Agendux
          </Typography>

          <Typography variant="body-lg" className="mt-4 ">
            Optimiza tu negocio con nuestra plataforma de gestión de citas.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
          {benefitsData.map((benefit) => (
            <BenefitCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              colors={benefit.colors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
