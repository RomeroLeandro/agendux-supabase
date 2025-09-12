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
    return <div>No se pudo cargar el perfil del profesional.</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: todaysAppointmentsCount, error: countError } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("appointment_datetime", today.toISOString())
    .lt("appointment_datetime", tomorrow.toISOString());

  const { count: allAppointmentsCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

    const { count: unreadMessagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('recipient_id', user.id).eq('is_read', false);

  if (countError) {
    console.error("Error counting today's appointments:", countError);
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Aside
        user={user}
        professional={professional}
        todaysAppointmentsCount={todaysAppointmentsCount || 0}
        allAppointmentsCount={allAppointmentsCount || 0}
        unreadMessagesCount={unreadMessagesCount || 0}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
