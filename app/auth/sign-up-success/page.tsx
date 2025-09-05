import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold">¡Registro Exitoso!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu cuenta ha sido creada exitosamente.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
