import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { isoDateToString } from "utils/dateHandler";

export function MisPntsTable({ pernoites, acDeslocSede, total }) {
   return (
      <div className='overflow-x-auto p-2'>
         <span className='capitalize'>Pernoites</span>
         <Table className='text-center'>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Chegada</TableHeadCell>
                  <TableHeadCell>Saída</TableHeadCell>
                  <TableHeadCell>Cidade</TableHeadCell>
                  <TableHeadCell>UF</TableHeadCell>
                  <TableHeadCell>Valores</TableHeadCell>
                  <TableHeadCell>Acresc Desloc</TableHeadCell>
                  <TableHeadCell>SubTotal</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className='divide-y'>
               {pernoites.map((pnt) => {
                  const ini = isoDateToString(pnt.data_ini);
                  const fim = isoDateToString(pnt.data_fim);

                  const ac_desloc = pnt.acrec_desloc ? 95 : 0;

                  return (
                     <TableRow key={pnt.id}>
                        <TableCell>{ini}</TableCell>
                        <TableCell>{fim}</TableCell>
                        <TableCell>{pnt.cidade.nome}</TableCell>
                        <TableCell>{pnt.cidade.uf}</TableCell>
                        <TableCell>
                           {pnt.custo.vals.map((val, i) => {
                              const qtd = Number(val.qtd).toFixed(1);
                              const valor = Number(val.valor).toLocaleString(
                                 "pt-BR",
                                 {
                                    style: "currency",
                                    currency: "BRL",
                                 }
                              );

                              return (
                                 <div className='text-nowrap' key={i}>
                                    {qtd} x {valor}
                                 </div>
                              );
                           })}
                           {}
                        </TableCell>
                        <TableCell>
                           {Number(ac_desloc).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                           })}
                        </TableCell>
                        <TableCell>
                           {Number(pnt.custo.subtotal).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                           })}
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
         <div className='mt-2 grid grid-cols-2'>
            <div>
               <span className='text-sm capitalize mr-2'>
                  Acréscimo Deslocamento em sede:
               </span>
               <span className='font-semibold'>
                  {acDeslocSede
                     ? Number(95).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                       })
                     : Number(0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                       })}
               </span>
            </div>

            <span className='font-semibold'>
               Total:{" "}
               {Number(total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
               })}
            </span>
         </div>
      </div>
   );
}
