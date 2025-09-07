import { ChevronLeft, ChevronRight } from "lucide-react";
import { FC, useMemo } from "react";

interface CalendarStepProps {
  currentMonthDate: Date;
  onMonthChange: (offset: number) => void;
  onSelectDate: (day: number) => void;
  onBack: () => void;
}

export const CalendarStep: FC<CalendarStepProps> = ({
  currentMonthDate,
  onMonthChange,
  onSelectDate,
  onBack,
}) => {
  const calendarData = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const monthName = currentMonthDate.toLocaleString("es-ES", {
      month: "long",
    });
    const yearName = currentMonthDate.getFullYear();
    return { startingDay, daysInMonth, monthName, yearName };
  }, [currentMonthDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);
  maxDate.setHours(23, 59, 59, 999);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-bold text-md capitalize">
          {calendarData.monthName}, {calendarData.yearName}
        </h3>
        <div>
          <button
            onClick={() => onMonthChange(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => onMonthChange(1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {Array.from({ length: calendarData.startingDay }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}
        {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(
            calendarData.yearName,
            currentMonthDate.getMonth(),
            day
          );
          const dayOfWeek = date.getDay();
          const isDisabled =
            dayOfWeek === 0 ||
            dayOfWeek === 6 ||
            date < today ||
            date > maxDate;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(day)}
              disabled={isDisabled}
              className={`p-2 rounded-full text-center ${
                isDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-indigo-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
