"use client";

import { Button } from "@/components/ui/button";
import { Settings, List, Clock, FileText, Palette } from "lucide-react";

interface AutoAgendaTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AutoAgendaTabs({
  activeTab,
  onTabChange,
}: AutoAgendaTabsProps) {
  const tabs = [
    { id: "general", name: "General", icon: Settings },
    { id: "services", name: "Servicios", icon: List },
    { id: "schedules", name: "Horarios", icon: Clock },
    { id: "fields", name: "Campos", icon: FileText },
    { id: "design", name: "Diseño", icon: Palette },
  ];

  return (
    <div className="relative border-b border-border bg-background/70 backdrop-blur-sm">
      {/* FADE LEFT */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent md:hidden" />
      {/* FADE RIGHT */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent md:hidden" />

      {/* NAV */}
      <nav
        className="
          flex items-center gap-2
          overflow-x-auto whitespace-nowrap py-2 px-2
          scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
          md:scrollbar-none
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
