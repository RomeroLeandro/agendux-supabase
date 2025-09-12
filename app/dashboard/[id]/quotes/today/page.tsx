"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// Interfaces para tipado
interface Patient {
  full_name: string;
  phone: string;
}

interface Service {
  name: string;
}

interface Appointment {
  id: number;
  appointment_datetime: string;
  duration_minutes: number;
  status: "scheduled" | "confirmed" | "cancelled";
  notes: string;
  patients: Patient;
  services: Service;
}

export default function TodaysAppointmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Estados para el diálogo de EDICIÓN
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [updatedNotes, setUpdatedNotes] = useState("");
  const [updatedStatus, setUpdatedStatus] =
    useState<Appointment["status"]>("scheduled");
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para el diálogo de ELIMINACIÓN
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await supabase
          .from("appointments")
          .select("*, patients(*), services(*)")
          .eq("user_id", user.id)
          .gte("appointment_datetime", today.toISOString())
          .lt("appointment_datetime", tomorrow.toISOString())
          .order("appointment_datetime", { ascending: true });

        if (error) console.error("Error fetching appointments:", error);
        else setAppointments(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  useEffect(() => {
    if (editingAppointment) {
      setUpdatedNotes(editingAppointment.notes || "");
      setUpdatedStatus(editingAppointment.status);
    }
  }, [editingAppointment]);

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setIsUpdating(true);

    const { data: updatedAppointment, error } = await supabase
      .from("appointments")
      .update({ notes: updatedNotes, status: updatedStatus })
      .eq("id", editingAppointment.id)
      .select("*, patients(*), services(*)")
      .single();

    if (error) {
      alert("Error al actualizar la cita: " + error.message);
    } else {
      setAppointments(
        appointments.map((a) =>
          a.id === editingAppointment.id ? updatedAppointment : a
        )
      );
      setIsEditDialogOpen(false);
    }
    setIsUpdating(false);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentToDelete.id);
    if (error) {
      alert("Error al eliminar la cita: " + error.message);
    } else {
      setAppointments(
        appointments.filter((a) => a.id !== appointmentToDelete.id)
      );
      setIsDeleteDialogOpen(false);
    }
    setIsDeleting(false);
  };

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => statusFilter === "all" || app.status === statusFilter)
      .filter(
        (app) =>
          app.patients.full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.services.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [appointments, statusFilter, searchTerm]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      pending: appointments.filter((a) => a.status === "scheduled").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    }),
    [appointments]
  );

  const todayFormatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const getStatusInfo = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return {
          text: "Confirmada",
          color:
            "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50",
        };
      case "scheduled":
        return {
          text: "Pendiente",
          color:
            "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50",
        };
      case "cancelled":
        return {
          text: "Cancelada",
          color: "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50",
        };
      default:
        return {
          text: "Desconocido",
          color:
            "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
        };
    }
  };

  if (loading) return <div className="p-8">Cargando citas...</div>;

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <Typography variant="heading-lg">Citas de Hoy</Typography>
          <Typography
            variant="body-md"
            className="text-muted-foreground capitalize"
          >
            {todayFormatted}
          </Typography>
        </div>
        <Button onClick={() => router.push(`/dashboard/${userId}/citas/nueva`)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <Typography variant="body-md" className="p-0 text-muted-foreground">
            Total Citas
          </Typography>
          <Typography variant="heading-xl" className="p-0">
            {stats.total}
          </Typography>
        </Card>
        <Card className="p-4">
          <Typography variant="body-md" className="p-0 text-muted-foreground">
            Confirmadas
          </Typography>
          <Typography variant="heading-xl" className="p-0 text-green-600">
            {stats.confirmed}
          </Typography>
        </Card>
        <Card className="p-4">
          <Typography variant="body-md" className="p-0 text-muted-foreground">
            Pendientes
          </Typography>
          <Typography variant="heading-xl" className="p-0 text-yellow-600">
            {stats.pending}
          </Typography>
        </Card>
        <Card className="p-4">
          <Typography variant="body-md" className="p-0 text-muted-foreground">
            Canceladas
          </Typography>
          <Typography variant="heading-xl" className="p-0 text-red-600">
            {stats.cancelled}
          </Typography>
        </Card>
      </section>

      <section>
        <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente o servicio..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={setStatusFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="scheduled">Pendientes</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </section>

      <section>
        <Typography variant="heading-md" className="mb-4">
          Lista de Citas ({filteredAppointments.length})
        </Typography>
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <Card key={app.id} className="p-4 flex gap-x-4 items-start">
                  <div className="text-center w-16 flex-shrink-0">
                    <Typography variant="body-lg" className="p-0 font-bold">
                      {new Date(app.appointment_datetime).toLocaleTimeString(
                        "es-AR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </Typography>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-x-2 mb-1">
                      <Typography variant="heading-sm" className="p-0">
                        {app.patients.full_name}
                      </Typography>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                    <Typography
                      variant="body-sm"
                      className="text-muted-foreground"
                    >
                      {app.services.name} • {app.duration_minutes} min •{" "}
                      {app.patients.phone}
                    </Typography>
                    <p className="text-sm mt-2 italic text-muted-foreground">
                      {app.notes || "Sin notas adicionales."}
                    </p>
                  </div>
                  <div className="flex gap-x-1">
                    <Button disabled>
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingAppointment(app);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className="hover:text-destructive"
                      onClick={() => {
                        setAppointmentToDelete(app);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay citas para mostrar con los filtros actuales.
            </p>
          )}
        </div>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
            <DialogDescription>
              Actualizá el estado o las notas de la cita.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAppointment}>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  onValueChange={(value) =>
                    setUpdatedStatus(value as Appointment["status"])
                  }
                  defaultValue={editingAppointment?.status}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="scheduled">Pendiente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas Adicionales</Label>
                <Textarea
                  id="edit-notes"
                  value={updatedNotes}
                  onChange={(e) => setUpdatedNotes(e.target.value)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              <AlertTriangle className="text-destructive" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar esta cita? Esta acción no se
              puede deshacer.
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
