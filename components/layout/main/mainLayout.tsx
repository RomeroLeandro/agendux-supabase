"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header/header";

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
    "/dashboard",
  ];

  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  return (
    <>
      {!shouldHideHeader && <Header />}
      {children}
    </>
  );
}
