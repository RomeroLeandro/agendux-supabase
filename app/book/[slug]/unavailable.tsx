import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function UnavailablePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-600 text-2xl">⏸️</span>
          </div>
          <Typography variant="heading-xl" className="mb-2">
            Agenda Temporalmente No Disponible
          </Typography>
          <Typography variant="body-md" className="text-muted-foreground">
            Esta página de agendamiento no está disponible en este momento. Por
            favor contacta directamente al profesional.
          </Typography>
        </div>

        <Button onClick={() => window.history.back()}>Volver</Button>
      </div>
    </div>
  );
}
