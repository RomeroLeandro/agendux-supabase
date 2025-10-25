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

      // Buscar todas las configuraciones con el mismo url_slug
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

        // Verificar si el usuario actual tiene múltiples configuraciones
        const userConfigs = data.filter((d) => d.user_id === userId);
        const otherConfigs = data.filter((d) => d.user_id !== userId);

        console.log("Configuraciones del usuario:", userConfigs.length);
        console.log("Configuraciones de otros:", otherConfigs.length);

        setDuplicateInfo({
          hasDuplicate: true,
          duplicateCount: data.length,
          allConfigs: data,
        });

        // Generar un nuevo slug sugerido
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

      // Si no hay resultados, está disponible
      if (!data || data.length === 0) {
        setSlugAvailable(true);
        return;
      }

      // Si hay resultados, no está disponible
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

  // Debounce para verificar disponibilidad
  useEffect(() => {
    if (!newSlug) return;

    const timeoutId = setTimeout(() => {
      checkSlugAvailability(newSlug);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newSlug]);

  if (isChecking) {
    return null; // O puedes mostrar un loader si quieres
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-orange-600">
                URL Duplicada Detectada
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base text-foreground pt-2">
            Hemos detectado que la URL{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {currentConfig?.url_slug}
            </code>{" "}
            está siendo usada por{" "}
            <strong>{duplicateInfo?.duplicateCount} configuraciones</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 mb-2">
              <strong>¿Por qué es un problema?</strong>
            </p>
            <p className="text-sm text-orange-700">
              Tener URLs duplicadas puede causar conflictos al intentar guardar
              cambios y puede confundir a tus pacientes sobre cuál es tu página
              correcta.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="new-slug">Nueva URL única</Label>
            <div className="flex items-center gap-2">
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
                  className={
                    slugAvailable === true
                      ? "border-green-500"
                      : slugAvailable === false
                      ? "border-red-500"
                      : ""
                  }
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
            <p className="text-sm text-muted-foreground">
              {isCheckingSlug
                ? "Verificando disponibilidad..."
                : slugAvailable === true
                ? "✅ Esta URL está disponible"
                : slugAvailable === false
                ? "❌ Esta URL ya está en uso"
                : "Escribe una URL única para continuar"}
            </p>
          </div>

          {duplicateInfo && duplicateInfo.allConfigs.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Configuraciones encontradas:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {duplicateInfo.allConfigs.map((config, index) => (
                  <li
                    key={config.id}
                    className={
                      config.id === currentConfig?.id
                        ? "font-bold text-orange-600"
                        : ""
                    }
                  >
                    {index + 1}. ID: {config.id.slice(0, 8)}... |{" "}
                    {config.user_id === userId
                      ? "Tu configuración"
                      : "Otro usuario"}{" "}
                    | {new Date(config.created_at).toLocaleDateString()}
                    {config.id === currentConfig?.id &&
                      " ← Tu configuración actual"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowDialog(false)}
            className="w-full sm:w-auto"
          >
            Ignorar por ahora
          </Button>
          <Button
            onClick={handleUpdateSlug}
            disabled={isUpdating || slugAvailable !== true || isCheckingSlug}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
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
