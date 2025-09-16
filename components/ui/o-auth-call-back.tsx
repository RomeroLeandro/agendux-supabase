"use client";

import { useEffect } from "react";
import { useGoogleCalendar } from "@/context/google-calendar-context";

export function OAuthCallback() {
  const { refreshConnection } = useGoogleCalendar();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const gcalConnected = urlParams.get("gcal_connected");
      const timestamp = urlParams.get("timestamp");
      const forceRefresh = urlParams.get("force_refresh");

      if (gcalConnected === "true" && timestamp) {
        console.log("OAuth callback detected, forcing context update...");

        // Múltiples intentos agresivos de actualización
        const attempts = [100, 500, 1000, 2000, 3000, 5000];
        attempts.forEach((delay) => {
          setTimeout(() => {
            console.log(`Attempting connection refresh at ${delay}ms`);
            refreshConnection();
          }, delay);
        });

        // Si se requiere recarga forzada
        if (forceRefresh === "1") {
          setTimeout(() => {
            console.log("Force refresh detected, reloading page...");
            window.location.reload();
          }, 3000);
        }

        // Limpiar URL después de los intentos
        setTimeout(() => {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
          console.log("URL cleaned");
        }, 6000);
      }
    }
  }, [refreshConnection]);

  return null; // No renderiza nada
}
