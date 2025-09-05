"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.webp";
import { Card } from "./ui/card";
import Link from "next/link";

export function ResetPasswordForm({}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleTokenValidation = async () => {
      // Verificar si hay errores en la URL
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        console.error("Reset password error:", error, errorDescription);
        setError(
          "El enlace ha expirado o es inválido. Por favor, solicita un nuevo enlace de restablecimiento."
        );
        return;
      }

      // Buscar token de recovery
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      console.log("Token found:", token ? "yes" : "no");
      console.log("Type:", type);

      if (token && type === "recovery") {
        console.log("Verifying recovery token...");
        const supabase = createClient();

        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "recovery",
          });

          if (!error) {
            console.log("Token verified successfully");
            setIsValidToken(true);
          } else {
            console.error("Error verifying token:", error);
            setError("Error al validar el enlace: " + error.message);
          }
        } catch (err) {
          console.error("Error with token verification:", err);
          setError("Error al procesar el enlace.");
        }
      } else {
        console.log("No valid token found. Token:", token, "Type:", type);
        setError(
          "Enlace inválido. No se encontró un token de restablecimiento válido."
        );
      }
    };

    // Dar tiempo para que la página cargue completamente
    const timer = setTimeout(handleTokenValidation, 500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const translateError = (error: string) => {
    const errorTranslations: { [key: string]: string } = {
      "Password should be at least 6 characters":
        "La contraseña debe tener al menos 6 caracteres",
      "New password should be different from the old password":
        "La nueva contraseña debe ser diferente a la anterior",
      "Invalid or expired token": "Token inválido o expirado",
      "Unable to validate email address: invalid format":
        "No se puede validar la dirección de email: formato inválido",
      "Session not found": "Sesión no encontrada",
      "Database connection error": "Error de conexión a la base de datos",
    };

    return errorTranslations[error] || error;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error";
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Typography variant="body-md" className="text-muted-foreground">
            Verificando enlace...
          </Typography>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
            <Typography variant="heading-lg" className="text-foreground">
              ¡Contraseña actualizada!
            </Typography>
            <Typography variant="body-md" className="text-muted-foreground">
              Tu contraseña se ha cambiado exitosamente
            </Typography>
          </div>

          {/* Success card */}
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>

              <div className="space-y-2">
                <Typography variant="heading-md" className="text-foreground">
                  Contraseña restablecida
                </Typography>
                <Typography variant="body-md" className="text-muted-foreground">
                  Serás redirigido al dashboard en unos segundos...
                </Typography>
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Ir al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
          <Typography variant="heading-lg" className="text-foreground">
            Nueva contraseña
          </Typography>
          <Typography variant="body-md" className="text-muted-foreground">
            Ingresa tu nueva contraseña
          </Typography>
        </div>

        {/* Formulario */}
        <div className=" space-y-6">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Nueva Contraseña
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
                Confirmar Nueva Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma tu nueva contraseña"
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

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Typography variant="body-sm" className="text-destructive">
                  {error}
                </Typography>
              </div>
            )}

            {/* Update password button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Actualizando contraseña..."
                : "Actualizar contraseña"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
