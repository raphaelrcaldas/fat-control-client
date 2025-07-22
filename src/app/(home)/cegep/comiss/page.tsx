"use client";
import { Progress } from "flowbite-react";


export default function HomeApp() {
   return (
      <div className='shadow-lg'>
         <div className='relative overflow-x-auto'>
            <table className='w-full text-sm text-center text-gray-500'>
               <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
                  <tr>
                     <th scope="col" className="px-6 py-3">
                        P/G
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Nome de Guerra
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Início
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Fim
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Status
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Tipo
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Previsto
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Cumprido
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Progresso
                     </th>
                     <th scope='col' className='px-6 py-3'>
                        Action
                     </th>
                  </tr>
               </thead>
               <tbody>
                  <tr className='bg-white border-b hover:bg-slate-100 border-gray-200'>
                     <th
                        scope='row'
                        className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'
                     >
                        2S
                     </th>
                     <td className='px-6 py-4'>RAPHAEL CALDAS</td>
                     <td className='px-6 py-4'>Fev/25</td>
                     <td className='px-6 py-4'>Fev/26</td>
                     <td className='px-6 py-4'>Ativo</td>
                     <td className='px-6 py-4'>Dias</td>
                     <td className='px-6 py-4'>58 dias</td>
                     <td className='px-6 py-4'>27 dias</td>
                     <td className='px-6 py-4'>
                        <Progress
                           progress={89}
                           progressLabelPosition='inside'
                           size='lg'
                        //    theme={themeBar}
                           labelProgress
                           //    labelText
                        />
                     </td>
                     <td className='px-6 py-4'>
                        <button>Teste</button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
   );
}
