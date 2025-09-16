"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface GoogleCalendarContextType {
  isConnected: boolean;
  isLoading: boolean;
  checkConnection: () => Promise<void>;
  setConnected: (connected: boolean) => void;
  refreshConnection: () => Promise<void>;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType>({
  isConnected: false,
  isLoading: true,
  checkConnection: async () => {},
  setConnected: () => {},
  refreshConnection: async () => {},
});

export function GoogleCalendarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const checkConnection = useCallback(async () => {
    console.log("=== CHECKING CONNECTION START ===");
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("✅ User found:", user.id);

        // CORREGIR: Usar select("*") en lugar de select("refresh_token")
        const { data: tokenData, error } = await supabase
          .from("gcal_tokens")
          .select("*")
          .eq("user_id", user.id);

        console.log("🔍 Token query result:");
        console.log("- tokenData:", tokenData);
        console.log("- error:", error);
        console.log("- is array:", Array.isArray(tokenData));
        console.log("- length:", tokenData?.length);

        if (error && error.code !== "PGRST116") {
          console.error("❌ Error checking Google Calendar connection:", error);
        }

        // CORREGIR: Verificar si es array y tiene elementos
        const connected =
          tokenData &&
          Array.isArray(tokenData) &&
          tokenData.length > 0 &&
          tokenData[0].refresh_token;
        console.log("📊 Google Calendar connection status:", connected);

        setIsConnected(connected);

        if (typeof window !== "undefined") {
          localStorage.setItem("gcal_connected", connected.toString());
          console.log("💾 Saved to localStorage:", connected.toString());
        }
      } else {
        console.log("❌ No user found");
        setIsConnected(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("gcal_connected");
        }
      }
    } catch (error) {
      console.error("💥 Error in checkConnection:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      console.log("=== CHECKING CONNECTION END ===");
    }
  }, [supabase]);

  const setConnected = useCallback((connected: boolean) => {
    console.log("Manually setting connection status:", connected);
    setIsConnected(connected);
    if (typeof window !== "undefined") {
      localStorage.setItem("gcal_connected", connected.toString());
    }
  }, []);

  const refreshConnection = useCallback(async () => {
    console.log("Refreshing Google Calendar connection...");
    await checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    console.log("Initializing Google Calendar context...");

    checkConnection();

    const timeouts = [
      setTimeout(() => checkConnection(), 1000),
      setTimeout(() => checkConnection(), 3000),
      setTimeout(() => checkConnection(), 5000),
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [checkConnection]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setTimeout(() => checkConnection(), 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, checkConnection]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gcal_connected") {
        console.log("Storage changed, updating connection status:", e.newValue);
        setIsConnected(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocus = () => {
      console.log("Window focused, checking connection...");
      setTimeout(() => checkConnection(), 500);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, checking connection...");
        setTimeout(() => checkConnection(), 500);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkConnection]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Periodic connection check...");
      checkConnection();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <GoogleCalendarContext.Provider
      value={{
        isConnected,
        isLoading,
        checkConnection,
        setConnected,
        refreshConnection,
      }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  );
}

export function useGoogleCalendar() {
  const context = useContext(GoogleCalendarContext);
  return context;
}
