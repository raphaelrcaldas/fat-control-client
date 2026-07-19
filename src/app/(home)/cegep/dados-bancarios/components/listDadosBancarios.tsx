import { useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { DadosBancariosWithUser } from "services/routes/cegep/dadosBancarios";
import { formatDateFull, formatMesAno } from "@/../utils/dateHandler";
import { realCurrency } from "@/../utils/financeiro";
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
         <div
            role="region"
            aria-label="Tabela de dados bancários"
            tabIndex={0}
            className="overflow-x-auto rounded border border-slate-200 shadow-sm"
         >
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Militar</TableHeadCell>
                     <TableHeadCell>Nome Completo</TableHeadCell>
                     <TableHeadCell>Banco</TableHeadCell>
                     <TableHeadCell>Agência</TableHeadCell>
                     <TableHeadCell>Conta</TableHeadCell>
                     <TableHeadCell className="text-center">
                        Remuneração
                     </TableHeadCell>
                     <TableHeadCell className="text-center">
                        Mês/Ano
                     </TableHeadCell>
                     <TableHeadCell className="text-center">
                        Aux. Transp.
                     </TableHeadCell>
                     <TableHeadCell className="text-center">
                        Atualizado em
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {dados.map((dado) => (
                     <TableRow
                        key={dado.id}
                        onClick={() => handleRowClick(dado)}
                        className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                     >
                        <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                           {dado.user.posto.short} {dado.user.nome_guerra}
                        </TableCell>
                        <TableCell className="text-gray-700 uppercase dark:text-gray-300">
                           {dado.user.nome_completo}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                           {dado.banco}{" "}
                           <span className="text-gray-500 dark:text-gray-400">
                              ({dado.codigo_banco})
                           </span>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                           {dado.agencia}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                           {dado.conta}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-900 tabular-nums dark:text-white">
                           {dado.remuneracao != null
                              ? realCurrency(dado.remuneracao)
                              : "—"}
                        </TableCell>
                        <TableCell className="text-center text-gray-700 dark:text-gray-300">
                           {dado.mes_ano ? formatMesAno(dado.mes_ano) : "—"}
                        </TableCell>
                        <TableCell className="text-center text-gray-700 tabular-nums dark:text-gray-300">
                           {dado.aux_transp != null
                              ? realCurrency(dado.aux_transp)
                              : "—"}
                        </TableCell>
                        <TableCell className="text-center text-slate-500 tabular-nums dark:text-gray-400">
                           {dado.updated_at
                              ? formatDateFull(dado.updated_at)
                              : "—"}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
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
