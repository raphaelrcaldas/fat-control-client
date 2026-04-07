"use client";
import React, { useState } from "react";
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
      <div className="flex min-h-38 flex-col justify-start gap-0.5 p-1">
         {info && infoStatus && (
            <div
               className={`truncate rounded border px-1 py-0.5 text-center font-mono text-sm font-medium ${infoStatus.bg} ${infoStatus.text} ${infoStatus.border}`}
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
                  className={`cursor-pointer truncate rounded border px-1 py-0.5 text-center font-mono text-sm font-medium transition-opacity hover:opacity-80 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                  title={`OM ${etapa.omNumero} — ${etapa.omTipo}`}
                  onClick={() => router.push(`/ops/om/${etapa.omId}`)}
               >
                  {etapa.horaZ && (
                     <span className="text-xs">{etapa.horaZ} </span>
                  )}
                  {etapa.origem} - {etapa.dest}
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
   onNavigateWeek,
}: WeekCalendarProps) {
   const [daysToShow, setDaysToShow] = useState(14);
   const [editingAeronave, setEditingAeronave] =
      useState<AeronavePublic | null>(null);
   const { hasPerm } = usePermBased();
   const canEditAeronave = hasPerm("aeronaves", "update");

   React.useEffect(() => {
      const updateDaysToShow = () => {
         const width = window.innerWidth;
         if (width >= 1920) {
            setDaysToShow(11);
         } else if (width >= 1280) {
            setDaysToShow(7);
         } else if (width >= 768) {
            setDaysToShow(7);
         } else {
            setDaysToShow(3);
         }
      };

      updateDaysToShow();
      window.addEventListener("resize", updateDaysToShow);
      return () => window.removeEventListener("resize", updateDaysToShow);
   }, []);

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
         <div className="mb-3">
            <div className="flex flex-col items-center gap-2">
               <div className="flex w-full items-center justify-between">
                  <h1 className="text-lg font-black tracking-wider text-gray-800 md:text-xl">
                     QUADRO DE OPERAÇÕES
                  </h1>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => onNavigateWeek(-1)}
                     className="rounded-lg border border-gray-300 bg-white px-2 py-1 font-medium hover:bg-gray-50"
                  >
                     ← Anterior
                  </button>
                  <span className="flex min-w-35 items-center justify-center gap-2 px-2 text-center text-gray-600">
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
                     className="rounded-lg border border-gray-300 bg-white px-2 py-1 font-medium hover:bg-gray-50"
                  >
                     Próxima →
                  </button>
               </div>
            </div>
         </div>

         {/* Calendário */}
         <div
            className={`overflow-x-auto rounded-xl bg-white shadow-lg transition-opacity duration-200 ${isFetching ? "opacity-50" : ""}`}
         >
            <table className="w-full table-fixed border-collapse">
               <thead>
                  <tr className="bg-gray-50">
                     <th className="w-28 border-r border-b border-gray-200 bg-white p-1 text-left text-[10px] font-bold text-gray-600 uppercase"></th>
                     {weekDays.map((day, idx) => {
                        const dateStr = toLocalDateStr(day);
                        const isToday = dateStr === today;
                        const isWeekend =
                           day.getDay() === 0 || day.getDay() === 6;
                        return (
                           <th
                              key={idx}
                              className={`border-r border-b border-gray-200 p-1 text-center ${
                                 isToday ? "bg-blue-50" : "bg-white"
                                 //   ? "bg-gray-100"
                                 //   : ""
                              }`}
                           >
                              <div
                                 className={`text-[8px] uppercase ${
                                    isToday ? "text-blue-600" : "text-gray-500"
                                 }`}
                              >
                                 {day.toLocaleDateString("pt-BR", {
                                    weekday: "short",
                                 })}
                              </div>
                              <div
                                 className={`text-sm font-bold ${
                                    isToday ? "text-blue-600" : "text-gray-700"
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
                     <tr key={anv.matricula} className="hover:bg-gray-50/50">
                        <td className="border-r border-b border-gray-200 p-1 text-center">
                           <div
                              className={clsx(
                                 "flex flex-col items-center justify-center gap-1.5",
                                 canEditAeronave &&
                                    "cursor-pointer rounded transition-colors hover:bg-gray-100"
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
                              <span className="text-sm font-bold text-gray-700">
                                 {anv.matricula}
                              </span>
                              <span
                                 className={clsx(
                                    "rounded px-2 py-0.5 text-center text-sm font-bold text-white",
                                    SIT_COLORS[anv.sit] ?? "bg-gray-300"
                                 )}
                              >
                                 {anv.sit}
                              </span>
                              <div className="text-xs whitespace-pre-line">
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
                                 className={`border-r border-b border-gray-200 align-top ${
                                    isWeekend ? "bg-red-100/40" : ""
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
               <div className="flex items-center justify-center py-12">
                  <Spinner color="failure" size="lg" />
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
