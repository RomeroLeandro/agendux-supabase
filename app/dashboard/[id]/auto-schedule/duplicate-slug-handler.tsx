"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DuplicateSlugHandlerProps {
  userId: string;
  currentConfig: {
    id: string;
    url_slug: string;
  } | null;
}

interface DuplicateInfo {
  hasDuplicate: boolean;
  duplicateCount: number;
  allConfigs: Array<{
    id: string;
    url_slug: string;
    user_id: string;
    created_at: string;
  }>;
}

export function DuplicateSlugHandler({
  userId,
  currentConfig,
}: DuplicateSlugHandlerProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(
    null
  );
  const [showDialog, setShowDialog] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkForDuplicates();
  }, [userId, currentConfig]);

  const checkForDuplicates = async () => {
    if (!currentConfig) {
      setIsChecking(false);
      return;
    }

    try {
      console.log("=== VERIFICANDO DUPLICADOS ===");
      console.log("User ID:", userId);
      console.log("Current config:", currentConfig);

      const { data, error } = await supabase
        .from("auto_agenda_config")
        .select("id, url_slug, user_id, created_at")
        .eq("url_slug", currentConfig.url_slug)
        .order("created_at", { ascending: true });

      console.log("Resultados de búsqueda:", { data, error });

      if (error) {
        console.error("Error al verificar duplicados:", error);
        setIsChecking(false);
        return;
      }

      if (data && data.length > 1) {
        console.log(
          `⚠️ DUPLICADOS ENCONTRADOS: ${data.length} configuraciones`
        );

        const userConfigs = data.filter((d) => d.user_id === userId);
        const otherConfigs = data.filter((d) => d.user_id !== userId);

        console.log("Configuraciones del usuario:", userConfigs.length);
        console.log("Configuraciones de otros:", otherConfigs.length);

        setDuplicateInfo({
          hasDuplicate: true,
          duplicateCount: data.length,
          allConfigs: data,
        });

        const baseName = currentConfig.url_slug.replace(/-\d+$/, "");
        const suggestedSlug = `${baseName}-${Date.now().toString().slice(-6)}`;
        setNewSlug(suggestedSlug);

        setShowDialog(true);
      } else {
        console.log("✅ No hay duplicados");
        setDuplicateInfo({
          hasDuplicate: false,
          duplicateCount: data?.length || 0,
          allConfigs: data || [],
        });
      }
    } catch (error) {
      console.error("Error en checkForDuplicates:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(false);
      return;
    }

    setIsCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from("auto_agenda_config")
        .select("id, user_id")
        .eq("url_slug", slug);

      if (error) {
        console.error("Error verificando disponibilidad:", error);
        setSlugAvailable(null);
        return;
      }

      if (!data || data.length === 0) {
        setSlugAvailable(true);
        return;
      }

      setSlugAvailable(false);
    } catch (error) {
      console.error("Error en checkSlugAvailability:", error);
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleUpdateSlug = async () => {
    if (!currentConfig || !newSlug || slugAvailable !== true) {
      return;
    }

    setIsUpdating(true);
    try {
      console.log("=== ACTUALIZANDO SLUG ===");
      console.log("Config ID:", currentConfig.id);
      console.log("Nuevo slug:", newSlug);

      const { data, error } = await supabase
        .from("auto_agenda_config")
        .update({ url_slug: newSlug })
        .eq("id", currentConfig.id)
        .select();

      console.log("Resultado actualización:", { data, error });

      if (error) {
        throw error;
      }

      alert("✅ URL actualizada correctamente");
      setShowDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error actualizando slug:", error);
      alert("❌ Error al actualizar la URL. Intenta con otra.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!newSlug) return;

    const timeoutId = setTimeout(() => {
      checkSlugAvailability(newSlug);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newSlug]);

  if (isChecking) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[620px] rounded-2xl border border-border/70 shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl text-amber-700">
                URL duplicada detectada
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Necesitamos que definas una dirección única para tu página.
              </p>
            </div>
          </div>
          <DialogDescription className="text-sm text-foreground pt-2 leading-relaxed">
            Detectamos que la URL{" "}
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-mono">
              {currentConfig?.url_slug}
            </span>{" "}
            está siendo usada por{" "}
            <span className="font-semibold">
              {duplicateInfo?.duplicateCount} configuraciones
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900 mb-1.5">
              ¿Por qué es importante?
            </p>
            <p className="text-xs sm:text-sm text-amber-800">
              Tener URLs duplicadas puede generar conflictos al guardar cambios
              y confundir a tus pacientes sobre cuál enlace es el correcto. Te
              recomendamos dejar una URL única y clara para tu página.
            </p>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="new-slug" className="text-sm font-medium">
              Elegí una nueva URL única
            </Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                agendux.com/
              </span>
              <div className="flex-1 relative">
                <Input
                  id="new-slug"
                  value={newSlug}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                      .replace(/--+/g, "-");
                    setNewSlug(value);
                  }}
                  className={`pr-9 ${
                    slugAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500/40"
                      : slugAvailable === false
                      ? "border-red-500 focus-visible:ring-red-500/40"
                      : ""
                  }`}
                  placeholder="tu-nombre-unico"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingSlug ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : slugAvailable === true ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : slugAvailable === false ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : null}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isCheckingSlug
                ? "Verificando disponibilidad..."
                : slugAvailable === true
                ? "Esta URL está disponible."
                : slugAvailable === false
                ? "Esta URL ya está en uso, probá con otra."
                : "Usá solo letras, números y guiones (-)."}
            </p>
          </div>

          {duplicateInfo && duplicateInfo.allConfigs.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/50 px-3 py-3">
              <p className="text-xs font-medium text-foreground mb-2">
                Configuraciones encontradas:
              </p>
              <ul className="text-[11px] sm:text-xs text-muted-foreground space-y-1.5 max-h-32 overflow-y-auto">
                {duplicateInfo.allConfigs.map((config, index) => (
                  <li
                    key={config.id}
                    className={`flex flex-wrap items-center gap-1 ${
                      config.id === currentConfig?.id
                        ? "font-semibold text-amber-700"
                        : ""
                    }`}
                  >
                    <span className="text-[11px]">
                      {index + 1}. ID: {config.id.slice(0, 8)}...
                    </span>
                    <span className="text-[11px]">
                      •{" "}
                      {config.user_id === userId
                        ? "Tu configuración"
                        : "Otro usuario"}
                    </span>
                    <span className="text-[11px]">
                      • {new Date(config.created_at).toLocaleDateString()}
                    </span>
                    {config.id === currentConfig?.id && (
                      <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
                        Actual
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            className="w-full sm:w-auto"
          >
            Ignorar por ahora
          </Button>
          <Button
            onClick={handleUpdateSlug}
            disabled={isUpdating || slugAvailable !== true || isCheckingSlug}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar URL"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
