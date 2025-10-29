// app/api/twilio-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { twiml } from "twilio"; // ¡Importante! Usamos el helper TwiML de Twilio

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  let responseMessage = "";
  const twilioResponse = new twiml.MessagingResponse();

  try {
    // 1. Twilio envía los datos como 'form data', no JSON.
    const formData = await req.formData();
    const body = (formData.get("Body") as string)?.trim().toUpperCase();
    const from = formData.get("From") as string; // Ej: 'whatsapp:+54911...'

    // 2. Limpiamos el número de teléfono del paciente
    const patientPhone = from.replace("whatsapp:", "");

    if (!patientPhone) {
      throw new Error(
        "No se pudo obtener el número de teléfono del remitente."
      );
    }

    console.log(`🔔 Webhook recibido de ${patientPhone}: "${body}"`);

    // 3. Buscar la cita PENDIENTE más próxima de este número de teléfono
    //    Tu estado 'pending' es 'scheduled' (según tu API book-appointment)
    const { data: appointment, error: findError } = await supabase
      .from("appointments")
      .select("id, patients!inner(phone)") // Hacemos JOIN con 'patients'
      .eq("patients.phone", patientPhone) // Buscamos por el teléfono
      .eq("status", "scheduled") // ¡CLAVE! Solo actuar sobre citas pendientes
      .order("appointment_datetime", { ascending: true }) // La más próxima
      .limit(1)
      .single();

    if (findError || !appointment) {
      console.warn(`No se encontró cita 'scheduled' para ${patientPhone}.`);
      responseMessage =
        "No encontramos una cita pendiente para este número. Si tienes un problema, por favor contacta al profesional.";
    } else {
      // 4. ¡Encontramos la cita! Procesamos la respuesta
      if (body === "CONFIRMAR") {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ status: "confirmed" }) // Cambiamos el estado
          .eq("id", appointment.id);

        responseMessage = updateError
          ? "Tuvimos un error al confirmar. Por favor, contacta al profesional."
          : "¡Gracias! Tu cita ha sido confirmada.";
      } else if (body === "CANCELAR") {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ status: "cancelled" }) // Cambiamos el estado
          .eq("id", appointment.id);

        responseMessage = updateError
          ? "Tuvimos un error al cancelar."
          : "Tu cita ha sido cancelada.";
      } else {
        // El paciente respondió algo que no es CONFIRMAR o CANCELAR
        responseMessage =
          'Respuesta no válida. Por favor, responde solo "CONFIRMAR" o "CANCELAR".';
      }
    }
  } catch (e) {
    console.error("❌ Error fatal en twilio-webhook:", (e as Error).message);
    responseMessage = "Ocurrió un error inesperado al procesar tu respuesta.";
  }

  // 5. Responder a Twilio en formato TwiML (XML)
  twilioResponse.message(responseMessage);

  // Devolvemos la respuesta en formato XML
  return new NextResponse(twilioResponse.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
