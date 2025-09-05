import { SyncPill } from "./sync-pill";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedImage } from "./animated-image";
import { CircleCheckBig } from "lucide-react";

const features = [
  "Recordatorios automáticos por WhatsApp",
  "Analytics y reportes detallados",
  "Agenda inteligente sincronizada",
];

export function HeroSection() {
  return (
    <section id="inicio" className="w-full py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center md:text-left">
            <SyncPill />
            <Typography variant="display" as="h1" className="font-adineue">
              Gestiona tu agenda
              <span className="bg-gradient-to-r from-[hsl(var(--azul-secundario))] to-[hsl(var(--azul-primario))] bg-clip-text text-transparent ">
                {" "}
                de forma inteligente
              </span>
            </Typography>
            <Typography
              variant="body-lg"
              className="mt-6 max-w-xl mx-auto md:mx-0 text-muted-foreground"
            >
              Automatiza recordatorios por WhatsApp, sincroniza tu calendario y
              optimiza tu tiempo. La solución completa para profesionales
              modernos.
            </Typography>
            <ul className="mt-8 space-y-4 text-left inline-block">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CircleCheckBig className="h-6 w-6 text-accent flex-shrink-0" />
                  <Typography
                    variant="body-md"
                    as="span"
                    className="text-foreground"
                  >
                    {feature}
                  </Typography>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link href="/auth/login">
                <Button>Empieza gratis</Button>
              </Link>
            </div>
          </div>
          <div className="relative flex h-full min-h-[400px] w-full items-center justify-center">
            <AnimatedImage />
          </div>
        </div>
      </div>
    </section>
  );
}
