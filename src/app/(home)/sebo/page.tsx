"use client";
import { useState, useEffect } from "react";
import { getTripData } from "services/google-sheets/sheets";
import TripTable from "./components/tripTable";
import { useSeboContext } from "../context/sebo";
import { durationToMinutes, sortTripsByDuration } from "./utils";
import ChartSebo from "./components/chartSebo";
import FilterPanel from "./components/filterPanel";

function SeboPage() {
   const [dataTrip, setData] = useState([]);
   const [arrayFunc, setArrayFunc] = useState([]);
   const [activeRow, setActiveRow] = useState(0);
   const [isLoading, setIsLoading] = useState(true);

   const [opIn, setOpIn] = useState(true);
   const [opOp, setOpOp] = useState(true);
   const [opAl, setOpAl] = useState(false);

   const { seboFunc, setSeboFunc } = useSeboContext();

   useEffect(() => {
      const fetchData = async () => {
         setIsLoading(true);
         try {
            const data = await getTripData();
            setData(data);
         } catch (err: any) {
            console.error("Erro ao buscar dados:", err);
         } finally {
            setIsLoading(false);
         }
      };

      fetchData();
   }, []);

   useEffect(() => {
      let filteredFunc = dataTrip.filter(
         (trip) => trip.func.toLowerCase() === seboFunc
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
   }, [seboFunc, dataTrip, opIn, opOp, opAl]);

   return (
      <div className='min-h-screen bg-gray-50 p-2'>
         {/* Header Section */}
         <div className='mb-3'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
               Pau de Sebo
            </h1>
            <p className='text-gray-600'>
               Acompanhe as horas de voo e informações dos tripulantes
            </p>
         </div>

         {/* Filter Panel */}
         <FilterPanel
            seboFunc={seboFunc}
            setSeboFunc={setSeboFunc}
            opIn={opIn}
            setOpIn={setOpIn}
            opOp={opOp}
            setOpOp={setOpOp}
            opAl={opAl}
            setOpAl={setOpAl}
            totalResults={arrayFunc.length}
            isLoading={isLoading}
         />

         {/* Content Flex Layout */}
         <div className='flex flex-col xl:flex-row gap-3 mt-3'>
            {/* Table Section - Width auto (only necessary) */}
            <div className='w-auto'>
               <TripTable
                  trips={arrayFunc}
                  activeRow={activeRow}
                  setRow={setActiveRow}
                  isLoading={isLoading}
               />
            </div>

            {/* Chart Section - Occupies remaining space */}
            {!isLoading && arrayFunc.length > 0 && (
               <div className='flex-1'>
                  <div className='bg-white rounded-xl shadow-lg p-4 sticky top-4'>
                     <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                        Gráfico de Horas de Voo
                     </h3>
                     <ChartSebo
                        data={arrayFunc.map((trip) =>
                           durationToMinutes(trip.hAno)
                        )}
                        categories={arrayFunc.map((trip) => trip.trig)}
                        activeRow={activeRow}
                        trips={arrayFunc}
                     />
                  </div>
               </div>
            )}
         </div>

         {/* Empty State */}
         {!isLoading && arrayFunc.length === 0 && (
            <div className='mt-12 text-center'>
               <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4'>
                  <svg
                     className='w-8 h-8 text-gray-400'
                     fill='none'
                     stroke='currentColor'
                     viewBox='0 0 24 24'
                  >
                     <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                     />
                  </svg>
               </div>
               <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Nenhum resultado encontrado
               </h3>
               <p className='text-gray-600'>
                  Tente ajustar os filtros ou a busca para encontrar o que
                  precisa.
               </p>
            </div>
         )}
      </div>
   );
}

export default SeboPage;
