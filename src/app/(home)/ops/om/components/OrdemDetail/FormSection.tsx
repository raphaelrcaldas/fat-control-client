import type { ReactNode } from "react";
import clsx from "clsx";

interface FormSectionProps {
   // Sem título, o cartão renderiza só o corpo (ex: Etapas, Ordens Especiais)
   title?: string;
   // Cor da barrinha de destaque ao lado do título (ex: "bg-blue-500")
   accentClass?: string;
   // Conteúdo extra no cabeçalho, ao lado do título (ex: botão "Gerenciar")
   action?: ReactNode;
   contentClassName?: string;
   children: ReactNode;
}

// Cartão de seção do formulário de OM: cabeçalho opcional (título + ação)
// e corpo com padding configurável por seção
export function FormSection({
   title,
   accentClass = "bg-blue-500",
   action,
   contentClassName = "p-4",
   children,
}: FormSectionProps) {
   return (
      <div className="rounded border border-slate-200 bg-white shadow-sm">
         {title && (
            <div className="border-b border-slate-200 p-4">
               <div className="flex items-center gap-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                     <div
                        className={clsx("h-4 w-1 rounded-full", accentClass)}
                     />
                     {title}
                  </h3>
                  {action}
               </div>
            </div>
         )}
         <div className={contentClassName}>{children}</div>
      </div>
   );
}
