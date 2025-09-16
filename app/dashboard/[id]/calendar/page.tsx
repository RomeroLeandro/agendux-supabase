import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { CalendarWithGoogleEvents } from "./calendar-with-google";
import { OAuthCallback } from "@/components/ui/o-auth-call-back";
import { GoogleCalendarDebugger } from "@/components/google-calendar-debugger"; // Agregar

interface Appointment {
  id: number;
  appointment_datetime: string;
  status: string;
  google_event_id?: string;
  patients: { full_name: string } | null;
  services: { name: string } | null;
}

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: agenduxAppointments } = await supabase
    .from("appointments")
    .select(
      `
      id, 
      appointment_datetime, 
      status, 
      google_event_id, 
      patients(full_name), 
      services(name)
    `
    )
    .eq("user_id", user.id);

  const typedAppointments = (agenduxAppointments ||
    []) as unknown as Appointment[];

  return (
    <div>
      <OAuthCallback />
      <div className="p-8 border-b border-border">
        <Typography variant="heading-lg">Mi Calendario</Typography>
        <Typography variant="body-md" className="text-muted-foreground">
          Vista mensual de todas tus citas
        </Typography>
      </div>

      {/* Agregar debugger temporal */}
      {/* <div className="p-8">
        <GoogleCalendarDebugger />
      </div> */}

      <CalendarWithGoogleEvents agenduxAppointments={typedAppointments} />
    </div>
  );
}
