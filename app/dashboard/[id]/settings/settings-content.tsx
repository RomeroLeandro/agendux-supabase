"use client";

import { useState } from "react";
import { SettingsTabs } from "./tab-settings";
import { ProfileSettings } from "./profile-settings";
import { AutomaticMessages } from "./automatic-messages";
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
}

export function SettingsContent({
  profile,
  professions,
  userId,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
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
          <GoogleCalendar />
        </div>

        <div className={activeTab === "notifications" ? "block" : "hidden"}>
          <Notifications />
        </div>

        <div className={activeTab === "security" ? "block" : "hidden"}>
          <Security />
        </div>
      </div>
    </>
  );
}
