"use client";

import { useState } from "react";
import { AutoAgendaTabs } from "./auto-schedule-tabs";
import { GeneralConfig } from "./general-config";
import { ServicesConfig } from "./service-config"; // Asumo que este componente existe
import { Service, Profile, AutoAgendaConfig } from "@/app/types"; // Importamos Profile
import { SchedulesConfig } from "./schedules-config";
import { FieldsConfig } from "./fields-config";
import { DesignConfig } from "./design-config";
import { DuplicateSlugHandler } from "./duplicate-slug-handler";

// BORRA cualquier 'interface Profile {...}' que pueda haber aquí

interface AutoAgendaContentProps {
  config: AutoAgendaConfig | null;
  services: Service[];
  profile: Profile | null; // Ahora usa el tipo importado
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
      <DuplicateSlugHandler
        userId={userId}
        currentConfig={
          config
            ? {
                id: String(config.id),
                url_slug: config.url_slug,
              }
            : null
        }
      />
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
          {/* Asumo que tienes un componente ServicesConfig, si no, reemplázalo */}
          <ServicesConfig services={services} userId={userId} />
        </div>

        <div className={activeTab === "schedules" ? "block" : "hidden"}>
          <SchedulesConfig userId={userId} />
        </div>

        <div className={activeTab === "fields" ? "block" : "hidden"}>
          <FieldsConfig userId={userId} />
        </div>

        <div className={activeTab === "design" ? "block" : "hidden"}>
          <DesignConfig userId={userId} config={config} />
        </div>
      </div>
    </>
  );
}
