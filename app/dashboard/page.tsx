"use client";

import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/Logo.webp";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Typography variant="body-md" className="text-muted-foreground">
            Cargando...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
          <Image
            src={Logo}
            alt="Logo de Agendux"
            className="h-8 w-auto"
            priority
          />
        </Link>

          <div className="flex items-center space-x-4">
            <Typography variant="body-sm" className="text-muted-foreground">
              {user?.email}
            </Typography>
            <Button onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Typography variant="heading-lg" className="text-foreground mb-2">
            ¡Bienvenido a tu Dashboard!
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground">
            Gestiona tu agenda de forma inteligente
          </Typography>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <Typography variant="heading-sm" className="text-foreground">
                Nueva Cita
              </Typography>
            </div>
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-4"
            >
              Programa una nueva cita
            </Typography>
            <Button className="w-full">Crear Cita</Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <Typography variant="heading-sm" className="text-foreground">
                Ver Calendario
              </Typography>
            </div>
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-4"
            >
              Revisa tu agenda completa
            </Typography>
            <Button className="w-full">Abrir Calendario</Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                <Clock
                  className="h-5 w-5"
                  style={{ color: "hsl(var(--chart-4))" }}
                />
              </div>
              <Typography variant="heading-sm" className="text-foreground">
                Próximas Citas
              </Typography>
            </div>
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-4"
            >
              Citas del día de hoy
            </Typography>
            <Button className="w-full">Ver Todas</Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-muted/10 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <Typography variant="heading-sm" className="text-foreground">
                Configuración
              </Typography>
            </div>
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-4"
            >
              Ajusta tu perfil
            </Typography>
            <Button className="w-full">Configurar</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-1"
            >
              Citas Hoy
            </Typography>
            <Typography variant="heading-xl" className="text-primary mb-2">
              3
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              2 pendientes, 1 completada
            </Typography>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-1"
            >
              Esta Semana
            </Typography>
            <Typography variant="heading-xl" className="text-accent mb-2">
              12
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              8 pendientes, 4 completadas
            </Typography>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <Typography
              variant="body-sm"
              className="text-muted-foreground mb-1"
            >
              Total Clientes
            </Typography>
            <Typography variant="heading-xl" className="text-chart-4 mb-2">
              47
            </Typography>
            <Typography variant="body-sm" className="text-muted-foreground">
              +3 nuevos esta semana
            </Typography>
          </div>
        </div>
      </main>
    </div>
  );
}
