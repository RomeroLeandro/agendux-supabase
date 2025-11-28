import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  ArrowRight,
  MessageSquare,
  Users,
  BarChart,
  Clock,
} from "lucide-react";

// Helper para formatear la hora
const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function DashboardHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // --- 1. CARGA DE DATOS EN PARALELO ---
  const professionalPromise = supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", id)
    .single();
  const totalPatientsPromise = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysAppointmentsPromise = supabase
    .from("appointments")
    .select("*, patients(full_name), services(name)")
    .eq("user_id", user.id)
    .gte("appointment_datetime", todayStart.toISOString())
    .order("appointment_datetime", { ascending: true });

  // Consultas para el Resumen Semanal
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const completedWeeklyPromise = supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("created_at", sevenDaysAgo.toISOString());

  const newPatientsWeeklyPromise = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", sevenDaysAgo.toISOString());

  const relevantAppointmentsPromise = supabase
    .from("appointments")
    .select("status")
    .eq("user_id", user.id)
    .gte("created_at", sevenDaysAgo.toISOString())
    .in("status", ["confirmed", "completed", "scheduled"]);

  // Ejecutamos todas las consultas a la vez
  const [
    { data: professional },
    { count: totalPatients },
    { data: todaysAppointments },
    { count: completedWeeklyCount },
    { count: newPatientsWeeklyCount },
    { data: relevantAppointments },
  ] = await Promise.all([
    professionalPromise,
    totalPatientsPromise,
    todaysAppointmentsPromise,
    completedWeeklyPromise,
    newPatientsWeeklyPromise,
    relevantAppointmentsPromise,
  ]);

  // --- 2. CÁLCULO DE ESTADÍSTICAS ---
  const dailyStats = {
    total: todaysAppointments?.length || 0,
    confirmed:
      todaysAppointments?.filter((a) => a.status === "confirmed").length || 0,
    pending:
      todaysAppointments?.filter((a) => a.status === "scheduled").length || 0,
  };

  const nextAppointment = todaysAppointments?.find(
    (a) =>
      a.status !== "cancelled" &&
      a.status !== "completed" &&
      new Date(a.appointment_datetime) > new Date()
  );

  const confirmedWeekly =
    relevantAppointments?.filter((a) => a.status === "confirmed").length || 0;
  const totalRelevantWeekly = relevantAppointments?.length || 0;
  const weeklyConfirmationRate =
    totalRelevantWeekly > 0
      ? Math.round((confirmedWeekly / totalRelevantWeekly) * 100)
      : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const professionalName = `${professional?.first_name || ""} ${
    professional?.last_name || ""
  }`;

  return (
    <div className="p-8 space-y-6 bg-muted/30">
      <header>
        <Typography variant="heading-xl" className="p-0">
          ¡Hola, {professionalName}!
        </Typography>
        <Typography variant="body-md" className="text-muted-foreground">
          Tienes {dailyStats.total} citas programadas para hoy,{" "}
          {dailyStats.confirmed} confirmadas, {dailyStats.pending} pendientes.
        </Typography>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex items-start justify-between">
          <div>
            <Typography variant="body-sm" className="p-0 text-muted-foreground">
              Citas Hoy
            </Typography>
            <Typography variant="heading-xl" className="p-0">
              {dailyStats.total}
            </Typography>
          </div>
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </Card>
        <Card className="p-4 flex items-start justify-between">
          <div>
            <Typography variant="body-sm" className="p-0 text-muted-foreground">
              Total Pacientes
            </Typography>
            <Typography variant="heading-xl" className="p-0">
              {totalPatients}
            </Typography>
          </div>
          <Users className="h-8 w-8 text-muted-foreground" />
        </Card>
        <Card className="p-4 flex items-start justify-between">
          <div>
            <Typography variant="body-sm" className="p-0 text-muted-foreground">
              Tasa Confirmación
            </Typography>
            <Typography variant="heading-xl" className="p-0 text-green-600">
              {dailyStats.total > 0
                ? Math.round(
                    (dailyStats.confirmed /
                      (dailyStats.total -
                        (todaysAppointments?.filter(
                          (a) => a.status === "cancelled"
                        ).length || 0))) *
                      100
                  )
                : 0}
              %
            </Typography>
          </div>
          <BarChart className="h-8 w-8 text-muted-foreground" />
        </Card>
        <Card className="p-4 flex items-start justify-between">
          <div>
            <Typography variant="body-sm" className="p-0 text-muted-foreground">
              Próxima Cita
            </Typography>
            <Typography variant="heading-xl" className="p-0">
              {nextAppointment
                ? formatTime(nextAppointment.appointment_datetime)
                : "--:--"}
            </Typography>
            <Typography variant="body-xs" className="text-muted-foreground p-0">
              {nextAppointment?.patients.full_name || "Sin próximas citas"}
            </Typography>
          </div>
          <Clock className="h-8 w-8 text-muted-foreground" />
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="heading-md" className="p-0">
                Citas de Hoy
              </Typography>
              <Link href={`/dashboard/${id}/quotes/today`}>
                <Button>
                  Ver todas <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {todaysAppointments && todaysAppointments.length > 0 ? (
                todaysAppointments.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-x-4 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <span className="font-semibold text-muted-foreground">
                      {formatTime(app.appointment_datetime)}
                    </span>
                    <div className="flex-grow">
                      <p className="font-semibold text-foreground">
                        {app.patients.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {app.services.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2">
                      {getStatusIcon(app.status)}
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {app.status === "scheduled" ? "Pendiente" : app.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tenés citas programadas para hoy.
                </p>
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <Typography variant="heading-md" className="p-0 mb-4">
              Acciones Rápidas
            </Typography>
            <div className="space-y-2">
              <Link href={`/dashboard/${id}/quotes/new`} className="block">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" /> Nueva Cita
                </Button>
              </Link>
              <Link href={`/dashboard/${id}/calendar`} className="block">
                <Button className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" /> Ver Agenda
                </Button>
              </Link>
              <Link href={`/dashboard/${id}/mensajes`} className="block">
                <Button className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" /> Mensajes
                </Button>
              </Link>
            </div>
          </Card>
          <Card className="p-6">
            <Typography variant="heading-md" className="p-0 mb-4">
              Resumen Semanal
            </Typography>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Citas completadas</span>
                <span className="font-semibold">{completedWeeklyCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa de confirmación</span>
                <span className="font-semibold text-green-600">
                  {weeklyConfirmationRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nuevos pacientes</span>
                <span className="font-semibold">{newPatientsWeeklyCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Ingresos estimados</span>
                <span className="font-semibold text-muted-foreground">--</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
