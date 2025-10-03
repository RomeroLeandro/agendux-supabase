// 👇 1. Se mantiene porque usas hooks como useState, useEffect, etc.
"use client";

import { useState, useEffect } from "react";
// 👇 2. Importamos 'useParams' para leer la URL en un Client Component.
import { useRouter, useParams } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { AutoAgendaContent } from "./auto-schedule-content";
import { createClient } from "@/lib/supabase/client";
import { Service, Profile, AutoAgendaConfig } from "@/app/types";

// 👇 3. Ya no se reciben 'params' como props, por lo que la interfaz se elimina.
export default function AutoAgendaPage() {
  // 👇 4. Esta es la forma correcta de obtener los parámetros en un Client Component.
  const params = useParams();
  const userId = params.id as string; // Extraemos el 'id' del objeto de parámetros.

  const [autoAgendaConfig, setAutoAgendaConfig] =
    useState<AutoAgendaConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // Verificamos si el usuario autenticado coincide con el de la URL
        if (user.id !== userId) {
          // Puedes redirigir o mostrar un error de acceso denegado
          router.push("/auth/login");
          return;
        }

        // Cargar configuración de Auto-Agenda
        const { data: config } = await supabase
          .from("auto_agenda_config")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setAutoAgendaConfig(config);

        // Cargar servicios
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id);
        setServices(servicesData || []);

        // Cargar perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadData();
    } else {
      // Si no hay userId en la URL, no hay nada que cargar.
      setIsLoading(false);
    }
  }, [userId, router, supabase]);

  const generateBookingUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const slug =
      autoAgendaConfig?.url_slug ||
      `${profile?.first_name?.toLowerCase() || "dr"}-${
        profile?.last_name?.toLowerCase() || "profesional"
      }`;
    return `${baseUrl}/book/${slug}`;
  };

  const handleCopyUrl = async () => {
    try {
      const bookingUrl = generateBookingUrl();
      await navigator.clipboard.writeText(bookingUrl);
      alert("URL copiada al portapapeles");
    } catch (error) {
      console.error("Error al copiar la URL:", error);
      alert("Error al copiar URL");
    }
  };

  const handlePreview = () => {
    const bookingUrl = generateBookingUrl();
    window.open(bookingUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const bookingUrl = generateBookingUrl();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()}>
            <span className="text-sm">←</span>
          </Button>
          <div>
            <Typography variant="heading-xl" className="font-semibold">
              Auto-Agenda
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              Configura tu página pública para que los pacientes puedan agendar
              citas
            </Typography>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            className="flex-1 sm:flex-none items-center gap-2"
            onClick={handleCopyUrl}
            disabled={!autoAgendaConfig?.is_active}
          >
            <Copy className="h-4 w-4" />
            Copiar URL
          </Button>
          <Button
            className="flex-1 sm:flex-none items-center gap-2"
            onClick={handlePreview}
            disabled={!autoAgendaConfig?.is_active}
          >
            <Eye className="h-4 w-4" />
            Vista Previa
          </Button>
        </div>
      </div>

      <AutoAgendaContent
        config={autoAgendaConfig}
        services={services || []}
        profile={profile}
        userId={userId}
        bookingUrl={bookingUrl}
      />
    </div>
  );
}
