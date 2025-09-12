// @/app/dashboard/[id]/DashboardUI.tsx
"use client"; // Este SÍ es un componente de cliente

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { Aside } from "@/components/dashboard/aside";
import { Typography } from "@/components/ui/typography";

interface ProfessionalData {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  professions: { name: string } | null;
  username: string;
  phone: string;
}

interface DashboardUIProps {
  user: User;
  professional: ProfessionalData;
}

export function DashboardUI({ user, professional }: DashboardUIProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const fullName = `${professional.first_name} ${professional.last_name}`;

  return (
    <div className="min-h-screen bg-background flex">
      <Aside
        user={user}
        professional={{ ...professional, first_name: fullName }}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8">
        <Typography variant="heading-lg" className="text-foreground mb-2">
          ¡Bienvenido, {fullName}!
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground">
          Aquí tienes el resumen de tu actividad.
        </Typography>
      </main>
    </div>
  );
}
