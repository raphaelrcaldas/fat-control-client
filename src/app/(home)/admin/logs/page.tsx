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
   TextInput,
   Select,
   Badge,
} from "flowbite-react";
import { HiSearch, HiRefresh, HiFilter, HiClipboardList } from "react-icons/hi";
import clsx from "clsx";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function LogDashboard() {
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [filteredLogs, setFilteredLogs] = useState<UserActionLog[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [searchTerm, setSearchTerm] = useState<string>("");
   const [actionFilter, setActionFilter] = useState<string>("login");
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

   const fetchLogs = async () => {
      const filters = { action: actionFilter };
      setLoading(true);
      try {
         const data = await getUserActionLogs(filters);
         setLogs(data);
         setFilteredLogs(data);
         setLastUpdate(new Date());
      } catch (err: any) {
         console.error("Erro ao buscar logs:", err);
      } finally {
         setLoading(false);
      }
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
      <div className="grid gap-4 p-2">
         {/* Header com título e estatísticas */}
         <div className="rounded-lg bg-white px-5 py-4 shadow-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
               <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Logs</h2>
                  <p className="mt-1 text-sm text-gray-500">
                     Última atualização:{" "}
                     {lastUpdate.toLocaleTimeString("pt-BR")}
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <Badge color="red" size="lg">
                     {filteredLogs.length}{" "}
                     {filteredLogs.length === 1 ? "registro" : "registros"}
                  </Badge>
                  <button
                     onClick={fetchLogs}
                     disabled={loading}
                     className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
                  >
                     <HiRefresh className={loading ? "animate-spin" : ""} />
                     Atualizar
                  </button>
               </div>
            </div>
         </div>

         {/* Filtros */}
         <div className="rounded-lg bg-white p-4 shadow-md">
            <div className="mb-3 flex items-center gap-2">
               <HiFilter className="text-gray-600" />
               <h3 className="font-medium text-gray-700">Filtros</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
               <TextInput
                  icon={HiSearch}
                  placeholder="Buscar por usuário, data ou ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Select
                  value={actionFilter}
                  disabled
                  onChange={(e) => setActionFilter(e.target.value)}
               >
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="create">Criar</option>
                  <option value="update">Atualizar</option>
                  <option value="delete">Deletar</option>
                  <option value="">Todas as ações</option>
               </Select>
            </div>
         </div>

         {/* Tabela */}
         <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Data/Hora</TableHeadCell>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell className="hidden md:table-cell">
                        Ação
                     </TableHeadCell>
                     <TableHeadCell>Origem</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {loading ? (
                     <TableRow className="bg-white">
                        <TableCell colSpan={4} className="p-4">
                           <TableSkeleton rows={8} cols={4} />
                        </TableCell>
                     </TableRow>
                  ) : filteredLogs.length === 0 ? (
                     <TableRow className="bg-white">
                        <TableCell colSpan={4} className="py-12">
                           <EmptyState
                              icon={HiClipboardList}
                              title={
                                 searchTerm
                                    ? "Nenhum log encontrado para essa busca"
                                    : "Nenhum log encontrado"
                              }
                              action={
                                 searchTerm ? (
                                    <button
                                       onClick={() => setSearchTerm("")}
                                       className="text-sm text-blue-600 hover:underline"
                                    >
                                       Limpar filtros
                                    </button>
                                 ) : undefined
                              }
                           />
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
         <Badge color={colors[action] || "gray"} className="w-fit capitalize">
            {action}
         </Badge>
      );
   };

   return (
      <TableRow className="bg-white transition-colors hover:bg-gray-50">
         <TableCell className="font-mono text-sm">{timestamp}</TableCell>
         <TableCell>
            <span className="font-medium uppercase">
               {log.user.p_g} {log.user.nome_guerra}
            </span>
         </TableCell>
         <TableCell className="hidden md:table-cell">
            {getActionBadge(log.action)}
         </TableCell>
         <TableCell>
            <span
               className={clsx(
                  "rounded border p-1 text-xs font-medium text-gray-600 shadow",
                  {
                     "border-red-400 bg-red-200":
                        afterParse.client == "fatbird",
                     "border-blue-400 bg-blue-200":
                        afterParse.client == "fatcontrol",
                  }
               )}
            >
               {afterParse.client}
            </span>
         </TableCell>
      </TableRow>
   );
}
