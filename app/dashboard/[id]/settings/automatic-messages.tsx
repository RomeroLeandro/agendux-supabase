"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface MessageConfig {
  active: boolean;
  message: string;
}

interface Messages {
  confirmation: MessageConfig;
  reminder: MessageConfig;
  firstReminder: MessageConfig;
  postCita: MessageConfig;
}

export function AutomaticMessages() {
  const [messages, setMessages] = useState<Messages>({
    confirmation: {
      active: true,
      message: "¡Hola {{nombre}}! Tu cita para {{servicio}} a las {{hora}} ha sido confirmada. Te esperamos!"
    },
    reminder: {
      active: false,
      message: "Hola {{nombre}}. Tienes una cita mañana a las {{hora}} {{fecha}}. Si no puedes venir, por favor avísanos con anticipación."
    },
    firstReminder: {
      active: true,
      message: "¡Hola {{nombre}}! Estamos organizando nuestras actividades para las próximas semanas."
    },
    postCita: {
      active: true,
      message: "Gracias por tu visita. ¡Cuéntanos qué te pareció nuestra atención! [llave de valoración]"
    }
  });

  const [secondReminderConfig, setSecondReminderConfig] = useState({
    active: false,
    timeValue: "1",
    timeUnit: "Horas antes"
  });

  const [rescheduleConfig, setRescheduleConfig] = useState({
    active: false
  });

  const availableVariables = [
    "{{nombre}}",
    "{{apellido}}", 
    "{{servicio}}",
    "{{fecha}}",
    "{{hora}}",
    "{{precio}}"
  ];

  const handleMessageChange = (type: keyof Messages, field: keyof MessageConfig, value: string | boolean) => {
    setMessages(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    console.log("Guardando configuración de mensajes:", messages);
    // Aquí se implementará la lógica de guardado
  };

  return (
    <div>
      <div className="mb-6">
        <Typography variant="heading-lg" className="font-semibold mb-2">
          Resumen de Mensajes Activos
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          Lista de los mensajes automáticos que tienes activos
        </Typography>
      </div>

      {/* Resumen de mensajes activos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800">Confirmación</span>
          </div>
          <p className="text-sm text-green-600 mt-1">Al agendar</p>
        </Card>

        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="font-medium text-orange-800">1er Recordatorio</span>
          </div>
          <p className="text-sm text-orange-600 mt-1">24 horas</p>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="font-medium text-purple-800">Post-Cita</span>
          </div>
          <p className="text-sm text-purple-600 mt-1">Al finalizar</p>
        </Card>
      </div>

      <div className="space-y-8">
        {/* Mensaje de Confirmación */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="heading-md" className="font-semibold">
                Mensaje de Confirmación
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Activo siempre
              </Typography>
            </div>
            <Switch
              checked={messages.confirmation.active}
              onCheckedChange={(checked: boolean) => handleMessageChange('confirmation', 'active', checked)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>¿Cuándo enviar?</Label>
              <p className="text-sm text-muted-foreground">Inmediatamente</p>
            </div>
            <div>
              <Label htmlFor="confirmation-message">Mensaje</Label>
              <Textarea
                id="confirmation-message"
                value={messages.confirmation.message}
                onChange={(e) => handleMessageChange('confirmation', 'message', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Primer Recordatorio */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="heading-md" className="font-semibold">
                Primer Recordatorio
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Envío automático de recordatorio antes de la cita
              </Typography>
            </div>
            <Switch
              checked={messages.firstReminder.active}
              onCheckedChange={(checked: boolean) => handleMessageChange('firstReminder', 'active', checked)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>¿Cuándo enviar?</Label>
              <p className="text-sm text-muted-foreground">24 horas antes</p>
            </div>
            <div>
              <Label htmlFor="first-reminder-message">Mensaje</Label>
              <Textarea
                id="first-reminder-message"
                value={messages.firstReminder.message}
                onChange={(e) => handleMessageChange('firstReminder', 'message', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Segundo Recordatorio */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="heading-md" className="font-semibold">
                Segundo Recordatorio
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Envío adicional más cerca de la cita
              </Typography>
            </div>
            <Switch
              checked={secondReminderConfig.active}
              onCheckedChange={(checked: boolean) => setSecondReminderConfig(prev => ({ ...prev, active: checked }))}
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>¿Cuándo enviar?</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={secondReminderConfig.timeValue}
                    onChange={(e) => setSecondReminderConfig(prev => ({ ...prev, timeValue: e.target.value }))}
                    className="flex-1"
                  />
                  <Select
                    value={secondReminderConfig.timeUnit}
                    onValueChange={(value: string) => setSecondReminderConfig(prev => ({ ...prev, timeUnit: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Horas antes">Horas antes</SelectItem>
                      <SelectItem value="Días antes">Días antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="second-reminder-message">Mensaje</Label>
              <Textarea
                id="second-reminder-message"
                value={messages.reminder.message}
                onChange={(e) => handleMessageChange('reminder', 'message', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Mensaje Post-Cita */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="heading-md" className="font-semibold">
                Mensaje Post-Cita
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Mensaje de seguimiento después de la consulta
              </Typography>
            </div>
            <Switch
              checked={messages.postCita.active}
              onCheckedChange={(checked: boolean) => handleMessageChange('postCita', 'active', checked)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>¿Cuándo enviar?</Label>
              <p className="text-sm text-muted-foreground">1 hora después</p>
            </div>
            <div>
              <Label htmlFor="post-cita-message">Mensaje</Label>
              <Textarea
                id="post-cita-message"
                value={messages.postCita.message}
                onChange={(e) => handleMessageChange('postCita', 'message', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Solicitud de Reseña */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="heading-md" className="font-semibold">
                Solicitud de Reseña
              </Typography>
              <Typography variant="body-sm" className="text-muted-foreground">
                Pide reseñas para mejorar tu reputación
              </Typography>
            </div>
            <Switch
              checked={rescheduleConfig.active}
              onCheckedChange={(checked: boolean) => setRescheduleConfig(prev => ({ ...prev, active: checked }))}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>¿Cuándo enviar?</Label>
              <p className="text-sm text-muted-foreground">Activar solicitud</p>
            </div>
          </div>
        </Card>

        {/* Variables Disponibles */}
        <Card className="p-6">
          <Typography variant="heading-md" className="font-semibold mb-4">
            Variables Disponibles
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground mb-4">
            Usa estas variables en tus mensajes para personalizarlos automáticamente
          </Typography>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableVariables.map((variable) => (
              <div key={variable} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <code className="text-sm font-mono">{variable}</code>
                <Button 
                  onClick={() => navigator.clipboard.writeText(variable)}
                  className="text-xs"
                >
                  Copiar
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Tip: Las variables de mensajes se reemplazarán automáticamente con los datos reales de cada paciente.
          </p>
        </Card>
      </div>

      {/* Botón de guardar */}
      <div className="pt-8 flex justify-end">
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}