"use client";

import clsx from "clsx";

export interface SegOption<T> {
   value: T;
   label: string;
   /** Contagem ao lado do rótulo; omitir quando não fizer sentido. */
   count?: number;
}

interface Props<T> {
   options: SegOption<T>[];
   value: T;
   onChange: (v: T) => void;
   /** Rótulo do grupo para leitores de tela quando não há `FiltroGrupo`. */
   ariaLabel?: string;
   /** `xs` para uso dentro de um painel do dossiê, onde o espaço é curto. */
   size?: "sm" | "xs";
}

/**
 * Controle segmentado — o único dialeto de filtro da tela.
 *
 * Substitui os três que conviviam aqui: botões sólidos nas etapas, chips do
 * Flowbite no pau de sebo e badges com anel no efetivo. Filtros que fazem a
 * mesma coisa passam a ter a mesma forma.
 *
 * Sem `pointer-coarse:min-h-[44px]`: o segmentado aparece no modal e no painel
 * do pau de sebo, ambos densos, e 44px por botão infla a barra inteira. Os
 * 44px valem para a ação primária — ver a barra fixa do modal no mobile.
 */
export function Segmented<T extends string | null>({
   options,
   value,
   onChange,
   ariaLabel,
   size = "sm",
}: Props<T>) {
   return (
      <div
         role="group"
         aria-label={ariaLabel}
         className="flex w-fit items-center gap-0.5 rounded-md bg-slate-200/70 p-0.5"
      >
         {options.map((o) => {
            const active = value === o.value;
            return (
               <button
                  key={String(o.value)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange(o.value)}
                  className={clsx(
                     "flex shrink-0 items-center gap-1 rounded font-semibold whitespace-nowrap transition-all",
                     size === "xs"
                        ? "px-2 py-1 text-[11px]"
                        : "px-2.5 py-1.5 text-xs",
                     active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                  )}
               >
                  {o.label}
                  {/* A contagem se distingue do rótulo pelo peso, não por tinta
                      mais clara: no botão inativo o fundo já é o cinza do
                      trilho, e qualquer tom abaixo de `slate-600` ali reprova
                      contraste AA — medido no axe. */}
                  {o.count !== undefined && (
                     <span
                        className={clsx(
                           "font-bold tabular-nums",
                           active ? "text-slate-600" : "text-slate-700"
                        )}
                     >
                        {o.count}
                     </span>
                  )}
               </button>
            );
         })}
      </div>
   );
}
