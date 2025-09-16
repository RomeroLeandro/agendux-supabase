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
  Cell
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

const COLORS = ['#8884d8', '#00C9A7', '#00C6FF', '#FFB800', '#FF6B6B'];

export function AnalyticsDashboard({ appointments, patients, services }: AnalyticsDashboardProps) {
  // Cálculos de métricas principales
  const totalCitas = appointments.length;
  const pacientesUnicos = patients.length;
  
  // Calcular tasa de confirmación (asumiendo que 'confirmed' es un status)
  const citasConfirmadas = appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'completed').length;
  const tasaConfirmacion = totalCitas > 0 ? Math.round((citasConfirmadas / totalCitas) * 100) : 0;

  // Datos para tendencias mensuales (solo citas e ingresos)
  const tendenciasMensuales = React.useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const now = new Date();
    
    return meses.map((mes, index) => {
      const mesDate = new Date(now.getFullYear(), index, 1);
      const citasDelMes = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_datetime);
        return aptDate.getMonth() === mesDate.getMonth() && 
               aptDate.getFullYear() === mesDate.getFullYear();
      });
      
      return {
        mes,
        citas: citasDelMes.length,
      };
    });
  }, [appointments]);

  // Distribución semanal
  const distribucionSemanal = React.useMemo(() => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return dias.map((dia, index) => {
      const citasDelDia = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_datetime);
        // JavaScript: domingo = 0, lunes = 1, etc.
        const diaSemana = aptDate.getDay();
        const diaAjustado = diaSemana === 0 ? 6 : diaSemana - 1; // Convertir para que lunes = 0
        return diaAjustado === index;
      });
      
      return {
        dia,
        citas: citasDelDia.length
      };
    });
  }, [appointments]);

  // Distribución de servicios
  const distribucionServicios = React.useMemo(() => {
    const serviciosCount = services.map(service => {
      const citasServicio = appointments.filter(apt => 
        apt.services?.name === service.name
      ).length;
      
      const porcentaje = totalCitas > 0 ? Math.round((citasServicio / totalCitas) * 100) : 0;
      
      return {
        name: service.name,
        value: citasServicio,
        percentage: porcentaje
      };
    }).filter(item => item.value > 0);
    
    return serviciosCount;
  }, [appointments, services, totalCitas]);

  // Insights clave
  const mejorDiaSemana = distribucionSemanal.reduce((max, dia) => 
    dia.citas > max.citas ? dia : max
  );

  const servicioPopular = distribucionServicios.reduce((max, servicio) => 
    servicio.value > max.value ? servicio : max, { name: '', value: 0, percentage: 0 }
  );

  const tiempoPromedio = React.useMemo(() => {
    const totalMinutos = appointments.reduce((sum, apt) => 
      sum + (apt.duration_minutes || apt.services?.duration_minutes || 0), 0
    );
    return totalCitas > 0 ? Math.round(totalMinutos / totalCitas) : 0;
  }, [appointments, totalCitas]);

  const crecimientoMensual = React.useMemo(() => {
    const mesActual = new Date().getMonth();
    const mesAnterior = mesActual - 1;
    
    const citasMesActual = tendenciasMensuales[mesActual]?.citas || 0;
    const citasMesAnterior = tendenciasMensuales[mesAnterior]?.citas || 0;
    
    if (citasMesAnterior === 0) return 0;
    return Math.round(((citasMesActual - citasMesAnterior) / citasMesAnterior) * 100);
  }, [tendenciasMensuales]);

  return (
    <div className="space-y-8">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-sm" className="text-muted-foreground">
                Total Citas
              </Typography>
              <Typography variant="heading-xl" className="font-bold">
                {totalCitas}
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                +7% vs mes anterior
              </Typography>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-sm" className="text-muted-foreground">
                Pacientes Únicos
              </Typography>
              <Typography variant="heading-xl" className="font-bold">
                {pacientesUnicos}
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                +11% vs mes anterior
              </Typography>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body-sm" className="text-muted-foreground">
                Tasa de Confirmación
              </Typography>
              <Typography variant="heading-xl" className="font-bold">
                {tasaConfirmacion}%
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                +3% vs mes anterior
              </Typography>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tendencias Mensuales */}
        <Card className="p-6">
          <div className="mb-4">
            <Typography variant="heading-md" className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencias Mensuales
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Evolución de citas por mes
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribución de Servicios */}
        <Card className="p-6">
          <div className="mb-4">
            <Typography variant="heading-md">
              Distribución de Servicios
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Servicios más solicitados
            </Typography>
          </div>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={300}>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {distribucionServicios.map((servicio, index) => (
                <div key={servicio.name} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{servicio.name}</span>
                  <span className="text-muted-foreground">{servicio.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución Semanal */}
        <Card className="p-6">
          <div className="mb-4">
            <Typography variant="heading-md" className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Distribución Semanal
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Citas por día de la semana
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribucionSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="citas" fill="#FFB800" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Insights Clave */}
        <Card className="p-6">
          <div className="mb-4">
            <Typography variant="heading-md" className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights Clave
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Datos importantes de tu práctica
            </Typography>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Mejor día de la semana
                </Typography>
                <Typography variant="body-lg" className="font-bold">
                  {mejorDiaSemana.dia}
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  {mejorDiaSemana.citas} citas agendadas
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Crecimiento mensual
                </Typography>
                <Typography variant="body-lg" className="font-bold text-green-600">
                  +{crecimientoMensual}%
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  vs mes anterior
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Servicio más popular
                </Typography>
                <Typography variant="body-lg" className="font-bold">
                  {servicioPopular.name}
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  {servicioPopular.value} solicitudes
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Tiempo promedio
                </Typography>
                <Typography variant="body-lg" className="font-bold">
                  {tiempoPromedio} min
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  por consulta
                </Typography>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}