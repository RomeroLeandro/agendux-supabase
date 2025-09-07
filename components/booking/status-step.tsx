import { CheckCircle2, Loader2 } from "lucide-react";
import { FC } from "react";

interface StatusStepProps {
  status: RequestStatus;
  onReset: () => void;
  onRetry: () => void;
}

type RequestStatus = "idle" | "sending" | "sent" | "error";

export const StatusStep: FC<StatusStepProps> = ({
  status,
  onReset,
  onRetry,
}) => (
  <div className="text-center py-8 flex flex-col items-center justify-center h-full">
    {status === "sending" && (
      <>
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        <p className="mt-3 text-gray-600 text-sm">Confirmando tu reserva...</p>
      </>
    )}
    {status === "sent" && (
      <>
        <div className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-semibold">
            ¡Reserva confirmada con éxito!
          </span>
        </div>
        <p className="text-gray-600 mt-2 text-xs">
          Recibirás una confirmación por WhatsApp.
        </p>
        <button
          onClick={onReset}
          className="mt-5 bg-indigo-600 text-white font-bold py-2 px-4 text-sm rounded-lg hover:bg-indigo-700 transition"
        >
          Hacer otra reserva
        </button>
      </>
    )}
    {status === "error" && (
      <>
        <p className="text-red-500 text-sm">
          Hubo un error al confirmar la reserva.
        </p>
        <button
          onClick={onRetry}
          className="mt-4 bg-gray-200 text-gray-800 font-bold py-2 px-4 text-sm rounded-lg hover:bg-gray-300 transition"
        >
          Intentar de nuevo
        </button>
      </>
    )}
  </div>
);
