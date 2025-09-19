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
    {
      id: "general",
      name: "General",
      icon: Settings,
    },
    {
      id: "services",
      name: "Servicios",
      icon: List,
    },
    {
      id: "schedules",
      name: "Horarios",
      icon: Clock,
    },
    {
      id: "fields",
      name: "Campos",
      icon: FileText,
    },
    {
      id: "design",
      name: "Diseño",
      icon: Palette,
    },
  ];

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
