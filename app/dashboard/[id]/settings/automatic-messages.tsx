"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
// ¡Importante! Usamos TU componente Card. Verifica que esta ruta sea correcta.
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Database } from "@/types/supabase";

// --- El Schema de Zod (sin cambios) ---
const formSchema = z.object({
  is_active: z.boolean(),
  confirmation_template: z.string().optional(),
  confirmation_delay_minutes: z.number().min(0, "Debe ser 0 o más"),
  reminder_1_template: z.string().optional(),
  reminder_1_hours_before: z.number().min(0, "Debe ser 0 o más"),
  reminder_2_template: z.string().optional(),
  reminder_2_hours_before: z.number().min(0, "Debe ser 0 o más"),
  post_appointment_template: z.string().optional(),
  post_appointment_delay_minutes: z.number().min(0, "Debe ser 0 o más"),
});

type FormValues = z.infer<typeof formSchema>;
type WhatsappSettingsInsert =
  Database["public"]["Tables"]["whatsapp_settings"]["Insert"];

// --- Componente de Ayuda (Adaptado a tu Card) ---
const VariablesCheatSheet = () => (
  <Card className="bg-muted/50 sticky top-24">
    {/* Reemplazamos <CardHeader> y <CardTitle> */}
    <div className="mb-4">
      <h3 className="text-lg font-medium">Variables Disponibles</h3>
    </div>

    {/* Reemplazamos <CardContent> */}
    <div>
      <p className="text-sm">
        Usa estas variables en tus plantillas. Se reemplazarán automáticamente.
      </p>
      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
        <li>
          <code>[PACIENTE_NOMBRE]</code>
        </li>
        <li>
          <code>[PROFESIONAL_NOMBRE]</code>
        </li>
        <li>
          <code>[FECHA_CITA]</code>
        </li>
        <li>
          <code>[HORA_INICIO_CITA]</code>
        </li>
        <li>
          <code>[SERVICIO_NOMBRE]</code>
        </li>
      </ul>
      <p className="text-sm mt-3 font-medium">
        Importante: En tu mensaje de confirmación, recuerda pedir al paciente
        que responda:
      </p>
      <p className="text-sm text-muted-foreground">
        Responde <strong>CONFIRMAR</strong> o <strong>CANCELAR</strong>
      </p>
    </div>
  </Card>
);

// --- Componente Principal del Formulario (Adaptado a tu Card) ---
export default function AutomaticMessages({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // La lógica de useForm (sin cambios)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_active: false,
      confirmation_template: "",
      confirmation_delay_minutes: 10,
      reminder_1_template: "",
      reminder_1_hours_before: 24,
      reminder_2_template: "",
      reminder_2_hours_before: 2,
      post_appointment_template: "",
      post_appointment_delay_minutes: 60,
    },
  });

  // La lógica de loadSettings (sin cambios)
  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("profile_id", params.id)
        .single();

      if (data) {
        setSettingsId(data.id);
        form.reset({
          is_active: data.is_active || false,
          confirmation_template: data.confirmation_template || "",
          confirmation_delay_minutes: data.confirmation_delay_minutes ?? 10,
          reminder_1_template: data.reminder_1_template || "",
          reminder_1_hours_before: data.reminder_1_hours_before ?? 24,
          reminder_2_template: data.reminder_2_template || "",
          reminder_2_hours_before: data.reminder_2_hours_before ?? 2,
          post_appointment_template: data.post_appointment_template || "",
          post_appointment_delay_minutes:
            data.post_appointment_delay_minutes ?? 60,
        });
      }
    }
    loadSettings();
  }, [supabase, params.id, form]);

  // La lógica de onSubmit (sin cambios)
  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    const settingsToSave: WhatsappSettingsInsert = {
      profile_id: params.id,
      is_active: values.is_active,
      confirmation_template: values.confirmation_template,
      confirmation_delay_minutes: values.confirmation_delay_minutes,
      reminder_1_template: values.reminder_1_template,
      reminder_1_hours_before: values.reminder_1_hours_before,
      reminder_2_template: values.reminder_2_template,
      reminder_2_hours_before: values.reminder_2_hours_before,
      post_appointment_template: values.post_appointment_template,
      post_appointment_delay_minutes: values.post_appointment_delay_minutes,
    };

    const { error } = await supabase
      .from("whatsapp_settings")
      .upsert(settingsToSave, {
        onConflict: "profile_id",
      });

    if (error) {
      toast.error("Error al guardar la configuración.", {
        description: error.message,
      });
    } else {
      toast.success("¡Configuración guardada con éxito!");
      if (!settingsId) {
        const { data: newData } = await supabase
          .from("whatsapp_settings")
          .select("id")
          .eq("profile_id", params.id)
          .single();
        if (newData) setSettingsId(newData.id);
      }
    }
    setIsLoading(false);
  }

  // --- JSX Adaptado ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* --- Tarjeta de Activación --- */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  Mensajería Automática de WhatsApp
                </h3>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Activar mensajes
                        </FormLabel>
                        <FormDescription>
                          Habilita el envío de confirmaciones y recordatorios
                          para tus citas.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* --- Tarjeta de Mensaje de Confirmación --- */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-medium">
                  1. Mensaje de Confirmación
                </h3>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="confirmation_delay_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de envío</FormLabel>
                      <div className="flex items-center gap-2">
                        <span>Enviar</span>
                        <FormControl>
                          <Input type="number" className="w-20" {...field} />
                        </FormControl>
                        <span>minutos DESPUÉS de agendar.</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmation_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plantilla del Mensaje</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="¡Hola [PACIENTE_NOMBRE]! Tienes una cita para [SERVICIO_NOMBRE] el [FECHA_CITA] a las [HORA_INICIO_CITA]. Responde 'CONFIRMAR' o 'CANCELAR'."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* --- Tarjeta de Primer Recordatorio --- */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-medium">2. Primer Recordatorio</h3>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="reminder_1_hours_before"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de envío</FormLabel>
                      <div className="flex items-center gap-2">
                        <span>Enviar</span>
                        <FormControl>
                          <Input type="number" className="w-20" {...field} />
                        </FormControl>
                        <span>horas ANTES de la cita.</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminder_1_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plantilla del Mensaje</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="¡Hola [PACIENTE_NOMBRE]! Te recordamos tu cita para [SERVICIO_NOMBRE] mañana a las [HORA_INICIO_CITA]."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* --- Tarjeta de Segundo Recordatorio --- */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-medium">3. Segundo Recordatorio</h3>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="reminder_2_hours_before"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de envío</FormLabel>
                      <div className="flex items-center gap-2">
                        <span>Enviar</span>
                        <FormControl>
                          <Input type="number" className="w-20" {...field} />
                        </FormControl>
                        <span>horas ANTES de la cita.</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reminder_2_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plantilla del Mensaje</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="¡[PACIENTE_NOMBRE]! Tu cita con [PROFESIONAL_NOMBRE] es hoy a las [HORA_INICIO_CITA]."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* --- Tarjeta de Mensaje Post-Cita --- */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-medium">4. Mensaje Post-Cita</h3>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="post_appointment_delay_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de envío</FormLabel>
                      <div className="flex items-center gap-2">
                        <span>Enviar</span>
                        <FormControl>
                          <Input type="number" className="w-20" {...field} />
                        </FormControl>
                        <span>minutos DESPUÉS de la cita.</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="post_appointment_template"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plantilla del Mensaje</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="¡Gracias por tu visita, [PACIENTE_NOMBRE]! Esperamos verte pronto."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Guardando..." : "Guardar Configuración de Mensajes"}
            </Button>
          </form>
        </Form>
      </div>

      {/* --- Columna de Ayuda --- */}
      <div className="lg:col-span-1">
        <VariablesCheatSheet />
      </div>
    </div>
  );
}
