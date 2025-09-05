import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const CtaBanner = () => {
  return (
    <section className="bg-primary/20 dark:bg-[hsl(var(--pie-pagina))] rounded-3xl p-8 md:p-16">
      <div className="text-center flex flex-col items-center">
        <Typography
          variant="heading-lg"
          as="h2"
          className="font-adineue text-foreground"
        >
          ¿Listo para optimizar tu agenda?
        </Typography>

        <Typography
          variant="body-lg"
          className="mt-4 max-w-2xl text-muted-foreground"
        >
          Únete a profesionales que ya confían en Agendux para gestionar sus
          citas de manera inteligente y automatizada.
        </Typography>

        <div className="mt-8">
          <Button>Comenzar gratis</Button>
        </div>
      </div>
    </section>
  );
};
