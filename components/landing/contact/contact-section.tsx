import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ContactForm } from "./contact-form";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { Card } from "@/components/ui/card";

export function ContactSection() {
  const whatsappNumber = "549123456789";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hola,%20quisiera%20hacer%20una%20consulta%20sobre%20Agendux.`;

  return (
    <section
      id="contacto"
      className="py-16 md:py-24 bg-bg-light dark:bg-bg-dark"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Typography variant="badge">CONTACTO</Typography>
          <Typography
            variant="heading-lg"
            as="h2"
            className=" font-adineue-bold mt-4"
          >
            ¿Tienes alguna duda?
          </Typography>
          <Typography variant="body-lg" className="mt-4">
            Estamos aquí para ayudarte. Elige el método de contacto que
            prefieras.
          </Typography>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <Card className="">
            <Typography variant="heading-md" as="h3" className="mb-6">
              Escríbenos
            </Typography>
            <ContactForm />
          </Card>

          <Card className="h-auto">
            <Typography variant="heading-md" as="h3" className="mb-4">
              Chatea con nosotros
            </Typography>
            <Typography variant="body-md" className="mb-6">
              ¿Prefieres una respuesta más rápida? Haz clic en el botón para
              iniciar una conversación por WhatsApp con nuestro equipo de
              soporte.
            </Typography>
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-green-600">
                <FaWhatsapp size={24} />
                <span>Contactar por WhatsApp</span>
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
