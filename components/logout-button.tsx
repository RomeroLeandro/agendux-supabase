"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      onClick={logout}
      className="text-muted-foreground hover:text-primary transition-colors bg-transparent border-none shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0"
    >
      Cerrar Sesión
    </Button>
  );
}
