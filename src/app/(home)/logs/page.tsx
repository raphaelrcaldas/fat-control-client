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
} from "flowbite-react";

export default function LogDashboard() {
   const [logs, setLogs] = useState<UserActionLog[]>([]);

   useEffect(() => {
      const filters = { action: "login" };
      getUserActionLogs(filters).then(setLogs).catch(console.error);
   }, []);

   return (
      <div className='grid gap-2 p-2'>
         <div className='bg-white py-3 px-2 rounded-lg shadow-md'>
            <h2>Logs</h2>
         </div>
         <div className=''>
            <Table className='' hoverable>
               <TableHead>
                  <TableHeadCell>timestamp</TableHeadCell>
                  <TableHeadCell>user</TableHeadCell>
                  <TableHeadCell>action</TableHeadCell>
                  <TableHeadCell>resource</TableHeadCell>
               </TableHead>
               <TableBody className='divide-y'>
                  {logs.map((log) => (
                     <LogRow key={log.id} log={log} />
                  ))}
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
         <TableCell className='uppercase'>
            {log.user.p_g} {log.user.nome_guerra}
         </TableCell>
         <TableCell>{log.action}</TableCell>
         <TableCell>{log.resource}</TableCell>
      </TableRow>
   );
}
