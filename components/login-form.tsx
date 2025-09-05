"use client";

// import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Card } from "./ui/card";
import Image from "next/image";
import Logo from "@/assets/Logo.webp";
import { FcGoogle } from "react-icons/fc";

export function LoginForm({}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const translateError = (error: string) => {
    const errorTranslations: { [key: string]: string } = {
      "User already registered": "El usuario ya está registrado",
      "Password should be at least 6 characters":
        "La contraseña debe tener al menos 6 caracteres",
      "Unable to validate email address: invalid format":
        "No se puede validar la dirección de email: formato inválido",
      "Invalid email": "Email inválido",
      "Signup disabled": "Registro deshabilitado",
      "Email rate limit exceeded": "Límite de emails excedido",
      "Database connection error": "Error de conexión a la base de datos",
      "Too many requests": "Demasiadas solicitudes, intenta más tarde",
      "Weak password": "Contraseña muy débil",
      "Invalid login credentials": "Credenciales de inicio de sesión inválidas",
      "Email not confirmed": "Email no confirmado",
      "User not found": "Usuario no encontrado",
      "Invalid password": "Contraseña inválida",
      "Account is disabled": "La cuenta está deshabilitada",
    };

    return errorTranslations[error] || error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error";
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="bg-background flex items-center justify-center">
      <Card className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/">
            <Image
              src={Logo}
              alt="Logo de Agendux"
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Typography
            variant="heading-lg"
            className="text-foreground font-adineuepro"
          >
            Bienvenido de vuelta
          </Typography>
          <Typography variant="body-md" className="text-muted-foreground">
            Inicia sesión para gestionar tu agenda
          </Typography>
        </div>

        {/* Formulario */}
        <div className=" space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground"
                >
                  Recordarme
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Typography variant="body-sm" className="text-destructive">
                  {error}
                </Typography>
              </div>
            )}

            {/* Login button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          {/* Google login */}
          <Button
            type="button"
            className="w-full hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 bg-none text-foreground flex items-center justify-center shadow-none gap-2"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={20} />
            Iniciar sesión con Google
          </Button>

          {/* Sign up link */}
          <div className="text-center">
            <Typography variant="body-sm" className="text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary hover:underline"
              >
                Regístrate aquí
              </Link>
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
}
