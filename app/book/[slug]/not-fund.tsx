import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Typography variant="heading-xl" className="mb-4">
          Página de agenda no encontrada
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground mb-6">
          La página que buscas no existe o no está disponible.
        </Typography>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
