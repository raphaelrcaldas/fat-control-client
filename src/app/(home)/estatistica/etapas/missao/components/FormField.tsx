import type { ReactNode } from "react";
import { Label } from "flowbite-react";

export const fieldLabelClass =
   "mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase";

export const errorTextClass = "mt-1 text-xs font-medium text-red-600";

interface FormFieldProps {
   label: string;
   htmlFor?: string;
   error?: string;
   /** Classe do wrapper externo (default: nenhuma). */
   className?: string;
   /** Classe do Label (default: fieldLabelClass). */
   labelClassName?: string;
   children: ReactNode;
   /** Conteudo extra renderizado apos a mensagem de erro (ex.: avisos). */
   footer?: ReactNode;
}

export function FormField({
   label,
   htmlFor,
   error,
   className,
   labelClassName = fieldLabelClass,
   children,
   footer,
}: FormFieldProps) {
   return (
      <div className={className}>
         <Label htmlFor={htmlFor} className={labelClassName}>
            {label}
         </Label>
         {children}
         {error && <p className={errorTextClass}>{error}</p>}
         {footer}
      </div>
   );
}
