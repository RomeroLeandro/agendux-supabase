"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function WhatsAppTestPage() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [messageType, setMessageType] = useState("confirmation");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Cargar citas disponibles
  useEffect(() => {
    loadAppointments();
    loadMessages();
  }, []);

  const loadAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_datetime,
        status,
        patients(full_name, phone),
        services(name)
      `)
      .eq("user_id", user.id)
      .order("appointment_datetime", { ascending: false })
      .limit(20);

    setAppointments(data || []);
  };

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("profile_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(10);

    setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!selectedAppointment) {
      setResult({
        success: false,
        message: "Selecciona una cita primero",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/whatsapp-sender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          appointment_id: parseInt(selectedAppointment),
          message_type: messageType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "✅ Mensaje enviado correctamente",
          data: data,
        });
        loadMessages(); // Recargar mensajes
      } else {
        setResult({
          success: false,
          message: `❌ ${data.error || "Error al enviar mensaje"}`,
          data: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestTwilio = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-twilio", {
        method: "POST",
      });

      const data = await response.json();

      setResult({
        success: response.ok,
        message: response.ok
          ? "✅ Configuración de Twilio correcta"
          : "❌ Error en configuración de Twilio",
        data: data,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCron = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/whatsapp-cron", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "test"}`,
        },
      });

      const data = await response.json();

      setResult({
        success: response.ok,
        message: response.ok
          ? "✅ CRON ejecutado correctamente"
          : "❌ Error ejecutando CRON",
        data: data,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Typography variant="heading-xl" className="mb-2">
          🧪 Panel de Pruebas WhatsApp
        </Typography>
        <Typography variant="body-md" className="text-muted-foreground">
          Prueba el sistema de mensajería automática
        </Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Tests */}
        <div className="space-y-6">
          {/* Test 1: Verificar Twilio */}
          <Card className="p-6">
            <Typography variant="heading-md" className="mb-4">
              1️⃣ Verificar Configuración Twilio
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground mb-4">
              Verifica que las credenciales de Twilio sean correctas
            </Typography>
            <Button
              onClick={handleTestTwilio}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verificar Twilio
                </>
              )}
            </Button>
          </Card>

          {/* Test 2: Enviar Mensaje */}
          <Card className="p-6">
            <Typography variant="heading-md" className="mb-4">
              2️⃣ Enviar Mensaje de Prueba
            </Typography>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar Cita</Label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="">Selecciona una cita...</option>
                  {appointments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.patients?.full_name} -{" "}
                      {new Date(apt.appointment_datetime).toLocaleDateString()}{" "}
                      {new Date(apt.appointment_datetime).toLocaleTimeString()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAppointment && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  {appointments
                    .filter((apt) => apt.id === parseInt(selectedAppointment))
                    .map((apt) => (
                      <div key={apt.id} className="text-sm">
                        <p>
                          <strong>Paciente:</strong> {apt.patients?.full_name}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {apt.patients?.phone}
                        </p>
                        <p>
                          <strong>Servicio:</strong> {apt.services?.name}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Tipo de Mensaje</Label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="confirmation">Confirmación</option>
                  <option value="reminder_1">Recordatorio 1</option>
                  <option value="reminder_2">Recordatorio 2</option>
                  <option value="post_appointment">Post-Cita</option>
                </select>
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={loading || !selectedAppointment}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Test 3: Ejecutar CRON */}
          <Card className="p-6">
            <Typography variant="heading-md" className="mb-4">
              3️⃣ Ejecutar CRON Manualmente
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground mb-4">
              Busca y envía todos los recordatorios pendientes
            </Typography>
            <Button
              onClick={handleTestCron}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ejecutar CRON
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Columna Derecha: Resultados y Mensajes */}
        <div className="space-y-6">
          {/* Resultado */}
          {result && (
            <Alert
              className={
                result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
              }
            >
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <p className="font-medium mb-2">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium">
                          Ver detalles
                        </summary>
                        <pre className="text-xs bg-white p-3 rounded mt-2 overflow-auto max-h-64">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Últimos mensajes enviados */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="heading-md" className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Últimos Mensajes
              </Typography>
              <Button onClick={loadMessages} size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 border rounded-lg text-sm space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{msg.message_type}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          msg.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : msg.status === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : msg.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Para: {msg.recipient}
                    </p>
                    <p className="text-xs">
                      {new Date(msg.sent_at).toLocaleString()}
                    </p>
                    {msg.error_message && (
                      <p className="text-red-600 text-xs">❌ {msg.error_message}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay mensajes enviados aún
                </p>
              )}
            </div>
          </Card>

          {/* Información */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <Typography variant="heading-sm" className="mb-2">
              📌 Información
            </Typography>
            <ul className="text-sm space-y-1">
              <li>✅ Los mensajes se envían por Twilio</li>
              <li>✅ Requiere sandbox o cuenta pagada</li>
              <li>✅ Verifica la configuración en Settings</li>
              <li>✅ Revisa que las plantillas no estén vacías</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}