"use client";

import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { gerarRelatorio } from "utils/relatorioComiss";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { LiaFileExportSolid } from "react-icons/lia";

export function DetailComiss({
   show,
   setShow,
   comiss,
}: {
   show: boolean;
   setShow: (show: boolean) => void;
   comiss: ComissWithMiss;
}) {
   const data_abertura = isoStrToDate(comiss.data_ab).toLocaleDateString(
      "pt-br",
      {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      }
   );
   const data_fechamento = isoStrToDate(comiss.data_fc).toLocaleDateString(
      "pt-br",
      {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      }
   );

   const ajd_ab = comiss.valor_aj_ab;
   const ajd_fc = comiss.valor_aj_fc;

   async function handleExport() {
      const blob = await gerarRelatorio(comiss);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const userName = `${comiss.user.posto.short}_${comiss.user.nome_guerra}`;
      a.download = `comissionamento_${userName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
   }

   return (
      <>
         <Modal show={show} size='6xl' onClose={() => setShow(false)}>
            <ModalHeader>Detalhes Comissionamento</ModalHeader>
            <ModalBody>
               <h3 className='text-center uppercase text-lg'>
                  {comiss.user.posto.mid} {comiss.user.esp}{" "}
                  {comiss.user.nome_completo}
               </h3>
               <div className='grid grid-cols-3 mt-4 text-center'>
                  <div className='grid'>
                     <span className='text-lg uppercase'>
                        {comiss.doc_prop}
                     </span>
                     <span className='text-slate-500'>Proposta</span>
                  </div>
                  <div className='grid'>
                     <span className='text-lg uppercase'>{comiss.doc_aut}</span>
                     <span className='text-slate-500'>Autorização</span>
                  </div>
                  <div className='grid'>
                     <span className='text-lg uppercase'>
                        {comiss.doc_enc || "ND"}
                     </span>
                     <span className='text-slate-500'>Encerramento</span>
                  </div>
               </div>
               <div className='grid grid-cols-2 mt-4 gap-6'>
                  <div className='bg-green-100 text-center p-2 rounded-lg'>
                     <h3>Abertura</h3>
                     <div className='grid grid-cols-3 mt-2'>
                        <div className='grid'>
                           <span className='text-base'>{data_abertura}</span>
                           <span className='text-slate-500'>Data</span>
                        </div>
                        <div className='grid'>
                           <span className='text-base'>
                              {Number(comiss.qtd_aj_ab).toFixed(1)}
                           </span>
                           <span className='text-slate-500'>
                              Ajuda de Custo
                           </span>
                        </div>
                        <div className='grid'>
                           <span className='text-base'>
                              {realCurrency(comiss.valor_aj_ab)}
                           </span>
                           <span className='text-slate-500'>Valor</span>
                        </div>
                     </div>
                  </div>
                  <div className='bg-orange-100 text-center p-2 rounded-lg'>
                     <h3>Fechamento</h3>
                     <div className='grid grid-cols-3 mt-2'>
                        <div className='grid'>
                           <span className='text-base'>{data_fechamento}</span>
                           <span className='text-slate-500'>Data Prevista</span>
                        </div>
                        <div className='grid'>
                           <span className='text-base'>
                              {Number(comiss.qtd_aj_fc).toFixed(1)}
                           </span>
                           <span className='text-slate-500'>
                              Ajuda de Custo
                           </span>
                        </div>
                        <div className='grid'>
                           <span className='text-base'>
                              {realCurrency(comiss.valor_aj_fc)}
                           </span>
                           <span className='text-slate-500'>Valor</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className='grid grid-cols-3 m-2 gap-6'>
                  <div className='text-center flex p-2 gap-2 justify-center items-center'>
                     <span>Status:</span>
                     <span className='text-lg uppercase'>{comiss.status}</span>
                  </div>
                  <div className='text-center flex p-2 gap-2 justify-center items-center'>
                     <span>Módulo:</span>
                     <span className='text-lg uppercase'>
                        {comiss.modulo ? "Sim" : "Não"}
                     </span>
                  </div>
                  <div className='text-center flex p-2 gap-2 justify-center items-center'>
                     <span>Dependente:</span>
                     <span className='text-lg uppercase'>
                        {comiss.dep ? "Sim" : "Não"}
                     </span>
                  </div>
               </div>
               <div className='grid grid-cols-3'>
                  <div className='grid text-center'>
                     <div className='text-lg'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_cumprir}
                              <span className='text-sm capitalize'> dias</span>
                           </span>
                        ) : (
                           realCurrency(ajd_ab + ajd_fc)
                        )}
                     </div>
                     <div className='text-slate-500'>Previsto</div>
                  </div>
                  <div className='grid text-center'>
                     <div className='text-lg'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_comp}
                              <span className='text-sm capitalize'> dias</span>
                           </span>
                        ) : (
                           realCurrency(comiss.vals_comp)
                        )}
                     </div>
                     <div className='text-slate-500'>Computado</div>
                  </div>
                  <div className='grid text-center'>
                     <div className='text-lg'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_cumprir - comiss.dias_comp}
                              <span className='text-sm capitalize'> dias</span>
                           </span>
                        ) : (
                           realCurrency(ajd_ab + ajd_fc - comiss.vals_comp)
                        )}
                     </div>
                     <div className='text-slate-500'>Restante</div>
                  </div>
               </div>

               <div className='p-2 grid border rounded-lg gap-1 mt-4'>
                  {comiss.missoes.length > 0
                     ? comiss.missoes.map((m) => {
                          return (
                             <MissionRow
                                key={m.id}
                                mis={m}
                                diasPrev={comiss.dias_cumprir}
                             />
                          );
                       })
                     : "Nenhuma missão adicionada"}
               </div>
            </ModalBody>
            <ModalFooter className='grid justify-center'>
               <Button
                  color='light'
                  onClick={handleExport}
                  disabled={comiss.missoes.length == 0}
               >
                  <div className='flex flex-row gap-2'>
                     <LiaFileExportSolid className='size-5' /> Exportar
                  </div>
               </Button>
            </ModalFooter>
         </Modal>
      </>
   );
}

function MissionRow({ mis, diasPrev }) {
   const ini = new Date(mis.afast).toLocaleDateString("pt-BR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
   });
   const fim = new Date(mis.regres).toLocaleDateString("pt-BR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
   });

   return (
      <div className='flex flex-row text-center text-base hover:bg-slate-100 font-mono uppercase gap-1 p-2 items-center rounded-md border-b last:border-none'>
         <span className='w-8'>{mis.tipo_doc}</span>
         <span className='w-10'>{String(mis.n_doc).padStart(3, "0")}</span>
         <span className='flex-1'>{mis.desc}</span>
         <div className='flex flex-row gap-3 w-44 justify-center'>
            <span>{ini}</span>
            <span>{fim}</span>
         </div>
         <div className='grid gap-1 w-56'>
            {mis.pernoites.map((p) => {
               return (
                  <span
                     key={p.id}
                     className='bg-slate-200 py-0.5 px-1 rounded-lg'
                  >
                     {p.cidade.nome}-{p.cidade.uf}
                  </span>
               );
            })}
         </div>
         <span className='w-32'>
            {diasPrev
               ? `${mis.dias} dia${mis.dias > 1 ? "s" : ""}`
               : realCurrency(mis.valor_total)}
         </span>
      </div>
   );
}
