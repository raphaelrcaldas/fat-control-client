"use client";

import { useEffect, useState } from "react";
import { Table, Button, TableRow } from "flowbite-react";
import { SelectFuncao } from "../components/inputForm";
import { IndispCell } from "./components/indispCell";
import { TripIndisp } from "./components/tripIndisp";
import { getCrewIndisps } from "@/services/routes/indisps";

function genDates(dateRefer) {
   const offset = -3;
   const days = Array(31)
      .fill()
      .map((_, i) => {
         const yearUTC = dateRefer.getUTCFullYear();
         const mounthUTC = dateRefer.getUTCMonth();
         const dayUTC = dateRefer.getUTCDate();

         return new Date(yearUTC, mounthUTC, dayUTC + i + offset);
      });

   return days;
}

export default function IndispPage() {
   const [dateRef, setDateRef] = useState(new Date());
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
      getCrewIndisps(filterFunc)
         .then((res) => res.json())
         .then((data) => {
            const filterOp = data.filter((item) => item.trip.func.oper != "al");
            const filterAl = data.filter((item) => item.trip.func.oper == "al");

            setIndispsAl(filterAl);
            setIndisps(filterOp);
         });
   };

   useEffect(updateCrewIndisps, [filterFunc]);

   useEffect(() => {
      const newDates = genDates(dateRef);
      setDatesArray(newDates);
   }, [dateRef]);

   return (
      <>
         <h2>Indisponibilidades</h2>
         {/* <div className="w-28 mt-6">
                <SelectFuncao
                    value={filterFunc}
                    callFunc={setFilterFunc}
                />
            </div> */}
         <div className='grid justify-center'>
            <div className='gap-3 flex m-1 text-center font-semibold'>
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
               <span className='text-lg content-center'>
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
            <Button
               color='light'
               size='sm'
               onClick={() => setDateRef(new Date())}
            >
               Hoje
            </Button>
         </div>
         <div className='overflow-auto h-full'>
            <Table>
               <Table.Head>
                  <Table.HeadCell />
                  {datesArray.map((dayR, index) => {
                     let bold;
                     if (dayR.getDay() != 0 && dayR.getDay() != 6) {
                        bold = "font-normal";
                     }

                     return (
                        <Table.HeadCell
                           key={index}
                           className={"px-0 text-center " + bold}
                        >
                           {dayR.toLocaleDateString("pt-BR", {
                              weekday: "short",
                           })}
                        </Table.HeadCell>
                     );
                  })}
               </Table.Head>
               <Table.Head>
                  <Table.HeadCell />
                  {datesArray.map((dayR, index) => {
                     const options = {
                        month: "2-digit",
                        day: "2-digit",
                     };
                     const dateStr = dayR.toLocaleDateString("pt-BR", options);

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

                     return (
                        <Table.HeadCell
                           key={index}
                           className={"px-0 text-center " + color}
                        >
                           {dateStr}
                        </Table.HeadCell>
                     );
                  })}
               </Table.Head>
               <Table.Body className='divide-y'>
                  {indisps.map((item, index) => {
                     return (
                        <TableRow key={index}>
                           <Table.Cell className='grid p-px justify-center'>
                              <TripIndisp
                                 trip={item.trip}
                                 indisps={item.indisps}
                                 update={updateCrewIndisps}
                              />
                           </Table.Cell>
                           {datesArray.map((dayR, index) => {
                              return (
                                 <Table.Cell key={index} className='p-px'>
                                    <IndispCell
                                       dateRef={dayR}
                                       trip={item.trip}
                                       indisps={item.indisps}
                                    />
                                 </Table.Cell>
                              );
                           })}
                        </TableRow>
                     );
                  })}
                  {indispsAl && (
                     <>
                        <Table.Row className='mt-4'>
                           <Table.Cell className='grid justify-center p-1 pt-8'>
                              <span className='text-base font-semibold text-center'>
                                 Alunos
                              </span>
                           </Table.Cell>
                        </Table.Row>
                        {indispsAl.map((item, index) => {
                           return (
                              <TableRow key={index}>
                                 <Table.Cell className='grid p-px justify-center'>
                                    <TripIndisp
                                       trip={item.trip}
                                       indisps={item.indisps}
                                       update={updateCrewIndisps}
                                    />
                                 </Table.Cell>
                                 {datesArray.map((dayR, index) => {
                                    return (
                                       <Table.Cell key={index} className='p-px'>
                                          <IndispCell
                                             dateRef={dayR}
                                             trip={item.trip}
                                             indisps={item.indisps}
                                          />
                                       </Table.Cell>
                                    );
                                 })}
                              </TableRow>
                           );
                        })}
                     </>
                  )}
               </Table.Body>
            </Table>
         </div>
      </>
   );
}
