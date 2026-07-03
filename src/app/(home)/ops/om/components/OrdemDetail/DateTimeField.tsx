import { Label } from "flowbite-react";
import clsx from "clsx";
import { roundTimeToFiveMinutes } from "utils/dateHandler";

// Classe base dos inputs do EtapaModal (compartilhada com os demais campos)
export const inputBaseClass =
   "w-full min-w-0 rounded border bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

export function FieldError({
   children = "Obrigatório",
}: {
   children?: string;
}) {
   return <span className="mt-1 block text-xs text-red-500">{children}</span>;
}

interface DateTimeFieldProps {
   // Prefixo dos ids dos inputs (ex: "dt_dep" -> dt_dep_date / dt_dep_time)
   idPrefix: string;
   date: string;
   time: string;
   minDate?: string;
   // Anel de foco por seção (ex: "focus:ring-sky-500" / "focus:ring-emerald-500")
   focusRingClass: string;
   // Erro de obrigatório da data (exibido após blur)
   dateMissing?: boolean;
   onChange: (date: string, time: string) => void;
   onDateBlur?: () => void;
}

// Par Data + Hora (Z) do EtapaModal, usado em Decolagem e Pouso.
// A hora é arredondada para múltiplos de 5 minutos no blur.
export function DateTimeField({
   idPrefix,
   date,
   time,
   minDate,
   focusRingClass,
   dateMissing = false,
   onChange,
   onDateBlur,
}: DateTimeFieldProps) {
   return (
      <div className="grid grid-cols-2 gap-3">
         <div>
            <Label
               htmlFor={`${idPrefix}_date`}
               className="mb-1.5 block text-xs font-medium text-slate-500"
            >
               Data <span className="text-red-500">*</span>
            </Label>
            <input
               type="date"
               id={`${idPrefix}_date`}
               value={date}
               min={minDate}
               onChange={(e) => onChange(e.target.value, time || "00:00")}
               onBlur={onDateBlur}
               className={clsx(
                  inputBaseClass,
                  dateMissing
                     ? "border-red-300 focus:ring-red-500"
                     : clsx("border-slate-300", focusRingClass)
               )}
            />
            {dateMissing && <FieldError />}
         </div>
         <div>
            <Label
               htmlFor={`${idPrefix}_time`}
               className="mb-1.5 block text-xs font-medium text-slate-500"
            >
               Hora (Z)
            </Label>
            <input
               type="time"
               id={`${idPrefix}_time`}
               value={time}
               onChange={(e) => onChange(date, e.target.value)}
               onBlur={(e) => {
                  if (!e.target.value) return;
                  const rounded = roundTimeToFiveMinutes(e.target.value);
                  if (rounded !== e.target.value) {
                     onChange(date, rounded);
                  }
               }}
               step="300"
               className={clsx(
                  inputBaseClass,
                  "border-slate-300",
                  focusRingClass
               )}
            />
         </div>
      </div>
   );
}
