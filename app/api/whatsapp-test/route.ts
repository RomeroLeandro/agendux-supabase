import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
const toNumber = process.env.WHATSAPP_TEST_NUMBER!;

const client = twilio(accountSid, authToken);

export async function POST() {
  try {
    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return NextResponse.json(
        { ok: false, error: "Faltan variables de entorno de Twilio" },
        { status: 500 }
      );
    }

    const message = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      body: "Mensaje de prueba desde Agendux 🚀",
    });

    return NextResponse.json({ ok: true, sid: message.sid });
  } catch (error: any) {
    console.error("Error enviando WhatsApp:", error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Error desconocido" },
      { status: 500 }
    );
  }
}
