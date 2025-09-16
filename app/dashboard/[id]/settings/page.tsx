import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SettingsTabs } from "./tab-settings";
import { ProfileSettings } from "./profile-settings";

export default async function SettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.id !== params.id) {
    redirect("/auth/login");
  }

  console.log("=== DEBUGGING PROFILE QUERY ===");
  console.log("User ID:", user.id);

  // Primero, verificar qué registros existen en la tabla profiles
  const { data: allProfiles, error: allError } = await supabase
    .from("profiles")
    .select("*");

  console.log("All profiles in table:", allProfiles);
  console.log("All profiles error:", allError);

  // Intentar diferentes consultas para encontrar el perfil
  const { data: profile1, error: error1 } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_users_id", user.id)
    .single();

  console.log("Query by auth_users_id:", { data: profile1, error: error1 });

  // Intentar por si el campo se llama 'id' en lugar de 'auth_users_id'
  const { data: profile2, error: error2 } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("Query by id:", { data: profile2, error: error2 });

  // Usar el perfil que funcione
  const profile = profile1 || profile2;

  // Obtener profesiones
  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select("id, category, name")
    .order("category", { ascending: true });

  console.log("Professions:", professions?.length || 0, "items");
  console.log("Professions error:", professionsError);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button className="p-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2 text-sm">Volver</span>
          </Button>
          <div>
            <Typography variant="heading-xl" className="font-semibold">
              Configuración
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Personaliza tu perfil y configuraciones de mensajes automáticos
            </Typography>
          </div>
        </div>
      </div>

      <SettingsTabs />

      <div className="mt-8">
        <ProfileSettings
          profile={profile}
          professions={professions || []}
          userId={user.id}
        />
      </div>
    </div>
  );
}
