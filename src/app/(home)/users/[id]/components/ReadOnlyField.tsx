/**
 * Campo somente leitura (sem edição), no mesmo layout de linha do
 * EditableField para alinhamento visual dentro do SectionCard.
 */

interface ReadOnlyFieldProps {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   value: string;
   fieldName?: string;
}

export function ReadOnlyField({
   icon: Icon,
   label,
   value,
   fieldName,
}: ReadOnlyFieldProps) {
   return (
      <div
         id={fieldName ? `field-${fieldName}` : undefined}
         className="flex items-center gap-3 px-5 py-3.5"
      >
         <div className="bg-primary-100 shrink-0 rounded-md p-2.5">
            <Icon className="text-primary-600 h-4 w-4" />
         </div>
         <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-xs font-medium tracking-wide text-gray-500 uppercase">
               {label}
            </p>
            <p className="text-sm leading-tight font-semibold text-gray-900 select-all">
               {value || "—"}
            </p>
         </div>
      </div>
   );
}
