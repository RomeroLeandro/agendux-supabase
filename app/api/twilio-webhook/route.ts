import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import twilio from "twilio";

const MessagingResponse = twilio.twiml.MessagingResponse;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let responseMessage = "";
  const twilioResponse = new MessagingResponse();

  try {
    console.log("\n📲 ======= TWILIO WEBHOOK RECEIVED =======");

    // 1. Obtener datos del form
    const formData = await req.formData();
    const body = (formData.get("Body") as string)?.trim().toUpperCase();
    const from = formData.get("From") as string;
    const messageSid = formData.get("MessageSid") as string;

    // 2. Limpiar número
    const patientPhone = from.replace("whatsapp:", "");

    console.log(`📱 From: ${patientPhone}`);
    console.log(`💬 Message: "${body}"`);
    console.log(`🆔 SID: ${messageSid}`);

    if (!patientPhone) {
      throw new Error("No phone number");
    }

    // 3. Buscar cita pendiente
    const { data: appointment, error: findError } = await supabase
      .from("appointments")
      .select("id, status, patients!inner(phone)")
      .eq("patients.phone", patientPhone)
      .eq("status", "scheduled")
      .order("appointment_datetime", { ascending: true })
      .limit(1)
      .single();

    if (findError || !appointment) {
      console.warn(`⚠️ No scheduled appointment for ${patientPhone}`);
      responseMessage = "No encontramos una cita pendiente para este número.";
    } else {
      console.log(`✅ Found appointment ID: ${appointment.id}`);

      // 4. Procesar respuesta
      if (body === "CONFIRMAR") {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ status: "confirmed" })
          .eq("id", appointment.id);

        if (updateError) {
          console.error("❌ Error confirming:", updateError);
          responseMessage = "Error al confirmar. Contacta al profesional.";
        } else {
          console.log(`✅ Appointment ${appointment.id} confirmed`);
          responseMessage = "¡Gracias! Tu cita ha sido confirmada. ✅";
        }
      } else if (body === "CANCELAR") {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ status: "cancelled" })
          .eq("id", appointment.id);

        if (updateError) {
          console.error("❌ Error cancelling:", updateError);
          responseMessage = "Error al cancelar.";
        } else {
          console.log(`✅ Appointment ${appointment.id} cancelled`);
          responseMessage = "Tu cita ha sido cancelada. ❌";
        }
      } else {
        console.log(`⚠️ Invalid response: "${body}"`);
        responseMessage =
          'Respuesta no válida. Responde "CONFIRMAR" o "CANCELAR".';
      }
    }

    console.log(`📤 Response: "${responseMessage}"`);
    console.log("🏁 ======= TWILIO WEBHOOK END =======\n");
  } catch (e) {
    console.error("❌ Fatal webhook error:", (e as Error).message);
    responseMessage = "Error al procesar tu respuesta.";
  }

  // 5. Responder en TwiML
  twilioResponse.message(responseMessage);

  return new NextResponse(twilioResponse.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
