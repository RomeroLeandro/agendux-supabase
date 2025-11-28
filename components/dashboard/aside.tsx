"use client";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Clock,
  CalendarDays,
  BarChart,
  MessageSquare,
  Globe,
  CreditCard,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import Logo from "@/assets/Logo.webp";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useEffect, useState } from "react";

interface ProfessionalProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  professions: { name: string } | null;
}

interface AsideProps {
  user: User | null;
  professional: ProfessionalProfile | null;
  todaysAppointmentsCount: number;
  allAppointmentsCount: number;
  unreadMessagesCount: number;
}

export const Aside = ({
  user,
  professional,
  todaysAppointmentsCount,
  allAppointmentsCount,
  unreadMessagesCount,
}: AsideProps) => {
  const pathname = usePathname();
  const professionalId = professional?.id;
  const userEmail = user?.email || "";
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false); // 👈 estado del menú mobile

  // Cerrar el menú cuando cambia la ruta (para que se cierre al navegar)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { path: "", label: "Dashboard", icon: LayoutDashboard },
    { path: "quotes/new", label: "Nueva Cita", icon: Plus },
    {
      path: "quotes/today",
      label: "Citas de Hoy",
      icon: Clock,
      badge: todaysAppointmentsCount,
    },
    {
      path: "quotes",
      label: "Todas las Citas",
      icon: Calendar,
      badge: allAppointmentsCount,
    },
    { path: "calendar", label: "Mi Calendario", icon: CalendarDays },
    { path: "services", label: "Servicios", icon: Briefcase },
    { path: "reports", label: "Reportes", icon: BarChart },
    {
      path: "messages",
      label: "Mensajes",
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    { path: "auto-schedule", label: "Auto-Agenda", icon: Globe },
    { path: "subscription", label: "Suscripción", icon: CreditCard },
    { path: "settings", label: "Configuración", icon: Settings },
  ];

  const getInitials = () => {
    if (!professional) return "?";
    const { first_name, last_name } = professional;
    return `${first_name?.[0] || ""}${last_name?.[0] || ""}`.toUpperCase();
  };
  const fullName = professional
    ? `${professional.first_name} ${professional.last_name}`
    : "Cargando...";
  const professionName = professional?.professions?.name || "Profesional";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Botón hamburguesa - solo mobile */}
      <button
        type="button"
        className="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-full border bg-background p-2 shadow-md md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay cuando el menú está abierto en mobile */}
      <div
        className={twMerge(
          "fixed inset-0 z-30 bg-black/40 opacity-0 pointer-events-none transition-opacity md:hidden",
          isOpen && "opacity-100 pointer-events-auto"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* ASIDE */}
      <aside
        className={twMerge(
          // base
          "z-40 flex h-screen w-72 flex-shrink-0 flex-col bg-card border-r border-border p-4 transition-transform duration-200",
          // mobile: drawer
          "fixed inset-y-0 left-0 -translate-x-full md:static md:translate-x-0",
          isOpen && "translate-x-0"
        )}
      >
        {/* Botón cerrar - solo mobile */}
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border bg-background p-1.5 shadow-sm md:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center m-6 mt-10 md:mt-6">
          <Link
            href={`/dashboard/${professionalId || ""}`}
            className="flex items-center gap-x-3"
          >
            <Image
              src={Logo}
              alt="Logo de Agendux"
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-grow space-y-1.5 px-2">
          {navLinks.map((link) => {
            if (!professionalId) return null;
            const fullHref = link.path
              ? `/dashboard/${professionalId}/${link.path}`
              : `/dashboard/${professionalId}`;
            const isActive = pathname === fullHref;

            return (
              <Link
                href={fullHref}
                key={link.label}
                className={twMerge(
                  "flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
                {link.badge ? (
                  <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Perfil de Usuario y Logout */}
        <div className="mt-auto p-2 space-y-2">
          <div className="flex items-center gap-x-3 p-2">
            {professional?.avatar_url ? (
              <Image
                src={professional.avatar_url}
                alt={fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                {getInitials()}
              </div>
            )}
            <div className="flex-grow">
              <Typography
                variant="body-sm"
                className="font-semibold text-foreground p-0"
              >
                {fullName}
              </Typography>
              <Typography
                variant="body-xs"
                className="text-muted-foreground p-0"
              >
                {userEmail}
              </Typography>
              <Typography
                variant="body-xs"
                className="text-muted-foreground p-0"
              >
                {professionName}
              </Typography>
            </div>
            <ThemeSwitcher />
          </div>
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-foreground transition-colors bg-transparent"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
