// lib/twilio.ts
import { Twilio } from "twilio";
import { Database } from "@/types/supabase";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Patient = Database["public"]["Tables"]["patients"]["Row"];

export interface AppointmentData {
  appointment: Appointment;
  profile: Profile;
  service: Service;
  patient: Patient;
}

// Reemplaza las variables de plantilla
export function formatMessage(template: string, data: AppointmentData) {
  const { appointment, profile, service, patient } = data;

  const date = new Date(appointment.appointment_datetime);

  const fecha = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  const hora = date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const profesionalNombre = `${profile.first_name ?? ""} ${
    profile.last_name ?? ""
  }`.trim();

  return (
    template
      .replace(/\[PACIENTE_NOMBRE\]/g, patient.full_name ?? "")
      .replace(/\[PROFESIONAL_NOMBRE\]/g, profesionalNombre)
      .replace(/\[FECHA_CITA\]/g, fecha)
      // soportamos ambos alias de hora
      .replace(/\[HORA_INICIO_CITA\]/g, hora)
      .replace(/\[HORA_CITA\]/g, hora)
      .replace(/\[SERVICIO_NOMBRE\]/g, service.name ?? "")
  );
}

export async function sendWhatsAppMessage(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const rawFrom = process.env.TWILIO_PHONE_NUMBER; // +1415...

  if (!sid || !token || !rawFrom) {
    return {
      success: false,
      error: "Twilio no está configurado (revisar variables de entorno)",
    };
  }

  const from = rawFrom.startsWith("whatsapp:")
    ? rawFrom
    : `whatsapp:${rawFrom}`;
  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  try {
    const client = new Twilio(sid, token);

    const message = await client.messages.create({
      from,
      to: formattedTo,
      body,
    });

    return {
      success: true,
      sid: message.sid,
      status: message.status,
    };
  } catch (err: unknown) {
    console.error("Error Twilio:", err);

    // Intentamos extraer un mensaje legible
    let errorMessage = "Error desconocido al enviar el mensaje con Twilio";

    if (err && typeof err === "object" && "message" in err) {
      errorMessage = String((err as { message: unknown }).message);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
