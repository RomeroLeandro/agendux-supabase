import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST() {
  try {
    console.log("\n🔍 ======= TESTING TWILIO CONFIG =======");

    // 1. Verificar variables de entorno
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    console.log("Account SID exists:", !!accountSid);
    console.log("Auth Token exists:", !!authToken);
    console.log("WhatsApp Number:", whatsappNumber);

    if (!accountSid || !authToken || !whatsappNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Twilio configuration",
          missing: {
            accountSid: !accountSid,
            authToken: !authToken,
            whatsappNumber: !whatsappNumber,
          },
        },
        { status: 500 }
      );
    }

    // 2. Intentar inicializar cliente de Twilio
    let client;
    try {
      client = twilio(accountSid, authToken);
      console.log("✅ Twilio client initialized");
    } catch (error) {
      console.error("❌ Error initializing Twilio client:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize Twilio client",
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }

    // 3. Verificar cuenta
    try {
      const account = await client.api.accounts(accountSid).fetch();
      console.log("✅ Account verified:", account.friendlyName);
      console.log("   Status:", account.status);

      return NextResponse.json({
        success: true,
        message: "Twilio configuration is correct",
        account: {
          sid: account.sid,
          name: account.friendlyName,
          status: account.status,
        },
        config: {
          whatsappNumber: whatsappNumber,
        },
      });
    } catch (error) {
      console.error("❌ Error verifying account:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to verify Twilio account",
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Fatal error testing Twilio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fatal error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}