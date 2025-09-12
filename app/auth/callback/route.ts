// @/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError.message);
      // Si hay un error, lo mandamos a la página de login con un mensaje.
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("message", "Error al validar la sesión. Intenta de nuevo.");
      return NextResponse.redirect(redirectUrl);
    }

    if (session) {
      // Si la sesión es válida, buscamos el perfil para revisar el estado del onboarding.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, onboarding_complete") // Solo necesitamos estos dos campos.
        .eq("id", session.user.id)
        .single();

      if (profileError) {
         console.error("Error fetching profile from callback:", profileError.message);
         // Si no se encuentra el perfil, algo salió mal.
         const redirectUrl = new URL("/auth/login", request.url);
         redirectUrl.searchParams.set("message", "No se pudo encontrar tu perfil.");
         return NextResponse.redirect(redirectUrl);
      }

      // Esta es la decisión clave:
      if (profile.onboarding_complete) {
        // Si el onboarding está completo, lo mandamos a su dashboard.
        return NextResponse.redirect(new URL(`/dashboard/${profile.id}`, request.url));
      } else {
        // Si no está completo, lo mandamos a la página de bienvenida.
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // Si no hay 'code' o algo más falla, lo mandamos a la página de login.
  const redirectUrl = new URL("/auth/login", request.url);
  redirectUrl.searchParams.set("message", "El enlace de autenticación es inválido.");
  return NextResponse.redirect(redirectUrl);
}