import { MessageSquareIcon, CalendarIcon } from "lucide-react";
import Image from "next/image";
import MovilHero from "@/assets/HeroPhone.webp";
import { Typography } from "@/components/ui/typography";

const TopMiniCard = () => {
  return (
    <div className="z-20 absolute -top-2 -left-2 flex items-center gap-2 rounded-2xl p-2 text-xs shadow-lg bg-background dark:bg-card transition-colors duration-300">
      <MessageSquareIcon className="h-6 w-6 text-accent" />
      <div>
        <Typography
          variant="body-sm"
          as="p"
          className="font-bold text-foreground"
        >
          Mensaje enviado
        </Typography>
        <Typography variant="body-sm" as="p" className="text-muted-foreground">
          95% confirmación
        </Typography>
      </div>
    </div>
  );
};

const BottomMiniCard = () => {
  return (
    <div className="z-20 absolute -bottom-2 -right-2 flex items-center gap-2 rounded-2xl p-2 text-xs shadow-lg bg-background dark:bg-card transition-colors duration-300">
      <CalendarIcon className="h-6 w-6 text-primary" />
      <div>
        <Typography
          variant="body-sm"
          as="p"
          className="font-bold text-foreground"
        >
          Cita confirmada
        </Typography>
        <Typography variant="body-sm" as="p" className="text-muted-foreground">
          Automáticamente
        </Typography>
      </div>
    </div>
  );
};

export function AnimatedImage() {
  return (
    <div className="relative w-fit mx-auto">
      <Image
        src={MovilHero}
        alt="Demostración de Agendux en un teléfono móvil"
        className="w-full max-w-xs md:max-w-sm relative z-10
              [filter:drop-shadow(0_20px_25px_hsl(var(--primary)/0.5))_drop-shadow(0_15px_20px_hsl(var(--primary)/0.6))]"
      />
      <TopMiniCard />
      <BottomMiniCard />
    </div>
  );
}
