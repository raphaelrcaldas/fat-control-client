import { useUserAudit } from "../hooks/useUserAudit";
import { Badge } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { HiClock, HiUser, HiPencil, HiDocumentText } from "react-icons/hi";

export function UserAudit({ userId }: { userId?: number }) {
   const { logs, loading, error } = useUserAudit(userId);

   if (!userId) return null;
   if (loading)
      return (
         <div className="flex flex-col items-center justify-center p-8">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Carregando histórico...</p>
         </div>
      );
   if (error)
      return (
         <div className="flex flex-col items-center justify-center p-8">
            <div className="mb-4 rounded-full bg-red-50 p-4">
               <HiDocumentText className="h-12 w-12 text-red-400" />
            </div>
            <p className="font-medium text-red-600">{error}</p>
         </div>
      );

   return (
      <div className="p-2">
         {!logs.length ? (
            <div className="flex flex-col items-center justify-center p-12">
               <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <HiClock className="h-12 w-12 text-gray-400" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Nenhum histórico encontrado
               </h3>
               <p className="text-center text-gray-500">
                  Ainda não há registro de alterações para este usuário.
               </p>
            </div>
         ) : (
            <div className="space-y-4">
               {/* Timeline style */}
               {logs.map((log, index) => (
                  <div
                     key={log.id}
                     className="relative border-l-2 border-gray-200 pb-4 pl-8 last:border-l-0"
                  >
                     {/* Timeline dot */}
                     <div className="absolute top-0 -left-2 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white"></div>

                     {/* Card */}
                     <div className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                        <div className="mb-3 flex items-start justify-between">
                           <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-blue-100 p-2">
                                 <HiPencil className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <Badge
                                       color="info"
                                       size="sm"
                                       className="uppercase"
                                    >
                                       {log.action}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                       por
                                    </span>
                                    <span className="text-sm font-semibold text-gray-700 uppercase">
                                       {log.user.p_g} {log.user.nome_guerra}
                                    </span>
                                 </div>
                                 <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                    <HiClock className="h-3.5 w-3.5" />
                                    <time>
                                       {new Date(
                                          log.timestamp + "Z"
                                       ).toLocaleString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                       })}
                                    </time>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Diff view */}
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                           <div>
                              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                                 Antes
                              </p>
                              <div className="rounded-md border border-red-200 bg-red-50 p-2">
                                 <pre className="font-mono text-xs break-all whitespace-pre-wrap text-red-700">
                                    {log.before || "—"}
                                 </pre>
                              </div>
                           </div>
                           <div>
                              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                                 Depois
                              </p>
                              <div className="rounded-md border border-green-200 bg-green-50 p-2">
                                 <pre className="font-mono text-xs break-all whitespace-pre-wrap text-green-700">
                                    {log.after || "—"}
                                 </pre>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
