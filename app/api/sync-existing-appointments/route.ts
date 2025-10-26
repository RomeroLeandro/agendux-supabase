import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { google } from "googleapis";

interface AppointmentData {
  id: number;
  appointment_datetime: string;
  duration_minutes: number;
  patients: { full_name: string } | null;
  services: { name: string } | null;
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const timeZone = profile.timezone || "America/Argentina/Buenos_Aires";

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("gcal_tokens")
      .select("refresh_token")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData?.refresh_token) {
      console.log("Google Calendar not connected for user:", user.id);
      return NextResponse.json({
        success: false,
        message: "Google Calendar not connected",
      });
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_datetime,
        duration_minutes,
        patients(full_name),
        services(name)
      ` // <-- 2. AÑADIR duration_minutes AL SELECT
      )
      .eq("user_id", user.id)
      .is("google_event_id", null);

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      return NextResponse.json(
        { error: "Failed to fetch appointments" },
        { status: 500 }
      );
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No appointments to sync",
        syncedCount: 0,
      });
    }

    console.log(`Found ${appointments.length} appointments to sync`);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/gcal-callback`
    );

    oauth2Client.setCredentials({ refresh_token: tokenData.refresh_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    let successCount = 0;
    let failedCount = 0;

    for (const appointment of appointments) {
      try {
        const typedAppointment = appointment as unknown as AppointmentData;

        const duration = typedAppointment.duration_minutes || 60; // Fallback a 60
        const appointmentDate = new Date(typedAppointment.appointment_datetime);
        // <-- 3. USAR DURACIÓN REAL
        const endDate = new Date(
          appointmentDate.getTime() + duration * 60 * 1000
        );

        const serviceName = typedAppointment.services?.name || "Cita";
        const patientName = typedAppointment.patients?.full_name || "Paciente";

        const event = {
          summary: `${serviceName} - ${patientName}`,
          description: `Cita desde Agendux\nPaciente: ${patientName}\nServicio: ${serviceName}`,
          start: {
            dateTime: appointmentDate.toISOString(),
            timeZone: timeZone,
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: timeZone,
          },
        };

        console.log(
          `Syncing appointment ${typedAppointment.id} to Google Calendar`
        );

        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
        });

        if (response.data.id) {
          await supabase
            .from("appointments")
            .update({
              google_event_id: response.data.id,
              synced_to_google: true,
              last_sync: new Date().toISOString(),
            })
            .eq("id", typedAppointment.id);

          successCount++;
          console.log(`Successfully synced appointment ${typedAppointment.id}`);
        } else {
          failedCount++;
          console.error(
            `Failed to get Google event ID for appointment ${typedAppointment.id}`
          );
        }
      } catch (error) {
        failedCount++;
        console.error(`Error syncing appointment ${appointment.id}:`, error);
      }
    }

    console.log(
      `Sync completed: ${successCount} success, ${failedCount} failed`
    );

    return NextResponse.json({
      success: true,
      totalAppointments: appointments.length,
      syncedCount: successCount,
      failedCount: failedCount,
      message: `Successfully synced ${successCount} of ${appointments.length} appointments`,
    });
  } catch (error) {
    console.error("Error syncing existing appointments:", error);
    return NextResponse.json(
      {
        error: "Failed to sync existing appointments",
      },
      { status: 500 }
    );
  }
}
