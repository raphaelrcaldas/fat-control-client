"use client";
import Chart from "react-apexcharts";
import { Select } from "flowbite-react";
import { useState, useEffect } from "react";
import { getTripData } from "@/services/google-sheets/sheets";
import TripTable from "./components/tripTable";
import { durationToMinutes, converterMinutosParaHoras } from "./utils";

function SeboPage() {
   const [dataTrip, setData] = useState([]);
   const [selectFunc, setSelectFunc] = useState("mc");
   const [arrayFunc, setArrayFunc] = useState([]);

   const [media, setMedia] = useState(0);

   useEffect(() => {
      const getSheetData = async () => {
         const response = await getTripData();
         setData(response);
      };

      getSheetData();
   }, []);

   useEffect(() => {
      const filteredFunc = dataTrip.filter(
         (trip) => trip.func.toLowerCase() == selectFunc
      );

      const soma = filteredFunc.reduce((accumulator, current) => {
         const parseCurr = durationToMinutes(current.hAno);
         return accumulator + parseCurr;
      }, 0);

      setMedia(soma / filteredFunc.length);

      setArrayFunc(filteredFunc);
   }, [selectFunc, dataTrip]);

   const sortTripsByDuration = (trips) => {
      return trips.sort((a, b) => {
         const [hoursA, minutesA] = a.hAno.split(":").map(Number);
         const [hoursB, minutesB] = b.hAno.split(":").map(Number);

         const totalMinutesA = hoursA * 60 + minutesA;
         const totalMinutesB = hoursB * 60 + minutesB;

         return totalMinutesB - totalMinutesA;
      });
   };

   const sortedArrayFunc = sortTripsByDuration(arrayFunc);

   function customTooltip({ series, seriesIndex, dataPointIndex }) {
      const customElement = document.createElement("div");
      customElement.style.padding = "10px";
      customElement.innerHTML = converterMinutosParaHoras(
         series[seriesIndex][dataPointIndex]
      );

      return customElement;
   }

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
               <TripTable trips={sortedArrayFunc} />
               <div className='p-4'>
                  <div className='p-4 bg-white rounded-lg shadow-xl'>
                     <Chart
                        options={{
                           dataLabels: {
                              enabled: false,
                           },
                           yaxis: {
                              labels: {
                                 formatter: converterMinutosParaHoras,
                              },
                           },
                           xaxis: {
                              categories: arrayFunc.map((t) => t.trig),
                           },
                           tooltip: {
                              custom: customTooltip,
                           },
                           annotations: {
                              yaxis: [
                                 {
                                    y: media + (25 * media) / 100,
                                    y2: media - (25 * media) / 100,
                                    fillColor: "#ff0000",
                                    opacity: 0.2,
                                 },
                              ],
                           },
                        }}
                        series={[
                           {
                              data: arrayFunc.map((d) =>
                                 durationToMinutes(d.hAno)
                              ),
                           },
                        ]}
                        type='bar'
                        width='550'
                        height='400'
                     />
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}

export default SeboPage;
