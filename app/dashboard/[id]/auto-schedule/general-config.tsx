"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Profile, AutoAgendaConfig } from "@/app/types";

interface FormDataState {
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

  const [formData, setFormData] = useState<FormDataState>({
    is_active: true,
    url_slug: "",
    page_title: "",
    page_description: "",
    max_days_advance: 30,
    min_hours_advance: 2,
    max_appointments_per_day: 8,
  });

  // El useEffect para inicializar los datos no cambia.
  useEffect(() => {
    const checkSlugAndInitForm = async (slugToCheck: string) => {
      if (!slugToCheck || slugToCheck.length < 3) {
        setSlugAvailability({
          available: false,
          message: "La URL debe tener al menos 3 caracteres",
        });
        return;
      }
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slugToCheck)) {
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
          .eq("url_slug", slugToCheck)
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
    };

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
    } else if (profile) {
      const firstName = profile.first_name || "Dr.";
      const lastName = profile.last_name || "Profesional";
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
      checkSlugAndInitForm(defaultSlug);
    }
    setIsInitialized(true);
  }, [config, profile, userId, supabase]);

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

  const handleSave = async () => {
    console.log("handleSave called"); // Para verificar que se ejecuta

    if (
      slugAvailability.available === false &&
      formData.url_slug !== config?.url_slug
    ) {
      alert("Por favor corrige la URL antes de guardar");
      return;
    }

    console.log("Validation passed, starting transition");

    startTransition(async () => {
      console.log("Inside transition");

      try {
        console.log("=== INICIANDO GUARDADO ===");
        console.log("Config:", JSON.stringify(config, null, 2));
        console.log("FormData:", JSON.stringify(formData, null, 2));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log("User ID:", user?.id);

        if (config?.id) {
          console.log("Attempting update...");

          const updateData = {
            is_active: formData.is_active,
            url_slug: formData.url_slug,
            page_title: formData.page_title,
            page_description: formData.page_description,
            max_days_advance: formData.max_days_advance,
            min_hours_advance: formData.min_hours_advance,
            max_appointments_per_day: formData.max_appointments_per_day,
          };

          console.log("Update data:", JSON.stringify(updateData, null, 2));

          const { data, error } = await supabase
            .from("auto_agenda_config")
            .update(updateData)
            .eq("id", config.id)
            .select();

          console.log("Update response:", { data, error });

          if (error) {
            throw error;
          }

          alert("✅ Configuración guardada exitosamente");
          window.location.reload();
        } else {
          console.log("Attempting insert...");

          const { data, error } = await supabase
            .from("auto_agenda_config")
            .insert({
              ...formData,
              user_id: userId,
            })
            .select();

          console.log("Insert response:", { data, error });

          if (error) {
            throw error;
          }

          alert("✅ Configuración creada exitosamente");
          window.location.reload();
        }
      } catch (error: unknown) {
        console.error("=== ERROR CAPTURADO ===");
        console.error("Error object:", error);

        // Type guard para manejar el error de forma segura
        if (error && typeof error === "object" && "message" in error) {
          console.error(
            "Error message:",
            (error as { message: string }).message
          );
          alert(
            `❌ Error al guardar: ${(error as { message: string }).message}`
          );
        } else {
          console.error("Error desconocido:", error);
          alert("❌ Error desconocido al guardar la configuración");
        }
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
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, is_active: checked }));
                }}
              />
            </div>
          </Card>

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
                onChange={(e) => {
                  const value = e.target.value;
                  const cleanSlug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                    .replace(/--+/g, "-");
                  setFormData((prev) => ({ ...prev, url_slug: cleanSlug }));
                  const timeoutId = setTimeout(() => {
                    checkSlugAvailability(cleanSlug);
                  }, 500);
                  return () => clearTimeout(timeoutId);
                }}
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
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  page_title: e.target.value,
                }));
              }}
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>

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
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  page_description: e.target.value,
                }));
              }}
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>

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
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  max_days_advance: parseInt(e.target.value) || 0,
                }));
              }}
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
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  min_hours_advance: parseInt(e.target.value) || 0,
                }));
              }}
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
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  max_appointments_per_day: parseInt(e.target.value) || 0,
                }));
              }}
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>

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

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={
            isPending ||
            (slugAvailability.available === false &&
              formData.url_slug !== config?.url_slug)
          }
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
