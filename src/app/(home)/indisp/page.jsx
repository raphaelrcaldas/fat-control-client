"use client";

import { useEffect, useState } from "react";
import { Button, Select } from "flowbite-react";
import IndispCell from "./components/indispCell";
import { TripIndisp } from "./components/tripIndisp";
import { getCrewIndisps } from "@/services/routes/indisps";

function genDates(dateRefer, daysToGenerate) {
   const offset = -1;
   const days = Array(daysToGenerate)
      .fill()
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
   const [daysToGenerate, setDaysToGenerate] = useState(
      typeof window !== "undefined" && window.innerWidth >= 1024 ? 25 : 7
   );
   const [activeDate, setActiveDate] = useState(new Date());
   const [datesArray, setDatesArray] = useState(genDates(dateRef));

   const [filterFunc, setFilterFunc] = useState("mc");
   const [indisps, setIndisps] = useState([]);
   const [indispsAl, setIndispsAl] = useState([]);

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
      getCrewIndisps(filterFunc, "11gt")
         .then((res) => res.json())
         .then((data) => {
            const filterOp = data.filter((item) => item.trip.func.oper != "al");
            const filterAl = data.filter((item) => item.trip.func.oper == "al");

            setIndispsAl(filterAl);
            setIndisps(filterOp);
         });
   };

   const handleTodayDate = () => {
      setDateRef(new Date());
      setActiveDate(new Date());
   };

   useEffect(updateCrewIndisps, [filterFunc]);

   useEffect(() => {
      const handleResize = () => {
         setDaysToGenerate(window.innerWidth >= 1024 ? 30 : 8);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      setDatesArray(genDates(dateRef, daysToGenerate));
   }, [dateRef, daysToGenerate]);

   return (
      <div className='h-full'>
         <h2>Indisponibilidades</h2>
         <div className='mt-6'>
            <Select
               className='w-36'
               value={filterFunc}
               onChange={(e) => setFilterFunc(e.target.value)}
            >
               <option value='mc'>Mecânico</option>
               <option value='lm'>LoadMaster</option>
               <option value='tf'>Taifeiro</option>
               <option value='os'>Observador-SAR</option>
               <option value='oe'>OE</option>
            </Select>
         </div>
         <div className='grid justify-center'>
            <div className='flex gap-3 m-1 font-semibold text-center'>
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
                  onClick={() => changeDateRef(-1)}
               >
                  <span className='text-lg'>{"<"}</span>
               </Button>
               <span className='content-center text-lg'>
                  {dateRef.toLocaleDateString("pt-BR", {
                     day: "2-digit",
                     month: "long",
                     year: "numeric",
                  })}
               </span>
               <Button
                  className='p-0'
                  color='light'
                  size='sm'
                  onClick={() => changeDateRef(1)}
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
         <div className='grid justify-center'>
            <Button color='light' size='sm' onClick={handleTodayDate}>
               Hoje
            </Button>
         </div>
         <div className='overflow-y-auto max-h-[72%] bg-white shadow-lg mt-4 pb-3 px-3 w-fit rounded-lg'>
            <table className='w-full'>
               <thead className='sticky bg-white top-0 z-10'>
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
                        const options = {
                           month: "2-digit",
                           day: "2-digit",
                        };
                        const dateStr = dayR.toLocaleDateString(
                           "pt-BR",
                           options
                        );

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
                  {indisps.map((item, index) => {
                     return (
                        <tr key={index}>
                           <th scope='row' className='p-px'>
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
                                    />
                                 </TdCell>
                              );
                           })}
                        </tr>
                     );
                  })}
                  {indispsAl.length > 0 && (
                     <>
                        <tr>
                           <td className='grid justify-center p-1 pt-4'>
                              <span className='text-base font-semibold text-center'>
                                 Alunos
                              </span>
                           </td>
                        </tr>
                        {indispsAl.map((item, index) => {
                           return (
                              <tr key={index}>
                                 <td className='p-px'>
                                    <TripIndisp
                                       trip={item.trip}
                                       indisps={item.indisps}
                                       update={updateCrewIndisps}
                                    />
                                 </td>
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
                                          />
                                       </TdCell>
                                    );
                                 })}
                              </tr>
                           );
                        })}
                     </>
                  )}
               </tbody>
            </table>
         </div>
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
         className={
            "px-1 " + (checkRef ? "bg-blue-300 border-x-2 border-blue-500" : "")
         }
      >
         {children}
      </td>
   );
}
