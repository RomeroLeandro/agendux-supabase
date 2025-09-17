"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function Notifications() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);

  const handleSave = () => {
    console.log("Saving notification preferences:", {
      email: emailNotifications,
      whatsapp: whatsappNotifications,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Typography variant="heading-lg" className="font-semibold mb-2">
          Configuración de Notificaciones
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          Elige cómo quieres recibir las notificaciones.
        </Typography>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-lg" className="font-medium mb-1">
                Notificaciones por Email
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Recibir notificaciones en tu email
              </Typography>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-lg" className="font-medium mb-1">
                Notificaciones por WhatsApp
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Recibir notificaciones por WhatsApp
              </Typography>
            </div>
            <Switch
              checked={whatsappNotifications}
              onCheckedChange={setWhatsappNotifications}
            />
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
