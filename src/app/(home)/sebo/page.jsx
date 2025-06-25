"use client";
import { Select, ToggleSwitch } from "flowbite-react";
import { useState, useEffect } from "react";
import { getTripData } from "@/services/google-sheets/sheets";
import TripTable from "./components/tripTable";
import { useSelect } from "../../../context/select";
import { durationToMinutes, sortTripsByDuration } from "./utils";
import ChartSebo from "./components/chartSebo";

function SeboPage() {
   const [dataTrip, setData] = useState([]);

   const [arrayFunc, setArrayFunc] = useState([]);
   const [activeRow, setActiveRow] = useState(0);

   const [opIn, setOpIn] = useState(true);
   const [opOp, setOpOp] = useState(true);
   const [opAl, setOpAl] = useState(false);

   const { seboPage } = useSelect();

   useEffect(() => {
      getTripData().then((data) => {
         setData(data);
      });
   }, []);

   useEffect(() => {
      let filteredFunc = dataTrip.filter(
         (trip) => trip.func.toLowerCase() == seboPage.func.state
      );

      filteredFunc = filteredFunc.filter((trip) => {
         if (!opIn && trip.oper === "IN") return false;
         if (!opOp && trip.oper === "OP") return false;
         if (!opOp && trip.oper === "PO") return false;
         if (!opOp && trip.oper === "PB") return false;
         if (!opAl && trip.oper === "AL") return false;
         return true;
      });

      setArrayFunc(sortTripsByDuration(filteredFunc));
   }, [seboPage.func.state, dataTrip, opIn, opOp, opAl]);

   return (
      <>
         <div className='p-2 h-full w-full'>
            <div className='flex mt-4'>
               <Select
                  value={seboPage.func.state}
                  onChange={(e) => seboPage.func.setState(e.target.value)}
               >
                  <option value='pil'>Piloto</option>
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Comissário</option>
                  <option value='os'>Observador SAR</option>
                  <option value='acm'>OE</option>
               </Select>
               <div className='flex flex-row gap-2 justify-between ml-4 items-center'>
                  <span className='px-2'>
                     <ToggleSwitch
                        theme={{
                           root: {
                              base: "group flex flex-col rounded-lg focus:outline-none",
                           },
                        }}
                        checked={opIn}
                        onChange={setOpIn}
                        label='IN'
                     />
                  </span>
                  <span className='px-2'>
                     <ToggleSwitch
                        theme={{
                           root: {
                              base: "group flex flex-col rounded-lg focus:outline-none",
                           },
                        }}
                        checked={opOp}
                        onChange={setOpOp}
                        label='OP'
                     />
                  </span>
                  <span className='px-2'>
                     <ToggleSwitch
                        theme={{
                           root: {
                              base: "group flex flex-col rounded-lg focus:outline-none",
                           },
                        }}
                        checked={opAl}
                        onChange={setOpAl}
                        label='AL'
                     />
                  </span>
               </div>
            </div>
            <div className='flex flex-row h-full gap-4 mr-4 w-full'>
               <TripTable
                  trips={arrayFunc}
                  activeRow={activeRow}
                  setRow={setActiveRow}
               />
               {arrayFunc.length > 0 && (
                  <div className='p-4 hidden lg:inline'>
                     <div className='p-4 bg-white rounded-lg shadow-xl'>
                        <ChartSebo
                           data={arrayFunc.map((trip) =>
                              durationToMinutes(trip.hAno)
                           )}
                           categories={arrayFunc.map((trip) => trip.trig)}
                           activeRow={activeRow}
                        />
                     </div>
                  </div>
               )}
            </div>
         </div>
      </>
   );
}

export default SeboPage;
