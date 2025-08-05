"use client";

import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss } from "services/routes/cegep/comiss";

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

   return (
      <>
         <Modal show={show} size='5xl' onClose={() => setShow(false)}>
            <ModalHeader>Detalhes Comissionamento</ModalHeader>
            <ModalBody>
               <h3 className='text-center capitalize text-lg'>
                  {comiss.user.posto.mid} {comiss.user.nome_completo}
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
                     <span className='text-lg uppercase'>{comiss.doc_enc}</span>
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

               <div className='p-2 grid border rounded-lg gap-1 mt-2'>
                  {comiss.missoes.map((m) => {
                     return (
                        <MissionRow
                           key={m.id}
                           mis={m}
                           diasPrev={comiss.dias_cumprir}
                        />
                     );
                  })}
               </div>
            </ModalBody>
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
      <div className='flex flex-row text-center text-base hover:bg-slate-100 font-mono uppercase gap-3 p-2 items-center rounded-md border-b last:border-none'>
         <span className='w-8'>{mis.tipo_doc}</span>
         <span className='w-10'>{mis.n_doc}</span>
         <span className='w-10'>{mis.tipo}</span>
         <span className='flex-1'>{mis.desc}</span>
         <span className='w-24'>{ini}</span>
         <span className='w-24'>{fim}</span>
         <div className='grid gap-1 w-40'>
            {mis.pernoites.map((p) => {
               return (
                  <span
                     key={p.id}
                     className='bg-slate-200 py-0.5 px-2 rounded-lg'
                  >
                     {p.cidade.nome}-{p.cidade.uf}
                  </span>
               );
            })}
         </div>
         <span className='w-36'>
            {diasPrev ? `${mis.dias} dias` : realCurrency(mis.valor_total)}
         </span>
      </div>
   );
}
