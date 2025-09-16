"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useGoogleCalendar } from "@/context/google-calendar-context";
import { useAutoSync } from "@/hooks/use-auto-sync";

export function GoogleCalendarDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isConnected,
    isLoading: contextLoading,
    setConnected,
    refreshConnection,
  } = useGoogleCalendar();

  const { syncAppointment } = useAutoSync();
  const supabase = createClient();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Test 1: Verificación directa de base de datos
  const testDirectDatabase = async () => {
    addLog("=== TEST 1: DIRECT DATABASE CHECK ===");
    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      addLog(`User query result: ${user ? "Found" : "Not found"}`);
      if (userError) addLog(`User error: ${userError.message}`);

      if (user) {
        addLog(`User ID: ${user.id}`);

        const { data: tokenData, error: tokenError } = await supabase
          .from("gcal_tokens")
          .select("*") // Cambiar de select("*") que ya tienes a esto
          .eq("user_id", user.id);

        addLog(`Token query returned: ${JSON.stringify(tokenData)}`);
        if (tokenError) addLog(`Token error: ${tokenError.message}`);

        const hasToken =
          tokenData &&
          Array.isArray(tokenData) &&
          tokenData.length > 0 &&
          tokenData[0].refresh_token;
        addLog(`Has valid token: ${hasToken}`);

        if (hasToken && !isConnected) {
          addLog(
            "MISMATCH DETECTED: Token exists but context shows disconnected"
          );
        } else if (!hasToken && isConnected) {
          addLog("MISMATCH DETECTED: No token but context shows connected");
        } else {
          addLog("State is consistent");
        }
      }
    } catch (error) {
      addLog(`Database test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Forzar estado del contexto
  const testForceState = async () => {
    addLog("=== TEST 2: FORCE CONTEXT STATE ===");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: tokenData } = await supabase
          .from("gcal_tokens")
          .select("refresh_token")
          .eq("user_id", user.id)
          .single();

        const hasToken = !!tokenData?.refresh_token;
        addLog(`Token exists: ${hasToken}`);
        addLog(`Before: Context state = ${isConnected}`);

        if (hasToken) {
          setConnected(true);
          addLog("Forced context to TRUE");
        } else {
          setConnected(false);
          addLog("Forced context to FALSE");
        }

        setTimeout(() => {
          addLog(`After 1 second: Context state = ${isConnected}`);
        }, 1000);
      }
    } catch (error) {
      addLog(`Force state error: ${error}`);
    }
  };

  // Test 3: Verificar APIs de Google Calendar
  const testGoogleCalendarAPI = async () => {
    addLog("=== TEST 3: GOOGLE CALENDAR API ===");
    setIsLoading(true);

    try {
      // Test fetch events
      addLog("Testing fetch events API...");
      const fetchResponse = await fetch("/api/fetch-gcal-events");
      addLog(`Fetch events status: ${fetchResponse.status}`);

      if (fetchResponse.ok) {
        const events = await fetchResponse.json();
        addLog(
          `Fetched ${Array.isArray(events) ? events.length : "invalid"} events`
        );
      } else {
        const errorText = await fetchResponse.text();
        addLog(`Fetch events error: ${errorText}`);
      }

      // Test sync API
      addLog("Testing sync API...");
      const syncResponse = await fetch("/api/sync-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: 999999, // Test ID
          action: "test",
        }),
      });
      addLog(`Sync API status: ${syncResponse.status}`);

      if (!syncResponse.ok) {
        const errorText = await syncResponse.text();
        addLog(`Sync API error: ${errorText}`);
      }
    } catch (error) {
      addLog(`API test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Crear cita de prueba y verificar sincronización
  const testCreateAndSync = async () => {
    addLog("=== TEST 4: CREATE TEST APPOINTMENT AND SYNC ===");
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        addLog("No user found");
        return;
      }

      // Obtener un servicio existente
      const { data: services } = await supabase
        .from("services")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!services || services.length === 0) {
        addLog("No services found - cannot create test appointment");
        return;
      }

      // Crear paciente de prueba
      addLog("Creating test patient...");
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .insert({
          user_id: user.id,
          full_name: "TEST PATIENT - DELETE ME",
          phone: "123456789",
          email: "test@test.com",
        })
        .select()
        .single();

      if (patientError) {
        addLog(`Patient creation error: ${patientError.message}`);
        return;
      }

      addLog(`Test patient created with ID: ${patientData.id}`);

      // Crear cita de prueba
      addLog("Creating test appointment...");
      const testDate = new Date();
      testDate.setHours(testDate.getHours() + 1); // 1 hora en el futuro

      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          patient_id: patientData.id,
          service_id: services[0].id,
          appointment_datetime: testDate.toISOString(),
          duration_minutes: 30,
          notes: "TEST APPOINTMENT - DELETE ME",
          synced_to_google: false,
        })
        .select("id")
        .single();

      if (appointmentError) {
        addLog(`Appointment creation error: ${appointmentError.message}`);
        return;
      }

      addLog(`Test appointment created with ID: ${appointmentData.id}`);

      // Intentar sincronizar
      addLog("Attempting to sync to Google Calendar...");
      addLog(`Context shows connected: ${isConnected}`);

      if (isConnected) {
        try {
          const syncResult = await syncAppointment(
            appointmentData.id,
            "create"
          );
          addLog(`Sync result: ${JSON.stringify(syncResult)}`);
        } catch (syncError) {
          addLog(`Sync error: ${syncError}`);
        }
      } else {
        addLog("Skipping sync - context shows disconnected");
      }

      // Limpiar datos de prueba
      addLog("Cleaning up test data...");
      await supabase.from("appointments").delete().eq("id", appointmentData.id);
      await supabase.from("patients").delete().eq("id", patientData.id);
      addLog("Test data cleaned up");
    } catch (error) {
      addLog(`Test create and sync error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 5: Verificar contexto en tiempo real
  const testContextRefresh = async () => {
    addLog("=== TEST 5: CONTEXT REFRESH TEST ===");

    for (let i = 0; i < 5; i++) {
      addLog(
        `Attempt ${
          i + 1
        }: Context state = ${isConnected}, Loading = ${contextLoading}`
      );
      await refreshConnection();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Google Calendar Debugger</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        <button
          onClick={testDirectDatabase}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          Test DB Direct
        </button>

        <button
          onClick={testForceState}
          disabled={isLoading}
          className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
        >
          Force State
        </button>

        <button
          onClick={testGoogleCalendarAPI}
          disabled={isLoading}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Test APIs
        </button>

        <button
          onClick={testCreateAndSync}
          disabled={isLoading}
          className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          Test Sync
        </button>

        <button
          onClick={testContextRefresh}
          disabled={isLoading}
          className="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 disabled:opacity-50"
        >
          Test Context
        </button>

        <button
          onClick={clearLogs}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="mb-4 p-2 bg-white border rounded">
        <div className="text-sm font-medium">Current State:</div>
        <div className="text-xs">
          Connected: {isConnected ? "TRUE" : "FALSE"} | Loading:{" "}
          {contextLoading ? "TRUE" : "FALSE"} | Test Loading:{" "}
          {isLoading ? "TRUE" : "FALSE"}
        </div>
      </div>

      <div className="bg-black text-green-400 p-3 rounded h-64 overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500">
            No logs yet. Click a test button to start debugging.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
