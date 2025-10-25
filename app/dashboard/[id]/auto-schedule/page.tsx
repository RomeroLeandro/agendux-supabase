"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { AutoAgendaContent } from "./auto-schedule-content";
import { createClient } from "@/lib/supabase/client";
import { Service, Profile, AutoAgendaConfig } from "@/app/types";

export default function AutoAgendaPage() {
  const params = useParams();
  const userId = params.id as string;

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

        if (user.id !== userId) {
          router.push("/auth/login");
          return;
        }

        const { data: config } = await supabase
          .from("auto_agenda_config")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setAutoAgendaConfig(config);

        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id);
        setServices(servicesData || []);

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

      // Mostrar feedback visual
      const button = document.getElementById("copy-button");
      if (button) {
        button.textContent = "✓ Copiado";
        setTimeout(() => {
          button.innerHTML =
            '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Copiar URL';
        }, 2000);
      }
    } catch (error) {
      console.error("Error al copiar la URL:", error);
      alert("Error al copiar URL. Por favor, intenta nuevamente.");
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
  const isConfigActive = autoAgendaConfig?.is_active ?? false;

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
            id="copy-button"
            className="flex-1 sm:flex-none items-center gap-2"
            onClick={handleCopyUrl}
            disabled={!isConfigActive}
            title={
              !isConfigActive
                ? "Activa tu auto-agenda para copiar la URL"
                : "Copiar URL al portapapeles"
            }
          >
            <Copy className="h-4 w-4" />
            Copiar URL
          </Button>
          <Button
            className="flex-1 sm:flex-none items-center gap-2"
            onClick={handlePreview}
            disabled={!isConfigActive}
            title={
              !isConfigActive
                ? "Activa tu auto-agenda para ver la vista previa"
                : "Ver página pública"
            }
          >
            <Eye className="h-4 w-4" />
            Vista Previa
          </Button>
        </div>
      </div>

      {!isConfigActive && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Typography variant="body-sm" className="text-yellow-800">
            ⚠️ Tu auto-agenda está desactivada. Actívala en la pestaña General
            para que tus pacientes puedan agendar citas.
          </Typography>
        </div>
      )}

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
