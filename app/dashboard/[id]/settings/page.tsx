import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SettingsContent } from "./settings-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  console.log("[page.tsx] Passing params to SettingsContent:", params);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.id !== id) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      professions(id, category, name)
    `
    )
    .eq("id", user.id)
    .single();

  const { data: professions } = await supabase
    .from("professions")
    .select("id, category, name")
    .order("category", { ascending: true });

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4 flex-col">
        <div>
          <Typography variant="heading-xl" className="font-semibold">
            Configuración
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Personaliza tu perfil y configuraciones de mensajes automáticos
          </Typography>
        </div>
      </div>

      <SettingsContent
        profile={profile}
        professions={professions || []}
        userId={user.id}
        params={{ id }}
      />
    </div>
  );
}
