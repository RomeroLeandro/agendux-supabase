import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Aside } from "@/components/dashboard/aside";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: professional, error } = await supabase
    .from("profiles")
    .select("*, professions(*)")
    .eq("id", params.id)
    .single();

  if (error || !professional) {
    return <div>No se pudo cargar el perfil del profesional.</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Aside user={user} professional={professional} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}