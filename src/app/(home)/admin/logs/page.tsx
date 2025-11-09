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
   TextInput,
   Select,
   Badge,
} from "flowbite-react";
import { HiSearch, HiRefresh, HiFilter } from "react-icons/hi";

export default function LogDashboard() {
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [filteredLogs, setFilteredLogs] = useState<UserActionLog[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [searchTerm, setSearchTerm] = useState<string>("");
   const [actionFilter, setActionFilter] = useState<string>("login");
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

   const fetchLogs = () => {
      const filters = { action: actionFilter };
      setLoading(true);
      getUserActionLogs(filters)
         .then((data) => {
            setLogs(data);
            setFilteredLogs(data);
            setLastUpdate(new Date());
         })
         .catch(console.error)
         .finally(() => setLoading(false));
   };

   useEffect(() => {
      fetchLogs();
   }, [actionFilter]);

   useEffect(() => {
      const filtered = logs.filter((log) => {
         const searchLower = searchTerm.toLowerCase();
         const userName =
            `${log.user.p_g} ${log.user.nome_guerra}`.toLowerCase();
         const timestamp = new Date(log.timestamp + "Z").toLocaleDateString(
            "pt-BR"
         );

         return (
            userName.includes(searchLower) ||
            timestamp.includes(searchLower) ||
            log.action.toLowerCase().includes(searchLower)
         );
      });
      setFilteredLogs(filtered);
   }, [searchTerm, logs]);

   return (
      <div className='grid gap-4 p-2'>
         {/* Header com título e estatísticas */}
         <div className='bg-white py-4 px-5 rounded-lg shadow-md'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
               <div>
                  <h2 className='font-semibold text-2xl text-gray-800'>
                     Logs de Ações
                  </h2>
                  <p className='text-sm text-gray-500 mt-1'>
                     Última atualização:{" "}
                     {lastUpdate.toLocaleTimeString("pt-BR")}
                  </p>
               </div>
               <div className='flex items-center gap-3'>
                  <Badge color='info' size='lg'>
                     {filteredLogs.length}{" "}
                     {filteredLogs.length === 1 ? "registro" : "registros"}
                  </Badge>
                  <button
                     onClick={fetchLogs}
                     disabled={loading}
                     className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors'
                  >
                     <HiRefresh className={loading ? "animate-spin" : ""} />
                     Atualizar
                  </button>
               </div>
            </div>
         </div>

         {/* Filtros */}
         <div className='bg-white p-4 rounded-lg shadow-md'>
            <div className='flex items-center gap-2 mb-3'>
               <HiFilter className='text-gray-600' />
               <h3 className='font-medium text-gray-700'>Filtros</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
               <TextInput
                  icon={HiSearch}
                  placeholder='Buscar por usuário, data ou ação...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Select
                  value={actionFilter}
                  disabled
                  onChange={(e) => setActionFilter(e.target.value)}
               >
                  <option value='login'>Login</option>
                  <option value='logout'>Logout</option>
                  <option value='create'>Criar</option>
                  <option value='update'>Atualizar</option>
                  <option value='delete'>Deletar</option>
                  <option value=''>Todas as ações</option>
               </Select>
            </div>
         </div>

         {/* Tabela */}
         <div className='bg-white rounded-lg shadow-md overflow-hidden'>
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Data/Hora</TableHeadCell>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell className='hidden md:table-cell'>
                        Ação
                     </TableHeadCell>
                     <TableHeadCell>Origem</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className='divide-y'>
                  {loading ? (
                     <TableRow className='bg-white'>
                        <TableCell colSpan={4} className='py-12 text-center'>
                           <div className='flex flex-col justify-center items-center gap-3'>
                              <Spinner size='xl' aria-label='loading' />
                              <span className='text-base text-gray-600 font-medium'>
                                 Carregando logs...
                              </span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : filteredLogs.length === 0 ? (
                     <TableRow className='bg-white'>
                        <TableCell colSpan={4} className='py-12 text-center'>
                           <div className='flex flex-col items-center gap-2'>
                              <span className='text-gray-400 text-5xl'>📋</span>
                              <p className='text-gray-600 font-medium'>
                                 {searchTerm
                                    ? "Nenhum log encontrado para essa busca"
                                    : "Nenhum log encontrado"}
                              </p>
                              {searchTerm && (
                                 <button
                                    onClick={() => setSearchTerm("")}
                                    className='text-blue-600 hover:underline text-sm'
                                 >
                                    Limpar filtros
                                 </button>
                              )}
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : (
                     filteredLogs.map((log) => (
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

   const afterParse = JSON.parse(log.after);

   const getActionBadge = (action: string) => {
      const colors: Record<string, string> = {
         login: "success",
         logout: "info",
         create: "purple",
         update: "warning",
         delete: "failure",
      };
      return (
         <Badge color={colors[action] || "gray"} className='capitalize w-fit'>
            {action}
         </Badge>
      );
   };

   return (
      <TableRow className='bg-white hover:bg-gray-50 transition-colors'>
         <TableCell className='font-mono text-sm whitespace-nowrap'>
            {timestamp}
         </TableCell>
         <TableCell>
            <span className='font-medium uppercase'>
               {log.user.p_g} {log.user.nome_guerra}
            </span>
         </TableCell>
         <TableCell className='hidden md:table-cell'>
            {getActionBadge(log.action)}
         </TableCell>
         <TableCell>
            <span className='text-gray-600 text-sm'>{afterParse.client}</span>
         </TableCell>
      </TableRow>
   );
}
