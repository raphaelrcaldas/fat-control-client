import clsx from "clsx";
import { useState } from "react";
import Tooltip from "./tooltip";

const getColor = (value) => {
   let styles =
      "rounded-lg text-white font-semibold px-2 py-1 text-xs inline-block min-w-[40px] text-center";

   if (value > 45) {
      return styles + " bg-red-500";
   } else if (value > 30) {
      return styles + " bg-yellow-400 text-gray-800";
   } else {
      return styles + " bg-green-500";
   }
};

const getColorForDate = (dateString) => {
   let styles =
      "rounded-lg text-white font-semibold px-2 py-1 text-xs inline-block cursor-help";

   if (dateString != "") {
      const [day, month, year] = dateString.split("/").map(Number);
      const date = new Date(2000 + year, month - 1, day);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
         return styles + " bg-red-500";
      } else if (diffDays <= 15) {
         return styles + " bg-yellow-400 text-gray-800";
      } else {
         return styles + " bg-green-500";
      }
   } else {
      return styles + " bg-slate-500";
   }
};

const getDateTooltip = (dateString, label) => {
   if (!dateString) return `${label} não informado`;

   const [day, month, year] = dateString.split("/").map(Number);
   const date = new Date(2000 + year, month - 1, day);
   const today = new Date();
   const diffTime = date - today;
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

   if (diffDays <= 0) {
      return `${label} vencido há ${Math.abs(diffDays)} dias`;
   } else if (diffDays <= 15) {
      return `${label} vence em ${diffDays} dias`;
   } else {
      return `${label} vence em ${diffDays} dias`;
   }
};

const getDsvTooltip = (value) => {
   if (value > 45) {
      return `${value} dias desde último voo`;
   } else if (value > 30) {
      return `${value} dias desde último voo`;
   } else {
      return `${value} dias desde último voo`;
   }
};

const TripTable = ({ trips, setRow, activeRow, isLoading }) => {
   if (isLoading) {
      return <TableLoading />;
   }

   return (
      <div className='rounded-xl w-full shadow-lg overflow-hidden bg-white'>
         <div className='overflow-x-auto'>
            <table className='w-full text-gray-600 text-center text-sm'>
               <thead className='bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300'>
                  <tr>
                     {/* <th
                        className='py-3 px-4 hidden md:table-cell cursor-pointer hover:bg-gray-300 transition-colors group'
                     >
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              PG
                           </span>
                        </div>
                     </th>
                     <th
                        className='py-3 px-4 hidden md:table-cell cursor-pointer hover:bg-gray-300 transition-colors group'
                        
                     >
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              NOME DE GUERRA
                           </span>
                        </div>
                     </th> */}
                     <th className='py-3 px-4 cursor-pointer hover:bg-gray-300 transition-colors group'>
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              TRIG
                           </span>
                        </div>
                     </th>
                     <th className='py-3 px-4 cursor-pointer hover:bg-gray-300 transition-colors group'>
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              OP
                           </span>
                        </div>
                     </th>
                     <th className='py-3 px-4 cursor-pointer hover:bg-gray-300 transition-colors group'>
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              DSV
                           </span>
                        </div>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <span className='font-semibold text-gray-700'>
                           CEMAL
                        </span>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <span className='font-semibold text-gray-700'>CRM</span>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <span className='font-semibold text-gray-700'>
                           PASSAP
                        </span>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <span className='font-semibold text-gray-700'>
                           VISA
                        </span>
                     </th>
                     <th className='py-3 px-4 cursor-pointer hover:bg-gray-300 transition-colors group'>
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              TOTAL
                           </span>
                        </div>
                     </th>
                     <th className='py-3 px-4 cursor-pointer hover:bg-gray-300 transition-colors group'>
                        <div className='flex items-center justify-center gap-1'>
                           <span className='font-semibold text-gray-700'>
                              ANO
                           </span>
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {trips.length > 0 ? (
                     <>
                        {trips.map((trip, index) => (
                           <tr
                              key={trip.trig}
                              onClick={() => setRow(index)}
                              className={clsx(
                                 "border-b border-gray-100 cursor-pointer transition-all duration-150",
                                 {
                                    "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500":
                                       index === activeRow,
                                    "hover:bg-gray-50": index !== activeRow,
                                 }
                              )}
                           >
                              {/* <td className='py-2 px-4 font-semibold text-gray-700 hidden md:table-cell'>
                                 {trip.pg}
                              </td>
                              <td className='py-2 px-4 font-semibold text-gray-800 text-nowrap hidden md:table-cell'>
                                 {trip.nomeGuerra}
                              </td> */}
                              <td className='py-2 px-4 font-bold text-gray-900'>
                                 {trip.trig}
                              </td>
                              <td className='py-2 px-4'>
                                 <span
                                    className={clsx(
                                       "px-3 py-1 rounded-full text-xs font-bold",
                                       {
                                          "bg-green-100 text-green-700":
                                             trip.oper === "AL",
                                          "bg-yellow-100 text-yellow-700":
                                             trip.oper === "OP",
                                          "bg-yellow-200 text-yellow-800":
                                             trip.oper === "PO",
                                          "bg-orange-100 text-orange-700":
                                             trip.oper === "PB",
                                          "bg-red-100 text-red-700":
                                             trip.oper === "IN",
                                       }
                                    )}
                                 >
                                    {trip.oper}
                                 </span>
                              </td>
                              <td className='py-2 px-4'>
                                 <Tooltip content={getDsvTooltip(trip.dsv)}>
                                    <span className={getColor(trip.dsv)}>
                                       {trip.dsv}
                                    </span>
                                 </Tooltip>
                              </td>
                              <td className='py-2 px-4 hidden md:table-cell'>
                                 <Tooltip
                                    content={getDateTooltip(
                                       trip.cemal,
                                       "CEMAL"
                                    )}
                                 >
                                    <span
                                       className={getColorForDate(trip.cemal)}
                                    >
                                       {trip.cemal || "NIL"}
                                    </span>
                                 </Tooltip>
                              </td>
                              <td className='py-2 px-4 hidden md:table-cell'>
                                 <Tooltip
                                    content={getDateTooltip(trip.crm, "CRM")}
                                 >
                                    <span className={getColorForDate(trip.crm)}>
                                       {trip.crm || "NIL"}
                                    </span>
                                 </Tooltip>
                              </td>
                              <td className='py-2 px-4 hidden md:table-cell'>
                                 <Tooltip
                                    content={getDateTooltip(
                                       trip.val_pass,
                                       "Passaporte"
                                    )}
                                 >
                                    <span
                                       className={getColorForDate(
                                          trip.val_pass
                                       )}
                                    >
                                       {trip.val_pass || "NIL"}
                                    </span>
                                 </Tooltip>
                              </td>
                              <td className='py-2 px-4 hidden md:table-cell'>
                                 <Tooltip
                                    content={getDateTooltip(
                                       trip.val_visa,
                                       "Visto"
                                    )}
                                 >
                                    <span
                                       className={getColorForDate(
                                          trip.val_visa
                                       )}
                                    >
                                       {trip.val_visa || "NIL"}
                                    </span>
                                 </Tooltip>
                              </td>
                              <td className='py-2 px-4 font-medium text-gray-700'>
                                 {trip.hTotal}
                              </td>
                              <td className='py-2 px-4 font-bold text-blue-600'>
                                 {trip.hAno}
                              </td>
                           </tr>
                        ))}
                     </>
                  ) : (
                     <tr>
                        <td
                           colSpan='11'
                           className='py-12 text-center text-gray-500'
                        >
                           Nenhum registro encontrado
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};

function TableLoading() {
   return (
      <div className='rounded-xl w-full shadow-lg overflow-hidden bg-white'>
         <div className='overflow-x-auto'>
            <table className='w-full text-gray-600 text-center text-sm'>
               <thead className='bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300'>
                  <tr>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-12 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-32 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-16 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-12 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-12 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-20 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-16 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-20 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4 hidden md:table-cell'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-16 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-16 mx-auto'></div>
                     </th>
                     <th className='py-3 px-4'>
                        <div className='h-4 bg-gray-300 rounded animate-pulse w-12 mx-auto'></div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {Array(10)
                     .fill()
                     .map((_, i) => {
                        return (
                           <tr key={i} className='border-b border-gray-100'>
                              <td className='py-3 px-4 hidden md:table-cell'>
                                 <div className='h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4 hidden md:table-cell'>
                                 <div className='h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4'>
                                 <div className='h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4'>
                                 <div className='h-6 bg-gray-200 rounded-full animate-pulse w-12 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4'>
                                 <div className='h-6 bg-gray-200 rounded animate-pulse w-10 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4 hidden md:table-cell'>
                                 <div className='h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4 hidden md:table-cell'>
                                 <div className='h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4 hidden md:table-cell'>
                                 <div className='h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4 hidden md:table-cell'>
                                 <div className='h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4'>
                                 <div className='h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto'></div>
                              </td>
                              <td className='py-3 px-4'>
                                 <div className='h-4 bg-gray-200 rounded animate-pulse w-14 mx-auto'></div>
                              </td>
                           </tr>
                        );
                     })}
               </tbody>
            </table>
         </div>
      </div>
   );
}

export default TripTable;
