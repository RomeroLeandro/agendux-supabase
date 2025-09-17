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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">📅</span>
          </div>
          <Typography variant="heading-lg" className="font-semibold">
            Integración con Google Calendar
          </Typography>
        </div>
        <Typography variant="body-sm" className="text-muted-foreground">
          Sincroniza tus citas con Google Calendar para tener todo organizado en
          un solo lugar
        </Typography>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">G</span>
            </div>

            <div>
              <Typography variant="body-lg" className="font-medium mb-1">
                Google Calendar
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                {isConnected ? "Conectado" : "No conectado"}
              </Typography>
            </div>
          </div>

          {!isConnected && (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? "Conectando..." : "Conectar"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
