import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import MainLayout from "@/components/layout/main/mainLayout";
import { poppins, adineue } from "./fonts";
import { GoogleCalendarProvider } from "@/context/google-calendar-context";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Agendux | Gestioná tu Agenda de Citas Online",
  description:
    "Agendux es la plataforma líder para profesionales. Automatizá la gestión de tus citas, permití que tus clientes agenden online y optimizá tu tiempo.",
  openGraph: {
    title: "Agendux | Gestioná tu Agenda de Citas Online",
    description:
      "Agendux es la plataforma líder para profesionales. Automatizá la gestión de tus citas, permití que tus clientes agenden online y optimizá tu tiempo.",
    url: defaultUrl,
    siteName: "Agendux",
    images: [
      {
        url: "/Logo.ico",
        width: 1200,
        height: 630,
        alt: "Agendux | Gestioná tu Agenda de Citas Online",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agendux | Gestioná tu Agenda de Citas Online",
    description:
      "Agendux es la plataforma líder para profesionales. Automatizá la gestión de tus citas, permití que tus clientes agenden online y optimizá tu tiempo.",
    images: ["/Logo.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${adineue.variable}`}
      suppressHydrationWarning
    >
      <body className="text-base">
        <GoogleCalendarProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
        </GoogleCalendarProvider>
      </body>
    </html>
  );
}
