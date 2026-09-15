"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { OrdemMissaoList } from "services/routes/om/ordens";
import {
   STATUS_CONFIG,
   type StatusType,
} from "@/constants/ops/ordens-missao/status";
import { Button } from "flowbite-react";
import {
   dateToIso,
   extractDate,
   extractTime,
   formatPeriodo,
   formatPeriodoSemAno,
   todayIso,
} from "utils/dateHandler";
import type { AeronavePublic } from "services/routes/aeronaves";
import clsx from "clsx";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { AeronaveFormModal } from "@/app/(home)/ops/aeronaves/components/AeronaveFormModal";
import { useTimelineDrag } from "@/hooks/useTimelineDrag";

// Rótulo curto do dia da semana, indexado por `getDay()`. Evita um
// `toLocaleDateString` por coluna a cada render.
const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const SIT_COLORS: Record<string, string> = {
   DI: "bg-emerald-400",
   DO: "bg-orange-400",
   IN: "bg-red-400",
   IS: "bg-gray-400",
};

interface WeekCalendarProps {
   ordens: OrdemMissaoList[];
   aeronaves: AeronavePublic[];
   isFetching: boolean;
   isError: boolean;
   onRetry: () => void;
   truncado: boolean;
   totalOrdens: number;
   dates: Date[];
   onShiftDays: (days: number) => void;
   onToday: () => void;
   canBack: boolean;
   canForward: boolean;
   isToday: boolean;
}

interface EtapaDoDia {
   omId: number;
   omNumero: string;
   omTipo: string;
   omStatus: string;
   origem: string;
   dest: string;
   horaZ: string;
}

/** Chave de célula do quadro: uma aeronave num dia. */
function cellKey(matricula: string, dateStr: string): string {
   return `${matricula}|${dateStr}`;
}

/**
 * Indexa as etapas por (aeronave, dia) numa passada só.
 *
 * A varredura por célula custava aeronaves × dias × ordens × etapas — com
 * 15 aeronaves e 11 dias são 165 células percorrendo a lista inteira.
 *
 * A ordenação usa o `dt_dep` cru, não a hora já formatada: `extractTime`
 * devolve "" para datetime sem hora, e ordenar pela string jogaria essa
 * etapa para o topo do dia, antes das que têm horário.
 */
function indexarEtapas(ordens: OrdemMissaoList[]): Map<string, EtapaDoDia[]> {
   const porCelula = new Map<string, { dtDep: string; etapa: EtapaDoDia }[]>();

   for (const om of ordens) {
      for (const etapa of om.etapas) {
         const dateStr = extractDate(etapa.dt_dep);
         if (!dateStr) continue;

         const key = cellKey(om.matricula_anv, dateStr);
         const hora = extractTime(etapa.dt_dep).replace(":", "");
         const lista = porCelula.get(key) ?? [];
         lista.push({
            dtDep: etapa.dt_dep,
            etapa: {
               omId: om.id,
               omNumero: om.numero,
               omTipo: om.tipo,
               omStatus: om.status,
               origem: etapa.origem,
               dest: etapa.dest,
               horaZ: hora ? `${hora}Z` : "",
            },
         });
         porCelula.set(key, lista);
      }
   }

   const resultado = new Map<string, EtapaDoDia[]>();
   for (const [key, lista] of porCelula) {
      lista.sort((a, b) => a.dtDep.localeCompare(b.dtDep));
      resultado.set(
         key,
         lista.map((item) => item.etapa)
      );
   }
   return resultado;
}

/**
 * Botão da barra de navegação. `disabled` nos limites da janela de dados
 * buscada: fora dela não há dado, e deixar clicar mostraria um quadro
 * vazio que se confunde com "nenhuma missão".
 */
function NavButton({
   onClick,
   disabled,
   title,
   children,
}: {
   onClick: () => void;
   disabled?: boolean;
   title: string;
   children: React.ReactNode;
}) {
   return (
      <button
         type="button"
         onClick={onClick}
         disabled={disabled}
         title={title}
         className={clsx(
            "flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]",
            disabled
               ? "cursor-not-allowed opacity-40"
               : "hover:bg-slate-50 hover:text-slate-800"
         )}
      >
         {children}
      </button>
   );
}

function AeronaveCell({
   etapas,
   onSelectOrdem,
   shouldIgnoreClick,
}: {
   etapas: EtapaDoDia[];
   onSelectOrdem: (omId: number) => void;
   /** Um arrasto que termina sobre o chip não deve abrir a OM. */
   shouldIgnoreClick: () => boolean;
}) {
   return (
      <div className="flex min-h-38 flex-col justify-start gap-1 p-1">
         {etapas.map((etapa, idx) => {
            const statusCfg =
               STATUS_CONFIG[etapa.omStatus as StatusType] ??
               STATUS_CONFIG.aprovada;
            return (
               <button
                  key={`${etapa.omId}-${idx}`}
                  type="button"
                  className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded border px-1.5 py-1 text-center font-mono text-sm font-semibold whitespace-nowrap shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-h-[32px] pointer-coarse:min-h-[44px] ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                  title={`OM ${etapa.omNumero} — ${etapa.omTipo} — ${etapa.origem} para ${etapa.dest}${
                     etapa.horaZ ? ` às ${etapa.horaZ}` : ""
                  }`}
                  onClick={() => {
                     if (shouldIgnoreClick()) return;
                     onSelectOrdem(etapa.omId);
                  }}
               >
                  {etapa.horaZ && (
                     <span className="text-xs">{etapa.horaZ}</span>
                  )}
                  {/* `whitespace-nowrap` no botão: a rota é o dado que o
                      quadro existe para mostrar e não pode quebrar em duas
                      linhas nem ser cortada. A coluna comporta o par
                      hora+rota porque a grade rola em vez de espremer os
                      dias na largura da viewport. */}
                  <span>
                     {etapa.origem} - {etapa.dest}
                  </span>
               </button>
            );
         })}
      </div>
   );
}

export default function WeekCalendar({
   ordens,
   aeronaves,
   isFetching,
   isError,
   onRetry,
   truncado,
   totalOrdens,
   dates,
   onShiftDays,
   onToday,
   canBack,
   canForward,
   isToday: refIsToday,
}: WeekCalendarProps) {
   const [editingAeronave, setEditingAeronave] =
      useState<AeronavePublic | null>(null);
   const { hasPerm } = usePermBased();
   const router = useRouter();
   const canEditAeronave = hasPerm("ops.aeronaves", "update");

   // A trilha medida é só a área dos dias. A superfície do gesto é a grade
   // inteira (o div externo), mas ela inclui a coluna fixa da aeronave, que
   // não representa tempo: medir por ali superestimava o dia em até 18% no
   // celular e o conteúdo escorregava sob o dedo. A referência fica numa
   // célula de dia e o hook recebe a largura de UM dia já resolvida.
   const dayCellRef = useRef<HTMLTableCellElement>(null);
   const medirTrilha = useCallback(
      () => (dayCellRef.current?.clientWidth ?? 0) * dates.length,
      [dates.length]
   );
   const { dragHandlers, wasDragged } = useTimelineDrag(
      medirTrilha,
      dates.length,
      onShiftDays
   );

   // O arrasto não alcança quem navega por teclado.
   const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const passo =
         event.key === "ArrowLeft"
            ? -1
            : event.key === "ArrowRight"
              ? 1
              : event.key === "PageUp"
                ? -7
                : event.key === "PageDown"
                  ? 7
                  : 0;
      if (!passo) return;
      event.preventDefault();
      onShiftDays(passo);
   };

   const etapasPorCelula = useMemo(() => indexarEtapas(ordens), [ordens]);
   const today = todayIso();
   const inicioIso = dateToIso(dates[0]);
   const fimIso = dateToIso(dates[dates.length - 1]);

   return (
      <div className="min-h-screen text-gray-900">
         {/* Navegação. O arrasto na grade é a forma principal de andar no
             tempo (ver `useTimelineDrag`), então só restam os saltos largos,
             que o gesto não alcança bem. O período no meio é o botão de
             voltar para hoje: o espaço que só rotulava passou a agir, e
             desabilitado ele responde "onde eu estou" sem gastar mais
             cromo — mesmo padrão do `DateNav` do FatBird. */}
         <div className="m-4 flex items-center justify-center gap-1">
            <NavButton
               onClick={() => onShiftDays(-7)}
               disabled={!canBack}
               title="Uma semana para trás"
            >
               «
            </NavButton>

            <button
               type="button"
               onClick={onToday}
               disabled={refIsToday}
               title={refIsToday ? "Você está em hoje" : "Voltar para hoje"}
               aria-label={
                  refIsToday
                     ? formatPeriodo(inicioIso, fimIso)
                     : `${formatPeriodo(inicioIso, fimIso)} — voltar para hoje`
               }
               className={clsx(
                  // Sem `disabled:opacity-*` de propósito: o período
                  // continua sendo informação mesmo quando a ação de
                  // voltar para hoje não cabe.
                  "flex min-h-[32px] items-center justify-center rounded border border-slate-200 bg-white px-3 text-center text-xs font-bold whitespace-nowrap text-slate-700 tabular-nums shadow-sm transition-colors sm:min-w-35 sm:text-sm pointer-coarse:min-h-[44px]",
                  refIsToday
                     ? "cursor-default"
                     : "hover:bg-slate-50 hover:text-slate-900"
               )}
            >
               <span className="sm:hidden">
                  {formatPeriodoSemAno(inicioIso, fimIso)}
               </span>
               <span className="hidden sm:inline">
                  {formatPeriodo(inicioIso, fimIso)}
               </span>
            </button>

            <NavButton
               onClick={() => onShiftDays(7)}
               disabled={!canForward}
               title="Uma semana para frente"
            >
               »
            </NavButton>
         </div>

         {/* Falha de carga. Grade vazia por erro e grade vazia por ausência
             de missão são indistinguíveis a olho nu — num quadro de
             operações, deixar a segunda leitura passar faz concluir que o
             dia está livre. */}
         {isError && (
            <div
               role="alert"
               className="mx-4 mb-2 space-y-2 rounded border border-slate-200 bg-white px-4 py-3 text-center shadow-sm"
            >
               <h2 className="text-sm font-semibold text-red-700">
                  Erro ao carregar as ordens de missão
               </h2>
               <p className="text-xs text-slate-600">
                  O quadro abaixo pode estar incompleto. Verifique a conexão e
                  tente novamente.
               </p>
               <Button color="light" size="xs" onClick={onRetry}>
                  Tentar novamente
               </Button>
            </div>
         )}

         {/* A janela estourou uma página: o backend ordena por decolagem,
             então o que falta são as missões do fim do período. */}
         {truncado && !isError && (
            <div
               role="alert"
               className="mx-4 mb-2 rounded border border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-700 shadow-sm"
            >
               <span className="font-semibold text-red-700">
                  Quadro incompleto:
               </span>{" "}
               o período tem {totalOrdens} ordens e o quadro mostra as{" "}
               {ordens.length} primeiras. Reduza o intervalo para ver as demais.
            </div>
         )}

         {/* Calendário */}
         <div
            role="group"
            tabIndex={0}
            aria-label="Quadro de operações — setas navegam no tempo"
            onKeyDown={onKeyDown}
            {...dragHandlers}
            className={clsx(
               // `touch-pan-y`: o gesto vertical continua rolando a página;
               // o horizontal pertence à navegação no tempo.
               "focus-visible:ring-primary-500 relative cursor-grab touch-pan-y rounded border border-slate-200 shadow transition-opacity duration-200 select-none focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset active:cursor-grabbing",
               isFetching && "opacity-50"
            )}
         >
            {/* Sem rolagem horizontal: o arrasto já navega no tempo, e as
                duas coisas disputariam o mesmo gesto. A escada de
                `useVisibleDays` escolhe um número de dias que cabe na
                largura, então `table-fixed` reparte o espaço por igual.
                `border-separate` porque `position: sticky` em célula é
                ignorado sob `border-collapse`. */}
            <table className="w-full table-fixed border-separate border-spacing-0">
               <thead>
                  <tr className="bg-white">
                     <th className="sticky left-0 z-10 w-16 border-r border-b border-slate-200/60 bg-white sm:w-24"></th>
                     {dates.map((day, idx) => {
                        const isToday = dateToIso(day) === today;
                        const isWeekend =
                           day.getDay() === 0 || day.getDay() === 6;

                        return (
                           <th
                              key={idx}
                              ref={idx === 0 ? dayCellRef : undefined}
                              className={clsx(
                                 "border-r border-b border-slate-200/60 p-2 text-center",
                                 isToday
                                    ? "bg-sky-50"
                                    : isWeekend
                                      ? "bg-red-50"
                                      : "bg-white"
                              )}
                           >
                              <div
                                 className={clsx(
                                    "text-[9px] font-semibold tracking-wider uppercase",
                                    isWeekend
                                       ? "text-red-700"
                                       : "text-slate-500"
                                 )}
                              >
                                 {WEEKDAY_LABELS[day.getDay()]}
                              </div>
                              <div
                                 className={clsx(
                                    "text-lg font-bold",
                                    isToday
                                       ? "text-sky-800"
                                       : isWeekend
                                         ? "text-red-700"
                                         : "text-slate-700"
                                 )}
                              >
                                 {day.getDate()}
                              </div>
                           </th>
                        );
                     })}
                  </tr>
               </thead>
               <tbody>
                  {aeronaves.map((anv) => (
                     <tr key={anv.matricula} className="transition-colors">
                        <td className="sticky left-0 z-10 border-r border-b border-slate-200/60 bg-white p-1 text-center">
                           <div
                              className={clsx(
                                 "flex flex-col items-center justify-center gap-1.5 p-1",
                                 canEditAeronave &&
                                    "cursor-pointer rounded transition-colors hover:bg-white/60 hover:shadow-sm"
                              )}
                              onClick={
                                 canEditAeronave
                                    ? () => setEditingAeronave(anv)
                                    : undefined
                              }
                              title={
                                 canEditAeronave ? "Editar aeronave" : undefined
                              }
                           >
                              <span className="text-sm font-bold tracking-tight text-slate-700">
                                 {anv.matricula}
                              </span>
                              <span
                                 className={clsx(
                                    "rounded-md px-2 py-0.5 text-center text-[11px] font-bold tracking-wider text-white shadow-sm",
                                    SIT_COLORS[anv.sit] ?? "bg-slate-300"
                                 )}
                              >
                                 {anv.sit}
                              </span>
                              <div className="hidden text-xs font-medium text-slate-500 md:block">
                                 {anv.obs}
                              </div>
                           </div>
                        </td>
                        {dates.map((day, idx) => {
                           const isWeekend =
                              day.getDay() === 0 || day.getDay() === 6;
                           const isToday = dateToIso(day) === today;
                           return (
                              <td
                                 key={idx}
                                 className={clsx(
                                    "border-r border-b border-slate-200/60 align-top",
                                    isToday
                                       ? "bg-sky-50"
                                       : isWeekend
                                         ? "bg-red-50"
                                         : "bg-white"
                                 )}
                              >
                                 <AeronaveCell
                                    shouldIgnoreClick={wasDragged}
                                    etapas={
                                       etapasPorCelula.get(
                                          cellKey(anv.matricula, dateToIso(day))
                                       ) ?? []
                                    }
                                    onSelectOrdem={(omId) =>
                                       router.push(`/ops/om/${omId}`)
                                    }
                                 />
                              </td>
                           );
                        })}
                     </tr>
                  ))}

                  {/* Linha de Sobreaviso */}
                  {/* <tr className="bg-amber-50/30">
                     <td className="border-r border-b border-gray-200 bg-amber-100/50 p-1">
                        <div className="text-center text-sm font-bold text-amber-800">
                           SOBREAVISO
                        </div>
                     </td>
                     {dates.map((day, idx) => {
                        const isWeekend =
                           day.getDay() === 0 || day.getDay() === 6;
                        return (
                           <td
                              key={idx}
                              className={`border-r border-b border-gray-200 p-0 ${
                                 isWeekend ? "bg-red-100/40" : ""
                              }`}
                           >
                              <SobreavisoCell
                                 date={day}
                                 onEdit={handleSobreavisoClick}
                              />
                           </td>
                        );
                     })}
                  </tr> */}
               </tbody>
            </table>
         </div>

         {/* Legenda */}
         {/* <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
               <span className="text-[10px] font-medium">Funções:</span>
               {Object.entries(FUNCTION_COLORS).map(([func, colors]) => (
                  <span
                     key={func}
                     style={{ backgroundColor: colors.bg, color: colors.text }}
                     className="rounded px-1 py-0.5 text-[8px] font-bold uppercase"
                  >
                     {func}
                  </span>
               ))}
            </div>
         </div> */}

         {/* Modal Editar Aeronave */}
         <AeronaveFormModal
            show={!!editingAeronave}
            onClose={() => setEditingAeronave(null)}
            editingAeronave={editingAeronave}
         />
      </div>
   );
}
