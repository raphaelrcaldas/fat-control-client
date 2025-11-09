"use client";

import { useState } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Popover,
} from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { gerarRelatorio } from "utils/relatorioComiss";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { LiaFileExportSolid } from "react-icons/lia";
import { MisPntsTable } from "../../components/popMisPnts";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { FormComiss } from "./formComiss";
import { RoleBasedRoute } from "@/app/(home)/hooks/useRoleBased";
import { deleteCmto } from "services/routes/cegep/comiss";
import { useToast } from "@/app/context/toast";

export function DetailComiss({
   show,
   setShow,
   comiss,
   update,
}: {
   show: boolean;
   setShow: (show: boolean) => void;
   comiss: ComissWithMiss;
   update?: () => void;
}) {
   const [showEditForm, setShowEditForm] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const { push } = useToast();

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

   const handleFormSuccess = () => {
      if (update) update();
      setShowEditForm(false);
   };

   const handleCloseEdit = (value: boolean) => {
      setShowEditForm(value);
      // Se fechou o form e não tem update (não salvou), mantém o detail aberto
   };

   const handleDelete = async () => {
      const userName = `${comiss.user.posto.mid} ${comiss.user.nome_guerra}`;
      const confirmed = window.confirm(
         `Tem certeza que deseja excluir o comissionamento de ${userName}?\n\nEsta ação não pode ser desfeita.`
      );

      if (!confirmed) return;

      setIsDeleting(true);
      try {
         const response = await deleteCmto(comiss.id);

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
               errorData.detail || "Erro ao excluir comissionamento"
            );
         }

         const data = await response.json();
         push({
            message: data.detail || "Comissionamento excluído com sucesso",
            type: "success",
         });

         setShow(false);
         if (update) update();
      } catch (error) {
         console.error("Erro ao excluir comissionamento:", error);
         push({
            title: "Erro",
            message:
               error.message || "Erro inesperado ao excluir. Tente novamente.",
            type: "error",
         });
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <>
         <Modal
            show={show && !showEditForm}
            size='6xl'
            onClose={() => setShow(false)}
         >
            <ModalHeader className='border-b border-gray-200'>
               Detalhes do Comissionamento
            </ModalHeader>
            <ModalBody className='space-y-6'>
               {/* Botão Exportar */}
               <div className='flex justify-end -mt-2'>
                  <Button
                     color='light'
                     onClick={handleExport}
                     disabled={comiss.missoes.length == 0 || isDeleting}
                     className='transition-all duration-200 hover:shadow-md'
                  >
                     <div className='flex items-center gap-2'>
                        <LiaFileExportSolid className='size-5' />
                        <span>Exportar</span>
                     </div>
                  </Button>
               </div>
               {/* Informações do Militar */}
               <div className='text-center space-y-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
                  <h3 className='text-lg font-bold text-gray-900 uppercase tracking-wide'>
                     {comiss.user.posto.mid} {comiss.user.esp}{" "}
                     {comiss.user.nome_guerra}
                  </h3>
                  <p className='text-sm text-gray-600 capitalize'>
                     {comiss.user.nome_completo}
                  </p>
               </div>

               {/* Documentos */}
               <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center p-4 bg-gray-50 rounded-xl border border-gray-200'>
                     <span className='text-base font-semibold text-gray-900 uppercase block'>
                        {comiss.doc_prop}
                     </span>
                     <span className='text-xs text-gray-500 uppercase tracking-wide'>
                        Proposta
                     </span>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-xl border border-gray-200'>
                     <span className='text-base font-semibold text-gray-900 uppercase block'>
                        {comiss.doc_aut}
                     </span>
                     <span className='text-xs text-gray-500 uppercase tracking-wide'>
                        Autorização
                     </span>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-xl border border-gray-200'>
                     <span className='text-base font-semibold text-gray-900 uppercase block'>
                        {comiss.doc_enc || "ND"}
                     </span>
                     <span className='text-xs text-gray-500 uppercase tracking-wide'>
                        Encerramento
                     </span>
                  </div>
               </div>

               {/* Datas e Valores */}
               <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Abertura */}
                  <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border border-emerald-200 shadow-sm'>
                     <h4 className='text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2'>
                        <div className='w-2 h-2 bg-emerald-500 rounded-full' />
                        Abertura
                     </h4>
                     <div className='grid grid-cols-3 gap-4'>
                        <div className='text-center'>
                           <span className='text-base font-semibold text-gray-900 block'>
                              {data_abertura}
                           </span>
                           <span className='text-xs text-gray-500'>Data</span>
                        </div>
                        <div className='text-center'>
                           <span className='text-base font-semibold text-gray-900 block'>
                              {Number(comiss.qtd_aj_ab).toFixed(1)}
                           </span>
                           <span className='text-xs text-gray-500'>
                              Ajuda de Custo
                           </span>
                        </div>
                        <div className='text-center'>
                           <span className='text-base font-semibold text-gray-900 block'>
                              {realCurrency(comiss.valor_aj_ab)}
                           </span>
                           <span className='text-xs text-gray-500'>Valor</span>
                        </div>
                     </div>
                  </div>

                  {/* Fechamento */}
                  <div className='bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200 shadow-sm'>
                     <h4 className='text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full' />
                        Fechamento
                     </h4>
                     <div className='grid grid-cols-3 gap-4'>
                        <div className='text-center'>
                           <span className='text-base font-semibold text-gray-900 block'>
                              {data_fechamento}
                           </span>
                           <span className='text-xs text-gray-500'>
                              Data Prevista
                           </span>
                        </div>
                        <div className='text-center'>
                           <span className='text-base font-semibold text-gray-900 block'>
                              {Number(comiss.qtd_aj_fc).toFixed(1)}
                           </span>
                           <span className='text-xs text-gray-500'>
                              Ajuda de Custo
                           </span>
                        </div>
                        <div className='text-center'>
                           <span className='text-base font-semibold text-gray-900 block'>
                              {realCurrency(comiss.valor_aj_fc)}
                           </span>
                           <span className='text-xs text-gray-500'>Valor</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Status e Informações */}
               <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                     <span className='text-sm text-gray-600'>Status:</span>
                     <span className='text-sm font-semibold text-gray-900 uppercase'>
                        {comiss.status}
                     </span>
                  </div>
                  <div className='flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                     <span className='text-sm text-gray-600'>Módulo:</span>
                     <span className='text-sm font-semibold text-gray-900 uppercase'>
                        {comiss.modulo ? "Sim" : "Não"}
                     </span>
                  </div>
                  <div className='flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                     <span className='text-sm text-gray-600'>Dependente:</span>
                     <span className='text-sm font-semibold text-gray-900 uppercase'>
                        {comiss.dep ? "Sim" : "Não"}
                     </span>
                  </div>
               </div>

               {/* Métricas */}
               <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200'>
                  <div className='text-center'>
                     <div className='text-xl font-bold text-gray-900'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_cumprir}
                              <span className='text-sm font-normal text-gray-500 ml-1'>
                                 dias
                              </span>
                           </span>
                        ) : (
                           realCurrency(ajd_ab + ajd_fc)
                        )}
                     </div>
                     <div className='text-xs text-gray-500 uppercase tracking-wide mt-1'>
                        Previsto
                     </div>
                  </div>
                  <div className='text-center'>
                     <div className='text-xl font-bold text-gray-900'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_comp}
                              <span className='text-sm font-normal text-gray-500 ml-1'>
                                 dias
                              </span>
                           </span>
                        ) : (
                           realCurrency(comiss.vals_comp)
                        )}
                     </div>
                     <div className='text-xs text-gray-500 uppercase tracking-wide mt-1'>
                        Computado
                     </div>
                  </div>
                  <div className='text-center'>
                     <div className='text-xl font-bold text-gray-900'>
                        {comiss.dias_cumprir ? (
                           <span>
                              {comiss.dias_cumprir - comiss.dias_comp}
                              <span className='text-sm font-normal text-gray-500 ml-1'>
                                 dias
                              </span>
                           </span>
                        ) : (
                           realCurrency(ajd_ab + ajd_fc - comiss.vals_comp)
                        )}
                     </div>
                     <div className='text-xs text-gray-500 uppercase tracking-wide mt-1'>
                        Restante
                     </div>
                  </div>
               </div>

               {/* Missões */}
               <div className='space-y-3'>
                  <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                     Missões Relacionadas
                  </h4>
                  <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                     {comiss.missoes.length > 0 ? (
                        <div className='divide-y divide-gray-100'>
                           {comiss.missoes.map((m) => (
                              <MissionRow
                                 key={m.id}
                                 mis={m}
                                 diasPrev={comiss.dias_cumprir}
                              />
                           ))}
                        </div>
                     ) : (
                        <div className='p-8 text-center text-sm text-gray-500'>
                           Nenhuma missão adicionada
                        </div>
                     )}
                  </div>
               </div>
            </ModalBody>
            <ModalFooter className='border-t border-gray-200'>
               <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                  <div className='flex justify-center items-center w-full gap-3'>
                     <Button
                        color='blue'
                        onClick={() => setShowEditForm(true)}
                        disabled={isDeleting}
                        className='transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95'
                     >
                        <div className='flex items-center gap-2'>
                           <MdOutlineEdit size={18} />
                           <span>Editar</span>
                        </div>
                     </Button>
                     <Button
                        color='red'
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className='transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95'
                     >
                        <div className='flex items-center gap-2'>
                           {isDeleting ? (
                              <>
                                 <svg
                                    className='animate-spin h-4 w-4'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                 >
                                    <circle
                                       className='opacity-25'
                                       cx='12'
                                       cy='12'
                                       r='10'
                                       stroke='currentColor'
                                       strokeWidth='4'
                                    ></circle>
                                    <path
                                       className='opacity-75'
                                       fill='currentColor'
                                       d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    ></path>
                                 </svg>
                                 <span>Excluindo...</span>
                              </>
                           ) : (
                              <>
                                 <MdDeleteOutline size={18} />
                                 <span>Excluir</span>
                              </>
                           )}
                        </div>
                     </Button>
                  </div>
               </RoleBasedRoute>
            </ModalFooter>
         </Modal>

         {showEditForm && (
            <FormComiss
               show={showEditForm}
               setShow={handleCloseEdit}
               comiss={comiss}
               update={handleFormSuccess}
            />
         )}
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
      <div className='flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors duration-200'>
         <div className='w-20 shrink-0'>
            <span className='text-sm font-semibold text-gray-900 uppercase'>
               {mis.tipo_doc} {String(mis.n_doc).padStart(3, "0")}
            </span>
         </div>
         <div className='flex-1 min-w-0'>
            <span className='text-sm text-gray-700 uppercase truncate block'>
               {mis.desc}
            </span>
         </div>
         <div className='grid sm:flex gap-2 shrink-0'>
            <span className='text-sm font-mono text-gray-600 bg-emerald-50 px-2 py-1 rounded'>
               {ini}
            </span>
            <span className='text-sm font-mono text-gray-600 bg-orange-50 px-2 py-1 rounded'>
               {fim}
            </span>
         </div>
         <div className='w-24 text-right shrink-0'>
            <span className='text-sm font-semibold text-gray-900'>
               {diasPrev
                  ? `${mis.dias} dia${mis.dias > 1 ? "s" : ""}`
                  : realCurrency(mis.valor_total)}
            </span>
         </div>
         <Popover
            content={
               <MisPntsTable
                  pernoites={mis.pernoites}
                  acDeslocSede={mis.acrec_desloc}
                  total={mis.valor_total}
               />
            }
         >
            <Button
               size='sm'
               color='light'
               className='shrink-0 hover:bg-gray-100 transition-colors duration-200'
            >
               <IoMdInformationCircleOutline size={18} />
            </Button>
         </Popover>
      </div>
   );
}
