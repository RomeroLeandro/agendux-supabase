"use client";

import { useCallback } from "react";
import { useGoogleCalendar } from "@/context/google-calendar-context";

export function useAutoSync() {
  const { isConnected } = useGoogleCalendar();

  const syncAppointment = useCallback(
    async (appointmentId: number, action: "create" | "update" | "delete") => {
      if (!isConnected) {
        console.log("Google Calendar not connected, skipping sync");
        return { success: false, message: "Google Calendar not connected" };
      }

      try {
        const response = await fetch("/api/auto-sync-to-gcal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId, action }),
        });

        const result = await response.json();

        if (!result.success) {
          console.warn("Auto-sync failed:", result.error || result.message);
        } else {
          console.log(
            `Successfully synced appointment ${appointmentId} to Google Calendar`
          );
        }

        return result;
      } catch (error) {
        console.error("Auto-sync error:", error);
        return { success: false, error: "Network error" };
      }
    },
    [isConnected]
  );

  const syncExistingAppointments = useCallback(async () => {
    if (!isConnected) {
      return { success: false, message: "Google Calendar not connected" };
    }

    try {
      const response = await fetch("/api/sync-existing-appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Sync result:", result);
        return result;
      } else {
        console.error("Sync failed:", result);
        return { success: false, error: result.error || "Unknown error" };
      }
    } catch (error) {
      console.error("Error syncing existing appointments:", error);
      return { success: false, error: "Network error" };
    }
  }, [isConnected]);

  return {
    syncAppointment,
    syncExistingAppointments,
    isConnected,
  };
}
