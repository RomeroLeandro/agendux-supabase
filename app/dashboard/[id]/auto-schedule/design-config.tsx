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
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Palette size={20} className="text-primary" />
        </div>
        <div>
          <Typography variant="heading-lg" className="font-semibold p-0">
            Diseño de la página
          </Typography>
          <Typography
            variant="body-sm"
            className="text-muted-foreground p-0 mt-0.5"
          >
            Personalizá la apariencia de tu página de reservas.
          </Typography>
        </div>
      </div>

      <Card className="p-6 space-y-6 border-border/70 shadow-sm">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Logo de la empresa</Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-24 h-24 rounded-xl border border-dashed border-muted flex items-center justify-center overflow-hidden bg-muted/60">
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
                  className="text-muted-foreground text-center px-2"
                >
                  Sin logo
                </Typography>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="relative justify-start"
              >
                <label
                  htmlFor="logo-upload"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? "Subiendo..." : "Subir imagen"}</span>
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
                className="text-muted-foreground p-0"
              >
                Recomendado: 200x200px, formato PNG o JPG.
              </Typography>
            </div>
          </div>
        </div>

        {/* Primary Color */}
        <div className="space-y-3">
          <Label htmlFor="primary-color" className="text-sm font-medium">
            Color principal
          </Label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id="primary-color"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-14 p-1 cursor-pointer rounded-md border border-border bg-background"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-32"
            />
            <div
              className="h-8 w-16 rounded-md border border-border"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
          <Typography variant="body-xs" className="text-muted-foreground p-0">
            Usá un color en formato HEX, por ejemplo: <code>#5A67D8</code>.
          </Typography>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          variant="primary"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
