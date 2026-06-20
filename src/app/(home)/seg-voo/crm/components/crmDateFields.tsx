import { Label, TextInput } from "flowbite-react";
import clsx from "clsx";
import { getDateStatus, getStatusConfig } from "@/utils/dateStatus";
import { STATUS_LABELS } from "../crmRules";

interface DateFieldProps {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   max?: string;
   min?: string;
}

/** Campo de data simples — sem avaliação de status (data de realização). */
export function SimpleDateField({
   label,
   name,
   value,
   onChange,
   max,
}: DateFieldProps) {
   return (
      <div>
         <Label htmlFor={name}>{label}</Label>
         <div className="mt-1">
            <TextInput
               id={name}
               name={name}
               type="date"
               value={value}
               onChange={onChange}
               max={max || undefined}
            />
         </div>
      </div>
   );
}

/** Campo de data com indicador de status — usado para a data de validade. */
export function ValidadeDateField({
   label,
   name,
   value,
   onChange,
   min,
}: DateFieldProps) {
   const status = getDateStatus(value || null);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   return (
      <div>
         <Label htmlFor={name}>{label}</Label>
         <div className="mt-1">
            <TextInput
               id={name}
               name={name}
               type="date"
               value={value}
               onChange={onChange}
               min={min || undefined}
            />
         </div>
         <div className="mt-1 flex items-center gap-1.5">
            <Icon className={clsx("h-4 w-4", config.color)} />
            <span className={clsx("text-xs font-medium", config.color)}>
               {STATUS_LABELS[status]}
            </span>
         </div>
      </div>
   );
}
