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

// Define los campos disponibles y sus etiquetas
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

      if (error) {
        console.error("Error fetching form fields:", error);
        setIsLoading(false);
        return;
      }

      // Si el usuario ya tiene campos guardados, los usamos
      if (data && data.length > 0) {
        const userFields = availableFields.map((af) => {
          const savedField = data.find((df) => df.field_name === af.id);
          return savedField
            ? {
                field_name: af.id,
                is_visible: savedField.is_visible,
                is_required: savedField.is_required,
              }
            : { field_name: af.id, is_visible: true, is_required: true }; // Fallback por si se añade un nuevo campo
        });
        setFields(userFields);
      } else {
        // Si no, creamos la configuración por defecto (todos visibles y requeridos)
        const defaultFields = availableFields.map((field) => ({
          field_name: field.id,
          is_visible: true,
          is_required: true,
        }));
        setFields(defaultFields);
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
    setFields((prevFields) =>
      prevFields.map((field) => {
        if (field.field_name === fieldName) {
          const updatedField = { ...field, [property]: value };
          // Lógica: si un campo no es visible, tampoco puede ser requerido.
          if (property === "is_visible" && !value) {
            updatedField.is_required = false;
          }
          return updatedField;
        }
        return field;
      })
    );
  };

  const handleSaveChanges = async () => {
    startTransition(async () => {
      try {
        // La función `upsert` es perfecta aquí: actualiza si existe, o inserta si no.
        const dataToSave = fields.map((field) => ({
          user_id: userId,
          field_name: field.field_name,
          is_visible: field.is_visible,
          is_required: field.is_required,
        }));

        const { error } = await supabase
          .from("form_fields")
          .upsert(dataToSave, {
            onConflict: "user_id, field_name",
          });

        if (error) throw error;

        alert("Configuración de campos guardada.");
      } catch (error) {
        console.error("Error saving form fields:", error);
        alert("Hubo un error al guardar los campos.");
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <FileText size={20} className="text-orange-600" />
        </div>
        <div>
          <Typography variant="heading-lg" className="font-semibold">
            Campos del Formulario
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Define qué información solicitar a tus clientes al agendar.
          </Typography>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b grid grid-cols-3 font-medium text-sm text-muted-foreground">
          <div className="col-span-1">Campo</div>
          <div className="text-center">Visible</div>
          <div className="text-center">Requerido</div>
        </div>
        <div className="divide-y divide-border">
          {fields.map((field) => {
            const fieldInfo = availableFields.find(
              (af) => af.id === field.field_name
            );
            if (!fieldInfo) return null;

            return (
              <div
                key={field.field_name}
                className="p-4 grid grid-cols-3 items-center"
              >
                <div className="col-span-1">
                  <Label htmlFor={`visible-${field.field_name}`}>
                    {fieldInfo.label}
                  </Label>
                </div>
                <div className="text-center">
                  <Switch
                    id={`visible-${field.field_name}`}
                    checked={field.is_visible}
                    onCheckedChange={(checked) =>
                      handleFieldChange(field.field_name, "is_visible", checked)
                    }
                  />
                </div>
                <div className="text-center">
                  <Switch
                    id={`required-${field.field_name}`}
                    checked={field.is_required}
                    onCheckedChange={(checked) =>
                      handleFieldChange(
                        field.field_name,
                        "is_required",
                        checked
                      )
                    }
                    disabled={!field.is_visible} // Un campo no puede ser requerido si no es visible
                  />
                </div>
              </div>
            );
          })}
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
