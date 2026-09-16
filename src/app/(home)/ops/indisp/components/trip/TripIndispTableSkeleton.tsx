import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";

// Espelha a TripIndispTable: mesmas colunas (MOTIVO / OBS / INÍCIO / FIM / Ações)
// e altura dos controles, só com blocos no lugar dos dados.
const ROWS = 5;

export function TripIndispTableSkeleton() {
   return (
      <div
         role="status"
         className="overflow-hidden rounded border border-slate-200 shadow-sm"
      >
         <span className="sr-only">Carregando registros…</span>
         <Table
            aria-hidden
            className="text-center uppercase"
            theme={{
               head: { cell: { base: "px-2 whitespace-nowrap" } },
               body: { cell: { base: "px-2 whitespace-nowrap" } },
            }}
         >
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
            <TableBody className="animate-pulse divide-y divide-slate-200 motion-reduce:animate-none">
               {Array.from({ length: ROWS }).map((_, i) => (
                  <TableRow key={i}>
                     <TableCell className="w-px">
                        <div className="mx-auto h-6 w-10 rounded bg-slate-200" />
                     </TableCell>
                     <TableCell className="hidden max-w-0 md:table-cell">
                        <div className="mx-auto h-4 w-32 rounded bg-slate-100" />
                     </TableCell>
                     <TableCell className="w-px">
                        <div className="mx-auto h-4 w-14 rounded bg-slate-100" />
                     </TableCell>
                     <TableCell className="w-px">
                        <div className="mx-auto h-4 w-14 rounded bg-slate-100" />
                     </TableCell>
                     <TableCell className="w-px">
                        <div className="mx-auto h-9 w-14 rounded bg-slate-100" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
