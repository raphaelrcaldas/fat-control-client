"use client";

import { useEffect, useState } from "react";
import { getUserActionLogs } from "services/routes/logs";
import { UserActionLog } from "services/routes/logs";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableCell,
   TableBody,
   TableRow,
   Label,
} from "flowbite-react";

export default function LogDashboard() {
   const hoje = new Date().toISOString().split("T")[0];
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [dataInicio, setDataInicio] = useState(hoje);
   const [dataFim, setDataFim] = useState(hoje);

   const recursos = ["auth"];
   const acoes = ["login"];

   useEffect(() => {
      const filters = { start: dataInicio, end: dataFim };
      getUserActionLogs(filters).then(setLogs).catch(console.error);
   }, [dataInicio, dataFim]);

   return (
      <div className='bg-white p-2 rounded-lg'>
         <h2>Logs</h2>
         <div className='p-2 flex flex-row gap-4 w-full justify-center'>
            <div className='flex flex-row gap-2 items-center'>
               <Label>Início</Label>
               <input
                  type='date'
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className='block text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
               />
            </div>
            <div className='flex flex-row gap-2 items-center'>
               <Label>Fim</Label>
               <input
                  type='date'
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className='block text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
               />
            </div>
         </div>
         <div className='mt-2'>
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
