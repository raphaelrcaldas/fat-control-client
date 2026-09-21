import { Label, Textarea } from "flowbite-react";

interface MissaoObsFieldProps {
   /** Id proprio de cada instancia: o campo aparece na sidebar, no drawer e no
    *  conteudo movel ao mesmo tempo, e ids repetidos quebrariam o `htmlFor`. */
   id: string;
   value: string;
   onChange: (value: string) => void;
   disabled?: boolean;
   /** `sr-only` na sidebar, onde o contexto ja e visivel; visivel no conteudo
    *  movel, que nao tem a sidebar por perto para dar o contexto. */
   labelVisible?: boolean;
   rows?: number;
   className?: string;
}

export default function MissaoObsField({
   id,
   value,
   onChange,
   disabled,
   labelVisible = false,
   rows = 2,
   className = "resize-y text-xs",
}: MissaoObsFieldProps) {
   return (
      <>
         <Label
            htmlFor={id}
            className={
               labelVisible ? "text-sm font-semibold text-slate-800" : "sr-only"
            }
         >
            Observações da missão
         </Label>
         <Textarea
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder="Observações da missão (opcional)"
            rows={rows}
            className={className}
         />
      </>
   );
}
