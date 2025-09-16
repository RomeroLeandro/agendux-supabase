import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("🔍 GCAL CALLBACK START");
  console.log("🔍 Code received:", !!code);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    console.log("🔍 Exchanging code for session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    console.log("🔍 Exchange result:", {
      hasSession: !!session,
      hasRefreshToken: !!session?.provider_refresh_token,
      error: error?.message,
    });

    if (!error && session?.provider_refresh_token) {
      console.log("✅ Valid session and refresh token obtained");
      console.log("✅ User ID:", session.user.id);
      console.log("✅ Token length:", session.provider_refresh_token.length);

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      console.log("🔍 Environment check:");
      console.log(
        "- SUPABASE_URL exists:",
        !!process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      console.log(
        "- SERVICE_ROLE_KEY exists:",
        !!process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      try {
        console.log("🔍 Attempting to upsert token...");

        const { data, error: insertError } = await supabaseAdmin
          .from("gcal_tokens")
          .upsert({
            user_id: session.user.id,
            refresh_token: session.provider_refresh_token,
            updated_at: new Date().toISOString(),
          })
          .select();

        console.log("🔍 Upsert result:", {
          data,
          error: insertError?.message,
          errorDetails: insertError,
        });

        if (insertError) {
          console.error("❌ Upsert failed:", insertError);
        } else {
          console.log("✅ Token saved successfully");
          console.log("✅ Saved data:", data);
        }

        // Verificar que se guardó correctamente
        const { data: verifyData, error: verifyError } = await supabaseAdmin
          .from("gcal_tokens")
          .select("*")
          .eq("user_id", session.user.id);

        console.log("🔍 Verification query:", {
          data: verifyData,
          error: verifyError?.message,
        });
      } catch (dbError) {
        console.error("💥 Database operation failed:", dbError);
      }

      const referer = request.headers.get("referer");
      let redirectUrl = `${origin}/dashboard/${session.user.id}/calendar`;

      if (referer) {
        if (referer.includes("/quotes/new")) {
          redirectUrl = `${origin}/quotes/new`;
        } else if (referer.includes("/calendar")) {
          redirectUrl = `${origin}/dashboard/${session.user.id}/calendar`;
        }
      }

      redirectUrl += `?gcal_connected=true&timestamp=${Date.now()}&force_refresh=1`;

      console.log("✅ Redirecting to:", redirectUrl);
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("❌ Session exchange failed:", {
        error,
        hasSession: !!session,
      });
    }
  } else {
    console.log("❌ No code parameter received");
  }

  console.log("🔍 GCAL CALLBACK END - Redirecting to dashboard");
  return NextResponse.redirect(`${origin}/dashboard`);
}
