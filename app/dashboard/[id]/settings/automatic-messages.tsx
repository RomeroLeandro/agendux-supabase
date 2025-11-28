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
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Database } from "@/types/supabase";

// --- Schema Zod (igual) ---
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

// --- Columna de ayuda ---
const VariablesCheatSheet = () => (
  <Card className="bg-muted/40 border-dashed sticky top-24 p-5 space-y-3">
    <div>
      <h3 className="text-base font-semibold">Variables disponibles</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Usa estas variables en tus plantillas. Se reemplazarán automáticamente.
      </p>
    </div>

    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
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

    <div className="pt-2 border-t border-border/50">
      <p className="text-xs font-medium">Importante</p>
      <p className="text-xs text-muted-foreground mt-1">
        En tu mensaje de confirmación, recordá pedir al paciente que responda:
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Responde <strong>CONFIRMAR</strong> o <strong>CANCELAR</strong>
      </p>
    </div>
  </Card>
);

// --- Formulario principal ---
export default function AutomaticMessages({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

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
      if (error) {
        console.error(error);
      }
    }
    loadSettings();
  }, [supabase, params.id, form]);

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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
      <div className="space-y-6">
        {/* Header de la sección */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Mensajes automáticos</h2>
          <p className="text-sm text-muted-foreground">
            Configurá las plantillas de WhatsApp que se enviarán automáticamente
            a tus pacientes.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pb-4"
          >
            {/* Activación */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">
                    Mensajería automática de WhatsApp
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activá o desactivá todos los mensajes automáticos.
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Activar mensajes
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Enviar confirmaciones, recordatorios y mensajes
                        post-cita de forma automática.
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
            </Card>

            {/* Confirmación */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  1. Mensaje de confirmación
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Se envía automáticamente cuando se crea una nueva cita.
                </p>
              </div>

              <FormField
                control={form.control}
                name="confirmation_delay_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tiempo de envío</FormLabel>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Enviar</span>
                      <FormControl>
                        <Input type="number" className="w-20 h-9" {...field} />
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
                    <FormLabel className="text-sm">
                      Plantilla del mensaje
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="resize-none"
                        placeholder="¡Hola [PACIENTE_NOMBRE]! Tenés una cita para [SERVICIO_NOMBRE] el [FECHA_CITA] a las [HORA_INICIO_CITA]. Respondé CONFIRMAR o CANCELAR."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Primer recordatorio */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  2. Primer recordatorio
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Ideal para recordarle al paciente el día anterior.
                </p>
              </div>

              <FormField
                control={form.control}
                name="reminder_1_hours_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tiempo de envío</FormLabel>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Enviar</span>
                      <FormControl>
                        <Input type="number" className="w-20 h-9" {...field} />
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
                    <FormLabel className="text-sm">
                      Plantilla del mensaje
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="resize-none"
                        placeholder="¡Hola [PACIENTE_NOMBRE]! Te recordamos tu cita para [SERVICIO_NOMBRE] mañana a las [HORA_INICIO_CITA]."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Segundo recordatorio */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  3. Segundo recordatorio
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Útil para unas horas antes de la consulta.
                </p>
              </div>

              <FormField
                control={form.control}
                name="reminder_2_hours_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tiempo de envío</FormLabel>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Enviar</span>
                      <FormControl>
                        <Input type="number" className="w-20 h-9" {...field} />
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
                    <FormLabel className="text-sm">
                      Plantilla del mensaje
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="resize-none"
                        placeholder="¡[PACIENTE_NOMBRE]! Tu cita con [PROFESIONAL_NOMBRE] es hoy a las [HORA_INICIO_CITA]."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Post-cita */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  4. Mensaje post-cita
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Perfecto para agradecimiento, encuestas o próximos pasos.
                </p>
              </div>

              <FormField
                control={form.control}
                name="post_appointment_delay_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Tiempo de envío</FormLabel>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Enviar</span>
                      <FormControl>
                        <Input type="number" className="w-20 h-9" {...field} />
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
                    <FormLabel className="text-sm">
                      Plantilla del mensaje
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="resize-none"
                        placeholder="¡Gracias por tu visita, [PACIENTE_NOMBRE]! Esperamos verte pronto."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8"
              >
                {isLoading
                  ? "Guardando..."
                  : "Guardar configuración de mensajes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Columna derecha */}
      <div className="lg:block">
        <VariablesCheatSheet />
      </div>
    </div>
  );
}
