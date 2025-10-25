"use client";

import { useEffect, useState } from "react";
import { getUserActionLogs, UserActionLog } from "services/routes/logs";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableCell,
   TableBody,
   TableRow,
   Spinner,
} from "flowbite-react";

export default function LogDashboard() {
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      const filters = { action: "login" };
      setLoading(true);
      getUserActionLogs(filters)
         .then(setLogs)
         .catch(console.error)
         .finally(() => setLoading(false));
   }, []);

   return (
      <div className='grid gap-2 p-2'>
         <div className='bg-white py-3 px-2 rounded-lg shadow-md'>
            <h2 className='font-medium text-lg'>Logs</h2>
         </div>
         <div className=''>
            <Table className='' hoverable>
               <TableHead>
                  <TableHeadCell>timestamp</TableHeadCell>
                  <TableHeadCell>user</TableHeadCell>
                  <TableHeadCell>action</TableHeadCell>
                  <TableHeadCell className='hidden md:table-cell'>
                     resource
                  </TableHeadCell>
               </TableHead>
               <TableBody className='divide-y'>
                  {loading ? (
                     <TableRow className='bg-white'>
                        <TableCell colSpan={4} className='py-6 text-center'>
                           <div className='flex justify-center items-center gap-2'>
                              <Spinner size='lg' aria-label='loading' />
                              <span className='text-sm text-gray-600'>Carregando...</span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : logs.length === 0 ? (
                     <TableRow className='bg-white'>
                        <TableCell colSpan={4} className='py-6 text-center text-gray-500'>
                           Nenhum log encontrado
                        </TableCell>
                     </TableRow>
                  ) : (
                     logs.map((log) => (
                        <LogRow key={log.id} log={log} />
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}

function LogRow({ log }: { log: UserActionLog }) {
   const timestamp =
      new Date(log.timestamp + "Z").toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
      }) || "N/A";

   return (
      <TableRow key={log.id} className='bg-white'>
         <TableCell className='font-mono text-base'>{timestamp}</TableCell>
         <TableCell className='uppercase text-nowrap'>
            {log.user.p_g} {log.user.nome_guerra}
         </TableCell>
         <TableCell>{log.action}</TableCell>
         <TableCell className='hidden md:table-cell'>{log.resource}</TableCell>
      </TableRow>
   );
}
