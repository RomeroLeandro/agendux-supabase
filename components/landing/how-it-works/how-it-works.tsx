import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { howItWorksData } from "@/config/landing";
import { Step } from "./step";
import Phones from "@/assets/Phones.webp"; // Asegúrate de que la ruta sea correcta

export function HowItWorksSection() {
  const { tag, title, subtitle, steps } = howItWorksData;
  return (
    <section id="como-funciona" className="py-16 md:py-24 ">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <Typography variant="badge">{tag}</Typography>
          <Typography
            variant="heading-lg"
            as="h2"
            className="mt-4 font-adineue text-foreground"
          >
            {title}
          </Typography>
          <Typography variant="body-lg" className="mt-4 text-muted-foreground">
            {subtitle}
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center mt-16">
          <div className="space-y-12">
            {steps.map((step) => (
              <Step key={step.stepNumber} {...step} />
            ))}
          </div>
          <div className="flex justify-center">
            <Image
              src={Phones}
              alt="Tres teléfonos mostrando el flujo de Agendux"
              className="w-full max-w-md lg:max-w-lg [filter:drop-shadow(0_15px_20px_hsl(var(--primary)/0.5))_drop-shadow(0_10px_15px_hsl(var(--primary)/0.6))]"
            />
          </div>
        </div>

        <div className="text-center mt-16">
          <Link href="/auth/login">
            <Button>Empieza ahora</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
