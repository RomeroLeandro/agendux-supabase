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
import { Card } from "@/components/ui/card";

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

  console.log("=== PROFILE-SETTINGS DEBUG ===");
  console.log("Profile prop:", profile);
  console.log("Current form data:", formData);
  console.log("Component rendered at:", new Date().toISOString());

  useEffect(() => {
    console.log("=== USEEFFECT TRIGGERED ===");
    console.log("Profile in useEffect:", profile);

    if (profile) {
      console.log("Profile exists, setting form data...");
      const newFormData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        profession_id: profile.profession_id?.toString() || "",
      };
      console.log("New form data:", newFormData);
      setFormData(newFormData);
    } else {
      console.log("No profile data available");
    }
  }, [profile]);

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
    <div className="space-y-6">
      {/* encabezado */}
      <div className="mb-2">
        <Typography variant="heading-lg" className="font-semibold mb-1">
          Perfil Profesional
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          Esta información se mostrará en la página pública de auto-agenda.
        </Typography>
      </div>

      <Card className="max-w-4xl p-6 space-y-6">
        {/* nombre / apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* email / teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={userEmail}
              disabled
              className="bg-muted text-muted-foreground"
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

        {/* especialidad */}
        <div className="space-y-2">
          <Label htmlFor="profession">Especialidad</Label>
          <Select
            value={formData.profession_id}
            onValueChange={(value) => handleInputChange("profession_id", value)}
          >
            <SelectTrigger id="profession">
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

        {/* botón guardar */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="min-w-[180px]"
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </Card>

      {/* diálogo éxito */}
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
              className="min-w-[120px]"
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
