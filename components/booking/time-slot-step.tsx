import { ChevronLeft } from "lucide-react";
import { FC } from "react";

interface TimeSlotStepProps {
  selectedDate: Date | null;
  timeSlots: string[];
  onSelectTime: (time: string) => void;
  onBack: () => void;
}

export const TimeSlotStep: FC<TimeSlotStepProps> = ({
  selectedDate,
  timeSlots,
  onSelectTime,
  onBack,
}) => {
  if (!selectedDate) return null;
  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 mr-2"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-bold text-md capitalize">
          Horarios para el {formattedDate}
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => onSelectTime(time)}
            className="p-2 text-sm border rounded-lg hover:bg-chart-5 hover:text-white transition"
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};
