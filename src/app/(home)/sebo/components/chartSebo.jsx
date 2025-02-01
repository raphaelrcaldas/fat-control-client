import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { converterMinutosParaHoras } from "../utils";

const Chart = dynamic(() => import("react-apexcharts"), {
   ssr: false, // This ensures the component is not SSR'd
});

function customTooltip({ series, seriesIndex, dataPointIndex }) {
   const customElement = document.createElement("div");
   customElement.style.padding = "10px";
   customElement.innerHTML = converterMinutosParaHoras(
      series[seriesIndex][dataPointIndex]
   );

   return customElement;
}

export default function ChartSebo({ categories, data, activeRow }) {
   const [media, setMedia] = useState([]);

   function setBarColour({ dataPointIndex }) {
      if (dataPointIndex == activeRow) return "#f8473c";

      return "#0064ff";
   }

   useEffect(() => {
      const soma = data.reduce((accumulator, current) => {
         return accumulator + current;
      }, 0);

      setMedia(soma / data.length);
   }, [data]);

   return (
      <Chart
         options={{
            colors: [setBarColour],
            dataLabels: {
               enabled: false,
            },
            yaxis: {
               labels: {
                  formatter: converterMinutosParaHoras,
               },
            },
            xaxis: {
               categories: categories,
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

            plotOptions: {
               bar: {
                  borderRadius: 3,
               },
            },
         }}
         series={[
            {
               data: data,
            },
         ]}
         type='bar'
         width='550'
         height='400'
      />
   );
}
