"use client";

import { useState, useEffect, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField } from "@/app/types";

interface FieldsConfigProps {
  userId: string;
}

const availableFields = [
  { id: "first_name", label: "Nombre" },
  { id: "last_name", label: "Apellido" },
  { id: "phone", label: "Teléfono" },
  { id: "email", label: "Correo Electrónico" },
];

type FieldState = Omit<FormField, "id" | "user_id">;

export function FieldsConfig({ userId }: FieldsConfigProps) {
  const [fields, setFields] = useState<FieldState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    const fetchFields = async () => {
      const { data, error } = await supabase
        .from("form_fields")
        .select("*")
        .eq("user_id", userId);

      if (!error && data && data.length > 0) {
        const userFields = availableFields.map((af) => {
          const savedField = data.find((df) => df.field_name === af.id);
          return savedField
            ? {
                field_name: af.id,
                is_visible: savedField.is_visible,
                is_required: savedField.is_required,
              }
            : { field_name: af.id, is_visible: true, is_required: true };
        });
        setFields(userFields);
      } else {
        setFields(
          availableFields.map((field) => ({
            field_name: field.id,
            is_visible: true,
            is_required: true,
          }))
        );
      }

      setIsLoading(false);
    };

    fetchFields();
  }, [userId, supabase]);

  const handleFieldChange = (
    fieldName: string,
    property: "is_visible" | "is_required",
    value: boolean
  ) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.field_name === fieldName) {
          const updated = { ...f, [property]: value };
          if (property === "is_visible" && !value) updated.is_required = false;
          return updated;
        }
        return f;
      })
    );
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
      try {
        const upsertPayload = fields.map((f) => ({
          user_id: userId,
          field_name: f.field_name,
          is_visible: f.is_visible,
          is_required: f.is_required,
        }));

        const { error } = await supabase
          .from("form_fields")
          .upsert(upsertPayload, {
            onConflict: "user_id, field_name",
          });

        if (error) throw error;
        alert("Configuración de campos guardada.");
      } catch (error) {
        console.error(error);
        alert("Error al guardar");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TITULO */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shadow-sm">
          <FileText size={20} className="text-orange-600" />
        </div>
        <div>
          <Typography variant="heading-lg" className="font-semibold">
            Campos del Formulario
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground mt-1">
            Seleccioná la información que querés solicitar al agendar.
          </Typography>
        </div>
      </div>

      {/* TABLA */}
      <Card className="overflow-hidden shadow-sm border border-border/60 rounded-xl">
        <div className="p-4 bg-muted/50 grid grid-cols-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
          <div>Campo</div>
          <div className="text-center">Visible</div>
          <div className="text-center">Requerido</div>
        </div>

        <div className="divide-y divide-border/60">
          {fields.map((field) => {
            const fieldInfo = availableFields.find(
              (f) => f.id === field.field_name
            );
            if (!fieldInfo) return null;

            return (
              <div
                key={field.field_name}
                className="p-4 grid grid-cols-3 items-center hover:bg-muted/40 transition-colors"
              >
                <Label className="font-medium">{fieldInfo.label}</Label>

                {/* Visible */}
                <div className="flex justify-center">
                  <Switch
                    checked={field.is_visible}
                    onCheckedChange={(checked) =>
                      handleFieldChange(field.field_name, "is_visible", checked)
                    }
                  />
                </div>

                {/* Required */}
                <div className="flex justify-center">
                  <Switch
                    checked={field.is_required}
                    onCheckedChange={(checked) =>
                      handleFieldChange(
                        field.field_name,
                        "is_required",
                        checked
                      )
                    }
                    disabled={!field.is_visible}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* BOTON GUARDAR */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          variant="primary"
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
