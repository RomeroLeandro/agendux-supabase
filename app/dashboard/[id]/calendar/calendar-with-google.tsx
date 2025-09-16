"use client";

import { useEffect, useState } from "react";
import { CalendarView } from "./calendar-view";
import { useGoogleCalendar } from "@/context/google-calendar-context";
import { useAutoSync } from "@/hooks/use-auto-sync";
import { createClient } from "@/lib/supabase/client";

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

  const { syncExistingAppointments } = useAutoSync();

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

          if (googleCalendarConnected) {
            console.log("Syncing existing appointments to Google Calendar...");
            await syncExistingAppointments();
          }

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
    syncExistingAppointments,
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
    <div>
      <div className="px-8 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLoadingGoogle || isCheckingConnection ? (
              <>
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {isCheckingConnection
                    ? "Verificando conexión..."
                    : "Cargando y sincronizando con Google Calendar..."}
                </span>
              </>
            ) : (
              <>
                <div
                  className={`w-3 h-3 rounded-full ${
                    googleCalendarConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  Google Calendar:{" "}
                  {googleCalendarConnected
                    ? "Conectado y sincronizado"
                    : "No conectado"}
                </span>
              </>
            )}
          </div>

          {/* Controles y botones de debug */}
          <div className="flex items-center gap-2">
            {!googleCalendarConnected &&
              !isLoadingGoogle &&
              !isCheckingConnection && (
                <button
                  onClick={handleConnectGoogle}
                  className="text-sm text-blue-500 hover:underline focus:outline-none"
                  type="button"
                >
                  Conectar
                </button>
              )}

            {/* Botones temporales de debug */}
            <button
              onClick={refreshConnection}
              className="text-xs text-gray-500 hover:underline px-2 py-1 rounded"
              type="button"
              disabled={isCheckingConnection}
            >
              {isCheckingConnection ? "..." : "Refresh"}
            </button>

            <button
              onClick={forceCheckConnection}
              className="text-xs text-purple-500 hover:underline px-2 py-1 rounded"
              type="button"
            >
              Force Check
            </button>

            {/* Estado actual para debug */}
            <span className="text-xs text-gray-400 ml-2">
              {googleCalendarConnected ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      <CalendarView appointments={allAppointments} />
    </div>
  );
}
