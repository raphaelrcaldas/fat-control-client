"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface ExportSectionProps {
   icon: IconType;
   title: string;
   /** Uma linha explicando o que se faz aqui; some quando e obvio. */
   hint?: string;
   /** Contagem a direita do titulo ("15 colunas", "7 de 13"). */
   badge?: string;
   /**
    * `id` do controle que a secao rotula. Com ele o titulo vira `<label>` e
    * clicar nele foca o campo — vale quando a secao inteira e UM input.
    */
   titleFor?: string;
   /** Controle no canto direito, alinhado ao titulo. */
   action?: ReactNode;
   /**
    * Posicao da secao na pilha, para a entrada escalonada (`--i`).
    * O modal inteiro se MONTA em vez de piscar pronto.
    */
   index: number;
   children: ReactNode;
}

/**
 * Moldura das secoes do modal de exportacao.
 *
 * Sao quatro perguntas em sequencia — em que ordem, quais colunas, como vai
 * ficar, com que nome — e antes elas se distinguiam so pelo espaco entre uma e
 * outra. O icone da a cada uma uma marca que se acha de relance, e o `badge`
 * responde de cara "quantas" sem obrigar a contar checkbox.
 *
 * `h4` porque o `ModalHeader` do Flowbite ja gasta o `h3`.
 */
export function ExportSection({
   icon: Icon,
   title,
   hint,
   badge,
   titleFor,
   action,
   index,
   children,
}: ExportSectionProps) {
   return (
      <section
         className="animate-enter space-y-2"
         style={{ "--i": index } as React.CSSProperties}
      >
         <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
               <h4 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-900">
                  <Icon
                     aria-hidden
                     className="h-4 w-4 shrink-0 text-slate-400"
                  />
                  {titleFor ? (
                     <label htmlFor={titleFor} className="cursor-pointer">
                        {title}
                     </label>
                  ) : (
                     title
                  )}
                  {badge && (
                     <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 tabular-nums">
                        {badge}
                     </span>
                  )}
               </h4>
               {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
            </div>
            {action}
         </div>
         {children}
      </section>
   );
}
