"use client";

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
    <div className="relative border-b border-border bg-background/70 backdrop-blur-sm">
      {/* FADE LEFT (mobile) */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent md:hidden" />
      {/* FADE RIGHT (mobile) */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent md:hidden" />

      {/* NAV TABS */}
      <nav
        className="
          flex items-center gap-2
          overflow-x-auto whitespace-nowrap py-2 px-2
          scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
          md:scrollbar-none
        "
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }
              `}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>

              {tab.count && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
