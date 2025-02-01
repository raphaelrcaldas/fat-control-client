"use client";
import { Select } from "flowbite-react";
import { useState, useEffect } from "react";
import { getTripData } from "@/services/google-sheets/sheets";
import TripTable from "./components/tripTable";
import { durationToMinutes, sortTripsByDuration } from "./utils";
import ChartSebo from "./components/chartSebo";

function SeboPage() {
   const [dataTrip, setData] = useState([]);

   const [selectFunc, setSelectFunc] = useState("mc");
   const [arrayFunc, setArrayFunc] = useState([]);
   const [activeRow, setActiveRow] = useState(0);

   useEffect(() => {
      getTripData().then((data) => {
         setData(data);
      });
   }, []);

   useEffect(() => {
      const filteredFunc = dataTrip.filter(
         (trip) => trip.func.toLowerCase() == selectFunc
      );

      setArrayFunc(sortTripsByDuration(filteredFunc));
   }, [selectFunc, dataTrip]);

   return (
      <>
         <div className='p-2'>
            <h2>Pau de Sebo</h2>

            <div className='flex mt-4'>
               <Select
                  value={selectFunc}
                  onChange={(e) => setSelectFunc(e.target.value)}
               >
                  <option value='mc'>Mecânico</option>
                  <option value='lm'>LoadMaster</option>
                  <option value='tf'>Taifeiro</option>
                  <option value='os'>Observador SAR</option>
                  <option value='acm'>OE</option>
               </Select>
            </div>
            <div className='flex flex-row gap-4 mr-4'>
               <TripTable
                  trips={arrayFunc}
                  activeRow={activeRow}
                  setRow={setActiveRow}
               />
               <div className='p-4'>
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
            </div>
         </div>
      </>
   );
}

export default SeboPage;
