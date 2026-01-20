import { useState } from "react";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import DetailDadosBancarios from "./detailDadosBancarios";

interface ListDadosBancariosProps {
   dados: DadosBancariosWithUser[];
}

export default function ListDadosBancarios({ dados }: ListDadosBancariosProps) {
   const [selectedDados, setSelectedDados] =
      useState<DadosBancariosWithUser | null>(null);
   const [showDetail, setShowDetail] = useState(false);

   const handleRowClick = (dado: DadosBancariosWithUser) => {
      setSelectedDados(dado);
      setShowDetail(true);
   };

   const handleClose = () => {
      setShowDetail(false);
      setSelectedDados(null);
   };

   return (
      <>
         <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                     <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Militar
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Nome Completo
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Banco
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Agência
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Conta
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Atualizado em
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {dados.map((dado) => (
                        <tr
                           key={dado.id}
                           onClick={() => handleRowClick(dado)}
                           className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                           <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                              {dado.user.posto.short} {dado.user.nome_guerra}
                           </td>
                           <td className="px-4 py-3 text-gray-700 uppercase dark:text-gray-300">
                              {dado.user.nome_completo}
                           </td>
                           <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {dado.banco}{" "}
                              <span className="text-gray-500 dark:text-gray-400">
                                 ({dado.codigo_banco})
                              </span>
                           </td>
                           <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {dado.agencia}
                           </td>
                           <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {dado.conta}
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(dado.updated_at).toLocaleDateString(
                                 "pt-BR"
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {showDetail && selectedDados && (
            <DetailDadosBancarios
               show={showDetail}
               onClose={handleClose}
               dados={selectedDados}
            />
         )}
      </>
   );
}
