export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function POST() {
  const to = process.env.WHATSAPP_TEST_NUMBER;

  if (!to) {
    return NextResponse.json(
      { success: false, error: "WHATSAPP_TEST_NUMBER faltante" },
      { status: 500 }
    );
  }

  const result = await sendWhatsAppMessage(
    to,
    "🧪 Test desde Agendux — ¡Twilio funcionando! 🚀"
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    sid: result.sid,
    status: result.status,
  });
}
