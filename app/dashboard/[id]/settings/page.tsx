import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SettingsContent } from "./settings-content";

export default async function SettingsPage({
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

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      professions(id, category, name)
    `
    )
    .eq("auth_users_id", user.id)
    .single();

  // Obtener todas las profesiones
  const { data: professions } = await supabase
    .from("professions")
    .select("id, category, name")
    .order("category", { ascending: true });

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

      <SettingsContent
        profile={profile}
        professions={professions || []}
        userId={user.id}
      />
    </div>
  );
}
