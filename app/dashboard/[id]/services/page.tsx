"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { User } from "@supabase/supabase-js";
import { Pencil, Trash2, AlertTriangle, PlusCircle } from "lucide-react";

// Interfaz sin la propiedad 'price'
interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
}

export default function ServicesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Estados del formulario de creación (sin precio)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState(60);
  const [isCreating, setIsCreating] = useState(false);

  // Estados del modal de edición (sin precio)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedDuration, setUpdatedDuration] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados del diálogo de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("ID del usuario logueado en la APP:", user?.id);
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id);
        if (error) console.error("Error fetching services:", error);
        else setServices(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  useEffect(() => {
    if (editingService) {
      setUpdatedName(editingService.name);
      setUpdatedDescription(editingService.description);
      setUpdatedDuration(editingService.duration_minutes);
    }
  }, [editingService]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsCreating(true);
    const { data, error } = await supabase
      .from("services")
      .insert({
        user_id: user.id,
        name: newName,
        description: newDescription,
        duration_minutes: newDuration,
      })
      .select()
      .single();

    if (error) {
      alert("Error al crear el servicio: " + error.message);
    } else if (data) {
      setServices([data, ...services]);
      setIsCreateModalOpen(false);
      setNewName("");
      setNewDescription("");
      setNewDuration(60);
    }
    setIsCreating(false);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setIsUpdating(true);
    const { data, error } = await supabase
      .from("services")
      .update({
        name: updatedName,
        description: updatedDescription,
        duration_minutes: updatedDuration,
      })
      .eq("id", editingService.id)
      .select()
      .single();

    if (error) {
      alert("Error al actualizar el servicio: " + error.message);
    } else {
      setServices(services.map((s) => (s.id === editingService.id ? data : s)));
      setIsEditModalOpen(false);
    }
    setIsUpdating(false);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceToDelete.id);
    if (error) {
      alert("Error al eliminar el servicio: " + error.message);
    } else {
      setServices(services.filter((s) => s.id !== serviceToDelete.id));
      setIsDeleteDialogOpen(false);
    }
    setIsDeleting(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="heading-lg">Gestioná tus Servicios</Typography>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Crear Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Servicio</DialogTitle>
              <DialogDescription>
                Añadí un nuevo servicio a tu catálogo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateService}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name-create">Nombre</Label>
                  <Input
                    id="name-create"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-create">Descripción</Label>
                  <Textarea
                    id="description-create"
                    value={newDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewDescription(e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration-create">Duración (min)</Label>
                  <Input
                    id="duration-create"
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creando..." : "Crear Servicio"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        {loading ? (
          <p>Cargando servicios...</p>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="mb-4">
                    <Typography variant="heading-sm" className="p-0 pr-2">
                      {service.name}
                    </Typography>
                    <Typography
                      variant="body-sm"
                      className="text-muted-foreground"
                    >
                      {service.duration_minutes} minutos
                    </Typography>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground h-12 overflow-hidden text-ellipsis">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-x-2 p-6 pt-4 border-t border-border mt-auto">
                  <Button
                    onClick={() => {
                      setEditingService(service);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => {
                      setServiceToDelete(service);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Aún no has creado ningún servicio. ¡Hacé clic en Crear Nuevo
            Servicio para empezar!
          </p>
        )}
      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>
              Modificá los detalles de tu servicio.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateService}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-desc" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="edit-desc"
                  value={updatedDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setUpdatedDescription(e.target.value)
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-duration" className="text-right">
                  Duración (min)
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={updatedDuration}
                  onChange={(e) => setUpdatedDuration(parseInt(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              <AlertTriangle className="text-destructive" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar el servicio{" "}
              {serviceToDelete?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
