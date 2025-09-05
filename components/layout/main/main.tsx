"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header/header";
// import { Footer } from "./Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noLayoutRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/auth/error",
    "/auth/callback",
  ];

  const showLayout = !noLayoutRoutes.includes(pathname);

  return (
    <>
      {showLayout && <Header />}
      <main>{children}</main>
      {/* {showLayout && <Footer />} */}
    </>
  );
}
