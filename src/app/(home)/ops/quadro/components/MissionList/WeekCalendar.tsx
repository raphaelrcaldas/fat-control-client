"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrdemMissaoList } from "services/routes/om/ordens";
import {
   STATUS_CONFIG,
   type StatusType,
} from "@/constants/ops/ordens-missao/status";
import { Spinner } from "flowbite-react";
import { extractDate, extractTime } from "utils/dateHandler";
import type { AeronavePublic } from "services/routes/aeronaves";
import clsx from "clsx";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { AeronaveFormModal } from "@/app/(home)/ops/aeronaves/components/AeronaveFormModal";

const SIT_COLORS: Record<string, string> = {
   DI: "bg-emerald-400",
   DO: "bg-orange-400",
   IN: "bg-red-400",
   IS: "bg-gray-400",
};

function toLocalDateStr(date: Date): string {
   const y = date.getFullYear();
   const m = String(date.getMonth() + 1).padStart(2, "0");
   const d = String(date.getDate()).padStart(2, "0");
   return `${y}-${m}-${d}`;
}

interface WeekCalendarProps {
   ordens: OrdemMissaoList[];
   aeronaves: AeronavePublic[];
   isLoading: boolean;
   isFetching: boolean;
   currentWeekStart: Date;
   daysToShow: number;
   onNavigateWeek: (direction: number) => void;
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

function getEtapasDoDia(
   ordens: OrdemMissaoList[],
   matricula: string,
   dateStr: string
): EtapaDoDia[] {
   const etapas: EtapaDoDia[] = [];
   for (const om of ordens) {
      if (om.matricula_anv !== matricula) continue;
      for (const etapa of om.etapas) {
         if (extractDate(etapa.dt_dep) === dateStr) {
            const hora = extractTime(etapa.dt_dep).replace(":", "");
            etapas.push({
               omId: om.id,
               omNumero: om.numero,
               omTipo: om.tipo,
               omStatus: om.status,
               origem: etapa.origem,
               dest: etapa.dest,
               horaZ: hora ? `${hora}Z` : "",
            });
         }
      }
   }
   etapas.sort((a, b) => a.horaZ.localeCompare(b.horaZ));
   return etapas;
}

interface LocalidadeEntreEtapas {
   localidade: string;
   omStatus: string;
}

function getLocalidadeEntreEtapas(
   ordens: OrdemMissaoList[],
   matricula: string,
   dateStr: string
): LocalidadeEntreEtapas | null {
   const todasEtapas: { dtDep: string; dest: string; omStatus: string }[] = [];

   for (const om of ordens) {
      if (om.matricula_anv !== matricula) continue;
      for (const etapa of om.etapas) {
         todasEtapas.push({
            dtDep: etapa.dt_dep,
            dest: etapa.dest,
            omStatus: om.status,
         });
      }
   }

   todasEtapas.sort((a, b) => a.dtDep.localeCompare(b.dtDep));

   let last: { dest: string; omStatus: string } | null = null;
   for (const etapa of todasEtapas) {
      if (extractDate(etapa.dtDep) < dateStr) {
         last = { dest: etapa.dest, omStatus: etapa.omStatus };
      }
   }

   if (!last || last.dest === "SBGL") return null;

   return { localidade: last.dest, omStatus: last.omStatus };
}

function AeronaveCell({
   matricula,
   date,
   ordens,
}: {
   matricula: string;
   date: Date;
   ordens: OrdemMissaoList[];
}) {
   const router = useRouter();
   const dateStr = toLocalDateStr(date);
   const etapas = getEtapasDoDia(ordens, matricula, dateStr);

   const info =
      etapas.length === 0
         ? getLocalidadeEntreEtapas(ordens, matricula, dateStr)
         : null;
   const infoStatus = info
      ? (STATUS_CONFIG[info.omStatus as StatusType] ?? STATUS_CONFIG.aprovada)
      : null;

   return (
      <div className="flex min-h-38 flex-col justify-start gap-1 p-1">
         {info && infoStatus && (
            <div
               className={`truncate rounded-md border px-1.5 py-0.5 text-center font-mono text-sm font-semibold shadow-sm backdrop-blur-sm transition-all ${infoStatus.bg} ${infoStatus.text} ${infoStatus.border}`}
            >
               {info.localidade}
            </div>
         )}

         {etapas.map((etapa, idx) => {
            const statusCfg =
               STATUS_CONFIG[etapa.omStatus as StatusType] ??
               STATUS_CONFIG.aprovada;
            return (
               <div
                  key={`${etapa.omId}-${idx}`}
                  className={`cursor-pointer truncate rounded-md border px-1.5 py-0.5 text-center font-mono text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                  title={`OM ${etapa.omNumero} — ${etapa.omTipo}`}
                  onClick={() => router.push(`/ops/om/${etapa.omId}`)}
               >
                  {etapa.horaZ && (
                     <span className="text-xs">{etapa.horaZ} </span>
                  )}
                  <span className="hidden sm:inline">
                     {etapa.origem} - {etapa.dest}
                  </span>
                  <span className="sm:hidden">
                     {etapa.origem.slice(-2)}-{etapa.dest.slice(-2)}
                  </span>
               </div>
            );
         })}
      </div>
   );
}

export default function WeekCalendar({
   ordens,
   aeronaves,
   isLoading,
   isFetching,
   currentWeekStart,
   daysToShow,
   onNavigateWeek,
}: WeekCalendarProps) {
   const [editingAeronave, setEditingAeronave] =
      useState<AeronavePublic | null>(null);
   const { hasPerm } = usePermBased();
   const canEditAeronave = hasPerm("aeronaves", "update");

   const getWeekDays = () => {
      const days: Date[] = [];
      for (let i = 0; i < daysToShow; i++) {
         const date = new Date(currentWeekStart);
         date.setDate(date.getDate() + i);
         days.push(date);
      }
      return days;
   };

   const weekDays = getWeekDays();
   const today = toLocalDateStr(new Date());

   return (
      <div className="min-h-screen text-gray-900">
         {/* Header com navegação */}
         <div className="m-4">
            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => onNavigateWeek(-1)}
                     className="rounded-lg bg-white/60 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white/90 hover:text-slate-800 hover:shadow"
                  >
                     ← Anterior
                  </button>
                  <span className="flex min-w-35 items-center justify-center gap-2 px-2 text-center text-sm font-bold text-slate-700">
                     {isFetching && <Spinner color="failure" size="xs" />}
                     {weekDays[0].toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                     })}{" "}
                     -{" "}
                     {weekDays[weekDays.length - 1].toLocaleDateString(
                        "pt-BR",
                        {
                           day: "2-digit",
                           month: "short",
                           year: "numeric",
                        }
                     )}
                  </span>
                  <button
                     onClick={() => onNavigateWeek(1)}
                     className="rounded-lg bg-white/60 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white/90 hover:text-slate-800 hover:shadow"
                  >
                     Próxima →
                  </button>
               </div>
            </div>
         </div>

         {/* Calendário */}
         <div
            className={`relative overflow-x-auto rounded-xl border border-slate-200 shadow duration-200 ${isFetching && !isLoading ? "opacity-50" : ""}`}
         >
            <table className="w-full table-fixed border-collapse">
               <thead>
                  <tr className="bg-white">
                     <th className="w-16 border-r border-b border-slate-200/60 bg-white/30 sm:w-24"></th>
                     {weekDays.map((day, idx) => {
                        const dateStr = toLocalDateStr(day);
                        const isToday = dateStr === today;

                        return (
                           <th
                              key={idx}
                              className={`border-r border-b border-slate-200/60 p-2 text-center ${
                                 isToday ? "bg-blue-50/60" : "bg-transparent"
                              }`}
                           >
                              <div
                                 className={`text-[9px] font-semibold tracking-wider uppercase ${
                                    isToday ? "text-blue-700" : "text-slate-500"
                                 }`}
                              >
                                 {day.toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                 })}
                              </div>
                              <div
                                 className={`text-lg font-bold ${
                                    isToday ? "text-blue-700" : "text-slate-700"
                                 }`}
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
                     <tr
                        key={anv.matricula}
                        className="transition-colors hover:bg-white/40"
                     >
                        <td className="border-r border-b border-slate-200/60 p-1 text-center">
                           <div
                              className={clsx(
                                 "flex flex-col items-center justify-center gap-1.5 p-1",
                                 canEditAeronave &&
                                    "cursor-pointer rounded-lg transition-colors hover:bg-white/60 hover:shadow-sm"
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
                        {weekDays.map((day, idx) => {
                           const isWeekend =
                              day.getDay() === 0 || day.getDay() === 6;
                           return (
                              <td
                                 key={idx}
                                 className={`border-r border-b border-slate-200/60 align-top ${
                                    isWeekend ? "bg-red-50" : "bg-transparent"
                                 }`}
                              >
                                 <AeronaveCell
                                    matricula={anv.matricula}
                                    date={day}
                                    ordens={ordens}
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
                     {weekDays.map((day, idx) => {
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

            {isLoading && ordens.length === 0 && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 py-12 backdrop-blur-sm">
                  <Spinner color="failure" size="xl" />
               </div>
            )}
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
