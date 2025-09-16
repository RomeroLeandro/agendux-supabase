"use client";

import { useState } from "react";
import { SettingsTabs } from "./tab-settings";
import { ProfileSettings } from "./profile-settings";
import { AutomaticMessages } from "./automatic-messages";

interface Profile {
  id?: number;
  auth_users_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profession_id?: number;
  professions?: { id: number; category: string; name: string };
}

interface Profession {
  id: number;
  category: string;
  name: string;
}

interface SettingsContentProps {
  profile: Profile | null;
  professions: Profession[];
  userId: string;
}

export function SettingsContent({
  profile,
  professions,
  userId,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            profile={profile}
            professions={professions}
            userId={userId}
          />
        );
      case "messages":
        return <AutomaticMessages />;
      case "google":
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Google Calendar (próximamente)
            </h3>
          </div>
        );
      case "notifications":
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Notificaciones (próximamente)
            </h3>
          </div>
        );
      case "security":
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Seguridad (próximamente)
            </h3>
          </div>
        );
      default:
        return (
          <ProfileSettings
            profile={profile}
            professions={professions}
            userId={userId}
          />
        );
    }
  };

  return (
    <>
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-8">{renderContent()}</div>
    </>
  );
}
