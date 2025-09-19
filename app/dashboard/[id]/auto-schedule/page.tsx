"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { AutoAgendaContent } from "./auto-schedule-content";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
}

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profession_id?: number;
}

interface AutoAgendaConfig {
  id?: string;
  user_id: string;
  is_active: boolean;
  url_slug: string;
  page_title: string;
  page_description: string;
  max_days_advance: number;
  min_hours_advance: number;
  max_appointments_per_day: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AutoAgendaPage({ params }: PageProps) {
  const [userId, setUserId] = useState<string>("");
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
        const resolvedParams = await params;
        const { id } = resolvedParams;
        setUserId(id);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        if (user.id !== id) {
          router.push("/auth/login");
          return;
        }

        // Obtener configuración de auto-agenda
        const { data: config } = await supabase
          .from("auto_agenda_config")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setAutoAgendaConfig(config);

        // Obtener servicios del usuario
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id);

        setServices(servicesData || []);

        // Obtener perfil del usuario
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params, router, supabase]);

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
      console.error("Error copying to clipboard:", error);
      alert("Error al copiar URL");
    }
  };

  const handlePreview = () => {
    const bookingUrl = generateBookingUrl();
    window.open(bookingUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const bookingUrl = generateBookingUrl();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button className="p-2" onClick={() => router.back()}>
            <span className="ml-2 text-sm">← Volver</span>
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

        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2"
            onClick={handleCopyUrl}
            disabled={!autoAgendaConfig?.is_active}
          >
            <Copy className="h-4 w-4" />
            Copiar URL
          </Button>
          <Button
            className="flex items-center gap-2"
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
        services={services}
        profile={profile}
        userId={userId}
        bookingUrl={bookingUrl}
      />
    </div>
  );
}
