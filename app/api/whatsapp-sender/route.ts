import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const SENDER_AUTH_TOKEN = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inicializar cliente de Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

/**
 * Función para enviar mensaje de WhatsApp a través de Twilio
 */
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    // Formatear número para WhatsApp
    const formattedNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    console.log(`📤 Sending WhatsApp to: ${formattedNumber}`);

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to: formattedNumber,
    });

    console.log(
      `✅ Message sent! SID: ${result.sid}, Status: ${result.status}`
    );

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error("❌ Twilio error:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  let messageLogId: number | null = null;

  try {
    console.log("\n📨 ======= WHATSAPP SENDER START =======");

    // 1. Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${SENDER_AUTH_TOKEN}`) {
      console.error("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener datos del body
    const { appointment_id, message_type } = await request.json();

    if (!appointment_id || !message_type) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing appointment_id or message_type" },
        { status: 400 }
      );
    }

    console.log(
      `📋 Processing: Appointment ${appointment_id}, Type: ${message_type}`
    );

    // 3. Obtener datos de la cita
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from("appointments")
      .select(
        `
        id,
        appointment_datetime,
        duration_minutes,
        user_id,
        patients!inner(full_name, phone),
        services!inner(name)
      `
      )
      .eq("id", appointment_id)
      .single();

    if (appointmentError || !appointment) {
      console.error("❌ Appointment not found:", appointmentError);
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // 4. CORRECCIÓN: Extraer datos correctamente según cómo vienen de Supabase
    // Supabase puede devolver patients como array o como objeto
    const patientData = Array.isArray(appointment.patients)
      ? appointment.patients[0]
      : appointment.patients;

    const serviceData = Array.isArray(appointment.services)
      ? appointment.services[0]
      : appointment.services;

    if (!patientData || !serviceData) {
      console.error("❌ Missing patient or service data");
      return NextResponse.json(
        { error: "Missing patient or service data" },
        { status: 404 }
      );
    }

    const patientName = patientData.full_name;
    const patientPhone = patientData.phone;
    const serviceName = serviceData.name;

    console.log(`✅ Appointment found: ${patientName}`);

    // 5. Obtener datos del profesional
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", appointment.user_id)
      .single();

    if (profileError || !profile) {
      console.error("❌ Profile not found:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log(`✅ Professional: ${profile.first_name} ${profile.last_name}`);

    // 6. Obtener configuración de WhatsApp
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("whatsapp_settings")
      .select("*")
      .eq("profile_id", appointment.user_id)
      .single();

    if (settingsError || !settings || !settings.is_active) {
      console.log("⚠️ WhatsApp not configured or not active");
      return NextResponse.json(
        { error: "WhatsApp not configured" },
        { status: 400 }
      );
    }

    console.log(`✅ WhatsApp settings found (active: ${settings.is_active})`);

    // 7. Obtener plantilla
    let template = "";

    switch (message_type) {
      case "confirmation":
        template = settings.confirmation_template || "";
        break;
      case "reminder_1":
        template = settings.reminder_1_template || "";
        break;
      case "reminder_2":
        template = settings.reminder_2_template || "";
        break;
      case "post_appointment":
        template = settings.post_appointment_template || "";
        break;
      default:
        console.error("❌ Invalid message_type:", message_type);
        return NextResponse.json(
          { error: "Invalid message_type" },
          { status: 400 }
        );
    }

    if (!template) {
      console.log(`⚠️ No template for ${message_type}`);
      return NextResponse.json(
        { error: `Template not configured for ${message_type}` },
        { status: 400 }
      );
    }

    console.log(`✅ Template found for ${message_type}`);

    // 8. Reemplazar variables
    const appointmentDate = new Date(appointment.appointment_datetime);
    const formattedDate = appointmentDate.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = template
      .replace(/\[PACIENTE_NOMBRE\]/g, patientName)
      .replace(
        /\[PROFESIONAL_NOMBRE\]/g,
        `${profile.first_name} ${profile.last_name}`
      )
      .replace(/\[FECHA_CITA\]/g, formattedDate)
      .replace(/\[HORA_INICIO_CITA\]/g, formattedTime)
      .replace(/\[SERVICIO_NOMBRE\]/g, serviceName);

    console.log(`✅ Message prepared (${message.length} chars)`);
    console.log(`📝 Preview: ${message.substring(0, 100)}...`);

    // 9. Enviar por Twilio
    const twilioResult = await sendWhatsAppMessage(patientPhone, message);

    // 10. Guardar log
    try {
      const { data: logData, error: logError } = await supabaseAdmin
        .from("whatsapp_messages")
        .insert({
          appointment_id: appointment_id,
          profile_id: appointment.user_id,
          message_type: message_type,
          recipient: patientPhone,
          message: message,
          twilio_sid: twilioResult.messageSid,
          status: twilioResult.status,
          sent_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (logError) {
        console.error("⚠️ Error saving log:", logError);
      } else {
        messageLogId = logData.id;
        console.log(`✅ Log saved with ID: ${messageLogId}`);
      }
    } catch (logError) {
      console.error("⚠️ Failed to save log:", logError);
    }

    console.log("🏁 ======= WHATSAPP SENDER END =======\n");

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      appointment_id,
      message_type,
      recipient: patientPhone,
      twilio_sid: twilioResult.messageSid,
      status: twilioResult.status,
      log_id: messageLogId,
    });
  } catch (error) {
    console.error("❌ Fatal error in sender:", error);

    // Actualizar log con error si existe
    if (messageLogId) {
      try {
        await supabaseAdmin
          .from("whatsapp_messages")
          .update({
            status: "failed",
            error_message: (error as Error).message,
          })
          .eq("id", messageLogId);
      } catch (updateError) {
        console.error("⚠️ Failed to update error log:", updateError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to send message",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
