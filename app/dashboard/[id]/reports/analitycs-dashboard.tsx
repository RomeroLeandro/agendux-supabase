"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, Users, TrendingUp, Clock } from "lucide-react";
import React from "react";

interface Appointment {
  id: number;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  patients: { full_name: string } | null;
  services: { name: string; duration_minutes: number } | null;
}

interface Patient {
  id: number;
  full_name: string;
  created_at: string;
}

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
}

interface AnalyticsDashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  services: Service[];
}

const COLORS = ["#8884d8", "#00C9A7", "#00C6FF", "#FFB800", "#FF6B6B"];

export function AnalyticsDashboard({
  appointments,
  patients,
  services,
}: AnalyticsDashboardProps) {
  // Cálculos de métricas principales
  const totalCitas = appointments.length;
  const pacientesUnicos = patients.length;

  // Calcular tasa de confirmación
  const citasConfirmadas = appointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "completed"
  ).length;
  const tasaConfirmacion =
    totalCitas > 0 ? Math.round((citasConfirmadas / totalCitas) * 100) : 0;

  // Datos para tendencias mensuales
  const tendenciasMensuales = React.useMemo(() => {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    const now = new Date();

    return meses.map((mes, index) => {
      const mesDate = new Date(now.getFullYear(), index, 1);
      const citasDelMes = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_datetime);
        return (
          aptDate.getMonth() === mesDate.getMonth() &&
          aptDate.getFullYear() === mesDate.getFullYear()
        );
      });

      return {
        mes,
        citas: citasDelMes.length,
      };
    });
  }, [appointments]);

  // Distribución semanal
  const distribucionSemanal = React.useMemo(() => {
    const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    return dias.map((dia, index) => {
      const citasDelDia = appointments.filter((apt) => {
        const aptDate = new Date(apt.appointment_datetime);
        const diaSemana = aptDate.getDay(); // 0 domingo
        const diaAjustado = diaSemana === 0 ? 6 : diaSemana - 1;
        return diaAjustado === index;
      });

      return {
        dia,
        citas: citasDelDia.length,
      };
    });
  }, [appointments]);

  // Distribución de servicios
  const distribucionServicios = React.useMemo(() => {
    const serviciosCount = services
      .map((service) => {
        const citasServicio = appointments.filter(
          (apt) => apt.services?.name === service.name
        ).length;

        const porcentaje =
          totalCitas > 0 ? Math.round((citasServicio / totalCitas) * 100) : 0;

        return {
          name: service.name,
          value: citasServicio,
          percentage: porcentaje,
        };
      })
      .filter((item) => item.value > 0);

    return serviciosCount;
  }, [appointments, services, totalCitas]);

  // Insights clave
  const mejorDiaSemana = distribucionSemanal.reduce((max, dia) =>
    dia.citas > max.citas ? dia : max
  );

  const servicioPopular = distribucionServicios.reduce(
    (max, servicio) => (servicio.value > max.value ? servicio : max),
    { name: "", value: 0, percentage: 0 }
  );

  const tiempoPromedio = React.useMemo(() => {
    const totalMinutos = appointments.reduce(
      (sum, apt) =>
        sum + (apt.duration_minutes || apt.services?.duration_minutes || 0),
      0
    );
    return totalCitas > 0 ? Math.round(totalMinutos / totalCitas) : 0;
  }, [appointments, totalCitas]);

  const crecimientoMensual = React.useMemo(() => {
    const mesActual = new Date().getMonth();
    const mesAnterior = mesActual - 1;

    const citasMesActual = tendenciasMensuales[mesActual]?.citas || 0;
    const citasMesAnterior = tendenciasMensuales[mesAnterior]?.citas || 0;

    if (citasMesAnterior === 0) return 0;
    return Math.round(
      ((citasMesActual - citasMesAnterior) / citasMesAnterior) * 100
    );
  }, [tendenciasMensuales]);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Typography
                  variant="body-sm"
                  className="text-muted-foreground p-0"
                >
                  Total de citas
                </Typography>
                <Typography
                  variant="heading-xl"
                  className="font-bold p-0 leading-tight"
                >
                  {totalCitas}
                </Typography>
                <Typography
                  variant="body-xs"
                  className="text-muted-foreground p-0 mt-1"
                >
                  +7% vs mes anterior
                </Typography>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-300" />
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Typography
                  variant="body-sm"
                  className="text-muted-foreground p-0"
                >
                  Pacientes únicos
                </Typography>
                <Typography
                  variant="heading-xl"
                  className="font-bold p-0 leading-tight"
                >
                  {pacientesUnicos}
                </Typography>
                <Typography
                  variant="body-xs"
                  className="text-muted-foreground p-0 mt-1"
                >
                  +11% vs mes anterior
                </Typography>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <Users className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Typography
                  variant="body-sm"
                  className="text-muted-foreground p-0"
                >
                  Tasa de confirmación
                </Typography>
                <Typography
                  variant="heading-xl"
                  className="font-bold p-0 leading-tight"
                >
                  {tasaConfirmacion}%
                </Typography>
                <Typography
                  variant="body-xs"
                  className="text-muted-foreground p-0 mt-1"
                >
                  +3% vs mes anterior
                </Typography>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                <TrendingUp className="h-5 w-5 text-purple-500 dark:text-purple-300" />
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tendencias Mensuales */}
          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="mb-4">
              <Typography
                variant="heading-md"
                className="flex items-center gap-2 p-0"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                Tendencias mensuales
              </Typography>
              <Typography
                variant="body-sm"
                className="text-muted-foreground p-0"
              >
                Evolución de citas por mes
              </Typography>
            </div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tendenciasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="citas"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Citas"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Distribución de Servicios */}
          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="mb-4">
              <Typography variant="heading-md" className="p-0">
                Distribución de servicios
              </Typography>
              <Typography
                variant="body-sm"
                className="text-muted-foreground p-0"
              >
                Servicios más solicitados
              </Typography>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="h-60 md:h-64 md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribucionServicios}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribucionServicios.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 md:w-1/2">
                {distribucionServicios.map((servicio, index) => (
                  <div
                    key={servicio.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="font-medium truncate">
                      {servicio.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {servicio.percentage}%
                    </span>
                  </div>
                ))}
                {distribucionServicios.length === 0 && (
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground p-0"
                  >
                    Aún no hay datos suficientes para mostrar esta gráfica.
                  </Typography>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos secundarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución Semanal */}
          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="mb-4">
              <Typography
                variant="heading-md"
                className="flex items-center gap-2 p-0"
              >
                <Calendar className="h-5 w-5 text-primary" />
                Distribución semanal
              </Typography>
              <Typography
                variant="body-sm"
                className="text-muted-foreground p-0"
              >
                Citas por día de la semana
              </Typography>
            </div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribucionSemanal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="citas" fill="#FFB800" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Insights Clave */}
          <Card className="p-5 sm:p-6 shadow-sm border-border/70">
            <div className="mb-4">
              <Typography
                variant="heading-md"
                className="flex items-center gap-2 p-0"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                Insights clave
              </Typography>
              <Typography
                variant="body-sm"
                className="text-muted-foreground p-0"
              >
                Datos importantes de tu práctica
              </Typography>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-medium p-0">
                    Mejor día de la semana
                  </Typography>
                  <Typography variant="body-lg" className="font-bold p-0">
                    {mejorDiaSemana.dia}
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground p-0"
                  >
                    {mejorDiaSemana.citas} citas agendadas
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-medium p-0">
                    Crecimiento mensual
                  </Typography>
                  <Typography
                    variant="body-lg"
                    className="font-bold text-green-600 dark:text-green-300 p-0"
                  >
                    +{crecimientoMensual}%
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground p-0"
                  >
                    vs mes anterior
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-medium p-0">
                    Servicio más popular
                  </Typography>
                  <Typography variant="body-lg" className="font-bold p-0">
                    {servicioPopular.name || "Sin datos"}
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground p-0"
                  >
                    {servicioPopular.value} solicitudes
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <Typography variant="body-sm" className="font-medium p-0">
                    Tiempo promedio
                  </Typography>
                  <Typography variant="body-lg" className="font-bold p-0">
                    {tiempoPromedio} min
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground p-0"
                  >
                    por consulta
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
