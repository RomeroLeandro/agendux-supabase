import { ChevronLeft } from "lucide-react";
import { FC } from "react";

interface MeetingType {
  id: number;
  title: string;
  duration: number;
  description: string;
}

interface MeetingTypeStepProps {
  meetingTypes: MeetingType[];
  onSelectMeeting: (meeting: MeetingType) => void;
  professionalName: string;
  onBack: () => void;
}

export const MeetingTypeStep: FC<MeetingTypeStepProps> = ({
  meetingTypes,
  onSelectMeeting,
  professionalName,
  onBack,
}) => (
  <div>
    <div className="flex items-center mb-4">
      <button
        onClick={onBack}
        className="p-1 rounded-full hover:bg-gray-100 mr-2"
      >
        <ChevronLeft size={20} />
      </button>
      <h3 className="text-lg font-bold text-center w-full text-foreground">
        Agendar con {professionalName}
      </h3>
    </div>
    <div className="space-y-3">
      {meetingTypes.map((meeting) => (
        <div
          key={meeting.id}
          onClick={() => onSelectMeeting(meeting)}
          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
        >
          <h4 className="font-semibold text-foreground text-sm">
            {meeting.title}
          </h4>
          <p className="text-xs text-secondary-foreground">
            {meeting.description}
          </p>
          <p className="text-xs text-secondary-foreground mt-1">
            {meeting.duration} minutos
          </p>
        </div>
      ))}
    </div>
  </div>
);
