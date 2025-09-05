"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm({}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateError = (error: string) => {
    const errorTranslations: { [key: string]: string } = {
      "Unable to validate email address: invalid format":
        "No se puede validar la dirección de email: formato inválido",
      "Invalid email": "Email inválido",
      "Email rate limit exceeded":
        "Límite de emails excedido, intenta más tarde",
      "Too many requests": "Demasiadas solicitudes, intenta más tarde",
      "User not found": "Usuario no encontrado",
      "Database connection error": "Error de conexión a la base de datos",
    };

    return errorTranslations[error] || error;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error";
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Typography
                  variant="heading-md"
                  className="text-white font-bold"
                >
                  A
                </Typography>
              </div>
              <Typography variant="heading-lg" className="text-primary">
                genduX
              </Typography>
            </div>
            <Typography variant="heading-lg" className="text-foreground">
              Correo enviado
            </Typography>
            <Typography variant="body-md" className="text-muted-foreground">
              Revisa tu bandeja de entrada y haz clic en el enlace para
              restablecer tu contraseña
            </Typography>
          </div>

          {/* Success card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-accent" />
              </div>

              <div className="space-y-2">
                <Typography variant="heading-md" className="text-foreground">
                  Enlace enviado a tu email
                </Typography>
                <Typography variant="body-md" className="text-muted-foreground">
                  Hemos enviado un enlace de restablecimiento a:
                </Typography>
                <Typography
                  variant="body-md"
                  className="text-primary font-medium"
                >
                  {email}
                </Typography>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <Typography variant="body-sm" className="text-muted-foreground">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de
                  spam o intenta nuevamente.
                </Typography>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Enviar otro enlace
              </Button>

              <Link href="/auth/login" className="block">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3">
              <Typography variant="heading-md" className="text-white font-bold">
                A
              </Typography>
            </div>
            <Typography variant="heading-lg" className="text-primary">
              genduX
            </Typography>
          </div>
          <Typography variant="heading-lg" className="text-foreground">
            ¿Olvidaste tu contraseña?
          </Typography>
          <Typography variant="body-md" className="text-muted-foreground">
            Ingresa tu email y te enviaremos un enlace para restablecerla
          </Typography>
        </div>

        {/* Formulario */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-6">
          <form onSubmit={handleResetPassword} className="space-y-6">
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

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Typography variant="body-sm" className="text-destructive">
                  {error}
                </Typography>
              </div>
            )}

            {/* Reset button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Enviando enlace..."
                : "Enviar enlace de restablecimiento"}
            </Button>
          </form>

          {/* Back to login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
