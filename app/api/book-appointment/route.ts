import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { fromZonedTime } from "date-fns-tz";

export async function POST(request: Request) {
  try {
    const {
      professional_id,
      service_id,
      patient_name,
      patient_phone,
      patient_email,
      appointment_date,
      appointment_time,
      notes,
    } = await request.json();

    console.log("📥 Booking request received:", {
      professional_id,
      service_id,
      patient_name,
      appointment_date,
      appointment_time,
    });

    const supabase = await createClient();

    // 2. OBTENER PERFIL Y SERVICIO PRIMERO
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", professional_id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Error fetching professional profile:", profileError);
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // 3. DEFINIR ZONA HORARIA (con fallback)
    const timeZone = profile.timezone || "America/Argentina/Buenos_Aires";

    // Obtener la duración del servicio
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("duration_minutes, name")
      .eq("id", service_id)
      .single();

    if (serviceError) {
      console.error("❌ Error fetching service:", serviceError);
      throw serviceError;
    }

    console.log("✅ Service found:", service);

    // Crear paciente
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert({
        user_id: professional_id,
        full_name: patient_name,
        phone: patient_phone,
        email: patient_email,
      })
      .select()
      .single();

    if (patientError) {
      console.error("❌ Error creating patient:", patientError);
      throw patientError;
    }

    console.log("✅ Patient created with ID:", patient.id);

    // 4. CREAR FECHA UTC CORRECTA
    // Combina fecha y hora local (ej: "2023-10-27T10:00")
    const localDateTimeString = `${appointment_date}T${appointment_time}`;
    // Convierte esa hora local (en la zona del profesional) a un objeto Date (UTC)
    const appointmentDateTime = fromZonedTime(localDateTimeString, timeZone);

    // Crear cita
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        user_id: professional_id,
        patient_id: patient.id,
        service_id: service_id,
        appointment_datetime: appointmentDateTime.toISOString(), // Usar el ISO string UTC
        duration_minutes: service.duration_minutes,
        notes: notes,
        status: "scheduled",
        synced_to_google: false, // Inicialmente false
      })
      .select()
      .single();

    if (appointmentError) {
      console.error("❌ Error creating appointment:", appointmentError);
      throw appointmentError;
    }

    console.log("✅ Appointment created successfully with ID:", appointment.id);

    // ===== SINCRONIZACIÓN CON GOOGLE CALENDAR =====
    let googleEventId: string | null = null;
    let syncedToGoogle = false;

    try {
      console.log(
        "🔍 Checking Google Calendar connection for user:",
        professional_id
      );

      // Usar el admin client para acceder a los tokens
      const { createClient: createAdminClient } = await import(
        "@supabase/supabase-js"
      );
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("gcal_tokens")
        .select("refresh_token")
        .eq("user_id", professional_id)
        .single();

      if (!tokenError && tokenData?.refresh_token) {
        console.log("✅ Google Calendar token found, syncing...");

        // Configurar OAuth2
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          `${process.env.NEXT_PUBLIC_APP_URL}/api/gcal-callback`
        );

        oauth2Client.setCredentials({
          refresh_token: tokenData.refresh_token,
        });

        const calendar = google.calendar({
          version: "v3",
          auth: oauth2Client,
        });

        // Calcular fecha de fin
        const endDateTime = new Date(appointmentDateTime.getTime()); // Clonar fecha UTC
        endDateTime.setMinutes(
          endDateTime.getMinutes() + service.duration_minutes
        );

        // Crear evento en Google Calendar
        const event = {
          summary: `${service.name} - ${patient_name}`,
          description: `Cita agendada desde la página pública\n\nPaciente: ${patient_name}\nServicio: ${
            service.name
          }\nTeléfono: ${patient_phone}\n${notes ? `\nNotas: ${notes}` : ""}`,
          start: {
            dateTime: appointmentDateTime.toISOString(), // Usar ISO string UTC
            timeZone: timeZone, // 5. USAR ZONA HORARIA DINÁMICA
          },
          end: {
            dateTime: endDateTime.toISOString(), // Usar ISO string UTC
            timeZone: timeZone, // 5. USAR ZONA HORARIA DINÁMICA
          },
        };

        console.log("📅 Creating Google Calendar event...");

        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
        });

        googleEventId = response.data.id || null;
        syncedToGoogle = !!googleEventId;

        console.log("✅ Google Calendar event created:", googleEventId);

        // Actualizar la cita con el ID del evento de Google
        if (googleEventId) {
          await supabase
            .from("appointments")
            .update({
              google_event_id: googleEventId,
              synced_to_google: true,
              last_sync: new Date().toISOString(),
            })
            .eq("id", appointment.id);

          console.log("✅ Appointment updated with Google event ID");
        }
      } else {
        console.log("⚠️ Google Calendar not connected for this user");
      }
    } catch (syncError) {
      console.error("⚠️ Error syncing to Google Calendar:", syncError);
      // No lanzamos el error para que la cita se cree de todas formas
    }

    return NextResponse.json({
      success: true,
      appointment_id: appointment.id,
      synced_to_google: syncedToGoogle,
      google_event_id: googleEventId,
      message: syncedToGoogle
        ? "Cita agendada y sincronizada con Google Calendar"
        : "Cita agendada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error in book-appointment API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create appointment",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
