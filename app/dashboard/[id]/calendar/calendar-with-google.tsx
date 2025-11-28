"use client";

import { useEffect, useState } from "react";
import { CalendarView } from "./calendar-view";
import { useGoogleCalendar } from "@/context/google-calendar-context";
// import { useAutoSync } from "@/hooks/use-auto-sync";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: number;
  appointment_datetime: string;
  status: string;
  google_event_id?: string;
  patients: { full_name: string } | null;
  services: { name: string } | null;
}

interface GoogleEvent {
  id: string;
  summary: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
}

interface CalendarWithGoogleEventsProps {
  agenduxAppointments: Appointment[];
}

export function CalendarWithGoogleEvents({
  agenduxAppointments,
}: CalendarWithGoogleEventsProps) {
  const [allAppointments, setAllAppointments] =
    useState<Appointment[]>(agenduxAppointments);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);

  const {
    isConnected: googleCalendarConnected,
    isLoading: isCheckingConnection,
    refreshConnection,
    setConnected,
  } = useGoogleCalendar();

  // const { syncExistingAppointments } = useAutoSync();

  // Función temporal para forzar verificación directa
  const forceCheckConnection = async () => {
    console.log("Force checking connection...");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      console.log("User found, checking tokens...");
      const { data: tokenData, error } = await supabase
        .from("gcal_tokens")
        .select("refresh_token")
        .eq("user_id", user.id)
        .single();

      console.log("Token data:", tokenData);
      console.log("Token error:", error);

      const hasToken = !!tokenData?.refresh_token;
      console.log("Has token:", hasToken);
      console.log("Current connected state:", googleCalendarConnected);

      if (hasToken && !googleCalendarConnected) {
        console.log(
          "Token exists but state is false - forcing connection state to true"
        );
        setConnected(true);
      } else if (!hasToken && googleCalendarConnected) {
        console.log("No token but state is true - setting to false");
        setConnected(false);
      } else {
        console.log("State is correct, no change needed");
      }
    } else {
      console.log("No user found");
    }
  };

  useEffect(() => {
    async function fetchGoogleEventsAndSync() {
      try {
        setIsLoadingGoogle(true);

        const response = await fetch("/api/fetch-gcal-events", {
          cache: "no-store",
        });

        if (!response.ok) {
          console.log("Failed to fetch Google Calendar events");
          setAllAppointments(agenduxAppointments);
          setIsLoadingGoogle(false);
          return;
        }

        const googleEvents = await response.json();

        if (Array.isArray(googleEvents)) {
          console.log(
            `Fetched ${googleEvents.length} events from Google Calendar`
          );

          // if (googleCalendarConnected) {
          //   console.log("Syncing existing appointments to Google Calendar...");
          //   await syncExistingAppointments();
          // }

          const syncedGoogleEventIds = new Set(
            agenduxAppointments
              .filter((apt) => apt.google_event_id)
              .map((apt) => apt.google_event_id)
          );

          const pureGoogleEvents = googleEvents.filter(
            (event: GoogleEvent) => !syncedGoogleEventIds.has(event.id)
          );

          console.log(
            `Filtered to ${
              pureGoogleEvents.length
            } pure Google Calendar events (${
              googleEvents.length - pureGoogleEvents.length
            } were synced from app)`
          );

          if (pureGoogleEvents.length > 0) {
            const formattedGoogleEvents = pureGoogleEvents.map(
              (event: GoogleEvent, index: number) => ({
                id: Date.now() + index,
                appointment_datetime:
                  event.start?.dateTime ||
                  event.start?.date ||
                  new Date().toISOString(),
                status: "google",
                google_event_id: event.id,
                patients: { full_name: event.summary || "Evento de Google" },
                services: { name: "Google Calendar" },
              })
            );

            setAllAppointments([
              ...agenduxAppointments,
              ...formattedGoogleEvents,
            ]);
          } else {
            setAllAppointments(agenduxAppointments);
          }
        } else {
          console.log("No Google Calendar events or invalid response");
          setAllAppointments(agenduxAppointments);
        }
      } catch (error) {
        console.error("Error fetching Google events:", error);
        setAllAppointments(agenduxAppointments);
      } finally {
        setIsLoadingGoogle(false);
      }
    }

    if (!isCheckingConnection) {
      fetchGoogleEventsAndSync();
    }
  }, [
    agenduxAppointments,
    // syncExistingAppointments,
    googleCalendarConnected,
    isCheckingConnection,
  ]);

  const handleConnectGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/api/gcal-callback`;
      const response = await fetch(
        `/api/gcal-init?redirectUrl=${encodeURIComponent(redirectUrl)}`
      );
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error initiating Google Calendar connection:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      {/* Barra de estado / controles */}
      <div className="px-4 sm:px-8 py-3 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Estado de conexión */}
          <div className="flex items-center gap-2">
            {isLoadingGoogle || isCheckingConnection ? (
              <>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {isCheckingConnection
                    ? "Verificando conexión con Google Calendar..."
                    : "Cargando y sincronizando con Google Calendar..."}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    googleCalendarConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Google Calendar:{" "}
                  <span className="font-medium">
                    {googleCalendarConnected
                      ? "Conectado y sincronizado"
                      : "No conectado"}
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Controles y debug */}
          <div className="flex items-center gap-2 justify-end">
            {!googleCalendarConnected &&
              !isLoadingGoogle &&
              !isCheckingConnection && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleConnectGoogle}
                >
                  Conectar
                </Button>
              )}

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={refreshConnection}
              disabled={isCheckingConnection}
              className="text-xs text-muted-foreground"
            >
              {isCheckingConnection ? "..." : "Refresh"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={forceCheckConnection}
              className="text-xs text-purple-500"
            >
              Force Check
            </Button>

            <span className="text-[11px] text-gray-400 ml-1">
              Estado: {googleCalendarConnected ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      <CalendarView appointments={allAppointments} />
    </div>
  );
}
