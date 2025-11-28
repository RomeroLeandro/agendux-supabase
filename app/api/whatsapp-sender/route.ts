// // app/api/whatsapp-sender/route.ts
// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { createClient } from "@/lib/supabase/server";
// import { formatMessage, sendWhatsAppMessage } from "@/lib/twilio";

// type MessageType =
//   | "confirmation"
//   | "reminder_1"
//   | "reminder_2"
//   | "post_appointment";

// export async function POST(req: Request) {
//   try {
//     const { appointment_id, message_type } = (await req.json()) as {
//       appointment_id: number;
//       message_type: MessageType;
//     };

//     const cookieStore = cookies();
//     const supabase = createClient(cookieStore);

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: "No autenticado" },
//         { status: 401 }
//       );
//     }

//     // Traer cita + paciente + servicio + perfil
//     const { data: appointment, error: aptError } = await supabase
//       .from("appointments")
//       .select(
//         `
//         *,
//         patients(*),
//         services(*),
//         profiles:profile_id(*)
//       `
//       )
//       .eq("id", appointment_id)
//       .eq("user_id", user.id)
//       .maybeSingle();

//     if (aptError || !appointment) {
//       return NextResponse.json(
//         { success: false, error: "Cita no encontrada" },
//         { status: 404 }
//       );
//     }

//     const patient = appointment.patients;
//     const service = appointment.services;
//     const profile = appointment.profiles;

//     if (!patient?.phone) {
//       return NextResponse.json(
//         { success: false, error: "El paciente no tiene teléfono" },
//         { status: 400 }
//       );
//     }

//     // Traer configuración de mensajes del profesional
//     const { data: settings } = await supabase
//       .from("whatsapp_settings")
//       .select("*")
//       .eq("profile_id", profile.id)
//       .maybeSingle();

//     if (!settings?.is_active) {
//       return NextResponse.json(
//         { success: false, error: "Mensajería automática desactivada" },
//         { status: 400 }
//       );
//     }

//     // Elegir plantilla según message_type
//     let template: string | null = null;

//     switch (message_type) {
export {}; //       case "confirmation":
//         template = settings.confirmation_template;
//         break;
//       case "reminder_1":
//         template = settings.reminder_1_template;
//         break;
//       case "reminder_2":
//         template = settings.reminder_2_template;
//         break;
//       case "post_appointment":
//         template = settings.post_appointment_template;
//         break;
//     }

//     // Si no hay plantilla, ponemos un fallback simple
//     if (!template) {
//       template = "Hola [PACIENTE_NOMBRE], mensaje sobre tu turno de [SERVICIO_NOMBRE] el [FECHA_CITA] a las [HORA_INICIO_CITA].";
//     }

//     const body = formatMessage(template, {
//       appointment,
//       patient,
//       service,
//       profile,
//     });

//     const send = await sendWhatsAppMessage(patient.phone, body);

//     // Guardar en whatsapp_messages
//     await supabase.from("whatsapp_messages").insert({
//       profile_id: profile.id,
//       appointment_id,
//       message_type,
//       recipient: patient.phone,
//       body,
//       status: send.success ? "sent" : "failed",
//       twilio_sid: send.sid ?? null,
//       error_message: send.error ?? null,
//       sent_at: new Date().toISOString(),
//     });

//     if (!send.success) {
//       return NextResponse.json(
//         { success: false, error: send.error },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       sid: send.sid,
//     });
//   } catch (err: any) {
//     console.error("Error /api/whatsapp-sender:", err);
//     return NextResponse.json(
//       { success: false, error: err.message },
//       { status: 500 }
//     );
//   }
// }
