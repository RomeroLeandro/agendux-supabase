import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { faqData } from "@/config/landing";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

const FaqContactCard = () => (
  <Card className="bg-bg-light dark:bg-bg-dark-secondary transition-colors duration-300 border border-gray-200 dark:border-gray-800 ">
    <div className="flex items-center">
      <MessageSquare className="mr-3 h-6 w-6 text-blue-primary" />
      <Typography variant="heading-md" as="h3">
        ¿Necesitas ayuda?
      </Typography>
    </div>
    <Typography variant="body-md" className="mt-2">
      Nuestro equipo está listo para ayudarte con cualquier pregunta adicional.
    </Typography>
    <Link href="#contacto" className="mt-4 block">
      <Button className="w-full">Contactar soporte</Button>
    </Link>
  </Card>
);

export function FaqSection() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <div>
              <Typography variant="badge">FAQ</Typography>
              <Typography
                variant="heading-lg"
                as="h2"
                className="mt-4 font-adineue-bold"
              >
                Preguntas <span className="text-blue-primary">Frecuentes</span>
              </Typography>
              <Typography variant="body-lg" className="mt-4 ">
                Encuentra respuestas a las preguntas más comunes sobre Agendux y
                cómo puede ayudarte a gestionar tus citas.
              </Typography>
            </div>
            <FaqContactCard />
          </div>

          <div>
            <Accordion items={faqData} />
          </div>
        </div>
      </div>
    </section>
  );
}