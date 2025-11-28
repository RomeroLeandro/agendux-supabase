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

  // INIT + verificación slug (NO se toca lógica)
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
          .select("url_slug")
          .eq("url_slug", slug)
          .limit(1);

        if (error) throw error;

        if (!data || data.length === 0) {
          setSlugAvailability({
            available: true,
            message: "URL disponible",
          });
          return;
        }

        setSlugAvailability({
          available: false,
          message: "Esta URL ya está en uso",
        });
      } catch (error) {
        console.error("Error al verificar slug:", error);
        setSlugAvailability({
          available: null,
          message: "Error al verificar disponibilidad",
        });
      } finally {
        setIsCheckingSlug(false);
      }
    },
    [supabase]
  );

  const handleSave = async () => {
    console.log("handleSave called");

    if (
      slugAvailability.available === false &&
      formData.url_slug !== config?.url_slug
    ) {
      alert("Por favor corrige la URL antes de guardar");
      return;
    }

    startTransition(async () => {
      try {
        console.log("=== INICIANDO GUARDADO ===");
        console.log("Config:", JSON.stringify(config, null, 2));
        console.log("FormData:", JSON.stringify(formData, null, 2));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log("User ID:", user?.id);

        if (config?.id) {
          const updateData = {
            is_active: formData.is_active,
            url_slug: formData.url_slug,
            page_title: formData.page_title,
            page_description: formData.page_description,
            max_days_advance: formData.max_days_advance,
            min_hours_advance: formData.min_hours_advance,
            max_appointments_per_day: formData.max_appointments_per_day,
          };

          const { data, error } = await supabase
            .from("auto_agenda_config")
            .update(updateData)
            .eq("id", config.id)
            .select();

          if (error) throw error;

          alert("✅ Configuración guardada exitosamente");
          window.location.reload();
        } else {
          const { data, error } = await supabase
            .from("auto_agenda_config")
            .insert({
              ...formData,
              user_id: userId,
            })
            .select();

          if (error) throw error;

          alert("✅ Configuración creada exitosamente");
          window.location.reload();
        }
      } catch (error: unknown) {
        console.error("=== ERROR CAPTURADO ===");
        console.error("Error object:", error);

        if (error && typeof error === "object" && "message" in error) {
          alert(
            `❌ Error al guardar: ${(error as { message: string }).message}`
          );
        } else {
          alert("❌ Error desconocido al guardar la configuración");
        }
      }
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isDisabled = !formData.is_active;

  // ---------- SOLO CAMBIOS DE LAYOUT / CLASES A PARTIR DE ACÁ ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">⚙️</span>
          </div>
          <Typography variant="heading-lg" className="font-semibold">
            Configuración General
          </Typography>
        </div>
        <Typography variant="body-sm" className="text-muted-foreground">
          Definí el estado de tu Auto-Agenda, tu URL pública y la información
          básica que verán tus pacientes.
        </Typography>
      </div>

      {/* Fila superior: Estado + Reglas (igual estructura que antes, solo más prolija) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Typography variant="body-lg" className="font-medium mb-1">
                Estado de la Auto-Agenda
              </Typography>
              <Typography
                variant="body-sm"
                className="text-muted-foreground max-w-md"
              >
                {formData.is_active
                  ? "Tus pacientes pueden agendar citas con este enlace."
                  : "La página pública está desactivada por el momento."}
              </Typography>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
            />
          </div>
        </Card>

        <Card
          className={`p-6 ${
            isDisabled ? "opacity-60" : ""
          } flex flex-col justify-between`}
        >
          <div>
            <Typography variant="heading-md" className="mb-1">
              Reglas de reserva
            </Typography>
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-4"
            >
              Definí cómo y cuándo tus pacientes pueden agendar nuevas citas.
            </Typography>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="max_days_advance"
                className={isDisabled ? "text-muted-foreground/60" : ""}
              >
                Días de anticipación máxima
              </Label>
              <Input
                id="max_days_advance"
                type="number"
                value={formData.max_days_advance}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_days_advance: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isDisabled}
                className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="min_hours_advance"
                className={isDisabled ? "text-muted-foreground/60" : ""}
              >
                Horas mínimas de anticipación
              </Label>
              <Input
                id="min_hours_advance"
                type="number"
                value={formData.min_hours_advance}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    min_hours_advance: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isDisabled}
                className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="max_appointments_per_day"
                className={isDisabled ? "text-muted-foreground/60" : ""}
              >
                Máximo de citas por día
              </Label>
              <Input
                id="max_appointments_per_day"
                type="number"
                value={formData.max_appointments_per_day}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_appointments_per_day: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isDisabled}
                className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Fila inferior: URL + textos a la izquierda, estado URL + botón a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* URL + título + descripción */}
        <Card className="p-6 space-y-5 lg:col-span-2">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url_slug">URL personalizada</Label>
            <div className="flex">
              <span
                className={`inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm ${
                  isDisabled
                    ? "bg-muted/50 text-muted-foreground/60 border-border/60"
                    : "bg-muted text-muted-foreground border-border"
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
                className={`rounded-none border-x-0 ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  slugAvailability.available === false
                    ? "border-red-500 focus-visible:ring-red-500/60"
                    : slugAvailability.available === true
                    ? "border-green-500 focus-visible:ring-green-500/60"
                    : ""
                }`}
              />
              <div className="flex items-center px-3 border border-l-0 border-border rounded-r-md bg-muted min-w-9 justify-center">
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
              variant="body-xs"
              className={`mt-1 ${
                slugAvailability.available === false
                  ? "text-red-600 font-medium"
                  : slugAvailability.available === true
                  ? "text-green-600 font-medium"
                  : isDisabled
                  ? "text-muted-foreground/60"
                  : "text-muted-foreground"
              }`}
            >
              {slugAvailability.message ||
                "Esta será la URL que compartirás con tus pacientes."}
            </Typography>

            {slugAvailability.available === false && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-800 leading-relaxed">
                  No podrás guardar mientras la URL esté en uso. Probá con:{" "}
                  <code className="bg-red-100 px-1 rounded">
                    {formData.url_slug}-2
                  </code>{" "}
                  o{" "}
                  <code className="bg-red-100 px-1 rounded">
                    {formData.url_slug}-pro
                  </code>
                  .
                </p>
              </div>
            )}
          </div>

          {/* Título página */}
          <div className="space-y-2">
            <Label
              htmlFor="page_title"
              className={isDisabled ? "text-muted-foreground/60" : ""}
            >
              Título de la página
            </Label>
            <Input
              id="page_title"
              value={formData.page_title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  page_title: e.target.value,
                }))
              }
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label
              htmlFor="page_description"
              className={isDisabled ? "text-muted-foreground/60" : ""}
            >
              Descripción
            </Label>
            <Textarea
              id="page_description"
              rows={3}
              value={formData.page_description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  page_description: e.target.value,
                }))
              }
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </Card>

        {/* Estado URL + botón guardar alineados a la derecha */}
        <div className="flex flex-col gap-4">
          {formData.is_active ? (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <Typography
                variant="body-sm"
                className="text-blue-800 mb-1 font-semibold"
              >
                ✅ Auto-Agenda activa
              </Typography>
              <Typography variant="body-sm" className="text-blue-700">
                Tus pacientes pueden agendar citas en:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                  {bookingUrl}
                </code>
              </Typography>
            </Card>
          ) : (
            <Card className="p-4 bg-red-50 border-red-200">
              <Typography
                variant="body-sm"
                className="text-red-800 mb-1 font-semibold"
              >
                ⚠️ Auto-Agenda desactivada
              </Typography>
              <Typography variant="body-sm" className="text-red-700">
                Tu página de reservas no está disponible. La URL devolverá un
                error 404 hasta que actives la Auto-Agenda.
              </Typography>
            </Card>
          )}

          <div className="mt-auto flex justify-end">
            <Button
              onClick={handleSave}
              disabled={
                isPending ||
                (slugAvailability.available === false &&
                  formData.url_slug !== config?.url_slug) ||
                isCheckingSlug
              }
              variant="primary"
            >
              {isPending
                ? "Guardando..."
                : isCheckingSlug
                ? "Verificando..."
                : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
