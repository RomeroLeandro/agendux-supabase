import { createClient } from "@/lib/supabase/server"; // Asegúrate de que la ruta sea correcta
import { Typography } from "@/components/ui/typography";
import { PricingClientComponent } from "./pricing-client-component";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Esta es una función asíncrona porque "espera" (await) la respuesta de la base de datos
export async function PricingSection() {
  const supabase = createClient();

  // La llamada a la base de datos es la parte que usa 'await'
  const { data: plans } = await (await supabase)
    .from("plans")
    .select()
    .order("price_monthly");

  return (
    <section id="planes" className="py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <Typography variant="badge">PRECIOS</Typography>
        <Typography
          variant="heading-lg"
          as="h2"
          className="mt-4 font-adineue-bold"
        >
          Precios que se adaptan al tamaño de tu negocio
        </Typography>
        <Typography variant="body-lg" className="mt-4 max-w-2xl mx-auto">
          Escoge el plan en base a la cantidad de citas que tienes al mes.
          Siempre puedes cambiarlo más adelante.
        </Typography>

        <div className="mt-8">
          <PricingClientComponent plans={plans ?? []} />
        </div>

        <Card className="mt-12 mx-auto max-w-2xl text-center">
          <Typography variant="heading-md">
            ¿Necesitas más de 500 citas al mes?
          </Typography>
          <Typography variant="body-md" className="mt-2 ">
            Contáctanos para un plan personalizado adaptado a las necesidades
            específicas de tu negocio.
          </Typography>
          <Link href="#contacto" className="mt-6 inline-block">
            <Button>Contactar para plan personalizado</Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
