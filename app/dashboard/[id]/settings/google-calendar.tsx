"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useGoogleCalendar } from "@/context/google-calendar-context";

export function GoogleCalendar() {
  const { isConnected, isLoading } = useGoogleCalendar();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUrl = `${window.location.origin}/api/gcal-callback`;
      const response = await fetch(
        `/api/gcal-init?redirectUrl=${encodeURIComponent(redirectUrl)}`
      );
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se pudo obtener URL de autorización");
      }
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
          <span className="text-lg">📅</span>
        </div>
        <div>
          <Typography variant="heading-lg" className="font-semibold">
            Integración con Google Calendar
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Sincronizá tus citas con Google Calendar para tener todo en un solo
            lugar.
          </Typography>
        </div>
      </div>

      {/* Card principal */}
      <Card className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-red-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-bold">G</span>
          </div>

          <div className="space-y-1">
            <Typography variant="body-lg" className="font-medium">
              Google Calendar
            </Typography>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`mr-1 h-1.5 w-1.5 rounded-full ${
                    isConnected ? "bg-emerald-500" : "bg-muted-foreground/50"
                  }`}
                />
                {isConnected ? "Conectado" : "No conectado"}
              </span>
              <span className="text-xs text-muted-foreground">
                {isConnected
                  ? "Tus citas se están sincronizando con tu calendario."
                  : "Conectá tu cuenta para empezar a sincronizar."}
              </span>
            </div>
          </div>
        </div>

        {!isConnected && (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            {isConnecting ? "Conectando..." : "Conectar con Google"}
          </Button>
        )}
      </Card>
    </div>
  );
}
