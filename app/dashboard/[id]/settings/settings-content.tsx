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

  // AGREGAR LOGGING DETALLADO
  console.log("=== SETTINGS-CONTENT DEBUG ===");
  console.log("Profile received:", profile);
  console.log("Professions received:", professions);
  console.log("User ID received:", userId);
  console.log("Active tab:", activeTab);

  return (
    <>
      {/* Debug panel temporal */}
      <div className="mb-4 p-4 bg-blue-100 text-xs">
        <p>
          <strong>DEBUG SETTINGS-CONTENT:</strong>
        </p>
        <p>Profile received: {profile ? "YES" : "NO"}</p>
        <p>Profile data: {JSON.stringify(profile)}</p>
        <p>Professions count: {professions?.length}</p>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-8">
        <div className={activeTab === "profile" ? "block" : "hidden"}>
          <ProfileSettings
            profile={profile}
            professions={professions}
            userId={userId}
          />
        </div>

        <div className={activeTab === "messages" ? "block" : "hidden"}>
          <AutomaticMessages />
        </div>

        <div className={activeTab === "google" ? "block" : "hidden"}>
          <div>Google Calendar (próximamente)</div>
        </div>

        <div className={activeTab === "notifications" ? "block" : "hidden"}>
          <div>Notificaciones (próximamente)</div>
        </div>

        <div className={activeTab === "security" ? "block" : "hidden"}>
          <div>Seguridad (próximamente)</div>
        </div>
      </div>
    </>
  );
}
