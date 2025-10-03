"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { List, PlusCircle } from "lucide-react";
import { Service } from "@/app/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServicesConfigProps {
  services: Service[];
  userId: string;
}

export function ServicesConfig({
  services: initialServices,
  userId,
}: ServicesConfigProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isSaving, startTransition] = useTransition();
  const supabase = createClient();

  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState(30);

  const handleServiceToggle = (serviceId: number, isChecked: boolean) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.id === serviceId
          ? { ...service, is_active_for_auto_agenda: isChecked }
          : service
      )
    );
  };

  const handleSaveChanges = () => {
    startTransition(async () => {
      try {
        const updatePromises = services.map((service) =>
          supabase
            .from("services")
            .update({
              is_active_for_auto_agenda: service.is_active_for_auto_agenda,
            })
            .eq("id", service.id)
            .eq("user_id", userId)
        );
        await Promise.all(updatePromises);
        alert("Servicios actualizados correctamente.");
      } catch (error) {
        console.error("Error updating services:", error);
        alert("Hubo un error al actualizar los servicios.");
      }
    });
  };

  const handleCreateService = async () => {
    if (!newServiceName || newServiceDuration <= 0) {
      alert("Por favor, completa el nombre y la duración del servicio.");
      return;
    }
    startTransition(async () => {
      try {
        const { data: newService, error } = await supabase
          .from("services")
          .insert({
            name: newServiceName,
            description: newServiceDescription,
            duration_minutes: newServiceDuration,
            user_id: userId,
            is_active_for_auto_agenda: true,
          })
          .select()
          .single();

        if (error) throw error;

        setServices((prev) => [...prev, newService]);
        alert("¡Servicio creado con éxito!");
        setNewServiceName("");
        setNewServiceDescription("");
        setNewServiceDuration(30);
        setIsNewServiceDialogOpen(false);
      } catch (error) {
        console.error("Error creando el servicio:", error);
        alert("Hubo un error al crear el servicio.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <List size={20} className="text-green-600" />
          </div>
          <div>
            <Typography variant="heading-lg" className="font-semibold">
              Servicios Disponibles
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Selecciona qué servicios ofrecer en tu página de Auto-Agenda.
            </Typography>
          </div>
        </div>

        <Dialog
          open={isNewServiceDialogOpen}
          onOpenChange={setIsNewServiceDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Servicio</DialogTitle>
              <DialogDescription>
                Completa los detalles para crear un nuevo servicio.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Nombre del servicio</Label>
                <Input
                  id="service-name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ej: Consulta inicial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newServiceDescription}
                  onChange={(e) => setNewServiceDescription(e.target.value)}
                  placeholder="Describe en qué consiste el servicio."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newServiceDuration}
                  onChange={(e) =>
                    setNewServiceDuration(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsNewServiceDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateService} disabled={isSaving}>
                {isSaving ? "Creando..." : "Crear Servicio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {services.length > 0 ? (
            services.map((service) => (
              <div
                key={service.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <Typography variant="body-lg" className="font-medium">
                    {service.name}
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground"
                  >
                    {service.duration_minutes} minutos
                  </Typography>
                </div>
                <Switch
                  checked={service.is_active_for_auto_agenda || false}
                  onCheckedChange={(isChecked) =>
                    handleServiceToggle(service.id, isChecked)
                  }
                />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <Typography variant="body-md">
                Aún no has creado ningún servicio. ¡Crea el primero!
              </Typography>
            </div>
          )}
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
