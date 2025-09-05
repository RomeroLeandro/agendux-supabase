import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { professionalsData } from "@/config/landing";
import { ProfessionalCard } from "./professional-card";
import Link from "next/link";

export function ForWhomSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <Typography variant="badge">¿PARA QUIÉN ES?</Typography>

        <Typography
          variant="heading-lg"
          as="h2"
          className="mt-4 font-adineue text-foreground"
        >
          Ideal para profesionales que dependen de citas
        </Typography>

        <Typography
          variant="body-lg"
          className="mt-4 max-w-2xl mx-auto text-muted-foreground"
        >
          Simplifica la gestión de citas y ahorra horas automatizando procesos
          por WhatsApp.
        </Typography>

        <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {professionalsData.map((prof) => (
            <ProfessionalCard
              key={prof.title}
              icon={prof.icon}
              title={prof.title}
              description={prof.description}
              features={prof.features}
            />
          ))}
        </div>

        <div className="mt-12">
          <Link href="/auth/login">
            <Button>Crea tu cuenta gratis</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
