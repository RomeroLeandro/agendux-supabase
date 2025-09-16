"use client";

import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Perfil", icon: "👤" },
  { id: "messages", label: "Mensajes Automáticos", count: 3, icon: "💬" },
  { id: "google", label: "Google Calendar", icon: "📅" },
  { id: "notifications", label: "Notificaciones", icon: "🔔" },
  { id: "security", label: "Seguridad", icon: "🔒" },
];

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count && (
              <span className="ml-1 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
