/**
 * Card de seção sóbrio reutilizado no formulário e na visualização de
 * usuário. O corpo aceita um `bodyClassName` porque o form empilha campos
 * (`space-y-3 p-5`) enquanto a leitura usa linhas divididas (`divide-y`).
 */

import type { ComponentType, ReactNode } from "react";

interface SectionCardProps {
   title: string;
   icon: ComponentType<{ className?: string }>;
   children: ReactNode;
   bodyClassName?: string;
}

export function SectionCard({
   title,
   icon: Icon,
   children,
   bodyClassName = "space-y-3 p-4",
}: SectionCardProps) {
   return (
      <div className="rounded border border-slate-200 bg-white shadow">
         <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
               <Icon className="h-4 w-4 text-red-600" />
               {title}
            </h2>
         </div>
         <div className={bodyClassName}>{children}</div>
      </div>
   );
}
