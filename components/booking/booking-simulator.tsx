import { ChangeEvent, FormEvent, useState } from "react";
import { ProfileView } from "./profile-view";
import { StatusStep } from "./status-step";
import { CalendarStep } from "./calendar-step";
import { TimeSlotStep } from "./time-slot-step";
import { ConfirmationStep } from "./confirmation-step";
import { MeetingTypeStep } from "./meeting-type-step";
import {
  mockProfile,
  mockMeetingTypes,
  mockTimeSlots,
} from "@/config/professional";
import { Card } from "../ui/card";

interface MeetingType {
  id: number;
  title: string;
  duration: number;
  description: string;
}

interface UserInfo {
  name: string;
  whatsapp: string;
}

type RequestStatus = "idle" | "sending" | "sent" | "error";

export default function BookingSimulator() {
  const [step, setStep] = useState<number>(0);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingType | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    whatsapp: "",
  });
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");

  const handleSelectMeeting = (meeting: MeetingType) => {
    setSelectedMeeting(meeting);
    setStep(2);
  };

  const handleSelectDate = (day: number) => {
    setSelectedDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day)
    );
    setStep(3);
  };

  const handleSubmitRequest = (e: FormEvent) => {
    e.preventDefault();
    setStep(5);
    setRequestStatus("sending");
    setTimeout(() => {
      setRequestStatus(Math.random() > 0.1 ? "sent" : "error");
    }, 2000);
  };

  const resetFlow = () => {
    setStep(0);
    setSelectedMeeting(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setUserInfo({ name: "", whatsapp: "" });
    setRequestStatus("idle");
  };

  const handleUserInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <ProfileView profile={mockProfile} onNext={() => setStep(1)} />;
      case 1:
        return (
          <MeetingTypeStep
            meetingTypes={mockMeetingTypes}
            professionalName={mockProfile.name}
            onSelectMeeting={handleSelectMeeting}
            onBack={() => setStep(0)}
          />
        );
      case 2:
        return (
          <CalendarStep
            currentMonthDate={currentMonthDate}
            onMonthChange={(offset: number) =>
              setCurrentMonthDate((prev) => {
                const d = new Date(prev);
                d.setMonth(d.getMonth() + offset);
                return d;
              })
            }
            onSelectDate={handleSelectDate}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <TimeSlotStep
            selectedDate={selectedDate}
            timeSlots={mockTimeSlots}
            onSelectTime={(time: string) => {
              setSelectedTime(time);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            selectedMeeting={selectedMeeting}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            userInfo={userInfo}
            onUserInfoChange={handleUserInfoChange}
            onSubmit={handleSubmitRequest}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <StatusStep
            status={requestStatus}
            onReset={resetFlow}
            onRetry={() => setStep(4)}
          />
        );
      default:
        return <ProfileView profile={mockProfile} onNext={() => setStep(1)} />;
    }
  };

  return <Card className="">{renderStepContent()}</Card>;
}
