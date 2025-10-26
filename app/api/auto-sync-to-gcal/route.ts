import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { google } from "googleapis";

interface AppointmentData {
  id: number;
  appointment_datetime: string;
  duration_minutes: number; // <-- 1. AÑADIR DURACIÓN
  google_event_id?: string | null;
  patients: { full_name: string } | null;
  services: { name: string } | null;
}

export async function POST(request: Request) {
  try {
    const { appointmentId, action } = await request.json();

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

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_datetime,
        duration_minutes, 
        google_event_id,
        synced_to_google,
        patients(full_name),
        services(name)
      ` // <-- 2. AÑADIR duration_minutes AL SELECT
      )
      .eq("id", appointmentId)
      .eq("user_id", user.id)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const typedAppointment = appointment as unknown as AppointmentData;

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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/gcal-callback`
    );

    oauth2Client.setCredentials({ refresh_token: tokenData.refresh_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const result = {
      success: true,
      googleEventId: typedAppointment.google_event_id || undefined,
    };

    const duration = typedAppointment.duration_minutes || 60; // Fallback a 60 si es nulo

    if (action === "create" && !typedAppointment.google_event_id) {
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

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      const googleEventId = response.data.id;

      if (googleEventId) {
        result.googleEventId = googleEventId;

        await supabase
          .from("appointments")
          .update({
            google_event_id: googleEventId,
            synced_to_google: true,
            last_sync: new Date().toISOString(),
          })
          .eq("id", appointmentId);
      }
    } else if (action === "update" && typedAppointment.google_event_id) {
      const appointmentDate = new Date(typedAppointment.appointment_datetime);
      // <-- 3. USAR DURACIÓN REAL
      const endDate = new Date(
        appointmentDate.getTime() + duration * 60 * 1000
      );

      const serviceName = typedAppointment.services?.name || "Cita";
      const patientName = typedAppointment.patients?.full_name || "Paciente";

      await calendar.events.update({
        calendarId: "primary",
        eventId: typedAppointment.google_event_id,
        requestBody: {
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
        },
      });

      await supabase
        .from("appointments")
        .update({ last_sync: new Date().toISOString() })
        .eq("id", appointmentId);
    } else if (action === "delete" && typedAppointment.google_event_id) {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: typedAppointment.google_event_id,
        });
      } catch (error) {
        console.log("Event already deleted or not found in Google Calendar");
      }

      await supabase
        .from("appointments")
        .update({
          google_event_id: null,
          synced_to_google: false,
        })
        .eq("id", appointmentId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in auto-sync to Google Calendar:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sync to Google Calendar failed",
      },
      { status: 500 }
    );
  }
}
