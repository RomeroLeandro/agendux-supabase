"use client";

import { useState, useTransition, useEffect } from "react";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  id?: number;
  auth_users_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profession_id?: number;
  professions?: { id: number; category: string; name: string };
}

interface Profession {
  id: number;
  category: string;
  name: string;
}

interface ProfileSettingsProps {
  profile: Profile | null;
  professions: Profession[];
  userId: string;
}

export function ProfileSettings({
  profile,
  professions,
}: ProfileSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [userEmail, setUserEmail] = useState("");
  const supabase = createClient();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    profession_id: "",
  });

  // Cargar datos del perfil cuando el componente se monta
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        profession_id: profile.profession_id?.toString() || "",
      });
    }
  }, [profile]);

  // Cargar email del usuario
  useEffect(() => {
    const getUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, [supabase]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      try {
        console.log("=== SAVING PROFILE (by ID) ===");

        // Si tienes el ID del perfil, úsalo directamente
        if (profile?.id) {
          const { data, error } = await supabase
            .from("profiles")
            .update({
              first_name: formData.first_name.trim(),
              last_name: formData.last_name.trim(),
              phone: formData.phone.trim(),
              profession_id: formData.profession_id
                ? parseInt(formData.profession_id)
                : null,
            })
            .eq("id", profile.id)
            .select();

          console.log("Update by ID response:", { data, error });

          if (error) throw error;
          setShowSuccessDialog(true);
        } else {
          throw new Error("No se encontró el ID del perfil");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Typography variant="heading-lg" className="font-semibold mb-2">
          Perfil Profesional
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          Esta información se mostrará en la página pública de auto-agenda.
        </Typography>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder="Juan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder="Pérez"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={userEmail}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+54 9 11 1234-5678"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">Especialidad</Label>
          <Select
            value={formData.profession_id}
            onValueChange={(value) => handleInputChange("profession_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar especialidad..." />
            </SelectTrigger>
            <SelectContent>
              {professions.map((profession) => (
                <SelectItem
                  key={profession.id}
                  value={profession.id.toString()}
                >
                  {profession.name} ({profession.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">
              ¡Perfil Actualizado!
            </DialogTitle>
            <DialogDescription className="text-center">
              Los cambios en tu perfil profesional han sido guardados
              correctamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
