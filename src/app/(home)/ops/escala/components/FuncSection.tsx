"use client";
import { useId, useState } from "react";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import { useFuncoes } from "@/hooks/queries";
import { TripCard } from "./TripCard";
import type { SectionBucket } from "../types";

interface FuncSectionProps {
   bucket: SectionBucket;
   index: number;
}

export function FuncSection({ bucket, index }: FuncSectionProps) {
   const { colors: funcColors, label: funcLabel } = useFuncoes();
   const funcKey = bucket.func as FuncType;
   const colors = funcColors(funcKey);
   const label = funcLabel(funcKey);
   const efetivos = bucket.disponiveis.length;
   const inop = bucket.indisponiveis.length;

   return (
      <section
         className={clsx(
            "relative flex w-full flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm sm:w-68 sm:shrink-0 sm:grow-0",
            // A coluna não é clicável — o realce fica só no mouse, onde lê
            // como profundidade. No dedo, `hover` gruda depois do toque e
            // sugere uma interação que não existe.
            "transition-shadow pointer-fine:hover:shadow-md"
         )}
      >
         <div className={clsx("absolute inset-y-0 left-0 w-1.5", colors.bar)} />

         <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-3 pl-7">
            <div className="flex items-baseline gap-3">
               <span
                  className={clsx(
                     "font-mono text-xs font-semibold tracking-widest tabular-nums",
                     colors.text
                  )}
               >
                  {String(index).padStart(2, "0")}
               </span>
               <h2 className="text-lg leading-none font-extrabold tracking-tight text-slate-900 uppercase">
                  {label}
               </h2>
            </div>

            {/* `w-full` força o bloco de contagens SEMPRE para a segunda
                linha. Sem isso ele só quebrava quando o nome da função era
                longo, e colunas vizinhas ficavam com cabeçalhos de 66px e
                39px — 27px de desalinho entre as réguas "DISPONÍVEIS". Também
                é o que o skeleton assume. */}
            <div className="flex w-full items-center gap-3 font-mono text-[11px] tracking-widest uppercase tabular-nums">
               <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold">{efetivos}</span>
                  <span className="text-slate-500">DI</span>
               </div>
               <span className="text-slate-400">·</span>
               <div className="flex items-center gap-1.5 text-rose-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                  <span className="font-bold">{inop}</span>
                  <span className="text-slate-500">IN</span>
               </div>
            </div>
         </header>

         <div className="space-y-5 px-4 py-4 pl-6">
            <SubList
               title="Disponíveis"
               count={efetivos}
               accent="bg-emerald-500"
               empty="Nenhum tripulante disponível"
            >
               {bucket.disponiveis.map((status, i) => (
                  <TripCard
                     key={`av-${status.trip.id}`}
                     status={status}
                     index={i + 1}
                  />
               ))}
            </SubList>

            <SubList
               title="Indisponíveis"
               count={inop}
               accent="bg-rose-500"
               empty="Nenhum tripulante indisponível"
               collapsible
               defaultOpen={false}
            >
               {bucket.indisponiveis.map((status, i) => (
                  <TripCard
                     key={`un-${status.trip.id}`}
                     status={status}
                     index={i + 1}
                  />
               ))}
            </SubList>
         </div>
      </section>
   );
}

interface SubListProps {
   title: string;
   count: number;
   accent: string;
   empty: string;
   children: React.ReactNode;
   collapsible?: boolean;
   defaultOpen?: boolean;
}

function SubList({
   title,
   count,
   accent,
   empty,
   children,
   collapsible = false,
   defaultOpen = true,
}: SubListProps) {
   const [open, setOpen] = useState(collapsible ? defaultOpen : true);
   // `aria-expanded` sozinho não diz O QUE expande. O par id/aria-controls
   // amarra o botão à região, e o `useId` evita colisão entre as colunas de
   // função, que renderizam a mesma sublista lado a lado.
   const regionId = `${useId()}-sublist`;

   const headerInner = (
      <>
         <span className={clsx("inline-block h-2 w-2 rounded-full", accent)} />
         <h3 className="text-[11px] font-bold tracking-[0.22em] text-slate-700 uppercase">
            {title}
         </h3>
         {/* Era `slate-400` (2,63:1). */}
         <span className="font-mono text-[10px] text-slate-500 tabular-nums">
            {String(count).padStart(2, "0")}
         </span>
         <div className="ml-1 h-px flex-1 bg-slate-200" />
         {collapsible && (
            <HiChevronDown
               className={clsx(
                  // A rotação do chevron é o ÚNICO sinal gráfico de
                  // aberto/fechado, então ele carrega significado e cai no
                  // 1.4.11 (3:1). Em `slate-400` media 2,63:1.
                  "shrink-0 text-sm text-slate-500 transition-transform",
                  open && "rotate-180"
               )}
               aria-hidden="true"
            />
         )}
      </>
   );

   return (
      <div>
         {collapsible ? (
            <button
               type="button"
               onClick={() => setOpen((v) => !v)}
               aria-expanded={open}
               aria-controls={regionId}
               className="mb-2 flex min-h-[24px] w-full items-center gap-2 text-left transition-colors pointer-coarse:min-h-[44px] pointer-fine:hover:text-slate-900"
            >
               {headerInner}
            </button>
         ) : (
            <div className="mb-2 flex items-center gap-2">{headerInner}</div>
         )}

         <div id={regionId}>
            {open &&
               (count === 0 ? (
                  // Era `slate-400` na variante `muted`, abaixo de AA sobre o
                  // fundo claro. O tom único de 500 mantém os dois vazios
                  // legíveis — a hierarquia entre eles já vem do colapso.
                  <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 py-3 text-center text-xs text-slate-500 italic">
                     {empty}
                  </p>
               ) : (
                  <div className="flex flex-col gap-1.5">{children}</div>
               ))}
         </div>
      </div>
   );
}
