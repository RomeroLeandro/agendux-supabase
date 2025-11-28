"use client";

import { useState } from "react";
import { AutoAgendaTabs } from "./auto-schedule-tabs";
import { GeneralConfig } from "./general-config";
import { ServicesConfig } from "./service-config";
import { Service, Profile, AutoAgendaConfig } from "@/app/types";
import { SchedulesConfig } from "./schedules-config";
import { FieldsConfig } from "./fields-config";
import { DesignConfig } from "./design-config";
import { DuplicateSlugHandler } from "./duplicate-slug-handler";

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
    <div className="space-y-6">
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

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm pt-2 pb-4 border-b">
        <AutoAgendaTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Contenido con card visual */}
      <div className="mt-4">
        <div
          className={`${
            activeTab === "general"
              ? "opacity-100"
              : "opacity-0 pointer-events-none hidden"
          } transition-opacity duration-300`}
        >
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <GeneralConfig
              config={config}
              profile={profile}
              userId={userId}
              bookingUrl={bookingUrl}
            />
          </div>
        </div>

        <div
          className={`${
            activeTab === "services"
              ? "opacity-100"
              : "opacity-0 pointer-events-none hidden"
          } transition-opacity duration-300`}
        >
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <ServicesConfig services={services} userId={userId} />
          </div>
        </div>

        <div
          className={`${
            activeTab === "schedules"
              ? "opacity-100"
              : "opacity-0 pointer-events-none hidden"
          } transition-opacity duration-300`}
        >
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <SchedulesConfig userId={userId} />
          </div>
        </div>

        <div
          className={`${
            activeTab === "fields"
              ? "opacity-100"
              : "opacity-0 pointer-events-none hidden"
          } transition-opacity duration-300`}
        >
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <FieldsConfig userId={userId} />
          </div>
        </div>

        <div
          className={`${
            activeTab === "design"
              ? "opacity-100"
              : "opacity-0 pointer-events-none hidden"
          } transition-opacity duration-300`}
        >
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <DesignConfig userId={userId} config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
