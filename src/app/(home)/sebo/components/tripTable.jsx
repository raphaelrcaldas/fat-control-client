import { Table, TableCell, TableHeadCell, TableRow } from "flowbite-react";

const tableTheme = {
   root: {
      base: "w-full text-center bg-white shadow-md text-base rounded-lg text-gray-500",
      shadow:
         "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md",
      wrapper: "relative",
   },
   body: {
      base: "group/body",
      cell: {
         base: "px-2 py-2 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
      },
   },
   head: {
      base: "group/head text-sm uppercase text-gray-700",
      cell: {
         base: "bg-gray-100 px-4 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg",
      },
   },
   row: {
      base: "group/row",
      hovered: "hover:bg-gray-50",
      striped: "odd:bg-white even:bg-gray-50",
   },
};

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
      <div className='my-4 overflow-y-auto max-h-[80%] md:w-fit w-full shadow-lg'>
         <Table theme={tableTheme}>
            {/* Cabeçalho fixo */}
            <Table.Head className='sticky top-0 z-10 bg-gray-100'>
               <TableHeadCell className='hidden md:table-cell'>
                  PG
               </TableHeadCell>
               <TableHeadCell className='hidden md:table-cell'>
                  NOME DE GUERRA
               </TableHeadCell>
               <TableHeadCell>TRIG</TableHeadCell>
               <TableHeadCell>OP</TableHeadCell>
               <TableHeadCell>DSV</TableHeadCell>
               <TableHeadCell className='hidden md:table-cell'>
                  CEMAL
               </TableHeadCell>
               <TableHeadCell>TOTAL</TableHeadCell>
               <TableHeadCell>H ANO</TableHeadCell>
            </Table.Head>
            {trips.length > 0 ? (
               <Table.Body>
                  {trips.map((trip, index) => (
                     <TableRow
                        key={trip.trig}
                        onClick={() => setRow(index)}
                        className={index === activeRow && "bg-gray-300"}
                     >
                        <TableCell className='hidden md:table-cell'>
                           {trip.pg}
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                           {trip.nomeGuerra}
                        </TableCell>
                        <TableCell className='font-semibold'>
                           {trip.trig}
                        </TableCell>
                        <TableCell>{trip.oper}</TableCell>
                        <TableCell>
                           <span className={getColor(trip.dsv)}>
                              {trip.dsv}
                           </span>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                           <span className={getColorForDate(trip.cemal)}>
                              {trip.cemal}
                           </span>
                        </TableCell>
                        <TableCell>{trip.hTotal}</TableCell>
                        <TableCell className='font-semibold'>
                           {trip.hAno}
                        </TableCell>
                     </TableRow>
                  ))}
               </Table.Body>
            ) : (
               <Table.Body>
                  {Array(15)
                     .fill()
                     .map((_, i) => {
                        return (
                           <TableRow key={i}>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                              </TableCell>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                              </TableCell>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                              </TableCell>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                              </TableCell>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full animate-pulse max-w-[360px]'></div>
                              </TableCell> 
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full hidden md:flex animate-pulse max-w-[360px]'></div>
                              </TableCell>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full hidden md:flex animate-pulse max-w-[360px]'></div>
                              </TableCell>
                              <TableCell>
                                 <div className='h-6 bg-gray-200 rounded-full hidden md:flex animate-pulse max-w-[360px]'></div>
                              </TableCell>
                           </TableRow>
                        );
                     })}
               </Table.Body>
            )}
         </Table>
      </div>
   );
};

export default TripTable;
