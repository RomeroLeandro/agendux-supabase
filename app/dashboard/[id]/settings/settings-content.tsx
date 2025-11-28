"use client";

import { useState } from "react";
import { SettingsTabs } from "./tab-settings";
import { ProfileSettings } from "./profile-settings";
import AutomaticMessages from "./automatic-messages";
import { GoogleCalendar } from "./google-calendar";
import { Notifications } from "./notifications";
import { Security } from "./security";

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
  params: {
    id: string;
  };
}

export function SettingsContent({
  profile,
  professions,
  userId,
  params,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  console.log("--- SettingsContent Render ---");
  console.log("Received params:", params);
  console.log("Current activeTab:", activeTab);

  return (
    <div className="space-y-6">
      {/* Tabs superiores */}
      <div className="border-b border-border pb-2">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Contenido de cada pestaña */}
      <div className="mt-4">
        <div className="max-w-5xl mx-auto">
          <div className={activeTab === "profile" ? "block" : "hidden"}>
            <ProfileSettings
              profile={profile}
              professions={professions}
              userId={userId}
            />
          </div>

          <div className={activeTab === "messages" ? "block" : "hidden"}>
            <AutomaticMessages params={params} />
          </div>

          <div className={activeTab === "google" ? "block" : "hidden"}>
            <GoogleCalendar />
          </div>

          <div className={activeTab === "notifications" ? "block" : "hidden"}>
            <Notifications />
          </div>

          <div className={activeTab === "security" ? "block" : "hidden"}>
            <Security />
          </div>
        </div>
      </div>
    </div>
  );
}
