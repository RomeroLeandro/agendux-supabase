import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { AnalyticsDashboard } from "./analitycs-dashboard";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.id !== (await params).id) {
    redirect("/auth/login");
  }

  // Obtener datos de citas
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_datetime,
      status,
      duration_minutes,
      patients(full_name),
      services(name, duration_minutes)
    `
    )
    .eq("user_id", user.id)
    .order("appointment_datetime", { ascending: false });

  // Obtener datos de pacientes únicos
  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, created_at")
    .eq("user_id", user.id);

  // Obtener datos de servicios
  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes")
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 sm:mb-8">
          <Typography variant="heading-lg" className="p-0">
            Analytics
          </Typography>
          <Typography
            variant="body-md"
            className="text-muted-foreground p-0 mt-1"
          >
            Reportes y estadísticas de tu consultorio
          </Typography>
        </div>

        <AnalyticsDashboard
          appointments={(appointments || []).map((a) => ({
            ...a,
            patients: Array.isArray(a.patients)
              ? a.patients[0] || null
              : a.patients || null,
            services: Array.isArray(a.services)
              ? a.services[0] || null
              : a.services || null,
          }))}
          patients={patients || []}
          services={services || []}
        />
      </div>
    </div>
  );
}
