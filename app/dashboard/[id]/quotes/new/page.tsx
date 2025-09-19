"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoSync } from "@/hooks/use-auto-sync";
import { useGoogleCalendar } from "@/context/google-calendar-context";
import { OAuthCallback } from "@/components/ui/o-auth-call-back";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Edit,
  CheckCircle,
  Cloud,
  CloudOff,
} from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
}

interface CreatedAppointmentDetails {
  patientName: string;
  date: string;
  time: string;
  syncedToGoogle: boolean;
}

export default function NewAppointmentPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isConnected: googleCalendarConnected,
    isLoading: isCheckingConnection,
    refreshConnection,
    setConnected,
  } = useGoogleCalendar();

  const router = useRouter();
  const supabase = createClient();
  const { syncAppointment } = useAutoSync();

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [sendReminder, setSendReminder] = useState(true);

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createdAppointmentDetails, setCreatedAppointmentDetails] =
    useState<CreatedAppointmentDetails | null>(null);

  const selectedService = services.find(
    (s) => s.id === parseInt(selectedServiceId)
  );

  // Función temporal para forzar verificación directa
  const forceCheckConnection = async () => {
    console.log("=== FORCE CHECK CONNECTION ===");

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
      console.log("No user found in force check");
    }
    console.log("=== END FORCE CHECK ===");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data: servicesData, error } = await supabase
          .from("services")
          .select("id, name, duration_minutes")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching services:", error);
        } else {
          setServices(servicesData || []);
        }
      } else {
        router.push("/auth/login");
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase, router]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedService) return;
    setIsSubmitting(true);

    let syncedToGoogle = false;

    try {
      console.log("=== CREATING APPOINTMENT ===");
      console.log("Google Calendar connected:", googleCalendarConnected);

      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .insert({
          user_id: user.id,
          full_name: patientName,
          phone: patientPhone,
          email: patientEmail,
        })
        .select()
        .single();

      if (patientError) throw patientError;

      const appointmentDateTime = new Date(
        `${appointmentDate}T${appointmentTime}`
      );

      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          patient_id: patientData.id,
          service_id: selectedService.id,
          appointment_datetime: appointmentDateTime.toISOString(),
          duration_minutes: selectedService.duration_minutes,
          notes: notes,
          synced_to_google: false,
        })
        .select("id")
        .single();

      if (appointmentError) throw appointmentError;

      console.log("Appointment created with ID:", appointmentData?.id);

      if (appointmentData?.id && googleCalendarConnected) {
        console.log("Attempting to sync appointment to Google Calendar...");
        console.log("- appointmentId:", appointmentData.id);
        console.log("- googleCalendarConnected:", googleCalendarConnected);

        try {
          const syncResult = await syncAppointment(
            appointmentData.id,
            "create"
          );
          console.log("Sync result:", syncResult);

          if (syncResult.success) {
            console.log("Cita sincronizada exitosamente con Google Calendar");
            syncedToGoogle = true;
          } else {
            console.error(
              "Sync failed:",
              syncResult.error || syncResult.message
            );
          }
        } catch (syncError) {
          console.error("Sync error:", syncError);
        }
      } else {
        console.log(
          "Skipping sync - ID:",
          appointmentData?.id,
          "Connected:",
          googleCalendarConnected
        );
      }

      setCreatedAppointmentDetails({
        patientName: patientName,
        date: new Date(appointmentDate + "T00:00:00").toLocaleDateString(
          "es-ES"
        ),
        time: appointmentTime,
        syncedToGoogle: syncedToGoogle,
      });
      setIsSuccessDialogOpen(true);

      // Reset form
      setPatientName("");
      setPatientPhone("");
      setPatientEmail("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSelectedServiceId("");
      setNotes("");
      setSendReminder(true);

      console.log("=== APPOINTMENT CREATION COMPLETE ===");
    } catch (error: unknown) {
      let errorMessage = "Ocurrió un error inesperado.";
      if (error instanceof Error) {
        errorMessage = "Error al crear la cita: " + error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
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
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Cargando...</div>
    );
  }

  return (
    <div className="p-8">
      <OAuthCallback />

      <div className="mb-6">
        <Typography variant="heading-lg">Nueva Cita</Typography>
        <Typography variant="body-md" className="text-muted-foreground">
          Programa una nueva cita para tu paciente
        </Typography>
      </div>

      {/* Estado de Google Calendar con debug */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCheckingConnection ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                <span className="text-sm font-medium text-gray-600">
                  Verificando conexión...
                </span>
              </>
            ) : googleCalendarConnected ? (
              <>
                <Cloud className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Google Calendar conectado
                </span>
              </>
            ) : (
              <>
                <CloudOff className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  Google Calendar no conectado
                </span>
              </>
            )}
          </div>

          {/* Controles y botones de debug */}
          <div className="flex items-center gap-2">
            {!googleCalendarConnected && !isCheckingConnection && (
              <Button onClick={handleConnectGoogleCalendar}>
                Conectar Google Calendar
              </Button>
            )}

            {/* Botones temporales de debug */}
            <Button
              onClick={refreshConnection}
              className="text-xs"
              disabled={isCheckingConnection}
            >
              {isCheckingConnection ? "..." : "Refresh"}
            </Button>

            <Button onClick={forceCheckConnection} className="text-xs">
              Force
            </Button>

            {/* Estado actual para debug */}
            <span className="text-xs text-gray-400">
              {googleCalendarConnected ? "ON" : "OFF"}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {googleCalendarConnected
            ? "Las citas se sincronizarán automáticamente con tu Google Calendar"
            : "Conecta tu Google Calendar para sincronizar automáticamente las citas"}
        </p>
      </Card>

      {/* Resto del formulario igual que antes */}
      <form onSubmit={handleCreateAppointment}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <div className="flex items-center gap-x-3 mb-4">
                <User className="h-6 w-6 text-primary" />
                <Typography variant="heading-md" className="p-0">
                  Información del Paciente
                </Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nombre Completo *</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientPhone">Teléfono (WhatsApp) *</Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label htmlFor="patientEmail">Email (opcional)</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-x-3 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <Typography variant="heading-md" className="p-0">
                  Fecha y Hora
                </Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Consulta *</Label>
                  <Select
                    onValueChange={setSelectedServiceId}
                    value={selectedServiceId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duración (minutos)</Label>
                  <Input
                    value={selectedService?.duration_minutes || ""}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-x-3 mb-4">
                <Edit className="h-6 w-6 text-primary" />
                <Typography variant="heading-md" className="p-0">
                  Notas Adicionales
                </Typography>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Motivo de la consulta, síntomas, o cualquier información relevante..."
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-8">
            <Card className="p-6">
              <Typography variant="heading-md" className="mb-4 p-0">
                Resumen de la Cita
              </Typography>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium text-right">
                    {patientName || "Sin especificar"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {appointmentDate
                      ? new Date(
                          appointmentDate + "T00:00:00"
                        ).toLocaleDateString("es-ES")
                      : "Sin especificar"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-medium">
                    {appointmentTime || "Sin especificar"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium text-right">
                    {selectedService?.name || "Sin especificar"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="font-medium">
                    {selectedService
                      ? `${selectedService.duration_minutes} min`
                      : "Sin especificar"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Sincronización:</span>
                  <div className="flex items-center gap-1">
                    {googleCalendarConnected ? (
                      <>
                        <Cloud className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          Automática
                        </span>
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-3 w-3 text-orange-600" />
                        <span className="text-xs text-orange-600">Manual</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <Typography variant="heading-md" className="mb-4 p-0">
                Configuración
              </Typography>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder" className="flex flex-col">
                  <span>Enviar recordatorio</span>
                  <span className="text-xs text-muted-foreground">
                    24h antes por WhatsApp
                  </span>
                </Label>
                <input
                  type="checkbox"
                  id="reminder"
                  checked={sendReminder}
                  onChange={(e) => setSendReminder(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </Card>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? googleCalendarConnected
                    ? "Creando y sincronizando..."
                    : "Creando cita..."
                  : "Crear Cita"}
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">
              ¡Cita Creada Exitosamente!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-2">
              La cita para{" "}
              <strong>{createdAppointmentDetails?.patientName}</strong>
            </p>
            <p className="text-muted-foreground mb-4">
              el día <strong>{createdAppointmentDetails?.date}</strong> a las{" "}
              <strong>{createdAppointmentDetails?.time} hs</strong> ha sido
              agendada con éxito.
            </p>

            {createdAppointmentDetails?.syncedToGoogle ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg">
                <Cloud className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  Sincronizada con Google Calendar
                </span>
              </div>
            ) : googleCalendarConnected ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 rounded-lg">
                <CloudOff className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">
                  No se pudo sincronizar con Google Calendar
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
                <CloudOff className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  Google Calendar no conectado
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setIsSuccessDialogOpen(false);
                router.push("/dashboard/appointments");
              }}
            >
              Ir a Mis Citas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
