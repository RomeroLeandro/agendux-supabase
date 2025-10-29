// lib/twilio.ts
import { Twilio } from "twilio";
import { Database } from "@/types/supabase"; // Importamos los tipos de tu DB

// --- Definición de Tipos ---
type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Patient = Database["public"]["Tables"]["patients"]["Row"];

interface AppointmentData {
  appointment: Appointment;
  profile: Profile;
  service: Service;
  patient: Patient;
}

/**
 * Reemplaza las variables (ej: [PACIENTE_NOMBRE]) en la plantilla de texto.
 * (CORREGIDO para usar appointment_datetime)
 */
export function formatMessage(
  template: string | null,
  data: AppointmentData
): string {
  if (!template) return "";

  const { appointment, profile, service, patient } = data;

  // Formatear fecha y hora al español
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  // --- INICIO DE LA CORRECCIÓN ---
  // Usamos 'appointment_datetime' en lugar de 'start_time'
  const appointmentDate = new Date(appointment.appointment_datetime);
  // --- FIN DE LA CORRECCIÓN ---

  const formattedDate = new Intl.DateTimeFormat("es-ES", dateOptions).format(
    appointmentDate
  );
  const formattedTime = new Intl.DateTimeFormat("es-ES", timeOptions).format(
    appointmentDate
  );

  // (Esto ya estaba corregido de antes)
  const patientFullName = patient.full_name || "";
  const profileFullName = `${profile.first_name || ""} ${
    profile.last_name || ""
  }`.trim();

  // Reemplazamos cada variable con su valor real
  return template
    .replace(/\[PACIENTE_NOMBRE\]/g, patientFullName)
    .replace(/\[PROFESIONAL_NOMBRE\]/g, profileFullName)
    .replace(/\[FECHA_CITA\]/g, formattedDate)
    .replace(/\[HORA_INICIO_CITA\]/g, formattedTime)
    .replace(/\[SERVICIO_NOMBRE\]/g, service.name || "");
}

/**
 * Envía un mensaje de WhatsApp usando la cuenta global de Twilio.
 * (Esta función no tiene cambios)
 */
export async function sendWhatsAppMessage(
  to: string, // Número del paciente
  body: string
) {
  // 1. Carga las credenciales globales desde el entorno (Paso 1)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER; // Ej: whatsapp:+1415...

  // 2. Verificación de seguridad
  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.error("Error Crítico: Faltan credenciales de Twilio en .env");
    return { success: false, error: "Servicio de mensajería no configurado." };
  }

  try {
    // 3. Inicializa el cliente de Twilio
    const client = new Twilio(twilioSid, twilioToken);

    // 4. Twilio requiere que el número del destinatario también tenga prefijo
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    // 5. Envía el mensaje
    const message = await client.messages.create({
      from: twilioFrom,
      to: formattedTo,
      body: body,
    });

    console.log(`Mensaje de Twilio enviado a ${to}. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`Error al enviar mensaje de Twilio a ${to}:`, error);
    return { success: false, error: (error as Error).message };
  }
}
