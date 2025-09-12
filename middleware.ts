// middleware.ts (en la raíz de tu proyecto)

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Creamos una respuesta base que podemos modificar
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Creamos el cliente de Supabase para el middleware (compatible con Edge)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Si una cookie necesita ser seteada, clonamos las cabeceras y la respuesta
          const newHeaders = new Headers(request.headers);
          const newRequest = new NextRequest(request.nextUrl, {
            headers: newHeaders,
          });
          response = NextResponse.next({ request: newRequest });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Si una cookie necesita ser eliminada, hacemos lo mismo
          const newHeaders = new Headers(request.headers);
          const newRequest = new NextRequest(request.nextUrl, {
            headers: newHeaders,
          });
          response = NextResponse.next({ request: newRequest });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Obtenemos el usuario para saber si está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Definimos las rutas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/onboarding"];

  // Lógica de protección: si no hay usuario y la ruta es protegida...
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    // ...lo redirigimos a la página de login.
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname); // Opcional: para redirigir de vuelta después
    return NextResponse.redirect(loginUrl);
  }

  // Devolvemos la respuesta final. Es crucial para mantener la sesión del usuario.
  return response;
}

// Configuración para que el middleware se ejecute en las rutas necesarias
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
