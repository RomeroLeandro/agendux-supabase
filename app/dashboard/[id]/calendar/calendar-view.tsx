"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type DateClickArg,
} from "@fullcalendar/interaction";
import type { EventContentArg } from "@fullcalendar/core";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";

interface Appointment {
  id: number;
  appointment_datetime: string;
  status: string;
  patients: { full_name: string } | null;
  services: { name: string } | null;
  google_event_id?: string; // Agregar esta línea
}

interface CalendarViewProps {
  appointments: Appointment[];
}

export function CalendarView({ appointments }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const params = useParams();

  const selectedDayAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const appDate = new Date(app.appointment_datetime);
      return appDate.toDateString() === selectedDate.toDateString();
    });
  }, [appointments, selectedDate]);

  const events = useMemo(() => {
    return appointments.map((app) => ({
      id: String(app.id),
      title: app.services?.name || "Cita",
      start: new Date(app.appointment_datetime),
      extendedProps: {
        patient: app.patients?.full_name || "Paciente",
      },
    }));
  }, [appointments]);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.date);
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div className="p-1.5 text-xs border-l-4 border-primary bg-primary/10 rounded-r-sm overflow-hidden w-full">
        <b className="font-semibold">{eventInfo.timeText}</b>
        <p className="truncate">{eventInfo.event.title}</p>
        <p className="truncate text-muted-foreground">
          {eventInfo.event.extendedProps.patient}
        </p>
      </div>
    );
  };

  // --- NUEVA LÓGICA PARA CONECTAR CON GOOGLE CALENDAR ---
  const handleConnectGoogleCalendar = async () => {
    const professionalId = params.id; // Obtenemos el ID del profesional

    // Construimos la URL de callback con el ID dinámico
    const redirectUrl = `${window.location.origin}/api/gcal-callback?next=/dashboard/${professionalId}/calendar`;

    // Hacemos la petición a nuestra propia API
    const response = await fetch(
      `/api/gcal-init?redirectUrl=${encodeURIComponent(redirectUrl)}`
    );
    const data = await response.json();

    if (data.url) {
      // Redirigimos al usuario a la URL de consentimiento de Google
      window.location.href = data.url;
    } else {
      alert("Hubo un error al iniciar la conexión con Google.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-137px)]">
      {/* Columna Principal: Calendario */}
      <div className="flex-grow p-6">
        <Typography variant="heading-lg" className="mb-4 p-0">
          Vista Mensual
        </Typography>
        <Card className="p-4 h-full">
          <style>{`
            .fc { --fc-border-color: hsl(var(--border)); --fc-page-bg-color: transparent; height: 100%; }
            .fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number { color: hsl(var(--foreground)); text-decoration: none; }
            .fc .fc-day-today { background-color: hsla(var(--primary), 0.1) !important; }
            .fc .fc-event { border: none !important; background-color: transparent !important; cursor: pointer; }
            .fc .fc-button { background-color: hsl(var(--primary)) !important; color: hsl(var(--primary-foreground)) !important; border: none !important; box-shadow: none !important; }
            .fc .fc-button:hover { background-color: hsl(var(--primary), 0.9) !important; }
            .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            events={events}
            dateClick={handleDateClick}
            eventContent={renderEventContent}
            headerToolbar={{
              left: "title",
              center: "",
              right: "today prev,next",
            }}
            locale="es"
            buttonText={{ today: "Hoy", month: "Mes" }}
            height="100%"
          />
        </Card>
      </div>

      {/* Panel Lateral */}
      <aside className="w-96 border-l border-border p-6 space-y-6 flex-shrink-0">
        <Card className="p-4">
          <Typography
            variant="heading-sm"
            className="p-0 mb-2 flex items-center gap-x-2"
          >
            <Calendar className="h-5 w-5" />
            Citas para el día
          </Typography>
          <Typography
            variant="body-sm"
            className="text-muted-foreground mb-4 capitalize"
          >
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Typography>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((app) => (
                <div key={app.id} className="text-sm">
                  <p className="font-semibold">
                    {new Date(app.appointment_datetime).toLocaleTimeString(
                      "es-AR",
                      { hour: "2-digit", minute: "2-digit" }
                    )}{" "}
                    hs
                  </p>
                  <p className="text-muted-foreground">
                    {app.services?.name} - {app.patients?.full_name}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay citas para este día.
              </p>
            )}
          </div>
        </Card>
        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <Typography
            variant="heading-sm"
            className="p-0 mb-2 flex items-center gap-x-2 text-green-600 dark:text-green-400"
          >
            <CheckCircle className="h-5 w-5" />
            Google Calendar
          </Typography>
          <Typography
            variant="body-sm"
            className="text-green-700/80 dark:text-green-400/80 mb-4"
          >
            Conectá tu cuenta para sincronizar tus citas.
          </Typography>
          {/* --- BOTÓN ACTUALIZADO --- */}
          <Button
            className="w-full bg-transparent border-green-500/30 hover:bg-green-500/20 text-green-600 dark:text-green-400"
            onClick={handleConnectGoogleCalendar}
          >
            Conectar con Google Calendar
          </Button>
        </Card>
      </aside>
    </div>
  );
}
