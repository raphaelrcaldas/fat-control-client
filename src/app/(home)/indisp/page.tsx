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
   const [dateRef, setDateRef] = useState(new Date());
   const [daysToGenerate, setDaysToGenerate] = useState(7);
   const [activeDate, setActiveDate] = useState(dateRef);
   const [datesArray, setDatesArray] = useState([]);
   const [dataTrip, setDataTrip] = useState([]);

   const [indisps, setIndisps] = useState([]);

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

   const handleTodayDate = () => {
      setDateRef(new Date());
      setActiveDate(new Date());
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

   return (
      <div className='h-full'>
         <div className='grid justify-center'>
            <div className='grid justify-center'>
               <Select
                  className='w-fit'
                  value={indispFunc}
                  onChange={(e) => setIndispFunc(e.target.value)}
               >
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Comissário</option>
                  <option value='os'>Observador-SAR</option>
                  <option value='oe'>OE</option>
               </Select>
            </div>
            <div className='flex gap-3 mt-4 font-semibold text-center'>
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

               <Button color='light' size='sm' onClick={handleTodayDate}>
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
            <div className='md:flex h-5/6 md:flex-row mt-3'>
               <div className='px-2 md:w-fit overflow-y-auto bg-white shadow-lg rounded-lg'>
                  <table className='relative overflow-visible w-full'>
                     <thead className='bg-white sticky top-0 z-10'>
                        <tr>
                           <th scope='col' />
                           {datesArray.map((dayR, index) => {
                              let bold;
                              if (dayR.getDay() != 0 && dayR.getDay() != 6) {
                                 bold = "font-normal";
                              }

                              return (
                                 <th
                                    key={index}
                                    scope='col'
                                    className={
                                       "px-0 text-center cursor-pointer " + bold
                                    }
                                    onClick={() => setActiveDate(dayR)}
                                 >
                                    {dayR.toLocaleDateString("pt-BR", {
                                       weekday: "short",
                                    })}
                                 </th>
                              );
                           })}
                        </tr>
                        <tr>
                           <th scope='col' />
                           {datesArray.map((dayR, index) => {
                              const dateStr = dayR.toLocaleDateString("pt-BR", {
                                 month: "2-digit",
                                 day: "2-digit",
                              });

                              return (
                                 <th
                                    key={index}
                                    className={
                                       "px-0 text-center font-semibold cursor-pointer " +
                                       getDayColor(dayR)
                                    }
                                    onClick={() => setActiveDate(dayR)}
                                    scope='col'
                                 >
                                    {dateStr}
                                 </th>
                              );
                           })}
                        </tr>
                     </thead>
                     <tbody className='divide-y'>
                        {indisps
                           .filter((item) => item.trip.func.oper != "al")
                           .map((item, index) => {
                              const tripSheet = dataTrip.find(
                                 (trips) =>
                                    trips.trig.toLowerCase() ==
                                    item.trip.trig.toLowerCase()
                              );

                              return (
                                 <tr key={index}>
                                    <th
                                       scope='row'
                                       className='p-px grid justify-items-center'
                                    >
                                       <TripIndisp
                                          trip={item.trip}
                                          indisps={item.indisps}
                                          update={updateCrewIndisps}
                                       />
                                    </th>
                                    {datesArray.map((dayR, index) => {
                                       return (
                                          <TdCell
                                             key={index}
                                             dref={dayR}
                                             activeD={activeDate}
                                          >
                                             <IndispCell
                                                dateRef={dayR}
                                                trip={item.trip}
                                                indisps={item.indisps}
                                                cemal={tripSheet.cemal}
                                                ultVoo={tripSheet.duv}
                                             />
                                          </TdCell>
                                       );
                                    })}
                                 </tr>
                              );
                           })}
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
                                 .map((item, index) => {
                                    const tripSheet = dataTrip.find(
                                       (trips) =>
                                          trips.trig.toLowerCase() ==
                                          item.trip.trig.toLowerCase()
                                    );

                                    return (
                                       <tr key={index}>
                                          <th
                                             scope='row'
                                             className='p-px grid justify-items-center'
                                          >
                                             <TripIndisp
                                                trip={item.trip}
                                                indisps={item.indisps}
                                                update={updateCrewIndisps}
                                             />
                                          </th>
                                          {datesArray.map((dayR, index) => {
                                             return (
                                                <TdCell
                                                   key={index}
                                                   dref={dayR}
                                                   activeD={activeDate}
                                                >
                                                   <IndispCell
                                                      dateRef={dayR}
                                                      trip={item.trip}
                                                      indisps={item.indisps}
                                                      cemal={tripSheet.cemal}
                                                      ultVoo={tripSheet.duv}
                                                   />
                                                </TdCell>
                                             );
                                          })}
                                       </tr>
                                    );
                                 })}
                           </>
                        }
                     </tbody>
                  </table>
               </div>
               <div className='hidden w-fit ml-3 md:flex h-fit'>
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

function getDayColor(dayR) {
   let color;

   if (dayR.getDay() == 0 || dayR.getDay() == 6) {
      color = "bg-red-400";
   }

   if (dayR.valueOf() < new Date().valueOf()) {
      color = "bg-gray-400";
   }

   if (
      dayR.getDate() == new Date().getDate() &&
      dayR.getMonth() == new Date().getMonth()
   ) {
      color = "bg-yellow-200";
   }

   return color;
}

function datasIguais(data1, data2) {
   return (
      data1.getDate() === data2.getDate() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getFullYear() === data2.getFullYear()
   );
}

function TdCell({ children, dref, activeD }) {
   const checkRef = datasIguais(dref, activeD);

   return (
      <td
         className={clsx("px-1", {
            "bg-blue-300 border-x-2 border-blue-500": checkRef,
         })}
      >
         <div className='w-full h-full flex items-center justify-center'>
            {children}
         </div>
      </td>
   );
}
