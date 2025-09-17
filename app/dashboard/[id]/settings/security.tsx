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
        // Cerrar sesión y redirigir
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
    <div className="space-y-8">
      {/* Cambiar Contraseña */}
      <div>
        <Typography variant="heading-lg" className="font-semibold mb-2">
          Cambiar Contraseña
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground mb-6">
          Para tu seguridad, te recomendamos usar una contraseña segura.
        </Typography>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
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
            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
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
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUpdatingPassword ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      </div>

      {/* Opciones de Seguridad */}
      <div>
        <Typography variant="heading-lg" className="font-semibold mb-2">
          Opciones de Seguridad
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground mb-6">
          Configuraciones adicionales de seguridad para tu cuenta.
        </Typography>

        <div className="space-y-4">
          <Card className="p-4 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <Typography
                  variant="body-md"
                  className="font-medium text-red-600"
                >
                  Eliminar Cuenta
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Esta acción no se puede deshacer. Se eliminarán todos tus
                  datos.
                </Typography>
              </div>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmación para eliminar cuenta */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <DialogTitle className="text-red-600">
                Eliminar Cuenta Permanentemente
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
                Para confirmar, escribe <strong>ELIMINAR</strong> en mayúsculas:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Escribe ELIMINAR"
                className="border-red-300 focus:border-red-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setConfirmationText("");
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== "ELIMINAR"}
            >
              {isDeleting ? "Eliminando cuenta..." : "Eliminar mi cuenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
