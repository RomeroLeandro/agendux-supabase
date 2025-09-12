"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  DialogClose,
} from "@/components/ui/dialog";
import { User, Calendar, Edit, CheckCircle } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

// Interfaces para tipado
interface Service {
  id: number;
  name: string;
  duration_minutes: number;
}

interface CreatedAppointmentDetails {
  patientName: string;
  date: string;
  time: string;
}

export default function NewAppointmentPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Estados del formulario
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [sendReminder, setSendReminder] = useState(true);

  // Estados para el diálogo de éxito
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [createdAppointmentDetails, setCreatedAppointmentDetails] =
    useState<CreatedAppointmentDetails | null>(null);

  const selectedService = services.find(
    (s) => s.id === parseInt(selectedServiceId)
  );

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
        if (error) console.error("Error fetching services:", error);
        else setServices(servicesData || []);
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

    try {
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

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          patient_id: patientData.id,
          service_id: selectedService.id,
          appointment_datetime: appointmentDateTime.toISOString(),
          duration_minutes: selectedService.duration_minutes,
          notes: notes,
        });
      if (appointmentError) throw appointmentError;

      setCreatedAppointmentDetails({
        patientName: patientName,
        date: new Date(appointmentDate + "T00:00:00").toLocaleDateString(
          "es-ES"
        ),
        time: appointmentTime,
      });
      setIsSuccessDialogOpen(true);

      // Reseteamos el formulario
      setPatientName("");
      setPatientPhone("");
      setPatientEmail("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSelectedServiceId("");
      setNotes("");
      setSendReminder(true);
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

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Cargando...</div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Typography variant="heading-lg">Nueva Cita</Typography>
        <Typography variant="body-md" className="text-muted-foreground">
          Programa una nueva cita para tu paciente
        </Typography>
      </div>

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
                {isSubmitting ? "Creando Cita..." : "Crear Cita"}
              </Button>
              <Button className="w-full" onClick={() => router.back()}>
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
              ¡Cita Creada!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <p>La cita para **{createdAppointmentDetails?.patientName}**</p>
            <p>
              el día **{createdAppointmentDetails?.date}** a las **
              {createdAppointmentDetails?.time} hs**
            </p>
            <p>ha sido agendada con éxito.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="w-full">
                Aceptar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
