"use client";

import { useEffect, useState, useRef } from "react";
import { Tooltip } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import IndispCell from "./components/indispCell";
import { TripIndisp } from "./components/tripIndisp";
import { getCrewIndisps } from "services/routes/indisps";
import { getTripData } from "services/google-sheets/sheets";
import clsx from "clsx";
import { useIndispContext } from "../../context/indisp";
import { LastIndisps } from "./components/lastIndisps";
import { AppLoadingScreen } from "../../components/appLoadingScreen";
import { TripSheet } from "services/google-sheets/sheets";
import { CrewIndispList } from "services/routes/indisps";
import { datasIguais, isoStrLocalToDate } from "utils/dateHandler";
import {
   HiChevronLeft,
   HiChevronRight,
   HiChevronDoubleLeft,
   HiChevronDoubleRight,
   HiUserGroup,
} from "react-icons/hi";
import { indispsOptions } from "./components/options";

function genDates(dateRefer, daysToGenerate) {
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
   const [daysToGenerate, setDaysToGenerate] = useState<number>(7);
   const [datesArray, setDatesArray] = useState<Date[]>([]);
   const [dataTrip, setDataTrip] = useState<TripSheet[] | null>(null);
   const [indisps, setIndisps] = useState<CrewIndispList[] | null>(null);

   const { indispFunc, setIndispFunc } = useIndispContext();
   const tableContainerRef = useRef<HTMLDivElement>(null);

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

   const updateCrewIndisps = async () => {
      setIndisps([]);
      try {
         const response = await getCrewIndisps(indispFunc, "11gt");
         const data = await response.json();
         if (response.ok) {
            setIndisps(data);
         } else {
            console.error("Erro ao buscar indisponibilidades:", data);
         }
      } catch (err: any) {
         console.error("Erro ao buscar indisponibilidades:", err);
      }
   };

   useEffect(() => {
      updateCrewIndisps();
   }, [indispFunc]);

   useEffect(() => {
      getTripData().then((data) => {
         setDataTrip(data);
      });
   }, []);

   useEffect(() => {
      const calculateDaysToShow = () => {
         if (tableContainerRef.current) {
            const containerWidth = tableContainerRef.current.offsetWidth;
            // Largura aproximada de cada coluna de dia (40px) + coluna da tripulação (65px)
            const cellWidth = 44;
            const firstColumnWidth = 65;
            const availableWidth = containerWidth - firstColumnWidth - 24; // 24px de padding interno
            const days = Math.floor(availableWidth / cellWidth);
            return Math.max(5, Math.min(days, 30)); // Min 5 dias, max 30 dias
         }
         // Fallback baseado na largura da janela
         const windowWidth = window.innerWidth;
         if (windowWidth < 768) return 5; // mobile
         if (windowWidth < 1024) return 7; // tablet
         if (windowWidth < 1440) return 12; // desktop pequeno
         return 16; // desktop grande
      };

      const updateDays = () => {
         const newDays = calculateDaysToShow();
         setDaysToGenerate(newDays);
      };

      const handleResize = () => {
         updateDays();
      };

      window.addEventListener("resize", handleResize);

      // Observer para detectar mudanças no tamanho do container
      const resizeObserver = new ResizeObserver(() => {
         // Usa requestAnimationFrame para garantir que o layout foi aplicado
         requestAnimationFrame(() => {
            updateDays();
         });
      });

      if (tableContainerRef.current) {
         resizeObserver.observe(tableContainerRef.current);
         // Força atualização inicial após o container estar montado
         requestAnimationFrame(() => {
            updateDays();
         });
      }

      return () => {
         window.removeEventListener("resize", handleResize);
         resizeObserver.disconnect();
      };
   }, []);

   // Recalcula quando os dados forem carregados e o container aparecer no DOM
   useEffect(() => {
      if (indisps && dataTrip && tableContainerRef.current) {
         const calculateDaysToShow = () => {
            const containerWidth = tableContainerRef.current.offsetWidth;
            const cellWidth = 40;
            const firstColumnWidth = 65;
            const availableWidth = containerWidth - firstColumnWidth - 24;
            const days = Math.floor(availableWidth / cellWidth);
            return Math.max(5, Math.min(days, 30));
         };

         // Usa requestAnimationFrame para garantir que o layout está aplicado
         requestAnimationFrame(() => {
            const newDays = calculateDaysToShow();
            setDaysToGenerate(newDays);
         });
      }
   }, [indisps, dataTrip]);

   useEffect(() => {
      setDatesArray(genDates(dateRef, daysToGenerate));
   }, [dateRef, daysToGenerate]);

   if (!indisps || !dataTrip) return <AppLoadingScreen />;

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

   const funcLabels = {
      pil: "Piloto",
      mc: "Mecânico",
      lm: "LoadMaster",
      tf: "Comissário",
      os: "Observador-SAR",
      oe: "OE",
   };

   return (
      <div className="flex h-full flex-col overflow-hidden">
         <div className="mb-2 flex shrink-0 flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-3 shadow-sm md:flex-row md:justify-between">
            {/* Select de Função - Customizado */}
            <div className="flex items-center gap-2">
               <HiUserGroup className="shrink-0 text-lg text-gray-500" />
               Função
               <select
                  value={indispFunc}
                  onChange={(e) => setIndispFunc(e.target.value)}
                  className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-400 hover:shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  aria-label="Selecionar função"
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                     backgroundPosition: "right 0.5rem center",
                     backgroundRepeat: "no-repeat",
                     backgroundSize: "1.5em 1.5em",
                  }}
               >
                  <option value="pil">Piloto</option>
                  <option value="mc">Mecânico</option>
                  <option value="lm">LoadMaster</option>
                  <option value="tf">Comissário</option>
                  <option value="os">Observador-SAR</option>
                  <option value="oe">OE</option>
               </select>
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

         {indisps.length > 0 && dataTrip.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
               <ColorLegend />
               <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
                  <div
                     ref={tableContainerRef}
                     className="min-w-0 flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                  >
                     <div className="h-fit min-w-max px-2 pb-2">
                        <table className="relative w-full overflow-visible">
                           <thead className="sticky top-0 z-10 bg-white">
                              <tr>
                                 <th scope="col" />
                                 {datesArray.map((dayR, index) => (
                                    <ThWeek key={index} dayRef={dayR} />
                                 ))}
                              </tr>
                              <tr>
                                 <th scope="col" />
                                 {datesArray.map((dayR, index) => (
                                    <ThMonth key={index} dayRef={dayR} />
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
                                       gSheetData={dataTrip}
                                       update={updateCrewIndisps}
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
                                             gSheetData={dataTrip}
                                             update={updateCrewIndisps}
                                          />
                                       ))}
                                 </>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
                  <div className="hidden w-auto max-w-sm shrink-0 md:block">
                     <LastIndisps
                        indisps={indisps}
                        update={updateCrewIndisps}
                     />
                  </div>
               </div>
            </div>
         ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
               <div className="grid justify-items-center">
                  <Spinner size="xl" />
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
      <div className="hidden shrink-0 flex-wrap justify-center gap-2 rounded-lg bg-white px-2 py-2 text-xs shadow md:flex md:text-sm">
         {indispsOptions.map((option) => {
            const label = option.label.split(" ")[1];
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

function ThWeek({ dayRef }: { dayRef: Date }) {
   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;

   return (
      <th
         scope="col"
         className={clsx("px-1 py-2 text-center text-xs uppercase", {
            "font-bold text-red-700": isWeekend,
            "font-medium text-gray-600": !isWeekend,
         })}
      >
         {dayRef.toLocaleDateString("pt-BR", {
            weekday: "short",
         })}
      </th>
   );
}

function ThMonth({ dayRef }: { dayRef: Date }) {
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
            }
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
   gSheetData,
   tripData,
   update,
}: {
   dates: Date[];
   gSheetData: TripSheet[];
   tripData: CrewIndispList;
   update: () => void;
}) {
   const tripSheet = gSheetData?.find(
      (trips) =>
         typeof trips?.trig === "string" &&
         typeof tripData?.trip?.trig === "string" &&
         trips.trig.toLowerCase() === tripData.trip.trig.toLowerCase()
   );

   const dataCemal =
      tripSheet && tripSheet.cemal ? isoStrLocalToDate(tripSheet.cemal) : null;
   const dataUltVoo =
      tripSheet && tripSheet.duv ? isoStrLocalToDate(tripSheet.duv) : null;

   return (
      <tr>
         <th scope="row" className="grid justify-items-center p-px">
            <TripIndisp
               trip={tripData.trip}
               indisps={tripData.indisps}
               update={update}
            />
         </th>
         {dates.map((day, index) => {
            const checkToday = datasIguais(day, new Date());

            return (
               <td
                  key={index}
                  className={clsx("px-1", {
                     "border-x-2 border-blue-500 bg-blue-300": checkToday,
                  })}
               >
                  <div className="flex h-full w-full items-center justify-center">
                     <IndispCell
                        dateRef={day}
                        tripData={tripData}
                        cemal={dataCemal}
                        ultVoo={dataUltVoo}
                        update={update}
                     />
                  </div>
               </td>
            );
         })}
      </tr>
   );
}
