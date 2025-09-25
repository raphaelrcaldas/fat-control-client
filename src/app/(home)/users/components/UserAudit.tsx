import { useUserAudit } from "../hooks/useUserAudit";
import { Spinner } from "flowbite-react";

export function UserAudit({ userId }: { userId?: number }) {
   const { logs, loading, error } = useUserAudit(userId);

   if (!userId) return null;
   if (loading)
      return (
         <div className='flex justify-center p-4'>
            <Spinner />
         </div>
      );
   if (error) return <div className='text-red-600 p-4'>{error}</div>;

   return (
      <div className='overflow-x-auto p-2'>
         {!logs.length ? (
            <div className='text-gray-500 p-4'>
               Nenhuma auditoria encontrada.
            </div>
         ) : (
            <table className='min-w-full text-sm text-left'>
               <thead className='bg-gray-100'>
                  <tr>
                     <th className='px-2 py-1'>Data/Hora</th>
                     <th className='px-2 py-1'>Usuário</th>
                     <th className='px-2 py-1'>Ação</th>
                     <th className='px-2 py-1'>Antes</th>
                     <th className='px-2 py-1'>Depois</th>
                  </tr>
               </thead>
               <tbody>
                  {logs.map((log) => (
                     <tr key={log.id} className='border-b'>
                        <td className='px-2 py-1 whitespace-nowrap'>
                           {new Date(log.timestamp+"Z").toLocaleString()}
                        </td>
                        <td className='px-2 py-1 uppercase'>
                           {log.user.p_g} {log.user.nome_guerra}
                        </td>
                        <td className='px-2 py-1'>{log.action}</td>
                        <td className='px-2 py-1 text-xs text-gray-600 max-w-xs break-all'>
                           {log.before}
                        </td>
                        <td className='px-2 py-1 text-xs text-gray-600 max-w-xs break-all'>
                           {log.after}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </div>
   );
}
