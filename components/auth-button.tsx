"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();

    // Obtener usuario actual
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
        <div className="w-24 h-10 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground text-sm">Hey, {user.email}!</span>
      <Link href="/dashboard">
        <Button>Dashboard</Button>
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <Link href="/auth/login">
        <Button className="text-muted-foreground hover:text-primary transition-colors bg-transparent border-none shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0 ">
          Iniciar Sesión
        </Button>
      </Link>
      <Link href="/auth/sign-up">
        <Button>Empieza ahora</Button>
      </Link>
    </div>
  );
}
