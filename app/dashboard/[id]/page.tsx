import { Typography } from "@/components/ui/typography";

export default function DashboardHomePage() {
  return (
    <div className="p-8">
      <Typography variant="heading-lg">¡Bienvenido!</Typography>
      <Typography variant="body-lg" className="text-muted-foreground">
        Aquí tienes el resumen de tu actividad.
      </Typography>
    </div>
  );
}
