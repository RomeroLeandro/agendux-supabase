"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Palette, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AutoAgendaConfig } from "@/app/types";

interface DesignConfigProps {
  userId: string;
  config: AutoAgendaConfig | null;
}

export function DesignConfig({ userId, config }: DesignConfigProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#5A67D8");
  const [theme, setTheme] = useState("light");
  const [uploading, setUploading] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    if (config) {
      setLogoUrl(config.logo_url || null);
      setPrimaryColor(config.primary_color || "#5A67D8");
      setTheme(config.theme || "light");
    }
  }, [config]);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Debes seleccionar una imagen para subir.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(filePath);
      setLogoUrl(publicUrl);
    } catch (error) {
      alert("Error al subir el logo.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
      try {
        const { error } = await supabase
          .from("auto_agenda_config")
          .update({
            logo_url: logoUrl,
            primary_color: primaryColor,
            theme: theme,
          })
          .eq("user_id", userId);

        if (error) throw error;
        alert("Diseño guardado correctamente.");
      } catch (error) {
        alert("Error al guardar el diseño.");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
          <Palette size={20} className="text-pink-600" />
        </div>
        <div>
          <Typography variant="heading-lg" className="font-semibold">
            Diseño de la Página
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Personaliza la apariencia de tu página de reservas.
          </Typography>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo de la empresa</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <Typography
                  variant="body-xs"
                  className="text-muted-foreground text-center"
                >
                  Sin logo
                </Typography>
              )}
            </div>
            <div>
              <Button>
                <label htmlFor="logo-upload">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Subiendo..." : "Subir imagen"}
                </label>
              </Button>
              <input
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
              <Typography
                variant="body-xs"
                className="text-muted-foreground mt-2"
              >
                Recomendado: 200x200px, PNG o JPG.
              </Typography>
            </div>
          </div>
        </div>

        {/* Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="primary-color">Color Principal</Label>
          <div className="flex items-center gap-2">
            <Input
              id="primary-color"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="p-1 h-10 w-14"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-28"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
