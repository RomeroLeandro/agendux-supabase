import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json([]);
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("gcal_tokens")
      .select("refresh_token")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData?.refresh_token) {
      return NextResponse.json([]);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/gcal-callback`
    );

    oauth2Client.setCredentials({ refresh_token: tokenData.refresh_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error in fetch-gcal-events:", error);
    return NextResponse.json([]);
  }
}
