"use client";

import { useState, useMemo } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Popover,
   Label,
   TextInput,
   Checkbox,
   Select,
   Spinner,
   Progress,
} from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { gerarRelatorio } from "utils/relatorioComiss";
import { realCurrency } from "utils/financeiro";
import {
   ComissWithMiss,
   Comiss as ComissSchema,
} from "services/routes/cegep/comiss";
import { LiaFileExportSolid } from "react-icons/lia";
import { MisPntsTable } from "../../components/popMisPnts";
import { IoMdInformationCircleOutline, IoMdSearch } from "react-icons/io";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { RoleBasedRoute } from "@/app/(home)/hooks/useRoleBased";
import {
   deleteCmto,
   createCmto,
   updateCmto,
} from "services/routes/cegep/comiss";
import { useToast } from "@/app/context/toast";
import { UserPublic } from "services/routes/users";
import { SearchUser } from "src/app/(home)/users/components/searchUser";

export function DetailComiss({
   show,
   setShow,
   comiss,
   update,
}: {
   show: boolean;
   setShow: (show: boolean) => void;
   comiss?: ComissWithMiss;
   update?: () => void;
}) {
   const [isEditMode, setIsEditMode] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [showUserSearch, setShowUserSearch] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const { push } = useToast();

   // Valores padrões do formulário
   const defaultValues = useMemo(
      () => ({
         user: comiss ? comiss.user : null,
         docProp: comiss ? comiss.doc_prop : "",
         docAut: comiss ? comiss.doc_aut : "",
         docEnc: comiss ? comiss.doc_enc : "",
         dataAb: comiss ? comiss.data_ab : "",
         qtdAjAb: comiss ? comiss.qtd_aj_ab : 0,
         valAjAb: comiss ? comiss.valor_aj_ab : 0,
         dataFc: comiss ? comiss.data_fc : "",
         qtdAjFc: comiss ? comiss.qtd_aj_fc : 0,
         valAjFc: comiss ? comiss.valor_aj_fc : 0,
         userId: comiss ? comiss.user_id : null,
         status: comiss ? comiss.status : "",
         dep: comiss ? comiss.dep : false,
         diasCumprir: comiss
            ? comiss.dias_cumprir
               ? comiss.dias_cumprir
               : 0
            : 0,
      }),
      [comiss]
   );

   const [user, setUser] = useState<UserPublic | null>(defaultValues.user);
   const [docProp, setDocProp] = useState(defaultValues.docProp);
   const [docAut, setDocAut] = useState(defaultValues.docAut);
   const [docEnc, setDocEnc] = useState(defaultValues.docEnc);
   const [dataAb, setDataAb] = useState(defaultValues.dataAb);
   const [qtdAjAb, setQtdAjAb] = useState(defaultValues.qtdAjAb);
   const [valAjAb, setValAjAb] = useState(defaultValues.valAjAb);
   const [dataFc, setDataFc] = useState(defaultValues.dataFc);
   const [qtdAjFc, setQtdAjFc] = useState(defaultValues.qtdAjFc);
   const [valAjFc, setValAjFC] = useState(defaultValues.valAjFc);
   const [status, setStatus] = useState(defaultValues.status);
   const [dep, setDep] = useState(defaultValues.dep);
   const [diasCumprir, setDiasCumprir] = useState(defaultValues.diasCumprir);

   // Dados computados para visualização
   const data_abertura = comiss
      ? isoStrToDate(comiss.data_ab).toLocaleDateString("pt-br", {
           day: "2-digit",
           month: "2-digit",
           year: "2-digit",
        })
      : "";
   const data_fechamento = comiss
      ? isoStrToDate(comiss.data_fc).toLocaleDateString("pt-br", {
           day: "2-digit",
           month: "2-digit",
           year: "2-digit",
        })
      : "";

   const ajd_ab = comiss?.valor_aj_ab || 0;
   const ajd_fc = comiss?.valor_aj_fc || 0;

   function verificarCampos(errors: string[]) {
      if (!(docProp != "")) errors.push("- Documento Proposta");
      if (!(docAut != "")) errors.push("- Documento Autorização");
      if (!(dataAb != "")) errors.push("- Data de Abertura");
      if (!(dataFc != "")) errors.push("- Data de Encerramento");
      if (!(qtdAjAb != 0))
         errors.push("- Quantidade da Ajuda de Custo da Abertura");
      if (!(qtdAjFc != 0))
         errors.push("- Quantidade da Ajuda de Custo do Encerramento");
      if (!(valAjAb != 0)) errors.push("- Valor da Ajuda de Custo da Abertura");
      if (!(valAjFc != 0))
         errors.push("- Valor da Ajuda de Custo do Encerramento");
   }

   async function handleSaveComiss() {
      let errors = [];
      verificarCampos(errors);
      if (errors.length > 0) {
         setIsLoading(false);
         return;
      }
      setIsLoading(true);

      const comisObj: ComissSchema = {
         user_id: user!.id,
         doc_prop: docProp,
         doc_aut: docAut,
         doc_enc: docEnc,
         data_ab: dataAb,
         data_fc: dataFc,
         qtd_aj_ab: qtdAjAb,
         qtd_aj_fc: qtdAjFc,
         valor_aj_ab: valAjAb,
         valor_aj_fc: valAjFc,
         status: status,
         dep: dep,
         dias_cumprir: diasCumprir == 0 ? null : diasCumprir,
         ...(comiss?.id && { id: comiss.id }),
      };

      try {
         const res = comiss
            ? await updateCmto(comisObj)
            : await createCmto(comisObj);

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.detail || "Erro desconhecido");
         }

         push({
            message: data.detail || "Salvo com sucesso",
            type: "success",
         });

         if (update) update();
         setIsEditMode(false);
         if (!comiss) setShow(false); // Se for criação, fecha o modal
      } catch (err) {
         push({
            title: "Erro",
            message: "Erro ao salvar o comissionamento: " + err.message,
            type: "error",
         });
      } finally {
         setIsLoading(false);
      }
   }

   async function handleExport() {
      if (!comiss) return;
      const blob = await gerarRelatorio(comiss);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const userName = `${comiss.user.posto.short}_${comiss.user.nome_guerra}`;
      a.download = `comissionamento_${userName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
   }

   const handleDelete = async () => {
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

         setShowDeleteModal(false);
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

   // Renderiza modo de edição/criação
   if (isEditMode || !comiss) {
      return (
         <Modal show={show} size='6xl' onClose={() => setShow(false)}>
            <ModalHeader className='border-b border-gray-200'>
               <h3 className='text-xl font-semibold text-gray-900'>
                  {comiss ? "Editar" : "Adicionar"} Comissionamento
               </h3>
            </ModalHeader>
            <ModalBody className='space-y-6'>
               {/* Seleção de Militar */}
               <div className='flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200'>
                  {user ? (
                     <div className='text-center space-y-1'>
                        <span className='font-semibold text-gray-900 uppercase block'>
                           {user.posto.mid} {user.esp} {user.nome_guerra}
                        </span>
                        <span className='text-sm text-gray-600 capitalize'>
                           {user.nome_completo}
                        </span>
                     </div>
                  ) : (
                     <span className='text-red-600 text-sm font-medium'>
                        Selecione um militar
                     </span>
                  )}

                  {!comiss && (
                     <Button
                        pill
                        onClick={() => setShowUserSearch(true)}
                        color='light'
                        className='hover:bg-white transition-colors duration-200'
                     >
                        <IoMdSearch className='size-5' />
                     </Button>
                  )}
               </div>

               <SearchUser
                  show={showUserSearch}
                  setShow={setShowUserSearch}
                  setUser={setUser}
               />

               {/* Documentos */}
               <div className='space-y-3'>
                  <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                     Documentos
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                     <div>
                        <Label
                           htmlFor='doc-prop'
                           className='text-sm font-medium text-gray-700 mb-2 block'
                        >
                           Proposta
                        </Label>
                        <TextInput
                           id='doc-prop'
                           required
                           value={docProp}
                           onChange={(e) => setDocProp(e.target.value)}
                           placeholder='Ex: OF-123/2024'
                        />
                     </div>
                     <div>
                        <Label
                           htmlFor='doc-aut'
                           className='text-sm font-medium text-gray-700 mb-2 block'
                        >
                           Autorização
                        </Label>
                        <TextInput
                           id='doc-aut'
                           required
                           value={docAut}
                           onChange={(e) => setDocAut(e.target.value)}
                           placeholder='Ex: PORT-456/2024'
                        />
                     </div>
                     <div>
                        <Label
                           htmlFor='doc-enc'
                           className='text-sm font-medium text-gray-700 mb-2 block'
                        >
                           Encerramento
                        </Label>
                        <TextInput
                           id='doc-enc'
                           value={docEnc}
                           onChange={(e) => setDocEnc(e.target.value)}
                           placeholder='Ex: OF-789/2024'
                        />
                     </div>
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
                     <div className='space-y-4'>
                        <div>
                           <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                              Data
                           </Label>
                           <TextInput
                              type='date'
                              value={dataAb}
                              onChange={(e) => setDataAb(e.target.value)}
                           />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                           <div>
                              <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                                 Qtd. Ajuda
                              </Label>
                              <TextInput
                                 value={qtdAjAb}
                                 type='number'
                                 min={0}
                                 max={2}
                                 step={0.5}
                                 onChange={(e) =>
                                    setQtdAjAb(Number(e.target.value))
                                 }
                              />
                           </div>
                           <div>
                              <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                                 Valor (R$)
                              </Label>
                              <TextInput
                                 value={valAjAb}
                                 min={0}
                                 type='number'
                                 step={0.01}
                                 onChange={(e) =>
                                    setValAjAb(Number(e.target.value))
                                 }
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Fechamento */}
                  <div className='bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200 shadow-sm'>
                     <h4 className='text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full' />
                        Fechamento
                     </h4>
                     <div className='space-y-4'>
                        <div>
                           <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                              Data
                           </Label>
                           <TextInput
                              type='date'
                              min={dataAb}
                              value={dataFc}
                              onChange={(e) => setDataFc(e.target.value)}
                           />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                           <div>
                              <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                                 Qtd. Ajuda
                              </Label>
                              <TextInput
                                 value={qtdAjFc}
                                 type='number'
                                 min={0}
                                 max={2}
                                 step={0.5}
                                 onChange={(e) =>
                                    setQtdAjFc(Number(e.target.value))
                                 }
                              />
                           </div>
                           <div>
                              <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                                 Valor (R$)
                              </Label>
                              <TextInput
                                 value={valAjFc}
                                 min={0}
                                 type='number'
                                 step={0.01}
                                 onChange={(e) =>
                                    setValAjFC(Number(e.target.value))
                                 }
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Configurações Adicionais */}
               <div className='space-y-3'>
                  <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                     Configurações
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                     <div>
                        <Label
                           htmlFor='status'
                           className='text-sm font-medium text-gray-700 mb-2 block'
                        >
                           Status
                        </Label>
                        <Select
                           id='status'
                           value={status}
                           onChange={(e) => setStatus(e.target.value)}
                        >
                           <option value='' disabled>
                              Selecione
                           </option>
                           <option value='aberto'>Aberto</option>
                           <option value='fechado'>Fechado</option>
                        </Select>
                     </div>
                     <div>
                        <Label
                           htmlFor='dias-cumprir'
                           className='text-sm font-medium text-gray-700 mb-2 block'
                        >
                           Dias a Cumprir
                        </Label>
                        <TextInput
                           id='dias-cumprir'
                           type='number'
                           min={0}
                           value={diasCumprir}
                           onChange={(e) =>
                              setDiasCumprir(Number(e.target.value))
                           }
                           placeholder='0 = Comparativo'
                        />
                     </div>
                     <div className='flex flex-col justify-center'>
                        <Label
                           htmlFor='dep'
                           className='text-sm font-medium text-gray-700 mb-2 block'
                        >
                           Possui Dependente
                        </Label>
                        <div className='flex items-center gap-2'>
                           <Checkbox
                              id='dep'
                              color='blue'
                              className='w-5 h-5'
                              checked={dep}
                              onChange={(e) => setDep(e.target.checked)}
                           />
                           <span className='text-sm text-gray-600'>
                              {dep ? "Sim" : "Não"}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </ModalBody>
            <ModalFooter className='flex justify-center gap-3 border-t border-gray-200'>
               <Button
                  color='gray'
                  onClick={() => {
                     if (comiss) {
                        setIsEditMode(false);
                     } else {
                        setShow(false);
                     }
                  }}
                  disabled={isLoading}
               >
                  Cancelar
               </Button>
               <Button
                  className='px-6'
                  color='blue'
                  onClick={handleSaveComiss}
                  disabled={isLoading}
               >
                  {isLoading ? (
                     <div className='flex items-center gap-2'>
                        <Spinner size='sm' />
                        <span>Salvando...</span>
                     </div>
                  ) : comiss ? (
                     "Salvar Alterações"
                  ) : (
                     "Adicionar Comissionamento"
                  )}
               </Button>
            </ModalFooter>
         </Modal>
      );
   }

   // Renderiza modo de visualização
   return (
      <>
         <Modal show={show} size='6xl' onClose={() => setShow(false)}>
            <ModalHeader className='border-b border-gray-200'>
               Detalhes do Comissionamento
            </ModalHeader>
            <ModalBody className='space-y-3'>
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
               <div className='hidden md:grid md:grid-cols-3 gap-4'>
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
               <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {/* Abertura */}
                  <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200 shadow-sm'>
                     <h4 className='text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-2'>
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
                  <div className='bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 shadow-sm'>
                     <h4 className='text-sm font-semibold text-orange-800 mb-1 flex items-center gap-2'>
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
               <div className='grid grid-cols-3 gap-4'>
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
               <div className='space-y-4 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200'>
                  {/* Dica para comissionamento comparativo */}
                  {!comiss.dias_cumprir && (
                     <div className='flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800'>
                        <IoMdInformationCircleOutline className='text-blue-600 size-4 shrink-0' />
                        <span>Cálculo baseado na menor diária (R$ 335,00)</span>
                     </div>
                  )}

                  <div className='grid grid-cols-3 gap-4'>
                     <div className='text-center'>
                        {!comiss.dias_cumprir ? (
                           <Popover
                              content={
                                 <div className='p-3 max-w-xs'>
                                    <p className='text-sm font-semibold text-gray-900 mb-2'>
                                       Valor Previsto
                                    </p>
                                    <div className='space-y-1 text-sm text-gray-700'>
                                       <p>
                                          <span className='font-medium'>Valor:</span>{" "}
                                          {realCurrency(ajd_ab + ajd_fc)}
                                       </p>
                                       <p>
                                          <span className='font-medium'>Equivalente:</span>{" "}
                                          ~{((ajd_ab + ajd_fc) / 335).toFixed(1)} dias
                                       </p>
                                       <p className='text-xs text-gray-500 mt-2'>
                                          (baseado em R$ 335,00 por diária)
                                       </p>
                                    </div>
                                 </div>
                              }
                              trigger="hover"
                           >
                              <div className='font-bold text-gray-900 cursor-help'>
                                 {realCurrency(ajd_ab + ajd_fc)}
                                 <div className='text-xs font-normal text-gray-500'>
                                    ~{((ajd_ab + ajd_fc) / 335).toFixed(1)} dias
                                 </div>
                              </div>
                           </Popover>
                        ) : (
                           <div className='font-bold text-gray-900'>
                              <span>
                                 {comiss.dias_cumprir}
                                 <span className='text-sm font-normal text-gray-500 ml-1'>
                                    dias
                                 </span>
                              </span>
                           </div>
                        )}
                        <div className='text-xs text-gray-500 uppercase tracking-wide mt-1'>
                           Previsto
                        </div>
                     </div>
                     <div className='text-center'>
                        {!comiss.dias_cumprir ? (
                           <Popover
                              content={
                                 <div className='p-3 max-w-xs'>
                                    <p className='text-sm font-semibold text-gray-900 mb-2'>
                                       Valor Computado
                                    </p>
                                    <div className='space-y-1 text-sm text-gray-700'>
                                       <p>
                                          <span className='font-medium'>Valor:</span>{" "}
                                          {realCurrency(comiss.vals_comp)}
                                       </p>
                                       <p>
                                          <span className='font-medium'>Equivalente:</span>{" "}
                                          ~{(comiss.vals_comp / 335).toFixed(1)} dias
                                       </p>
                                       <p className='text-xs text-gray-500 mt-2'>
                                          (baseado em R$ 335,00 por diária)
                                       </p>
                                    </div>
                                 </div>
                              }
                              trigger="hover"
                           >
                              <div className='font-bold text-gray-900 cursor-help'>
                                 {realCurrency(comiss.vals_comp)}
                                 <div className='text-xs font-normal text-gray-500'>
                                    ~{(comiss.vals_comp / 335).toFixed(1)} dias
                                 </div>
                              </div>
                           </Popover>
                        ) : (
                           <div className='font-bold text-gray-900'>
                              <span>
                                 {comiss.dias_comp}
                                 <span className='text-sm font-normal text-gray-500 ml-1'>
                                    dias
                                 </span>
                              </span>
                           </div>
                        )}
                        <div className='text-xs text-gray-500 uppercase tracking-wide mt-1'>
                           Computado
                        </div>
                     </div>
                     <div className='text-center'>
                        {!comiss.dias_cumprir ? (
                           <Popover
                              content={
                                 <div className='p-3 max-w-xs'>
                                    <p className='text-sm font-semibold text-gray-900 mb-2'>
                                       Valor Restante
                                    </p>
                                    <div className='space-y-1 text-sm text-gray-700'>
                                       <p>
                                          <span className='font-medium'>Valor:</span>{" "}
                                          {realCurrency(ajd_ab + ajd_fc - comiss.vals_comp)}
                                       </p>
                                       <p>
                                          <span className='font-medium'>Equivalente:</span>{" "}
                                          ~{((ajd_ab + ajd_fc - comiss.vals_comp) / 335).toFixed(1)} dias
                                       </p>
                                       <p className='text-xs text-gray-500 mt-2'>
                                          (baseado em R$ 335,00 por diária)
                                       </p>
                                    </div>
                                 </div>
                              }
                              trigger="hover"
                           >
                              <div className='font-bold text-gray-900 cursor-help'>
                                 {realCurrency(ajd_ab + ajd_fc - comiss.vals_comp)}
                                 <div className='text-xs font-normal text-gray-500'>
                                    ~{((ajd_ab + ajd_fc - comiss.vals_comp) / 335).toFixed(1)} dias
                                 </div>
                              </div>
                           </Popover>
                        ) : (
                           <div className='font-bold text-gray-900'>
                              <span>
                                 {comiss.dias_cumprir - comiss.dias_comp}
                                 <span className='text-sm font-normal text-gray-500 ml-1'>
                                    dias
                                 </span>
                              </span>
                           </div>
                        )}
                        <div className='text-xs text-gray-500 uppercase tracking-wide mt-1'>
                           Restante
                        </div>
                     </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-2'>
                     <div className='flex justify-between text-sm'>
                        <span className='text-gray-600'>Progresso</span>
                        <span className='font-semibold text-gray-900'>
                           {comiss.dias_cumprir
                              ? `${Math.round((comiss.dias_comp / comiss.dias_cumprir) * 100)}%`
                              : `${Math.round((comiss.vals_comp / (ajd_ab + ajd_fc)) * 100)}%`}
                        </span>
                     </div>
                     <Progress
                        progress={
                           comiss.dias_cumprir
                              ? Math.round((comiss.dias_comp / comiss.dias_cumprir) * 100)
                              : Math.round((comiss.vals_comp / (ajd_ab + ajd_fc)) * 100)
                        }
                        size='lg'
                        color={comiss.modulo ? "green" : "red"}
                     />
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
                        onClick={() => setIsEditMode(true)}
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
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className='transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95'
                     >
                        <div className='flex items-center gap-2'>
                           <MdDeleteOutline size={18} />
                           <span>Excluir</span>
                        </div>
                     </Button>
                  </div>
               </RoleBasedRoute>
            </ModalFooter>
         </Modal>

         {/* Modal de Confirmação de Exclusão */}
         <Modal
            show={showDeleteModal}
            size='md'
            onClose={() => !isDeleting && setShowDeleteModal(false)}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className='text-center px-4 py-2'>
                  <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                     <MdDeleteOutline className='h-9 w-9 text-red-600' />
                  </div>

                  <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                     Excluir Comissionamento
                  </h3>

                  <div className='mb-6 space-y-3'>
                     <p className='text-base text-gray-600'>
                        Você está prestes a excluir o comissionamento de:
                     </p>
                     <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                        <p className='text-lg font-bold text-gray-900 uppercase'>
                           {comiss.user.posto.mid} {comiss.user.esp}{" "}
                           {comiss.user.nome_guerra}
                        </p>
                        <p className='text-sm text-gray-600 capitalize mt-1'>
                           {comiss.user.nome_completo}
                        </p>
                     </div>
                     <div className='flex items-center justify-center gap-2 text-sm text-red-600 font-medium'>
                        <svg
                           className='w-5 h-5'
                           fill='currentColor'
                           viewBox='0 0 20 20'
                        >
                           <path
                              fillRule='evenodd'
                              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                              clipRule='evenodd'
                           />
                        </svg>
                        Esta ação não pode ser desfeita
                     </div>
                  </div>

                  <div className='flex justify-center gap-3'>
                     <Button
                        color='red'
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className='px-6'
                     >
                        {isDeleting ? (
                           <div className='flex items-center gap-2'>
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
                           </div>
                        ) : (
                           "Sim, excluir"
                        )}
                     </Button>
                     <Button
                        color='gray'
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                        className='px-6'
                     >
                        Cancelar
                     </Button>
                  </div>
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
