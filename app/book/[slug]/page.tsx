import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookingInterface } from "./booking-interface";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  console.log("=== BOOKING PAGE DEBUG ===");
  console.log("Received slug:", slug);

  // Buscar la configuración de auto-agenda por slug Y que esté activa
  const { data: config, error } = await supabase
    .from("auto_agenda_config")
    .select("*")
    .eq("url_slug", slug)
    .eq("is_active", true)
    .single();

  console.log("Config query result:", { config, error });

  if (error || !config) {
    console.log("Config not found or inactive, showing 404");
    notFound();
  }

  // Obtener el perfil del profesional
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      phone,
      professions(name, category)
    `
    )
    .eq("id", config.user_id)
    .single();

  console.log("Profile query result:", { profile, profileError });

  if (profileError || !profile) {
    console.log("Profile not found, showing 404");
    notFound();
  }

  // Obtener servicios ACTIVOS para auto-agenda
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", config.user_id)
    .eq("is_active_for_auto_agenda", true)
    .order("name");

  console.log("Services found:", services?.length || 0);

  // Obtener horarios laborales
  const { data: workHours } = await supabase
    .from("work_hours")
    .select("*")
    .eq("user_id", config.user_id)
    .order("day_of_week");

  console.log("Work hours found:", workHours?.length || 0);

  // Obtener configuración de campos del formulario
  const { data: formFields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("user_id", config.user_id);

  console.log("Form fields found:", formFields?.length || 0);

  // ===== OBTENER CITAS EXISTENTES =====
  // Obtener todas las citas futuras (no canceladas) para validar disponibilidad
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("appointment_datetime, duration_minutes, status")
    .eq("user_id", config.user_id)
    .gte("appointment_datetime", today.toISOString())
    .neq("status", "cancelled")
    .order("appointment_datetime");

  console.log(
    "Existing appointments found:",
    existingAppointments?.length || 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BookingInterface
        config={config}
        services={services || []}
        professional={profile}
        workHours={workHours || []}
        formFields={formFields || []}
        existingAppointments={existingAppointments || []}
      />
    </div>
  );
}

// Generar metadata dinámico solo para páginas activas
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("auto_agenda_config")
    .select("page_title, page_description, logo_url")
    .eq("url_slug", slug)
    .eq("is_active", true)
    .single();

  return {
    title: config?.page_title || "Página no disponible",
    description: config?.page_description || "Esta página no está disponible",
  };
}
