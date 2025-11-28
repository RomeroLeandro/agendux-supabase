"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Security() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const supabase = createClient();
  const router = useRouter();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        alert("Error al actualizar la contraseña: " + error.message);
      } else {
        alert("Contraseña actualizada correctamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      alert("Error al actualizar la contraseña");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== "ELIMINAR") {
      alert("Debes escribir 'ELIMINAR' para confirmar");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        await supabase.auth.signOut();
        router.push("/");
        alert("Tu cuenta ha sido eliminada exitosamente");
      } else {
        throw new Error(result.error || "Error al eliminar cuenta");
      }
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      alert(
        "Error al eliminar la cuenta. Por favor contacta al soporte técnico."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Cambiar Contraseña */}
      <section className="space-y-3">
        <div>
          <Typography variant="heading-lg" className="font-semibold mb-1">
            Seguridad
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Gestiona tu contraseña y la eliminación de tu cuenta.
          </Typography>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-1">
            <Typography variant="heading-sm" className="font-medium">
              Cambiar contraseña
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Para tu seguridad, te recomendamos usar una contraseña segura.
            </Typography>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdatingPassword}
              className="bg-purple-600 hover:bg-purple-700 min-w-[210px]"
            >
              {isUpdatingPassword ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </Card>
      </section>

      {/* Opciones de Seguridad */}
      <section className="space-y-4">
        <div>
          <Typography variant="heading-sm" className="font-semibold mb-1">
            Opciones de seguridad avanzada
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Configuraciones adicionales de seguridad para tu cuenta.
          </Typography>
        </div>

        <Card className="p-5 border-red-200 bg-red-50/60">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <Typography
                  variant="body-md"
                  className="font-semibold text-red-700"
                >
                  Eliminar cuenta
                </Typography>
              </div>
              <Typography
                variant="body-sm"
                className="text-sm text-red-700/90 mt-1"
              >
                Esta acción no se puede deshacer. Se eliminarán todos tus datos
                y no podrás recuperarlos.
              </Typography>
            </div>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              className="border border-red-500 text-red-600 bg-white hover:bg-red-50"
              variant="outline"
            >
              Eliminar cuenta
            </Button>
          </div>
        </Card>
      </section>

      {/* Dialog de confirmación para eliminar cuenta */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <DialogTitle className="text-red-600">
                Eliminar cuenta permanentemente
              </DialogTitle>
            </div>
            <DialogDescription>
              Esta acción eliminará permanentemente tu cuenta y todos los datos
              asociados. No podrás recuperar esta información.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Typography variant="body-sm" className="font-medium mb-2">
                Se eliminarán todos estos datos:
              </Typography>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Todas las citas programadas</li>
                <li>Información de pacientes</li>
                <li>Servicios configurados</li>
                <li>Mensajes y notificaciones</li>
                <li>Configuraciones personalizadas</li>
                <li>Integraciones con Google Calendar</li>
                <li>Tu perfil profesional</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Para confirmar, escribe{" "}
                <span className="font-semibold text-red-600">ELIMINAR</span> en
                mayúsculas:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Escribe ELIMINAR"
                className="border-red-300 focus-visible:ring-red-500"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setConfirmationText("");
              }}
              disabled={isDeleting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== "ELIMINAR"}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando cuenta..." : "Eliminar mi cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
