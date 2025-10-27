"use client";

import { useState, useEffect, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { WorkHour } from "@/app/types";

interface SchedulesConfigProps {
  userId: string;
}

const daysOfWeek = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" },
];

type ScheduleState = {
  [key: number]: {
    isEnabled: boolean;
    intervals: Array<{ start_time: string; end_time: string }>;
  };
};

export function SchedulesConfig({ userId }: SchedulesConfigProps) {
  const [schedule, setSchedule] = useState<ScheduleState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const supabase = createClient();

  // 🚀 Cargar horarios existentes
  useEffect(() => {
    const initialState: ScheduleState = {};
    daysOfWeek.forEach((day) => {
      initialState[day.id] = {
        isEnabled: false,
        intervals: [{ start_time: "09:00", end_time: "17:00" }],
      };
    });

    const fetchWorkHours = async () => {
      const { data: workHours, error } = await supabase
        .from("work_hours")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching work hours:", error);
        setIsLoading(false);
        return;
      }

      if (workHours && workHours.length > 0) {
        const updatedState = { ...initialState };
        workHours.forEach((wh) => {
          if (updatedState[wh.day_of_week]) {
            if (!updatedState[wh.day_of_week].isEnabled) {
              updatedState[wh.day_of_week].isEnabled = true;
              updatedState[wh.day_of_week].intervals = [];
            }
            updatedState[wh.day_of_week].intervals.push({
              start_time: (wh.start_time as string).substring(0, 5),
              end_time: (wh.end_time as string).substring(0, 5),
            });
          }
        });
        setSchedule(updatedState);
      } else {
        setSchedule(initialState);
      }
      setIsLoading(false);
    };

    fetchWorkHours();
  }, [userId, supabase]);

  // 🕐 Manejar cambios de hora
  const handleIntervalChange = (
    dayId: number,
    intervalIndex: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    const newSchedule = { ...schedule };
    newSchedule[dayId].intervals[intervalIndex][field] = value;
    setSchedule(newSchedule);
  };

  // ➕ Agregar rango horario
  const addInterval = (dayId: number) => {
    const newSchedule = { ...schedule };
    newSchedule[dayId].intervals.push({
      start_time: "09:00",
      end_time: "17:00",
    });
    setSchedule(newSchedule);
  };

  // ❌ Eliminar rango
  const removeInterval = (dayId: number, intervalIndex: number) => {
    const newSchedule = { ...schedule };
    newSchedule[dayId].intervals.splice(intervalIndex, 1);
    setSchedule(newSchedule);
  };

  // 🔁 Activar/desactivar día
  const handleDayToggle = (dayId: number, isEnabled: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], isEnabled },
    }));
  };

  // 💾 Guardar cambios
  const handleSaveChanges = async () => {
    startTransition(async () => {
      try {
        // 🧩 Validaciones
        for (const [dayIdStr, dayData] of Object.entries(schedule)) {
          const dayId = parseInt(dayIdStr);
          if (!dayData.isEnabled) continue;

          const intervals = dayData.intervals;
          for (const interval of intervals) {
            if (!interval.start_time || !interval.end_time) {
              alert(
                `El día ${
                  daysOfWeek.find((d) => d.id === dayId)?.name
                } tiene horarios vacíos.`
              );
              return;
            }
            if (interval.start_time >= interval.end_time) {
              alert(
                `El horario de inicio no puede ser mayor o igual al de fin (${
                  daysOfWeek.find((d) => d.id === dayId)?.name
                }).`
              );
              return;
            }
          }

          // 🔍 Validar que no haya solapamientos
          const sorted = [...intervals].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          );
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].start_time < sorted[i - 1].end_time) {
              alert(
                `Los intervalos del día ${
                  daysOfWeek.find((d) => d.id === dayId)?.name
                } se superponen.`
              );
              return;
            }
          }
        }

        // 🗑️ Borrar horarios previos del usuario
        const { error: deleteError } = await supabase
          .from("work_hours")
          .delete()
          .eq("user_id", userId);

        if (deleteError) throw deleteError;

        // 🆕 Insertar nuevos horarios
        const newWorkHours: Omit<WorkHour, "id">[] = [];
        Object.keys(schedule).forEach((dayIdStr) => {
          const dayId = parseInt(dayIdStr);
          const dayInfo = schedule[dayId];
          if (dayInfo.isEnabled) {
            dayInfo.intervals.forEach((interval) => {
              newWorkHours.push({
                user_id: userId,
                day_of_week: dayId,
                start_time: interval.start_time,
                end_time: interval.end_time,
              });
            });
          }
        });

        if (newWorkHours.length > 0) {
          const { error: insertError } = await supabase
            .from("work_hours")
            .insert(newWorkHours);
          if (insertError) throw insertError;
        }

        alert("✅ Horarios guardados correctamente.");
      } catch (error) {
        console.error("Error saving work hours:", error);
        alert("❌ Hubo un error al guardar los horarios.");
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
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Clock size={20} className="text-indigo-600" />
        </div>
        <div>
          <Typography variant="heading-lg" className="font-semibold">
            Horario Laboral
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            Define cuándo estás disponible para recibir citas.
          </Typography>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {daysOfWeek.map((day) => (
            <div
              key={day.id}
              className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
            >
              <div className="flex items-center gap-3 md:col-span-1">
                <Switch
                  checked={schedule[day.id]?.isEnabled || false}
                  onCheckedChange={(checked) =>
                    handleDayToggle(day.id, checked)
                  }
                />
                <Typography variant="body-lg" className="font-medium w-24">
                  {day.name}
                </Typography>
              </div>
              <div className="md:col-span-2 space-y-3">
                {schedule[day.id]?.isEnabled ? (
                  schedule[day.id].intervals.map((interval, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={interval.start_time}
                        onChange={(e) =>
                          handleIntervalChange(
                            day.id,
                            index,
                            "start_time",
                            e.target.value
                          )
                        }
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={interval.end_time}
                        onChange={(e) =>
                          handleIntervalChange(
                            day.id,
                            index,
                            "end_time",
                            e.target.value
                          )
                        }
                      />
                      <Button
                        onClick={() => removeInterval(day.id, index)}
                        disabled={schedule[day.id].intervals.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <Typography
                    variant="body-sm"
                    className="text-muted-foreground h-10 flex items-center"
                  >
                    No disponible
                  </Typography>
                )}
                {schedule[day.id]?.isEnabled && (
                  <Button onClick={() => addInterval(day.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir intervalo
                  </Button>
                )}
              </div>
            </div>
          ))}
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
