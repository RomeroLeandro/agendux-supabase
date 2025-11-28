"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Solo visual / demo
const CURRENT_PLAN = {
  name: "Plan Profesional",
  status: "Activo",
  appointmentsThisMonth: 127,
  appointmentsLimit: 200,
  uniquePatients: 89,
  messagesSent: 234,
  nextBillingDate: "1 de Febrero, 2024",
  priceText: "Se cobrará 18 USD por el Plan Profesional",
};

const FEATURES_LEFT = [
  "200 citas por mes",
  "Calendario avanzado",
  "Analytics básicos",
  "Soporte por chat",
];

const FEATURES_RIGHT = [
  "Recordatorios WhatsApp",
  "Google Calendar",
  "Auto-agenda personalizada",
  { label: "Múltiples recordatorios", enabled: false },
];

const subscriptionTabs = [
  { id: "current", label: "Plan Actual" },
  { id: "change", label: "Cambiar Plan" },
  { id: "billing", label: "Facturación" },
];

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<"current" | "change" | "billing">(
    "current"
  );

  const usedPercent =
    (CURRENT_PLAN.appointmentsThisMonth / CURRENT_PLAN.appointmentsLimit) * 100;
  const remainingAppointments =
    CURRENT_PLAN.appointmentsLimit - CURRENT_PLAN.appointmentsThisMonth;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Typography variant="heading-xl" className="font-semibold">
          Mi Suscripción
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          Gestiona tu plan y facturación.
        </Typography>
      </div>

      {/* Tabs (mismo estilo que AutoAgendaTabs) */}
      <div className="relative border-b border-border bg-background/70 backdrop-blur-sm rounded-t-lg">
        {/* Fades mobile */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent md:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent md:hidden" />

        <nav
          className="
          flex items-center gap-2
          overflow-x-auto whitespace-nowrap py-2 px-2
          scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
          md:scrollbar-none
        "
        >
          {subscriptionTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as "current" | "change" | "billing")
                }
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido TAB: Plan Actual */}
      {activeTab === "current" && (
        <div className="space-y-6">
          {/* Card principal del plan */}
          <Card className="p-6 space-y-6">
            {/* Encabezado plan + estado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <Typography variant="heading-md" className="font-semibold">
                  {CURRENT_PLAN.name}
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Tu plan actual y uso mensual
                </Typography>
              </div>

              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary" />
                {CURRENT_PLAN.status}
              </span>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none bg-purple-50 text-purple-900 shadow-none">
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <CalendarCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-700/80 font-medium">
                      Citas este mes
                    </p>
                    <p className="text-xl font-semibold">
                      {CURRENT_PLAN.appointmentsThisMonth}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-none bg-emerald-50 text-emerald-900 shadow-none">
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700/80 font-medium">
                      Pacientes únicos
                    </p>
                    <p className="text-xl font-semibold">
                      {CURRENT_PLAN.uniquePatients}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-none bg-amber-50 text-amber-900 shadow-none">
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <MessageCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700/80 font-medium">
                      Mensajes enviados
                    </p>
                    <p className="text-xl font-semibold">
                      {CURRENT_PLAN.messagesSent}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Uso de citas mensuales */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Uso de citas mensuales
              </p>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.min(usedPercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Te quedan{" "}
                  <span className="font-semibold">
                    {remainingAppointments} citas
                  </span>{" "}
                  disponibles este mes
                </span>
                <span className="font-medium">
                  {CURRENT_PLAN.appointmentsThisMonth} /{" "}
                  {CURRENT_PLAN.appointmentsLimit}
                </span>
              </div>
            </div>

            {/* Próxima facturación */}
            <div className="mt-2 rounded-lg border bg-blue-50 px-4 py-3 text-blue-900 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Próxima facturación
                </p>
                <p className="text-sm font-medium">
                  {CURRENT_PLAN.nextBillingDate}
                </p>
                <p className="text-xs text-blue-800/80">
                  {CURRENT_PLAN.priceText}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-800 hover:bg-blue-100/60"
              >
                Ver detalles de facturación
              </Button>
            </div>
          </Card>

          {/* Características del plan */}
          <Card className="p-6">
            <Typography variant="heading-md" className="font-semibold mb-1">
              Características de tu Plan
            </Typography>
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-4"
            >
              Todo lo que incluye tu Plan Profesional.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                {FEATURES_LEFT.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {FEATURES_RIGHT.map((item) => {
                  const enabled =
                    typeof item === "string" ? true : item.enabled;
                  const label = typeof item === "string" ? item : item.label;

                  return (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-sm"
                    >
                      {enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          enabled ? "" : "text-muted-foreground line-through"
                        }
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Contenido TAB: Cambiar Plan (placeholder visual) */}
      {activeTab === "change" && <SubscriptionPage />}

      {/* Contenido TAB: Facturación (placeholder visual) */}
      {activeTab === "billing" && (
        <Card className="p-6">
          <Typography variant="heading-md" className="font-semibold mb-1">
            Historial de Facturación
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Aquí podrías mostrar facturas, métodos de pago y detalles
            relacionados a la facturación.
          </Typography>
        </Card>
      )}
    </div>
  );
}
