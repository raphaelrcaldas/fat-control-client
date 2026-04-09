"use client";

import { useMemo, useState } from "react";
import { Tooltip, Spinner, Select } from "flowbite-react";
import IndispCell from "./components/indispCell";
import { TripIndisp } from "./components/tripIndisp";
import clsx from "clsx";
import { usePersistedState } from "@/hooks/usePersistedState";
import { LastIndisps } from "./components/lastIndisps";
import { AppLoadingScreen } from "../../components/appLoadingScreen";
import { CrewIndispList } from "services/routes/indisps";
import { datasIguais, isoStrToDate } from "utils/dateHandler";
import { FUNC_LABELS_SHORT, FUNCOES_PRINCIPAIS } from "@/constants/tripulantes";
import {
   HiChevronLeft,
   HiChevronRight,
   HiChevronDoubleLeft,
   HiChevronDoubleRight,
   HiUserGroup,
} from "react-icons/hi";
import { indispsOptions } from "./components/options";
import { useCrewIndisps } from "@/hooks/queries";
import { getColumnVisibilityClass } from "./utils/columnVisibility";

// Número fixo de dias - visibilidade controlada via CSS (Tailwind breakpoints)
const DAYS_TO_GENERATE = 21;

function genDates(dateRefer: Date, daysToGenerate: number) {
   const offset = -1;
   const days = Array(daysToGenerate)
      .fill(null)
      .map((_, i) => {
         const yearUTC = dateRefer.getFullYear();
         const monthUTC = dateRefer.getMonth();
         const dayUTC = dateRefer.getDate();

         return new Date(yearUTC, monthUTC, dayUTC + i + offset);
      });

   return days;
}

export default function IndispPage() {
   const [dateRef, setDateRef] = useState<Date>(new Date());

   const [indispFunc, setIndispFunc] = usePersistedState(
      "indisp.indispFunc",
      "mc"
   );

   // Array de datas derivado - sem useState/useEffect
   const datesArray = useMemo(
      () => genDates(dateRef, DAYS_TO_GENERATE),
      [dateRef]
   );

   // Query de indisponibilidades com React Query
   const {
      data: indisps,
      isLoading: isLoadingIndisps,
      isFetching,
   } = useCrewIndisps(indispFunc, "11gt");

   // Loading inicial (primeira carga) vs refetch (mudança de função)
   const isInitialLoading = isLoadingIndisps;
   const showLoadingOverlay = isFetching && !isLoadingIndisps;

   const changeDateRef = (day, month) => {
      const dateCopy = new Date(dateRef.getTime());

      if (day) {
         const prevDay = dateCopy.getDate();
         dateCopy.setDate(prevDay + day);
      }

      if (month) {
         const prevMonth = dateCopy.getMonth();
         dateCopy.setMonth(prevMonth + month);
      }

      setDateRef(dateCopy);
   };

   // Loading inicial - apenas na primeira carga
   if (isInitialLoading) return <AppLoadingScreen />;

   const getCurrentPeriod = () => {
      if (datesArray.length === 0) return "";
      const firstDate = datesArray[0];
      const lastDate = datesArray[datesArray.length - 1];
      return `${firstDate.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "short",
      })} - ${lastDate.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      })}`;
   };

   // Usar labels curtos de constants/tripulantes
   const funcLabels = FUNC_LABELS_SHORT;

   return (
      <div className="flex flex-1 flex-col overflow-hidden">
         <div className="mb-2 flex shrink-0 flex-col items-center gap-3 rounded-lg border border-gray-200 bg-linear-to-r from-gray-50 to-white px-4 py-3 shadow-sm md:flex-row md:justify-between">
            {/* Select de Função - Customizado */}
            <div className="flex items-center gap-2">
               <HiUserGroup className="shrink-0 text-lg text-gray-500" />
               Função
               <Select
                  className="w-36"
                  value={indispFunc}
                  onChange={(e) => setIndispFunc(e.target.value)}
               >
                  {FUNCOES_PRINCIPAIS.map((f) => (
                     <option key={f} value={f}>
                        {funcLabels[f]}
                     </option>
                  ))}
               </Select>
            </div>

            {/* Navegação de Datas */}
            <div className="flex flex-col items-center gap-2">
               <div className="flex flex-row items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                  <Tooltip content="Mês anterior">
                     <button
                        onClick={() => changeDateRef(null, -1)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Mês anterior"
                     >
                        <HiChevronDoubleLeft className="text-lg" />
                     </button>
                  </Tooltip>
                  <Tooltip content="Dia anterior">
                     <button
                        onClick={() => changeDateRef(-1, null)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Dia anterior"
                     >
                        <HiChevronLeft className="text-lg" />
                     </button>
                  </Tooltip>

                  <button
                     onClick={() => setDateRef(new Date())}
                     className="mx-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                     aria-label="Ir para hoje"
                  >
                     Hoje
                  </button>

                  <Tooltip content="Próximo dia">
                     <button
                        onClick={() => changeDateRef(1, null)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Próximo dia"
                     >
                        <HiChevronRight className="text-lg" />
                     </button>
                  </Tooltip>
                  <Tooltip content="Próximo mês">
                     <button
                        onClick={() => changeDateRef(null, 1)}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                        aria-label="Próximo mês"
                     >
                        <HiChevronDoubleRight className="text-lg" />
                     </button>
                  </Tooltip>
               </div>
               <div className="hidden rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm md:block">
                  {getCurrentPeriod()}
               </div>
            </div>

            {/* Badge com função selecionada - Visível apenas em desktop */}
            <div className="hidden items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 md:flex">
               <span className="text-xs font-medium text-blue-600 uppercase">
                  Visualizando
               </span>
               <span className="text-sm font-bold text-blue-700">
                  {funcLabels[indispFunc]}
               </span>
            </div>
         </div>

         {indisps && indisps.length > 0 ? (
            <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
               {/* Loading Overlay - quando refetching */}
               {showLoadingOverlay && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                     <div className="flex flex-col items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
                        <Spinner size="lg" color="failure" />
                        <p className="text-sm text-gray-600">
                           Carregando {funcLabels[indispFunc]}...
                        </p>
                     </div>
                  </div>
               )}

               <ColorLegend />
               <div
                  className={clsx(
                     "flex min-h-0 flex-1 justify-between gap-2 transition-opacity duration-200",
                     showLoadingOverlay ? "pointer-events-none" : ""
                  )}
               >
                  <div className="max-h-full min-h-0 w-fit overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                     <div className="min-w-max px-2 pb-2">
                        <table className="relative w-full overflow-visible">
                           <thead className="sticky top-0 z-10 bg-white">
                              <tr>
                                 <th scope="col" />
                                 {datesArray.map((dayR, index) => (
                                    <ThWeek
                                       key={index}
                                       dayRef={dayR}
                                       className={getColumnVisibilityClass(
                                          index
                                       )}
                                    />
                                 ))}
                              </tr>
                              <tr>
                                 <th scope="col" />
                                 {datesArray.map((dayR, index) => (
                                    <ThMonth
                                       key={index}
                                       dayRef={dayR}
                                       className={getColumnVisibilityClass(
                                          index
                                       )}
                                    />
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-200">
                              {indisps
                                 .filter((item) => item.trip.func.oper != "al")
                                 .map((item, index) => (
                                    <TripRow
                                       key={index}
                                       dates={datesArray}
                                       tripData={item}
                                    />
                                 ))}
                              {indisps.filter(
                                 (item) => item.trip.func.oper == "al"
                              ).length > 0 && (
                                 <>
                                    <tr className="">
                                       <td
                                          colSpan={datesArray.length + 1}
                                          className="px-4 py-3"
                                       >
                                          <div className="flex items-center justify-center gap-2">
                                             <div className="h-px flex-1 bg-gray-300"></div>
                                             <span className="text-base font-bold text-gray-700 uppercase">
                                                Alunos
                                             </span>
                                             <div className="h-px flex-1 bg-gray-300"></div>
                                          </div>
                                       </td>
                                    </tr>
                                    {indisps
                                       .filter(
                                          (item) => item.trip.func.oper == "al"
                                       )
                                       .map((item, index) => (
                                          <TripRow
                                             key={index}
                                             dates={datesArray}
                                             tripData={item}
                                          />
                                       ))}
                                 </>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
                  <div className="hidden flex-1 justify-center lg:grid">
                     <LastIndisps indisps={indisps} />
                  </div>
               </div>
            </div>
         ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
               <div className="grid justify-items-center">
                  <Spinner size="xl" color="failure" />
                  <p className="mt-4 font-medium text-gray-600">
                     Carregando indisponibilidades...
                  </p>
               </div>
            </div>
         )}
      </div>
   );
}

function ColorLegend() {
   return (
      <div className="hidden shrink-0 flex-wrap justify-center gap-2 rounded-lg bg-white px-2 py-2 text-xs shadow md:text-sm 2xl:flex">
         {indispsOptions.map((option) => {
            const label = option.label;
            return (
               <div key={option.value} className="flex items-center gap-1">
                  <div className={`h-4 w-4 rounded ${option.color.button}`} />
                  <span className="font-medium">{label}</span>
               </div>
            );
         })}
         <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-emerald-600" />
            <span className="font-medium">Disponível</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-purple-600" />
            <span className="font-medium">CEMAL Inválido</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-slate-600" />
            <span className="font-medium">Desadaptado</span>
         </div>
      </div>
   );
}

function ThWeek({ dayRef, className }: { dayRef: Date; className?: string }) {
   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;

   return (
      <th
         scope="col"
         className={clsx(
            "px-1 py-2 text-center text-xs uppercase",
            {
               "font-bold text-red-700": isWeekend,
               "font-medium text-gray-600": !isWeekend,
            },
            className
         )}
      >
         {dayRef.toLocaleDateString("pt-BR", {
            weekday: "short",
         })}
      </th>
   );
}

function ThMonth({ dayRef, className }: { dayRef: Date; className?: string }) {
   if (!dayRef || !(dayRef instanceof Date)) return null;

   const dateStr = dayRef.toLocaleDateString("pt-BR", {
      month: "2-digit",
      day: "2-digit",
   });

   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;

   const hoje = new Date();
   const toStartOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf();
   const hojeStart = toStartOfDay(hoje);
   const diaStart = toStartOfDay(dayRef);

   const isToday = diaStart === hojeStart;
   const isPast = diaStart < hojeStart;

   return (
      <th
         scope="col"
         className={clsx(
            "px-1 py-2 text-center text-sm font-bold transition-colors",
            {
               "bg-red-400 text-white": isWeekend && !isToday,
               "bg-yellow-400 text-gray-900 shadow-md": isToday,
               "bg-gray-300 text-gray-600": isPast && !isToday && !isWeekend,
               "bg-white text-gray-900": !isPast && !isToday && !isWeekend,
            },
            className
         )}
         aria-current={isToday ? "date" : undefined}
         aria-label={`Data: ${dateStr}${isToday ? " (hoje)" : ""}`}
      >
         {dateStr}
      </th>
   );
}

function TripRow({
   dates,
   tripData,
}: {
   dates: Date[];
   tripData: CrewIndispList;
}) {
   const dataCemal = tripData.trip.cemal
      ? isoStrToDate(tripData.trip.cemal)
      : null;
   const dataUltVoo = tripData.trip.data_ult_voo
      ? isoStrToDate(tripData.trip.data_ult_voo)
      : null;

   return (
      <tr>
         <th scope="row" className="grid justify-items-center p-px">
            <TripIndisp trip={tripData.trip} indisps={tripData.indisps} />
         </th>
         {dates.map((day, index) => {
            const checkToday = datasIguais(day, new Date());

            return (
               <td
                  key={index}
                  className={clsx("px-1", getColumnVisibilityClass(index), {
                     "border-x-2 border-blue-500 bg-blue-300": checkToday,
                  })}
               >
                  <div className="flex h-full w-full items-center justify-center">
                     <IndispCell
                        dateRef={day}
                        tripData={tripData}
                        cemal={dataCemal}
                        ultVoo={dataUltVoo}
                     />
                  </div>
               </td>
            );
         })}
      </tr>
   );
}
