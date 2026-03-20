import { Label, TextInput } from "flowbite-react";
import clsx from "clsx";
import { getDateStatus, getStatusConfig } from "../../utils/dateStatus";

const statusLabels = {
   valid: "Em dia",
   warning: "Atenção (< 90 dias)",
   critical: "Crítico (< 30 dias)",
   expired: "Vencido",
   empty: "Sem data",
} as const;

interface DateFieldProps {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DateField({
   label,
   name,
   value,
   onChange,
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
            />
         </div>
         <div className="mt-1 flex items-center gap-1.5">
            <Icon className={clsx("h-4 w-4", config.color)} />
            <span className={clsx("text-xs font-medium", config.color)}>
               {statusLabels[status]}
            </span>
         </div>
      </div>
   );
}
