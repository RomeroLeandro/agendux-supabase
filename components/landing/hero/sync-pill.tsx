import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import GoogleCalendarIcon from "@/assets/GoogleCalendarIcon.webp";

export function SyncPill() {
  return (
    <div className="inline-flex items-center gap-2  px-3 py-1 mb-4 ">
      <Image
        src={GoogleCalendarIcon}
        alt="Logo de Google Calendar"
        width={24}
        height={24}
      />
      <Typography variant="body-sm" className="text-text-secondary">
        Sincronizado con Google Calendar
      </Typography>
    </div>
  );
}
