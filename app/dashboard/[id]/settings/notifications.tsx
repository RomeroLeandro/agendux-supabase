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
    <div className="space-y-8">
      {/* Título */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <span className="text-purple-600 text-lg">🔔</span>
          </div>

          <Typography variant="heading-lg" className="font-semibold">
            Configuración de Notificaciones
          </Typography>
        </div>

        <Typography variant="body-sm" className="text-muted-foreground">
          Elegí cómo querés recibir tus alertas y recordatorios.
        </Typography>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {/* EMAIL */}
        <Card className="p-5 border-border/70 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-lg" className="font-medium">
                Notificaciones por Email
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Recibir alertas importantes en tu correo electrónico.
              </Typography>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </Card>

        {/* WHATSAPP */}
        <Card className="p-5 border-border/70 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-lg" className="font-medium">
                Notificaciones por WhatsApp
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Recibir recordatorios directamente en WhatsApp.
              </Typography>
            </div>
            <Switch
              checked={whatsappNotifications}
              onCheckedChange={setWhatsappNotifications}
            />
          </div>
        </Card>
      </div>

      {/* Botón */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 px-6"
        >
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
