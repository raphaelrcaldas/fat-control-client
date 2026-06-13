"use client";

import { useEffect, useState } from "react";
import {
   getUserActionLogs,
   deleteUserActionLog,
   UserActionLog,
} from "services/routes/logs";
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
   Modal,
   ModalBody,
   ModalHeader,
   Button,
} from "flowbite-react";
import {
   HiSearch,
   HiRefresh,
   HiFilter,
   HiClipboardList,
   HiTrash,
} from "react-icons/hi";
import { MdWarning, MdDelete, MdClose } from "react-icons/md";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/app/context/toast";

export default function LogDashboard() {
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [filteredLogs, setFilteredLogs] = useState<UserActionLog[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [searchTerm, setSearchTerm] = useState<string>("");
   const [actionFilter, setActionFilter] = useState<string>("login");
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
   const [logToDelete, setLogToDelete] = useState<UserActionLog | null>(null);
   const [isDeleting, setIsDeleting] = useState<boolean>(false);
   const { push } = useToast();

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

   const handleDelete = async () => {
      if (!logToDelete) return;
      setIsDeleting(true);
      try {
         await deleteUserActionLog(logToDelete.id);
         setLogs((prev) => prev.filter((l) => l.id !== logToDelete.id));
         setFilteredLogs((prev) => prev.filter((l) => l.id !== logToDelete.id));
         setLogToDelete(null);
         push({ type: "success", message: "Log excluído com sucesso." });
      } catch (err: any) {
         console.error("Erro ao excluir log:", err);
         push({
            type: "error",
            message: "Erro ao excluir log. Tente novamente.",
         });
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <div className="grid gap-4 p-2">
         {/* Header com título e estatísticas */}
         <div className="rounded bg-white px-5 py-4 shadow ring-1 ring-gray-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
               <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Logs</h2>
                  <p className="mt-1 text-sm text-gray-500">
                     Última atualização:{" "}
                     {lastUpdate.toLocaleTimeString("pt-BR")}
                  </p>
               </div>
               <div className="flex items-center justify-between gap-3 md:justify-end">
                  <Badge color="red" size="lg">
                     {filteredLogs.length}{" "}
                     {filteredLogs.length === 1 ? "registro" : "registros"}
                  </Badge>
                  <button
                     onClick={fetchLogs}
                     disabled={loading}
                     className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
                  >
                     <HiRefresh className={loading ? "animate-spin" : ""} />
                     Atualizar
                  </button>
               </div>
            </div>
         </div>

         {/* Filtros */}
         <div className="rounded bg-white p-4 shadow-sm ring-1 ring-gray-200">
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
         <div className="overflow-x-auto rounded bg-white shadow-sm ring-1 ring-gray-200">
            <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Data/Hora</TableHeadCell>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell className="hidden md:table-cell">
                        Ação
                     </TableHeadCell>
                     <TableHeadCell>Origem</TableHeadCell>
                     <TableHeadCell>Ações</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {loading ? (
                     Array.from({ length: 8 }).map((_, i) => (
                        <LogRowSkeleton key={i} />
                     ))
                  ) : filteredLogs.length === 0 ? (
                     <TableRow className="bg-white">
                        <TableCell colSpan={5} className="py-12">
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
                        <LogRow
                           key={log.id}
                           log={log}
                           onDeleteClick={setLogToDelete}
                        />
                     ))
                  )}
               </TableBody>
            </Table>
         </div>

         {logToDelete && (
            <DeleteLogModal
               show={true}
               onClose={() => setLogToDelete(null)}
               onConfirm={handleDelete}
               isPending={isDeleting}
               logId={logToDelete.id}
               userName={`${logToDelete.user.p_g} ${logToDelete.user.nome_guerra}`}
               timestamp={new Date(
                  logToDelete.timestamp + "Z"
               ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
               })}
            />
         )}
      </div>
   );
}

function LogRowSkeleton() {
   return (
      <TableRow className="bg-white">
         <TableCell>
            <Skeleton className="h-4 w-32" />
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               <Skeleton className="h-4 w-40" />
               <Skeleton className="h-6 w-16 rounded-full md:hidden" />
            </div>
         </TableCell>
         <TableCell className="hidden md:table-cell">
            <Skeleton className="h-6 w-16 rounded-full" />
         </TableCell>
         <TableCell>
            <Skeleton className="h-6 w-20 rounded" />
         </TableCell>
         <TableCell>
            <Skeleton className="size-7 rounded" />
         </TableCell>
      </TableRow>
   );
}

function LogRow({
   log,
   onDeleteClick,
}: {
   log: UserActionLog;
   onDeleteClick: (log: UserActionLog) => void;
}) {
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
         <TableCell className="font-mono text-sm whitespace-nowrap">
            {timestamp}
         </TableCell>
         <TableCell>
            <div className="flex flex-col gap-1">
               <span className="font-medium uppercase">
                  {log.user.p_g} {log.user.nome_guerra}
               </span>
               {/* Badge de ação inline no mobile (coluna "Ação" oculta) */}
               <span className="md:hidden">{getActionBadge(log.action)}</span>
            </div>
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
         <TableCell>
            <button
               onClick={() => onDeleteClick(log)}
               className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
               title="Excluir log"
               type="button"
            >
               <HiTrash className="size-4" />
            </button>
         </TableCell>
      </TableRow>
   );
}

interface DeleteLogModalProps {
   show: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isPending: boolean;
   logId: number;
   userName: string;
   timestamp: string;
}

function DeleteLogModal({
   show,
   onClose,
   onConfirm,
   isPending,
   logId,
   userName,
   timestamp,
}: DeleteLogModalProps) {
   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible>
         <ModalHeader className="border-b-2 border-red-100 bg-linear-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
               <div className="rounded-full bg-red-500 p-2">
                  <MdWarning className="size-6 text-white" />
               </div>
               <span className="text-xl font-bold text-gray-800">
                  Confirmar Exclusão
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <div className="flex flex-col gap-6">
               <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="font-medium text-gray-800">
                     Tem certeza que deseja excluir este log?
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                     Esta ação não pode ser desfeita. O registro será removido
                     permanentemente.
                  </p>
               </div>

               <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700">
                     Detalhes do Log:
                  </h4>
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">ID:</span>
                        <span className="font-semibold text-gray-800">
                           #{logId}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Usuário:</span>
                        <span className="font-semibold text-gray-800 uppercase">
                           {userName}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                           Data/Hora:
                        </span>
                        <span className="font-mono text-sm font-semibold text-gray-800">
                           {timestamp}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex justify-center gap-3 pt-2">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     type="button"
                     disabled={isPending}
                  >
                     <div className="flex items-center gap-2">
                        <MdClose className="size-5" />
                        <span>Cancelar</span>
                     </div>
                  </Button>

                  <Button
                     color="red"
                     className="w-32"
                     onClick={onConfirm}
                     type="button"
                     disabled={isPending}
                  >
                     <div className="flex items-center gap-2">
                        <MdDelete className="size-5" />
                        <span>{isPending ? "Excluindo..." : "Excluir"}</span>
                     </div>
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
