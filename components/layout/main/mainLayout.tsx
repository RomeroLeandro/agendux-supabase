"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";

export default function ConditionalHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Rutas donde no se debe mostrar el header
  const hideHeaderRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/login",
    "/signup",
    "/onboarding",
  ];

  const shouldHideHeader =
    hideHeaderRoutes.includes(pathname) || pathname.startsWith("/dashboard");

  return (
    <>
      {!shouldHideHeader && <Header />}
      {children}
      {!shouldHideHeader && <Footer />}
    </>
  );
}
