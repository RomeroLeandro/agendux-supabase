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
  google_event_id?: string;
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
      <div className="p-1.5 text-[11px] border-l-4 border-primary/80 bg-primary/5 rounded-r-md overflow-hidden w-full space-y-0.5">
        <b className="font-semibold block">{eventInfo.timeText}</b>
        <p className="truncate leading-snug">{eventInfo.event.title}</p>
        <p className="truncate text-[11px] text-muted-foreground leading-snug">
          {eventInfo.event.extendedProps.patient as string}
        </p>
      </div>
    );
  };

  // --- LÓGICA GOOGLE CALENDAR (no se toca) ---
  const handleConnectGoogleCalendar = async () => {
    const professionalId = params.id;
    const redirectUrl = `${window.location.origin}/api/gcal-callback?next=/dashboard/${professionalId}/calendar`;

    const response = await fetch(
      `/api/gcal-init?redirectUrl=${encodeURIComponent(redirectUrl)}`
    );
    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Hubo un error al iniciar la conexión con Google.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-137px)] bg-muted/40">
      {/* Columna Principal: Calendario */}
      <div className="flex-grow p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="heading-lg" className="p-0">
            Vista mensual
          </Typography>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
            <span>Citas programadas</span>
          </div>
        </div>

        <Card className="p-3 sm:p-4 h-full">
          <style>{`
            .fc {
              --fc-border-color: hsl(var(--border));
              --fc-page-bg-color: transparent;
              height: 100%;
              font-size: 0.8rem;
            }
            .fc .fc-col-header-cell {
              background-color: hsl(var(--muted));
            }
            .fc .fc-col-header-cell-cushion,
            .fc .fc-daygrid-day-number {
              color: hsl(var(--foreground));
              text-decoration: none;
              padding: 0.25rem 0.5rem;
            }
            .fc .fc-daygrid-day-frame {
              padding: 0.15rem;
            }
            .fc .fc-day-today {
              background-color: hsla(var(--primary), 0.10) !important;
            }
            .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
              background-color: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              border-radius: 999px;
            }
            .fc .fc-daygrid-day:hover {
              background-color: hsl(var(--muted)) !important;
            }
            .fc .fc-event {
              border: none !important;
              background-color: transparent !important;
              cursor: pointer;
            }
            .fc .fc-button {
              background-color: hsl(var(--primary)) !important;
              color: hsl(var(--primary-foreground)) !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0.25rem 0.75rem !important;
              border-radius: 999px !important;
              font-size: 0.75rem !important;
            }
            .fc .fc-button:hover {
              background-color: hsl(var(--primary)) !important;
              opacity: 0.9;
            }
            .fc .fc-button:disabled {
              opacity: 0.6 !important;
            }
            .fc-toolbar-title {
              font-size: 1rem;
              font-weight: 600;
            }
            .fc .fc-toolbar.fc-header-toolbar {
              margin-bottom: 0.75rem;
            }
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
      <aside className="hidden lg:flex w-96 border-l border-border p-6 space-y-6 flex-shrink-0 bg-background/80 backdrop-blur">
        <Card className="p-4">
          <Typography
            variant="heading-sm"
            className="p-0 mb-2 flex items-center gap-x-2"
          >
            <Calendar className="h-5 w-5 text-primary" />
            Citas para el día
          </Typography>
          <Typography
            variant="body-sm"
            className="text-muted-foreground mb-4 capitalize p-0"
          >
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Typography>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((app) => (
                <div
                  key={app.id}
                  className="text-sm rounded-md border border-border/60 bg-muted/60 px-3 py-2"
                >
                  <p className="font-semibold">
                    {new Date(app.appointment_datetime).toLocaleTimeString(
                      "es-AR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                    hs
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {app.services?.name} • {app.patients?.full_name}
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

        <Card className="p-4 bg-green-500/5 border-green-500/20">
          <Typography
            variant="heading-sm"
            className="p-0 mb-2 flex items-center gap-x-2 text-green-700 dark:text-green-400"
          >
            <CheckCircle className="h-5 w-5" />
            Google Calendar
          </Typography>
          <Typography
            variant="body-sm"
            className="text-green-700/80 dark:text-green-300/80 mb-4 p-0"
          >
            Conectá tu cuenta para sincronizar tus citas automáticamente.
          </Typography>
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
