"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Card } from "./ui/card";
import Image from "next/image";
import Logo from "@/assets/Logo.webp";

export function SignUpForm({}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error";
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full text-center space-y-4">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <Typography variant="heading-lg" className="text-foreground">
            ¡Revisa tu correo!
          </Typography>
          <Typography
            variant="body-md"
            className="text-muted-foreground max-w-sm mx-auto"
          >
            Te hemos enviado un enlace a <b>{email}</b>. Por favor, haz clic en
            él para activar tu cuenta.
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className=" bg-background flex items-center justify-center ">
      <Card className="w-full space-y-6 min-w-[420px]">
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
          <Typography variant="heading-lg" className="text-foreground">
            Crea tu cuenta
          </Typography>
          <Typography variant="body-md" className="text-muted-foreground">
            Comienza a gestionar tu agenda de forma inteligente
          </Typography>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-6">
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
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma tu contraseña"
                  className="pl-10 pr-10"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary mt-0.5"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-5"
              >
                Acepto los{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
              </Label>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Typography variant="body-sm" className="text-destructive">
                  {error}
                </Typography>
              </div>
            )}

            {/* Sign up button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background dark:bg-card px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          {/* Google signup */}
          <Button
            type="button"
            className="w-full hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 bg-none text-foreground flex items-center justify-center shadow-none gap-2"
            onClick={handleGoogleSignUp}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Registrarse con Google
          </Button>

          {/* Login link */}
          <div className="text-center">
            <Typography variant="body-sm" className="text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
}
