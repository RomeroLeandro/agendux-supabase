"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useTimezone() {
  const [timezone, setTimezone] = useState<string>("UTC");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    detectAndSaveTimezone();
  }, []);

  const detectAndSaveTimezone = async () => {
    try {
      const supabase = createClient();

      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Usar zona horaria del navegador
        const browserTimezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(browserTimezone);
        setIsLoading(false);
        return;
      }

      // Intentar obtener zona horaria guardada en el perfil
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error obteniendo timezone del perfil:", error);
      }

      let userTimezone = profile?.timezone;

      // Si no hay zona horaria guardada, detectar y guardar
      if (!userTimezone) {
        userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Zona horaria detectada:", userTimezone);

        // Guardar en el perfil
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ timezone: userTimezone })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error guardando timezone:", updateError);
        }
      }

      setTimezone(userTimezone || "UTC");
    } catch (error) {
      console.error("Error en detectAndSaveTimezone:", error);
      // Fallback a zona horaria del navegador
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(browserTimezone);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimezone = async (newTimezone: string) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      const { error } = await supabase
        .from("profiles")
        .update({ timezone: newTimezone })
        .eq("id", user.id);

      if (error) {
        console.error("Error actualizando timezone:", error);
        return false;
      }

      setTimezone(newTimezone);
      return true;
    } catch (error) {
      console.error("Error en updateTimezone:", error);
      return false;
    }
  };

  return {
    timezone,
    isLoading,
    updateTimezone,
  };
}
