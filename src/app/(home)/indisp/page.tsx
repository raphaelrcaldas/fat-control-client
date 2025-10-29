"use client";

import { useEffect, useState } from "react";
import { Button, Select, Spinner } from "flowbite-react";
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

      function dayRefWindowsSize(size) {
         return parseInt((size / 80).toString());
      }

      setDaysToGenerate(dayRefWindowsSize(window.innerWidth));

      const handleResize = () => {
         setDaysToGenerate(dayRefWindowsSize(window.innerWidth));
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      setDatesArray(genDates(dateRef, daysToGenerate));
   }, [dateRef, daysToGenerate]);

   if (!indisps || !dataTrip) return <AppLoadingScreen />;

   return (
      <div className='h-full'>
         <div className='grid justify-items-center items-center relative py-2 gap-2'>
            <Select
               className='md:absolute left-0 w-fit'
               value={indispFunc}
               onChange={(e) => setIndispFunc(e.target.value)}
            >
               <option value='mc'>Mecânico</option>
               <option value='lm'>LoadMaster</option>
               <option value='tf'>Comissário</option>
               <option value='os'>Observador-SAR</option>
               <option value='oe'>OE</option>
            </Select>
            <div className='flex flex-row gap-2'>
               <Button
                  className='p-0'
                  color='light'
                  size='sm'
                  onClick={() => changeDateRef(null, -1)}
               >
                  <span className='text-lg'>{"<<"}</span>
               </Button>
               <Button
                  className='p-0'
                  color='light'
                  size='sm'
                  onClick={() => changeDateRef(-1, null)}
               >
                  <span className='text-lg'>{"<"}</span>
               </Button>

               <Button
                  color='light'
                  size='sm'
                  onClick={() => setDateRef(new Date())}
               >
                  Hoje
               </Button>

               <Button
                  className='p-0'
                  color='light'
                  size='sm'
                  onClick={() => changeDateRef(1, null)}
               >
                  <span className='text-lg'>{">"}</span>
               </Button>
               <Button
                  className='p-0'
                  color='light'
                  size='sm'
                  onClick={() => changeDateRef(null, 1)}
               >
                  <span className='text-lg'>{">>"}</span>
               </Button>
            </div>
         </div>

         {indisps.length > 0 && dataTrip.length > 0 ? (
            <div className='md:flex h-[92%] md:flex-row mt-2 gap-2'>
               <div className='h-full px-2 pb-2 md:w-fit overflow-y-auto bg-white shadow-lg rounded-lg'>
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
                        {
                           <>
                              <tr>
                                 <td className='grid justify-center p-1 pt-4'>
                                    <span className='text-base font-semibold text-center'>
                                       Alunos
                                    </span>
                                 </td>
                              </tr>
                              {indisps
                                 .filter((item) => item.trip.func.oper == "al")
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
                        }
                     </tbody>
                  </table>
               </div>
               <div className='hidden w-fit md:flex h-fit'>
                  <LastIndisps indisps={indisps} />
               </div>
            </div>
         ) : (
            <div className='grid justify-items-center align-middle mt-4 h-full'>
               <Spinner color='failure' size='xl' />
            </div>
         )}
      </div>
   );
}

function ThWeek({ dayRef }: { dayRef: Date }) {
   const diaSemana = dayRef.getDay();
   const isWeekend = diaSemana === 0 || diaSemana === 6;

   return (
      <th
         scope='col'
         className={clsx("px-0 text-center", {
            "font-normal": !isWeekend,
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
   const toStartOfDay = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf();
   const hojeStart = toStartOfDay(hoje);
   const diaStart = toStartOfDay(dayRef);

   const isToday = diaStart === hojeStart;
   const isPast = diaStart < hojeStart;

   return (
      <th
         scope='col'
         className={clsx("px-0 text-center font-semibold", {
            "bg-red-400": isWeekend,
            "bg-yellow-300": isToday,
            "bg-gray-400": isPast && !isToday,
         })}
         aria-current={isToday ? "date" : undefined}
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
                     />
                  </div>
               </td>
            );
         })}
      </tr>
   );
}
