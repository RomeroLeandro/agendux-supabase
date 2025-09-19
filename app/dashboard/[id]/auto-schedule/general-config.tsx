"use client";

import { useState, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useCallback } from "react";

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profession_id?: number;
}

interface AutoAgendaConfig {
  id?: string;
  user_id: string;
  is_active: boolean;
  url_slug: string;
  page_title: string;
  page_description: string;
  max_days_advance: number;
  min_hours_advance: number;
  max_appointments_per_day: number;
}

interface GeneralConfigProps {
  config: AutoAgendaConfig | null;
  profile: Profile | null;
  userId: string;
  bookingUrl: string;
}

export function GeneralConfig({
  config,
  profile,
  userId,
  bookingUrl,
}: GeneralConfigProps) {
  const [isPending, startTransition] = useTransition();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{
    available: boolean | null;
    message: string;
  }>({ available: null, message: "" });

  const supabase = createClient();

  const [formData, setFormData] = useState({
    is_active: true,
    url_slug: "",
    page_title: "",
    page_description: "",
    max_days_advance: 30,
    min_hours_advance: 2,
    max_appointments_per_day: 8,
  });

  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 3) {
        setSlugAvailability({
          available: false,
          message: "La URL debe tener al menos 3 caracteres",
        });
        return;
      }

      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        setSlugAvailability({
          available: false,
          message: "Solo se permiten letras minúsculas, números y guiones",
        });
        return;
      }

      setIsCheckingSlug(true);

      try {
        const { data, error } = await supabase
          .from("auto_agenda_config")
          .select("user_id")
          .eq("url_slug", slug)
          .single();

        if (error && error.code === "PGRST116") {
          setSlugAvailability({ available: true, message: "URL disponible" });
        } else if (data && data.user_id === userId) {
          setSlugAvailability({
            available: true,
            message: "Esta es tu URL actual",
          });
        } else if (data) {
          setSlugAvailability({
            available: false,
            message: "Esta URL ya está en uso",
          });
        }
      } catch {
        setSlugAvailability({
          available: null,
          message: "Error al verificar disponibilidad",
        });
      } finally {
        setIsCheckingSlug(false);
      }
    },
    [supabase, userId]
  );

  useEffect(() => {
    if (config) {
      setFormData({
        is_active: config.is_active,
        url_slug: config.url_slug,
        page_title: config.page_title,
        page_description: config.page_description,
        max_days_advance: config.max_days_advance,
        min_hours_advance: config.min_hours_advance,
        max_appointments_per_day: config.max_appointments_per_day,
      });
      setSlugAvailability({
        available: true,
        message: "Esta es tu URL actual",
      });
    } else {
      const firstName = profile?.first_name || "Dr.";
      const lastName = profile?.last_name || "Profesional";
      const defaultSlug =
        `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(
          /\s+/g,
          "-"
        );

      setFormData({
        is_active: true,
        url_slug: defaultSlug,
        page_title: `${firstName} ${lastName} - Médico General`,
        page_description:
          "Agenda tu cita médica de forma rápida y sencilla. Atención personalizada y profesional.",
        max_days_advance: 30,
        min_hours_advance: 2,
        max_appointments_per_day: 8,
      });

      checkSlugAvailability(defaultSlug);
    }
    setIsInitialized(true);
  }, [config, profile, checkSlugAvailability]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "url_slug" && typeof value === "string") {
      const cleanSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-");
      if (cleanSlug !== value) {
        setFormData((prev) => ({ ...prev, url_slug: cleanSlug }));
      }

      const timeoutId = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleSave = async () => {
    if (!slugAvailability.available) {
      alert("Por favor corrige la URL antes de guardar");
      return;
    }

    startTransition(async () => {
      try {
        if (config?.id) {
          const { error } = await supabase
            .from("auto_agenda_config")
            .update(formData)
            .eq("id", config.id);

          if (error) {
            if (error.code === "23505") {
              alert("Esta URL ya está en uso por otro profesional");
              return;
            }
            throw error;
          }
        } else {
          const { error } = await supabase.from("auto_agenda_config").insert({
            ...formData,
            user_id: userId,
          });

          if (error) {
            if (error.code === "23505") {
              alert("Esta URL ya está en uso por otro profesional");
              return;
            }
            throw error;
          }
        }

        alert("Configuración guardada exitosamente");
        window.location.reload();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "Error desconocido";
        alert("Error al guardar la configuración: " + errorMessage);
      }
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isDisabled = !formData.is_active;

  return (
    <div className="space-y-6">
      {/* Configuración General */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">⚙️</span>
          </div>
          <Typography variant="heading-lg" className="font-semibold">
            Configuración General
          </Typography>
        </div>
        <Typography variant="body-sm" className="text-muted-foreground mb-6">
          Configuración básica de tu página pública
        </Typography>

        <div className="space-y-6">
          {/* Estado de la Auto-Agenda */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-lg" className="font-medium mb-1">
                  Estado de la Auto-Agenda
                </Typography>
                <Typography variant="body-sm" className="text-muted-foreground">
                  Los pacientes pueden agendar citas
                </Typography>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  handleInputChange("is_active", checked)
                }
              />
            </div>
          </Card>

          {/* URL Personalizada */}
          <div className="space-y-2">
            <Label htmlFor="url_slug">URL Personalizada</Label>
            <div className="flex">
              <span
                className={`inline-flex items-center px-3 rounded-l-md border border-r-0 border-border text-sm ${
                  isDisabled
                    ? "bg-muted/50 text-muted-foreground/50"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                agendux.com/
              </span>
              <Input
                id="url_slug"
                value={formData.url_slug}
                onChange={(e) => handleInputChange("url_slug", e.target.value)}
                disabled={isDisabled}
                className={`rounded-l-none ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  slugAvailability.available === false
                    ? "border-red-500"
                    : slugAvailability.available === true
                    ? "border-green-500"
                    : ""
                }`}
              />
              <div className="flex items-center px-3 border border-l-0 border-border rounded-r-md bg-muted">
                {isCheckingSlug ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : slugAvailability.available === true ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : slugAvailability.available === false ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            </div>
            <Typography
              variant="body-sm"
              className={`${
                slugAvailability.available === false
                  ? "text-red-600"
                  : slugAvailability.available === true
                  ? "text-green-600"
                  : isDisabled
                  ? "text-muted-foreground/50"
                  : "text-muted-foreground"
              }`}
            >
              {slugAvailability.message ||
                "Esta será la URL que compartirás con tus pacientes"}
            </Typography>
          </div>

          {/* Título de la Página */}
          <div className="space-y-2">
            <Label
              htmlFor="page_title"
              className={isDisabled ? "text-muted-foreground/50" : ""}
            >
              Título de la Página
            </Label>
            <Input
              id="page_title"
              value={formData.page_title}
              onChange={(e) => handleInputChange("page_title", e.target.value)}
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label
              htmlFor="page_description"
              className={isDisabled ? "text-muted-foreground/50" : ""}
            >
              Descripción
            </Label>
            <Textarea
              id="page_description"
              rows={3}
              value={formData.page_description}
              onChange={(e) =>
                handleInputChange("page_description", e.target.value)
              }
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>

      {/* Reglas de Reserva */}
      <div className={isDisabled ? "opacity-50" : ""}>
        <Typography
          variant="heading-lg"
          className={`font-semibold mb-2 ${
            isDisabled ? "text-muted-foreground/50" : ""
          }`}
        >
          Reglas de Reserva
        </Typography>
        <Typography
          variant="body-sm"
          className={`mb-6 ${
            isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
          }`}
        >
          Configura las limitaciones para las citas
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="max_days_advance"
              className={isDisabled ? "text-muted-foreground/50" : ""}
            >
              Días de anticipación máxima
            </Label>
            <Input
              id="max_days_advance"
              type="number"
              value={formData.max_days_advance}
              onChange={(e) =>
                handleInputChange(
                  "max_days_advance",
                  parseInt(e.target.value) || 30
                )
              }
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="min_hours_advance"
              className={isDisabled ? "text-muted-foreground/50" : ""}
            >
              Horas mínimas de anticipación
            </Label>
            <Input
              id="min_hours_advance"
              type="number"
              value={formData.min_hours_advance}
              onChange={(e) =>
                handleInputChange(
                  "min_hours_advance",
                  parseInt(e.target.value) || 2
                )
              }
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="max_appointments_per_day"
              className={isDisabled ? "text-muted-foreground/50" : ""}
            >
              Máximo de citas por día
            </Label>
            <Input
              id="max_appointments_per_day"
              type="number"
              value={formData.max_appointments_per_day}
              onChange={(e) =>
                handleInputChange(
                  "max_appointments_per_day",
                  parseInt(e.target.value) || 8
                )
              }
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>

      {/* Indicador de estado cuando está desactivado */}
      {!formData.is_active && (
        <Card className="p-4 bg-red-50 border-red-200">
          <Typography variant="body-sm" className="text-red-800 mb-2">
            <strong>⚠️ Auto-Agenda Desactivada</strong>
          </Typography>
          <Typography variant="body-sm" className="text-red-700">
            Tu página de reservas no está disponible para los pacientes. La URL
            devolverá un error 404 hasta que actives la auto-agenda.
          </Typography>
        </Card>
      )}

      {/* Vista previa de URL solo cuando está activo */}
      {formData.is_active && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <Typography variant="body-sm" className="text-blue-800 mb-2">
            <strong>✅ Auto-Agenda Activa</strong>
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            Los pacientes pueden agendar citas en:{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">{bookingUrl}</code>
          </Typography>
        </Card>
      )}

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending || !slugAvailability.available}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
