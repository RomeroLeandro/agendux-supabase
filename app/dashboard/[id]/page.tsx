// @/app/dashboard/[id]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardUI } from "./dashboardUI";

export default async function ProfessionalDashboardPage({
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

  const { data: professional, error } = await supabase
    .from("profiles")
    .select("*, professions(*)")
    .eq("id", params.id)
    .single();

  if (error || !professional) {
    console.error("Error fetching profile on server:", error);
    return <div>No se pudo cargar el perfil del profesional.</div>;
  }

  return <DashboardUI user={user} professional={professional} />;
}
