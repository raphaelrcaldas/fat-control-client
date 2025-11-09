"use client";

import { useEffect, useState, useRef } from "react";
import { Spinner, Tooltip } from "flowbite-react";
import IndispCell from "./components/indispCell";
import { TripIndisp } from "./components/tripIndisp";
import { getCrewIndisps } from "services/routes/indisps";
import { getTripData } from "services/google-sheets/sheets";
import clsx from "clsx";
import { useIndispContext } from "../context/indisp";
import { LastIndisps } from "./components/lastIndisps";
import { AppLoadingScreen } from "../components/appLoadingScreen";
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

   const updateCrewIndisps = () => {
      setIndisps([]);
      getCrewIndisps(indispFunc, "11gt")
         .then((res) => res.json())
         .then((data) => {
            setIndisps(data);
         });
   };

   useEffect(updateCrewIndisps, [indispFunc]);

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
            const cellWidth = 40;
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

      // Aguarda renderização inicial
      const timeoutId = setTimeout(updateDays, 150);

      const handleResize = () => {
         updateDays();
      };

      window.addEventListener("resize", handleResize);

      // Observer para detectar mudanças no tamanho do container
      const resizeObserver = new ResizeObserver(() => {
         updateDays();
      });

      if (tableContainerRef.current) {
         resizeObserver.observe(tableContainerRef.current);
      }

      return () => {
         window.removeEventListener("resize", handleResize);
         resizeObserver.disconnect();
         clearTimeout(timeoutId);
      };
   }, []); // Executa apenas uma vez na montagem e responde a eventos de resize

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
      mc: "Mecânico",
      lm: "LoadMaster",
      tf: "Comissário",
      os: "Observador-SAR",
      oe: "OE",
   };

   return (
      <div className='h-full flex flex-col overflow-hidden'>
         <div className='flex mb-2 flex-col md:flex-row items-center md:justify-between gap-3 py-3 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-sm border border-gray-200 px-4'>
            {/* Select de Função - Customizado */}
            <div className='flex items-center gap-2'>
               <HiUserGroup className='text-gray-500 text-lg flex-shrink-0' />
               Função
               <select
                  value={indispFunc}
                  onChange={(e) => setIndispFunc(e.target.value)}
                  className='appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-sm hover:shadow'
                  aria-label='Selecionar função'
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                     backgroundPosition: "right 0.5rem center",
                     backgroundRepeat: "no-repeat",
                     backgroundSize: "1.5em 1.5em",
                  }}
               >
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Comissário</option>
                  <option value='os'>Observador-SAR</option>
                  <option value='oe'>OE</option>
               </select>
            </div>

            {/* Navegação de Datas */}
            <div className='flex flex-col items-center gap-2'>
               <div className='flex flex-row gap-1 items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200'>
                  <Tooltip content='Mês anterior'>
                     <button
                        onClick={() => changeDateRef(null, -1)}
                        className='p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-800'
                        aria-label='Mês anterior'
                     >
                        <HiChevronDoubleLeft className='text-lg' />
                     </button>
                  </Tooltip>
                  <Tooltip content='Dia anterior'>
                     <button
                        onClick={() => changeDateRef(-1, null)}
                        className='p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-800'
                        aria-label='Dia anterior'
                     >
                        <HiChevronLeft className='text-lg' />
                     </button>
                  </Tooltip>

                  <button
                     onClick={() => setDateRef(new Date())}
                     className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors mx-1 shadow-sm'
                     aria-label='Ir para hoje'
                  >
                     Hoje
                  </button>

                  <Tooltip content='Próximo dia'>
                     <button
                        onClick={() => changeDateRef(1, null)}
                        className='p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-800'
                        aria-label='Próximo dia'
                     >
                        <HiChevronRight className='text-lg' />
                     </button>
                  </Tooltip>
                  <Tooltip content='Próximo mês'>
                     <button
                        onClick={() => changeDateRef(null, 1)}
                        className='p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 hover:text-gray-800'
                        aria-label='Próximo mês'
                     >
                        <HiChevronDoubleRight className='text-lg' />
                     </button>
                  </Tooltip>
               </div>
               <div className='text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200'>
                  {getCurrentPeriod()}
               </div>
            </div>

            {/* Badge com função selecionada - Visível apenas em desktop */}
            <div className='hidden md:flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2'>
               <span className='text-xs font-medium text-blue-600 uppercase'>
                  Visualizando
               </span>
               <span className='text-sm font-bold text-blue-700'>
                  {funcLabels[indispFunc]}
               </span>
            </div>
         </div>

         {indisps.length > 0 && dataTrip.length > 0 ? (
            <div className='flex-1 min-h-0 flex flex-col gap-2 overflow-hidden'>
               <ColorLegend />
               <div className='flex flex-col md:flex-row flex-1 min-h-0 gap-2'>
                  <div
                     ref={tableContainerRef}
                     className='flex-1 min-w-0 overflow-x-auto overflow-y-auto bg-white shadow-lg rounded-lg border border-gray-200'
                  >
                     <div className='px-2 pb-2 min-w-max h-fit'>
                        <table className='relative overflow-visible w-full'>
                           <thead className='bg-white sticky top-0 z-10'>
                              <tr>
                                 <th scope='col' />
                                 {datesArray.map((dayR, index) => (
                                    <ThWeek key={index} dayRef={dayR} />
                                 ))}
                              </tr>
                              <tr>
                                 <th scope='col' />
                                 {datesArray.map((dayR, index) => (
                                    <ThMonth key={index} dayRef={dayR} />
                                 ))}
                              </tr>
                           </thead>
                           <tbody className='divide-y'>
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
                                    <tr className=''>
                                       <td
                                          colSpan={datesArray.length + 1}
                                          className='py-3 px-4'
                                       >
                                          <div className='flex items-center justify-center gap-2'>
                                             <div className='h-px bg-gray-300 flex-1'></div>
                                             <span className='text-base font-bold text-gray-700 uppercase'>
                                                Alunos
                                             </span>
                                             <div className='h-px bg-gray-300 flex-1'></div>
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
                  <div className='hidden md:block flex-shrink-0 w-auto max-w-sm'>
                     <LastIndisps
                        indisps={indisps}
                        update={updateCrewIndisps}
                     />
                  </div>
               </div>
            </div>
         ) : (
            <div className='flex-1 flex flex-col items-center justify-center gap-4'>
               <div className='text-center'>
                  <Spinner color='info' size='xl' />
                  <p className='mt-4 text-gray-600 font-medium'>
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
      <div className='flex flex-wrap justify-center gap-2 px-2 py-2 bg-white shadow rounded-lg text-xs md:text-sm flex-shrink-0'>
         {indispsOptions.map((option) => (
            <div key={option.value} className='flex items-center gap-1'>
               <div className={`w-4 h-4 rounded ${option.color.button}`} />
               <span className='font-medium'>{option.label}</span>
            </div>
         ))}
         <div className='flex items-center gap-1'>
            <div className='w-4 h-4 rounded bg-emerald-600' />
            <span className='font-medium'>Disponível</span>
         </div>
         <div className='flex items-center gap-1'>
            <div className='w-4 h-4 rounded bg-purple-600' />
            <span className='font-medium'>CEMAL Inválido</span>
         </div>
         <div className='flex items-center gap-1'>
            <div className='w-4 h-4 rounded bg-slate-600' />
            <span className='font-medium'>Desadaptado</span>
         </div>
      </div>
   );
}

function ThWeek({ dayRef }: { dayRef: Date }) {
   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;

   return (
      <th
         scope='col'
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
         scope='col'
         className={clsx(
            "px-1 py-2 text-center font-bold text-sm transition-colors",
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
         <th scope='row' className='p-px grid justify-items-center'>
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
                     "bg-blue-300 border-x-2 border-blue-500": checkToday,
                  })}
               >
                  <div className='w-full h-full flex items-center justify-center'>
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
