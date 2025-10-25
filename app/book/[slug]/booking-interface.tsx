"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import "react-day-picker/dist/style.css";

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
  logo_url?: string;
  primary_color?: string;
}

interface WorkHour {
  id: number;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface FormField {
  id: number;
  user_id: string;
  field_name: string;
  is_visible: boolean;
  is_required: boolean;
}

interface ExistingAppointment {
  appointment_datetime: string;
  duration_minutes: number;
  status: string;
}

interface BookingInterfaceProps {
  config: AutoAgendaConfig;
  services: Service[];
  professional: Professional;
  workHours: WorkHour[];
  formFields: FormField[];
  existingAppointments: ExistingAppointment[];
}

export function BookingInterface({
  config,
  services,
  professional,
  workHours,
  formFields,
  existingAppointments,
}: BookingInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
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

  // Generar fechas disponibles basadas en horarios laborales
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= config.max_days_advance; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      const hasWorkHours = workHours.some(
        (wh) => wh.day_of_week === dayOfWeek
      );

      if (hasWorkHours) {
        dates.push(date);
      }
    }
    return dates;
  }, [config.max_days_advance, workHours]);

  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    return !availableDates.some((availableDate) =>
      isSameDay(availableDate, date)
    );
  };

  // Función para verificar si un horario está ocupado
  const isTimeSlotOccupied = (
    date: Date,
    timeString: string,
    serviceDuration: number
  ): boolean => {
    const [hour, minute] = timeString.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);

    // Verificar si hay alguna cita que se superponga con este horario
    return existingAppointments.some((appointment) => {
      const appointmentStart = parseISO(appointment.appointment_datetime);
      const appointmentEnd = new Date(appointmentStart);
      appointmentEnd.setMinutes(
        appointmentEnd.getMinutes() + appointment.duration_minutes
      );

      // Verificar si es el mismo día
      if (!isSameDay(appointmentStart, date)) {
        return false;
      }

      // Verificar superposición de horarios
      // Hay superposición si:
      // 1. El slot comienza durante una cita existente
      // 2. El slot termina durante una cita existente
      // 3. El slot contiene completamente una cita existente
      return (
        (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
        (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
      );
    });
  };

  // Generar slots de tiempo basados en los horarios laborales y duración del servicio
  const generateTimeSlots = (date: Date | undefined, service: Service | null) => {
    if (!date || !service) return [];

    const dayOfWeek = date.getDay();
    const intervalMinutes = service.duration_minutes;

    const dayWorkHours = workHours.filter(
      (wh) => wh.day_of_week === dayOfWeek
    );

    if (dayWorkHours.length === 0) return [];

    const slots: string[] = [];
    const now = new Date();
    const minAdvanceMs = config.min_hours_advance * 60 * 60 * 1000;

    dayWorkHours.forEach((workHour) => {
      const [startHour, startMinute] = workHour.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = workHour.end_time.split(":").map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      const endTotalMinutes = endHour * 60 + endMinute;

      while (true) {
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        
        if (currentTotalMinutes + intervalMinutes > endTotalMinutes) {
          break;
        }

        const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute
          .toString()
          .padStart(2, "0")}`;

        const slotDateTime = new Date(date);
        const [slotHour, slotMinute] = timeString.split(":").map(Number);
        slotDateTime.setHours(slotHour, slotMinute, 0, 0);

        // Verificar tiempo mínimo de anticipación
        const meetsMinAdvance = slotDateTime.getTime() - now.getTime() >= minAdvanceMs;

        // Verificar que el horario no esté ocupado
        const isOccupied = isTimeSlotOccupied(date, timeString, service.duration_minutes);

        if (meetsMinAdvance && !isOccupied) {
          slots.push(timeString);
        }

        currentMinute += intervalMinutes;
        while (currentMinute >= 60) {
          currentMinute -= 60;
          currentHour += 1;
        }
      }
    });

    return slots;
  };

  const timeSlots = useMemo(
    () => generateTimeSlots(selectedDate, selectedService),
    [selectedDate, selectedService, workHours, config.min_hours_advance, existingAppointments]
  );

  const getFieldConfig = (fieldName: string) => {
    const field = formFields.find((f) => f.field_name === fieldName);
    return {
      isVisible: field?.is_visible ?? true,
      isRequired: field?.is_required ?? true,
    };
  };

  const firstNameConfig = getFieldConfig("first_name");
  const lastNameConfig = getFieldConfig("last_name");
  const phoneConfig = getFieldConfig("phone");
  const emailConfig = getFieldConfig("email");

  const handleNext = () => {
    if (currentStep === 1 && selectedService) {
      setSelectedDate(undefined);
      setSelectedTime("");
    }
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
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleBooking = async () => {
    if (!selectedDate) return;

    try {
      const response = await fetch("/api/book-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professional_id: config.user_id,
          service_id: selectedService?.id,
          patient_name: patientData.firstName
            ? `${patientData.firstName} ${patientData.lastName}`.trim()
            : patientData.name,
          patient_phone: patientData.phone,
          patient_email: patientData.email,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: selectedTime,
          notes: patientData.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const message = result.synced_to_google
          ? "¡Cita agendada exitosamente y sincronizada con Google Calendar! ✅"
          : "¡Cita agendada exitosamente! 📅";
        
        alert(message);
        
        setCurrentStep(1);
        setSelectedService(null);
        setSelectedDate(undefined);
        setSelectedTime("");
        setPatientData({
          firstName: "",
          lastName: "",
          name: "",
          phone: "",
          email: "",
          notes: "",
        });
      } else {
        alert("Error al agendar la cita. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Error al agendar la cita. Por favor intenta nuevamente.");
    }
  };

  const primaryColor = config.primary_color || "#3b82f6";

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{`
        .custom-primary {
          background-color: ${primaryColor};
        }
        .custom-primary-border {
          border-color: ${primaryColor};
        }
        .custom-primary-text {
          color: ${primaryColor};
        }
        
        .rdp {
          --rdp-cell-size: 50px;
          --rdp-accent-color: ${primaryColor};
          --rdp-background-color: ${primaryColor}20;
          margin: 0;
        }
        
        .rdp-months {
          justify-content: center;
        }
        
        .rdp-head_cell {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .rdp-cell {
          padding: 4px;
        }
        
        .rdp-button {
          border-radius: 8px;
          font-size: 0.875rem;
        }
        
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #f3f4f6;
        }
        
        .rdp-day_selected {
          background-color: ${primaryColor} !important;
          color: white;
          font-weight: 600;
        }
        
        .rdp-day_disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .rdp-day_today:not(.rdp-day_selected) {
          font-weight: 700;
          color: ${primaryColor};
        }
        
        .rdp-caption {
          margin-bottom: 1rem;
        }
        
        .rdp-caption_label {
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        .rdp-nav_button {
          width: 36px;
          height: 36px;
          border-radius: 6px;
        }
        
        .rdp-nav_button:hover {
          background-color: #f3f4f6;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          {config.logo_url && (
            <div className="mb-4 flex justify-center">
              <img
                src={config.logo_url}
                alt="Logo"
                className="h-20 w-20 object-cover rounded-full"
              />
            </div>
          )}
          <Typography variant="heading-xl" className="mb-2">
            {config.page_title}
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground mb-4">
            {config.page_description}
          </Typography>

          <Card className="p-4 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl custom-primary">
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
                        ? "custom-primary text-white"
                        : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      isActive
                        ? "custom-primary-text font-medium"
                        : "text-gray-500"
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
                        ? "custom-primary-border bg-blue-50"
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
                    <Typography
                      variant="body-sm"
                      className="custom-primary-text"
                    >
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
              {selectedService && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <Typography variant="body-sm" className="custom-primary-text font-medium">
                    📋 Servicio: {selectedService.name} ({selectedService.duration_minutes} minutos)
                  </Typography>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Fecha</Label>
                  <Card className="p-4">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={disabledDays}
                      locale={es}
                      fromDate={addDays(new Date(), 1)}
                      toDate={addDays(new Date(), config.max_days_advance)}
                      modifiersClassNames={{
                        selected: "rdp-day_selected",
                        today: "rdp-day_today",
                        disabled: "rdp-day_disabled",
                      }}
                    />
                  </Card>
                  {selectedDate && (
                    <div className="mt-2 text-center">
                      <Typography variant="body-sm" className="text-muted-foreground">
                        Fecha seleccionada:{" "}
                        <span className="font-semibold custom-primary-text">
                          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                        </span>
                      </Typography>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Hora disponible</Label>
                  {!selectedDate ? (
                    <Card className="p-8 text-center">
                      <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <Typography
                        variant="body-sm"
                        className="text-muted-foreground"
                      >
                        Selecciona una fecha para ver los horarios disponibles
                      </Typography>
                    </Card>
                  ) : timeSlots.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Typography
                        variant="body-sm"
                        className="text-muted-foreground"
                      >
                        No hay horarios disponibles para esta fecha. Todos los turnos están ocupados o no hay suficiente tiempo.
                      </Typography>
                    </Card>
                  ) : (
                    <Card className="p-4 max-h-[400px] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedTime === time
                                ? "custom-primary text-white border-transparent"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}
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
                {firstNameConfig.isVisible && (
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Nombre {firstNameConfig.isRequired && "*"}
                    </Label>
                    <Input
                      id="firstName"
                      value={patientData.firstName}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          firstName: e.target.value,
                        })
                      }
                      required={firstNameConfig.isRequired}
                    />
                  </div>
                )}

                {lastNameConfig.isVisible && (
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Apellido {lastNameConfig.isRequired && "*"}
                    </Label>
                    <Input
                      id="lastName"
                      value={patientData.lastName}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          lastName: e.target.value,
                        })
                      }
                      required={lastNameConfig.isRequired}
                    />
                  </div>
                )}

                {!firstNameConfig.isVisible && !lastNameConfig.isVisible && (
                  <div className="space-y-2 md:col-span-2">
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
                )}

                {phoneConfig.isVisible && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Teléfono {phoneConfig.isRequired && "*"}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={patientData.phone}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          phone: e.target.value,
                        })
                      }
                      required={phoneConfig.isRequired}
                    />
                  </div>
                )}

                {emailConfig.isVisible && (
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email {emailConfig.isRequired && "*"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          email: e.target.value,
                        })
                      }
                      required={emailConfig.isRequired}
                    />
                  </div>
                )}

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
                  ⏱️ <strong>Duración:</strong> {selectedService?.duration_minutes} minutos
                </Typography>
                <Typography variant="body-lg" className="mb-2">
                  🗓️ <strong>Fecha:</strong>{" "}
                  {selectedDate &&
                    format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })}
                </Typography>
                <Typography variant="body-lg" className="mb-2">
                  ⏰ <strong>Hora:</strong> {selectedTime}
                </Typography>
                <Typography variant="body-lg" className="mb-2">
                  👤 <strong>Paciente:</strong>{" "}
                  {patientData.firstName
                    ? `${patientData.firstName} ${patientData.lastName}`.trim()
                    : patientData.name}
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
                    ((firstNameConfig.isVisible &&
                      firstNameConfig.isRequired &&
                      !patientData.firstName) ||
                      (lastNameConfig.isVisible &&
                        lastNameConfig.isRequired &&
                        !patientData.lastName) ||
                      (!firstNameConfig.isVisible &&
                        !lastNameConfig.isVisible &&
                        !patientData.name) ||
                      (phoneConfig.isVisible &&
                        phoneConfig.isRequired &&
                        !patientData.phone) ||
                      (emailConfig.isVisible &&
                        emailConfig.isRequired &&
                        !patientData.email)))
                }
                className="custom-primary hover:opacity-90"
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