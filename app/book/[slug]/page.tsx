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
    .eq("is_active", true) // Solo páginas activas
    .single();

  console.log("Config query result:", { config, error });

  if (error || !config) {
    console.log("Config not found or inactive, showing 404");
    notFound();
  }

  // Obtener el perfil del profesional por separado
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

  // Obtener servicios disponibles del profesional
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", config.user_id)
    .order("name");

  console.log("Services found:", services?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BookingInterface
        config={config}
        services={services || []}
        professional={profile}
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
    .select("page_title, page_description")
    .eq("url_slug", slug)
    .eq("is_active", true) // Solo páginas activas
    .single();

  return {
    title: config?.page_title || "Página no disponible",
    description: config?.page_description || "Esta página no está disponible",
  };
}
