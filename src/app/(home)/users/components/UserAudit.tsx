import { useUserAudit } from "../hooks/useUserAudit";
import { Spinner, Badge } from "flowbite-react";
import { HiClock, HiUser, HiPencil, HiDocumentText } from "react-icons/hi";

export function UserAudit({ userId }: { userId?: number }) {
   const { logs, loading, error } = useUserAudit(userId);

   if (!userId) return null;
   if (loading)
      return (
         <div className='flex flex-col justify-center items-center p-8'>
            <Spinner size='xl' />
            <p className='mt-4 text-gray-500'>Carregando histórico...</p>
         </div>
      );
   if (error)
      return (
         <div className='flex flex-col items-center justify-center p-8'>
            <div className='p-4 bg-red-50 rounded-full mb-4'>
               <HiDocumentText className='w-12 h-12 text-red-400' />
            </div>
            <p className='text-red-600 font-medium'>{error}</p>
         </div>
      );

   return (
      <div className='p-2'>
         {!logs.length ? (
            <div className='flex flex-col items-center justify-center p-12'>
               <div className='p-4 bg-gray-100 rounded-full mb-4'>
                  <HiClock className='w-12 h-12 text-gray-400' />
               </div>
               <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Nenhum histórico encontrado
               </h3>
               <p className='text-gray-500 text-center'>
                  Ainda não há registro de alterações para este usuário.
               </p>
            </div>
         ) : (
            <div className='space-y-4'>
               {/* Timeline style */}
               {logs.map((log, index) => (
                  <div
                     key={log.id}
                     className='relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0'
                  >
                     {/* Timeline dot */}
                     <div className='absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full ring-4 ring-white'></div>

                     {/* Card */}
                     <div className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors'>
                        <div className='flex items-start justify-between mb-3'>
                           <div className='flex items-center gap-3'>
                              <div className='p-2 bg-blue-100 rounded-lg'>
                                 <HiPencil className='w-4 h-4 text-blue-600' />
                              </div>
                              <div>
                                 <div className='flex items-center gap-2'>
                                    <Badge color='info' size='sm' className='uppercase'>
                                       {log.action}
                                    </Badge>
                                    <span className='text-xs text-gray-500'>por</span>
                                    <span className='text-sm font-semibold text-gray-700 uppercase'>
                                       {log.user.p_g} {log.user.nome_guerra}
                                    </span>
                                 </div>
                                 <div className='flex items-center gap-1.5 mt-1 text-xs text-gray-500'>
                                    <HiClock className='w-3.5 h-3.5' />
                                    <time>
                                       {new Date(log.timestamp+"Z").toLocaleString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                       })}
                                    </time>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Diff view */}
                        <div className='grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200'>
                           <div>
                              <p className='text-xs font-semibold text-gray-500 mb-2 uppercase'>Antes</p>
                              <div className='bg-red-50 border border-red-200 rounded-md p-2'>
                                 <pre className='text-xs text-red-700 whitespace-pre-wrap break-all font-mono'>
                                    {log.before || '—'}
                                 </pre>
                              </div>
                           </div>
                           <div>
                              <p className='text-xs font-semibold text-gray-500 mb-2 uppercase'>Depois</p>
                              <div className='bg-green-50 border border-green-200 rounded-md p-2'>
                                 <pre className='text-xs text-green-700 whitespace-pre-wrap break-all font-mono'>
                                    {log.after || '—'}
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
