// export const runtime = "nodejs";
// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { cookies } from "next/headers";
// import { sendWhatsAppMessage, formatMessage } from "@/lib/twilio";

// export async function GET(req: Request) {
// const auth = req.headers.get("authorization");
// if (!auth || !auth.endsWith(process.env.CRON_SECRET || "test")) {
// return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }

// const cookieStore = cookies();
// const supabase = createClient(cookieStore);

// // Obtener configuraciones
// const { data: settings } = await supabase
// .from("whatsapp_settings")
// .select("*");

// const now = new Date();

// const results: any[] = [];

// for (const cfg of settings ?? []) {
// const rem1 = cfg.enable_reminder_1;
// const rem2 = cfg.enable_reminder_2;

// const h1 = cfg.hours_before_reminder_1 ?? 24;
// const h2 = cfg.hours_before_reminder_2 ?? 1;

// // Buscar citas del usuario
// const { data: appointments } = await supabase
//  .from("appointments")
// .select(
// *,
// patients(*),
// services(*),
// profiles:profile_id(*)
// )

// .eq("user_id", cfg.profile_id);

// for (const apt of appointments ?? []) {
// const date = new Date(apt.appointment_datetime);

// const diffHours = (date.getTime() - now.getTime()) / 1000 / 3600;

// let type: "reminder_1" | "reminder_2" | null = null;

// if (rem1 && diffHours <= h1 + 0.3 && diffHours >= h1 - 0.3)
//  type = "reminder_1";

// if (rem2 && diffHours <= h2 + 0.3 && diffHours >= h2 - 0.3)
//  type = "reminder_2";

// if (!type) continue;

// const template =
// type === "reminder_1"
//  ? "Hola [PACIENTE_NOMBRE], te recordamos tu turno de [SERVICIO_NOMBRE] el [FECHA_CITA] a las [HORA_CITA]."
//  : "Recordatorio final: tu turno de [SERVICIO_NOMBRE] es hoy
// [FECHA_CITA] a las [HORA_CITA].";

// const msg = formatMessage(template, {
// appointment: apt,
//  patient: apt.patients,
// service: apt.services,
// profile: apt.profiles,
// });

// const send = await sendWhatsAppMessage(apt.patients.phone, msg);

// await supabase.from("whatsapp_messages").insert({
// profile_id: cfg.profile_id,
//  appointment_id: apt.id,
// message_type: type,
//  recipient: apt.patients.phone,
//  body: msg,
// status: send.success ? "sent" : "failed",
//  twilio_sid: send.sid ?? null,
// error_message: send.error ?? null,
//  sent_at: new Date().toISOString(),
//  });

// results.push({
// appointment: apt.id,
// type,
// sent: send.success, });
// }
//  }

// return NextResponse.json({
// ok: true,
//  processed: results.length,
//  results, });
// }
