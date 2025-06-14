import clsx from "clsx";

const getColor = (value) => {
   let styles = "rounded-lg text-white font-semibold p-1";

   if (value > 45) {
      return styles + " bg-red-400";
   } else if (value > 30) {
      return styles + " bg-yellow-300";
   }
};

const getColorForDate = (dateString) => {
   let styles = "rounded-lg text-white font-semibold p-1";

   if (dateString != "") {
      const [day, month, year] = dateString.split("/").map(Number);
      const date = new Date(2000 + year, month - 1, day);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
         return styles + " bg-red-400";
      } else if (diffDays <= 15) {
         return styles + " bg-yellow-300";
      }
   }
};

const TripTable = ({ trips, setRow, activeRow }) => {
   return (
      <div className='my-4 overflow-y-auto max-h-[85%] h-fit rounded-lg md:w-fit w-full shadow-lg relative'>
         <table className='w-full text-gray-500 bg-white text-center text-base'>
            <thead className='sticky top-0 z-10 bg-gray-200'>
               <tr>
                  <th className='py-1.5 px-2.5 hidden md:table-cell'>PG</th>
                  <th className='py-1.5 px-2.5 hidden md:table-cell'>
                     NOME DE GUERRA
                  </th>
                  <th className='py-1.5 px-2.5'>TRIG</th>
                  <th className='py-1.5 px-2.5'>OP</th>
                  <th className='py-1.5 px-2.5'>DSV</th>
                  <th className='py-1.5 px-2.5 hidden md:table-cell'>CEMAL</th>
                  <th className='py-1.5 px-2.5'>TOTAL</th>
                  <th className='py-1.5 px-2.5'>H ANO</th>
               </tr>
            </thead>
            {trips.length > 0 ? (
               <tbody>
                  {trips.map((trip, index) => (
                     <tr
                        key={trip.trig}
                        onClick={() => setRow(index)}
                        className={clsx({
                           "bg-gray-300": index === activeRow,
                        })}
                     >
                        <td className='py-1.5 px-2.5 hidden md:table-cell'>
                           {trip.pg}
                        </td>
                        <td className='py-1.5 px-2.5 hidden md:table-cell'>
                           {trip.nomeGuerra}
                        </td>
                        <td className='py-1.5 px-2.5 font-semibold'>
                           {trip.trig}
                        </td>
                        <td
                           className={clsx("py-1.5 px-2.5 font-semibold", {
                              "text-emerald-600": trip.oper === "AL",
                              "text-yellow-400": trip.oper === "OP",
                              "text-yellow-500": trip.oper === "PO",
                              "text-yellow-600": trip.oper === "PB",
                              "text-red-700": trip.oper === "IN",
                           })}
                        >
                           {trip.oper}
                        </td>
                        <td className='py-1.5 px-2.5'>
                           <span className={getColor(trip.dsv)}>
                              {trip.dsv}
                           </span>
                        </td>
                        <td className='py-1.5 px-2.5 hidden md:table-cell'>
                           <span className={getColorForDate(trip.cemal)}>
                              {trip.cemal}
                           </span>
                        </td>
                        <td className='py-1.5 px-2.5'>{trip.hTotal}</td>
                        <td className='py-1.5 px-2.5 font-semibold'>
                           {trip.hAno}
                        </td>
                     </tr>
                  ))}
               </tbody>
            ) : (
               <tbody></tbody>
            )}
         </table>
      </div>
   );
};

function tableLoading() {
   return (
      <>
         {Array(15)
            .fill()
            .map((_, i) => {
               return (
                  <tr key={i}>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full hidden md:flex animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full hidden md:flex animate-pulse max-w-[360px]'></div>
                     </td>
                     <td>
                        <div className='h-6 bg-gray-200 rounded-full hidden md:flex animate-pulse max-w-[360px]'></div>
                     </td>
                  </tr>
               );
            })}
      </>
   );
}

export default TripTable;
