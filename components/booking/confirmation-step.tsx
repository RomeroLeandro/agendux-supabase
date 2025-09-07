import React, { ChangeEvent, FormEvent } from "react";
import { ChevronLeft, MoveRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingType {
  id: number;
  title: string;
  duration: number;
  description: string;
}

type UserInfo = {
  name: string;
  whatsapp: string;
};

interface ConfirmationStepProps {
  selectedMeeting: MeetingType | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  userInfo: UserInfo;
  onUserInfoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedMeeting,
  selectedDate,
  selectedTime,
  userInfo,
  onUserInfoChange,
  onSubmit,
  onBack,
}) => {
  if (!selectedDate || !selectedMeeting) return null;
  const summaryDate = selectedDate.toLocaleDateString("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
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
        <h3 className="font-bold text-lg capitalize">Finaliza tu reserva</h3>
      </div>
      <div className="p-3 border rounded-lg space-y-2 mb-4 text-sm">
        <div className="flex items-center">
          <MoveRight className="h-4 w-4 mr-2 text-gray-400" />{" "}
          <span>{selectedMeeting?.title}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />{" "}
          <span>
            {summaryDate}, {selectedTime}
          </span>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Tu nombre
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={userInfo.name}
              onChange={onUserInfoChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="whatsapp"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Tu WhatsApp
            </label>
            <input
              type="tel"
              name="whatsapp"
              id="whatsapp"
              value={userInfo.whatsapp}
              onChange={onUserInfoChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full mt-6">
          Confirmar Reserva
        </Button>
      </form>
    </div>
  );
};
