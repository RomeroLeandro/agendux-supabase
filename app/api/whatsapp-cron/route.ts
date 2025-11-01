import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SENDER_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/whatsapp-sender`;
const SENDER_AUTH_HEADER = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
const CRON_SECRET = process.env.CRON_SECRET;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function callSender(appointment_id: number, message_type: string) {
  console.log(
    `📤 Calling sender for appt [${appointment_id}], type [${message_type}]`
  );
  try {
    const res = await fetch(SENDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: SENDER_AUTH_HEADER,
      },
      body: JSON.stringify({ appointment_id, message_type }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `❌ Error calling sender for ${appointment_id}: ${res.status} ${errorText}`
      );
    } else {
      console.log(`✅ Successfully called sender for ${appointment_id}`);
    }
  } catch (e) {
    console.error(
      `❌ Fetch error calling sender for ${appointment_id}:`,
      (e as Error).message
    );
  }
}

export async function GET(request: Request) {
  // 1. Verificar autenticación
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error("❌ Unauthorized cron attempt");
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date().toISOString();
  console.log(`\n🚀 ======= CRON EXECUTION START =======`);
  console.log(`⏰ Timestamp: ${now}`);

  try {
    // 2. BUSCAR RECORDATORIO 1
    console.log("\n📋 Searching for Reminder 1...");
    const { data: r1Apps, error: r1Err } = await supabaseAdmin.rpc(
      "find_appointments_for_reminder_1",
      { now_time: now }
    );

    if (r1Err) {
      console.error("❌ Error in reminder_1:", r1Err.message);
    } else {
      console.log(
        `✅ Found ${(r1Apps || []).length} appointments for reminder_1`
      );
      for (const app of r1Apps || []) {
        await callSender(app.id, "reminder_1");
      }
    }

    // 3. BUSCAR RECORDATORIO 2
    console.log("\n📋 Searching for Reminder 2...");
    const { data: r2Apps, error: r2Err } = await supabaseAdmin.rpc(
      "find_appointments_for_reminder_2",
      { now_time: now }
    );

    if (r2Err) {
      console.error("❌ Error in reminder_2:", r2Err.message);
    } else {
      console.log(
        `✅ Found ${(r2Apps || []).length} appointments for reminder_2`
      );
      for (const app of r2Apps || []) {
        await callSender(app.id, "reminder_2");
      }
    }

    // 4. BUSCAR POST-CITA
    console.log("\n📋 Searching for Post-Appointment...");
    const { data: postApps, error: postErr } = await supabaseAdmin.rpc(
      "find_appointments_for_post_appointment",
      { now_time: now }
    );

    if (postErr) {
      console.error("❌ Error in post_appointment:", postErr.message);
    } else {
      console.log(
        `✅ Found ${(postApps || []).length} appointments for post_appointment`
      );
      for (const app of postApps || []) {
        await callSender(app.id, "post_appointment");
      }
    }

    console.log(`\n🏁 ======= CRON EXECUTION END =======\n`);

    return NextResponse.json(
      {
        success: true,
        message: "Cron ejecutado exitosamente",
        timestamp: now,
        results: {
          reminder_1: (r1Apps || []).length,
          reminder_2: (r2Apps || []).length,
          post_appointment: (postApps || []).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Fatal error in cron:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
