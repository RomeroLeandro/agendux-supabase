import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log('\n📊 ======= TWILIO STATUS UPDATE =======')
    
    const formData = await req.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string;
    const errorMessage = formData.get("ErrorMessage") as string;

    console.log(`🆔 SID: ${messageSid}`)
    console.log(`📊 Status: ${messageStatus}`)
    if (errorCode) console.log(`❌ Error: ${errorCode} - ${errorMessage}`)

    // Preparar datos de actualización
    const updateData: any = { status: messageStatus };

    if (messageStatus === "delivered") {
      updateData.delivered_at = new Date().toISOString();
      console.log(`✅ Message delivered`)
    }

    if (errorCode) {
      updateData.error_message = `${errorCode}: ${errorMessage}`;
      console.log(`❌ Message failed: ${errorCode}`)
    }

    // Actualizar en BD
    const { error } = await supabaseAdmin
      .from("whatsapp_messages")
      .update(updateData)
      .eq("twilio_sid", messageSid);

    if (error) {
      console.error("❌ Error updating status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Status updated in database`)
    console.log('🏁 ======= STATUS UPDATE END =======\n')

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Fatal status error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}