"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Phone } from "lucide-react";

interface Professional {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  professions?:
    | {
        name: string;
        category: string;
      }[]
    | null;
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
}

interface AutoAgendaConfig {
  id: string;
  user_id: string;
  page_title: string;
  page_description: string;
  max_days_advance: number;
  min_hours_advance: number;
  max_appointments_per_day: number;
}

interface BookingInterfaceProps {
  config: AutoAgendaConfig;
  services: Service[];
  professional: Professional;
}

export function BookingInterface({
  config,
  services,
  professional,
}: BookingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const profession = professional.professions?.[0];

  const steps = [
    { id: 1, name: "Servicio", icon: Calendar },
    { id: 2, name: "Fecha y Hora", icon: Clock },
    { id: 3, name: "Tus Datos", icon: User },
    { id: 4, name: "Confirmación", icon: Phone },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= config.max_days_advance; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleBooking = async () => {
    console.log("Booking appointment:", {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      patient: patientData,
    });

    alert("¡Cita agendada exitosamente!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Typography variant="heading-xl" className="mb-2">
            {config.page_title}
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground mb-4">
            {config.page_description}
          </Typography>

          <Card className="p-4 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {professional.first_name?.[0]}
                {professional.last_name?.[0]}
              </div>
              <div className="text-left">
                <Typography variant="heading-md">
                  {professional.first_name} {professional.last_name}
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  {profession?.name || "Profesional de la salud"}
                </Typography>
                {professional.phone && (
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground"
                  >
                    📞 {professional.phone}
                  </Typography>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      isActive ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-8 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="p-6 bg-white/90 backdrop-blur">
          {currentStep === 1 && (
            <div>
              <Typography variant="heading-lg" className="mb-4">
                Selecciona el tipo de consulta
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedService?.id === service.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <Typography variant="heading-sm" className="mb-2">
                      {service.name}
                    </Typography>
                    <Typography
                      variant="body-sm"
                      className="text-muted-foreground mb-2"
                    >
                      {service.description}
                    </Typography>
                    <Typography variant="body-sm" className="text-blue-600">
                      ⏱️ {service.duration_minutes} minutos
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <Typography variant="heading-lg" className="mb-4">
                Selecciona fecha y hora
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Fecha</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateAvailableDates().map((date) => (
                        <SelectItem key={date} value={date}>
                          {new Date(date + "T00:00:00").toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            }
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Hora</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <Typography variant="heading-lg" className="mb-4">
                Tus datos de contacto
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={patientData.name}
                    onChange={(e) =>
                      setPatientData({ ...patientData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={patientData.phone}
                    onChange={(e) =>
                      setPatientData({ ...patientData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientData.email}
                    onChange={(e) =>
                      setPatientData({ ...patientData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Comentarios adicionales</Label>
                  <Textarea
                    id="notes"
                    value={patientData.notes}
                    onChange={(e) =>
                      setPatientData({ ...patientData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <Typography variant="heading-lg" className="mb-4">
                Confirma tu cita
              </Typography>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <Typography variant="body-lg" className="mb-2">
                  📅 <strong>Servicio:</strong> {selectedService?.name}
                </Typography>
                <Typography variant="body-lg" className="mb-2">
                  🗓️ <strong>Fecha:</strong>{" "}
                  {selectedDate &&
                    new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "es-ES"
                    )}
                </Typography>
                <Typography variant="body-lg" className="mb-2">
                  ⏰ <strong>Hora:</strong> {selectedTime}
                </Typography>
                <Typography variant="body-lg" className="mb-2">
                  👤 <strong>Paciente:</strong> {patientData.name}
                </Typography>
                <Typography variant="body-lg">
                  📞 <strong>Teléfono:</strong> {patientData.phone}
                </Typography>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button onClick={handleBack} disabled={currentStep === 1}>
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedService) ||
                  (currentStep === 2 && (!selectedDate || !selectedTime)) ||
                  (currentStep === 3 &&
                    (!patientData.name || !patientData.phone))
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleBooking}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmar Cita
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
