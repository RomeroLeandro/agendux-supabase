"use client";

import { useState } from "react";
import { AutoAgendaTabs } from "./auto-schedule-tabs";
import { GeneralConfig } from "./general-config";

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

interface AutoAgendaContentProps {
  config: AutoAgendaConfig | null;
  services: Service[];
  profile: Profile | null;
  userId: string;
  bookingUrl: string;
}

export function AutoAgendaContent({
  config,
  services,
  profile,
  userId,
  bookingUrl,
}: AutoAgendaContentProps) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <>
      <AutoAgendaTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-8">
        <div className={activeTab === "general" ? "block" : "hidden"}>
          <GeneralConfig
            config={config}
            profile={profile}
            userId={userId}
            bookingUrl={bookingUrl}
          />
        </div>

        <div className={activeTab === "services" ? "block" : "hidden"}>
          <div>Servicios (en desarrollo)</div>
        </div>

        <div className={activeTab === "schedules" ? "block" : "hidden"}>
          <div>Horarios (en desarrollo)</div>
        </div>

        <div className={activeTab === "fields" ? "block" : "hidden"}>
          <div>Campos (en desarrollo)</div>
        </div>

        <div className={activeTab === "design" ? "block" : "hidden"}>
          <div>Diseño (en desarrollo)</div>
        </div>
      </div>
    </>
  );
}
