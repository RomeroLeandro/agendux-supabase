import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Eliminar en orden para mantener integridad referencial
    const deletions = [
      // 1. Google Calendar tokens
      supabaseAdmin.from("gcal_tokens").delete().eq("user_id", user.id),

      // 2. Appointments
      supabaseAdmin.from("appointments").delete().eq("user_id", user.id),

      // 3. Patients
      supabaseAdmin.from("patients").delete().eq("user_id", user.id),

      // 4. Services
      supabaseAdmin.from("services").delete().eq("user_id", user.id),

      // 5. Messages
      supabaseAdmin
        .from("messages")
        .delete()
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),

      // 6. User integrations (si existe)
      supabaseAdmin.from("user_integrations").delete().eq("user_id", user.id),

      // 7. Profile
      supabaseAdmin.from("profiles").delete().eq("id", user.id),
    ];

    // Ejecutar todas las eliminaciones
    await Promise.all(deletions);

    // Eliminar usuario de auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
