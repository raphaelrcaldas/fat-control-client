import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";

// Espelha a TripIndispTable: mesmas colunas (MOTIVO / OBS / INÍCIO / FIM / Ações)
// e altura de linha (h-10), só com blocos no lugar dos dados.
const ROWS = 5;

export function TripIndispTableSkeleton() {
   return (
      <div className="overflow-hidden rounded border border-slate-200 shadow">
         <Table className="text-center uppercase">
            <TableHead className="bg-gray-100">
               <TableRow>
                  <TableHeadCell className="font-bold">MOTIVO</TableHeadCell>
                  <TableHeadCell className="hidden font-bold md:table-cell">
                     OBS
                  </TableHeadCell>
                  <TableHeadCell className="font-bold">INÍCIO</TableHeadCell>
                  <TableHeadCell className="font-bold">FIM</TableHeadCell>
                  <TableHeadCell>
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="animate-pulse divide-y divide-slate-200">
               {Array.from({ length: ROWS }).map((_, i) => (
                  <TableRow key={i}>
                     <TableCell className="h-10 p-1">
                        <div className="mx-auto h-6 w-12 rounded-md bg-slate-200" />
                     </TableCell>
                     <TableCell className="hidden h-10 p-1 md:table-cell">
                        <div className="mx-auto h-4 w-32 rounded bg-slate-100" />
                     </TableCell>
                     <TableCell className="h-10 p-1">
                        <div className="mx-auto h-4 w-16 rounded bg-slate-100" />
                     </TableCell>
                     <TableCell className="h-10 p-1">
                        <div className="mx-auto h-4 w-16 rounded bg-slate-100" />
                     </TableCell>
                     <TableCell className="h-10 p-1">
                        <div className="mx-auto h-7 w-16 rounded-full bg-slate-100" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
