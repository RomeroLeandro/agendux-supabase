export {};// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   try {
//     const supabase = await createClient();
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const limit = parseInt(searchParams.get("limit") || "50");
//     const appointmentId = searchParams.get("appointment_id");

//     let query = supabase
//       .from("whatsapp_messages")
//       .select(
//         `
//         *,
//         appointments(
//           id,
//           appointment_datetime,
//           patients(full_name, phone),
//           services(name)
//         )
//       `
//       )
//       .eq("profile_id", user.id)
//       .order("sent_at", { ascending: false })
//       .limit(limit);

//     if (appointmentId) {
//       query = query.eq("appointment_id", parseInt(appointmentId));
//     }

//     const { data: messages, error } = await query;

//     if (error) throw error;

//     return NextResponse.json({
//       success: true,
//       messages: messages || [],
//       total: messages?.length || 0,
//     });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch messages" },
//       { status: 500 }
//     );
//   }
// }
