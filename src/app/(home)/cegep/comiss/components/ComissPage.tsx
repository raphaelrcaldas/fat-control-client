"use client";

import { useState, useMemo } from "react";
import {
   Button,
   Popover,
   Progress,
   Modal,
   ModalHeader,
   ModalBody,
} from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { gerarRelatorio } from "utils/planilhaComiss";
import { gerarRelatorioDocx } from "utils/apostilaComiss";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss, DeletePreview } from "services/routes/cegep/comiss";
import { Missao } from "services/routes/cegep/missoes";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import { RiFileExcel2Fill } from "react-icons/ri";
import {
   HiDocumentText,
   HiExternalLink,
   HiArrowLeft,
   HiExclamation,
} from "react-icons/hi";
import { useRouter } from "next/navigation";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { RoleBasedRoute } from "@/app/(home)/hooks/useRoleBased";
import { useToast } from "@/app/context/toast";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { useDeleteComiss } from "@/hooks/queries";
import { formatSaram } from "@/constants";

const DIARIA_MINIMA = 335;

interface ComissPageProps {
   detail: ComissWithMiss;
   onEdit: () => void;
   onClose: () => void;
}

export function ComissPage({ detail, onEdit, onClose }: ComissPageProps) {
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletePreview, setDeletePreview] = useState<DeletePreview | null>(
      null
   );
   const [showMissionModal, setShowMissionModal] = useState(false);
   const [selectedMission, setSelectedMission] =
      useState<PagamentoRecord | null>(null);
   const { push } = useToast();
   const router = useRouter();

   const comiss = detail;

   const deleteMutation = useDeleteComiss();
   const isDeleting = deleteMutation.isPending;

   const { data_abertura, data_fechamento } = useMemo(
      () => ({
         data_abertura: isoStrToDate(comiss.data_ab).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
         data_fechamento: isoStrToDate(comiss.data_fc).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
      }),
      [comiss.data_ab, comiss.data_fc]
   );

   const ajd_ab = comiss.valor_aj_ab || 0;
   const ajd_fc = comiss.valor_aj_fc || 0;

   async function handleExportSheet() {
      const blob = await gerarRelatorio(comiss);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const userName = `${comiss.user.posto.short}_${comiss.user.nome_guerra}`;
      a.download = `comissionamento_${userName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
   }

   async function handleExportDocx() {
      const blob = await gerarRelatorioDocx(comiss);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const userName = `${comiss.user.posto.short}_${comiss.user.nome_guerra}`;
      a.download = `apostila_${userName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
   }

   const handleDeleteRequest = () => {
      if (!comiss?.id) return;

      deleteMutation.mutate(
         { id: comiss.id },
         {
            onSuccess: (result) => {
               if (!result.ok) {
                  push({
                     title: "Erro",
                     message:
                        result.message || "Erro ao excluir comissionamento",
                     type: "error",
                  });
                  return;
               }
               if (result.data) {
                  setDeletePreview(result.data);
               } else {
                  push({
                     message:
                        result.message ||
                        "Comissionamento excluido com sucesso",
                     type: "success",
                  });
                  setShowDeleteModal(false);
                  onClose();
               }
            },
            onError: (err: Error) => {
               push({
                  title: "Erro",
                  message: err?.message || "Erro ao excluir comissionamento",
                  type: "error",
               });
            },
         }
      );
   };

   const handleDeleteConfirm = () => {
      if (!comiss?.id) return;

      deleteMutation.mutate(
         { id: comiss.id, confirm: true },
         {
            onSuccess: (result) => {
               if (!result.ok) {
                  push({
                     title: "Erro",
                     message:
                        result.message || "Erro ao excluir comissionamento",
                     type: "error",
                  });
                  return;
               }
               push({
                  message:
                     result.message || "Comissionamento excluido com sucesso",
                  type: "success",
               });
               setShowDeleteModal(false);
               setDeletePreview(null);
               onClose();
            },
            onError: (err: Error) => {
               push({
                  title: "Erro",
                  message: err?.message || "Erro ao excluir comissionamento",
                  type: "error",
               });
            },
         }
      );
   };

   return (
      <>
         <div className="flex w-full justify-center">
            <div className="flex w-full max-w-7xl flex-col gap-3">
               {/* Header: voltar + nome do militar + exportações */}
               <div className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-4 shadow-sm sm:gap-4 sm:px-4">
                  {/* Botão voltar */}
                  <button
                     onClick={onClose}
                     className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:px-3"
                  >
                     <HiArrowLeft className="h-4 w-4" />
                     <span className="hidden sm:inline">Voltar</span>
                  </button>

                  {/* Nome do militar — ocupa o centro e trunca */}
                  <div className="min-w-0 flex-1 text-center">
                     <h3 className="truncate text-base font-bold tracking-wide text-gray-900 uppercase sm:text-lg">
                        {comiss.user.posto.mid} {comiss.user.nome_guerra}
                     </h3>
                     <p className="truncate text-sm text-gray-600 capitalize">
                        {comiss.user.nome_completo} (
                        {formatSaram(comiss.user.saram)})
                     </p>
                  </div>

                  {/* Botões de exportação */}
                  <PermBased resource={"comiss"} requiredPerm={"create"}>
                     <div className="flex shrink-0 gap-2">
                        <Button
                           color="light"
                           onClick={handleExportSheet}
                           disabled={!comiss.missoes?.length || isDeleting}
                           className="bg-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                           <div className="flex items-center gap-2">
                              <RiFileExcel2Fill className="size-5 text-green-600" />
                              <span className="hidden font-semibold sm:inline">
                                 Planilha
                              </span>
                           </div>
                        </Button>
                        <Button
                           color="light"
                           onClick={handleExportDocx}
                           disabled={!comiss.missoes?.length || isDeleting}
                           className="bg-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                           <div className="flex items-center gap-2">
                              <HiDocumentText className="size-5 text-blue-600" />
                              <span className="hidden font-semibold sm:inline">
                                 Apostila
                              </span>
                           </div>
                        </Button>
                     </div>
                  </PermBased>
               </div>

               {/* Documentos */}
               <div className="hidden gap-4 md:grid md:grid-cols-3">
                  <div className="rounded border border-gray-200 bg-white p-4 text-center shadow-sm">
                     <span className="block text-base font-semibold text-gray-900 uppercase">
                        {comiss.doc_prop}
                     </span>
                     <span className="text-xs tracking-wide text-gray-500 uppercase">
                        Proposta
                     </span>
                  </div>
                  <div className="rounded border border-gray-200 bg-white p-4 text-center shadow-sm">
                     <span className="block text-base font-semibold text-gray-900 uppercase">
                        {comiss.doc_aut}
                     </span>
                     <span className="text-xs tracking-wide text-gray-500 uppercase">
                        Autorizacao
                     </span>
                  </div>
                  <div className="rounded border border-gray-200 bg-white p-4 text-center shadow-sm">
                     <span className="block text-base font-semibold text-gray-900 uppercase">
                        {comiss.doc_enc || "ND"}
                     </span>
                     <span className="text-xs tracking-wide text-gray-500 uppercase">
                        Encerramento
                     </span>
                  </div>
               </div>

               {/* Datas e Valores */}
               <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {/* Abertura */}
                  <div className="rounded border border-emerald-200 bg-white p-4 shadow-sm">
                     <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Abertura
                     </h4>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                           <span className="block text-base font-semibold text-gray-900">
                              {data_abertura}
                           </span>
                           <span className="text-xs text-gray-500">Data</span>
                        </div>
                        <div className="text-center">
                           <span className="block text-base font-semibold text-gray-900">
                              {Number(comiss.qtd_aj_ab).toFixed(1)}
                           </span>
                           <span className="text-xs text-gray-500">
                              Ajuda de Custo
                           </span>
                        </div>
                        <div className="text-center">
                           <span className="block text-base font-semibold text-gray-900">
                              {realCurrency(comiss.valor_aj_ab)}
                           </span>
                           <span className="text-xs text-gray-500">Valor</span>
                        </div>
                     </div>
                  </div>

                  {/* Fechamento */}
                  <div className="rounded border border-orange-200 bg-white p-4 shadow-sm">
                     <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-orange-800">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        Fechamento
                     </h4>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                           <span className="block text-base font-semibold text-gray-900">
                              {data_fechamento}
                           </span>
                           <span className="text-xs text-gray-500">
                              Data Prevista
                           </span>
                        </div>
                        <div className="text-center">
                           <span className="block text-base font-semibold text-gray-900">
                              {Number(comiss.qtd_aj_fc).toFixed(1)}
                           </span>
                           <span className="text-xs text-gray-500">
                              Ajuda de Custo
                           </span>
                        </div>
                        <div className="text-center">
                           <span className="block text-base font-semibold text-gray-900">
                              {realCurrency(comiss.valor_aj_fc)}
                           </span>
                           <span className="text-xs text-gray-500">Valor</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Status e Informacoes */}
               <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-center gap-2 rounded border border-slate-200 bg-white p-4 shadow-sm">
                     <span className="text-sm text-gray-600">Status:</span>
                     <span className="text-sm font-semibold text-gray-900 uppercase">
                        {comiss.status}
                     </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded border border-gray-200 bg-white p-4 shadow-sm">
                     <span className="text-sm text-gray-600">Modulo:</span>
                     <span className="text-sm font-semibold text-gray-900 uppercase">
                        {comiss.modulo ? "Sim" : "Nao"}
                     </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded border border-gray-200 bg-white p-4 shadow-sm">
                     <span className="text-sm text-gray-600">Dependente:</span>
                     <span className="text-sm font-semibold text-gray-900 uppercase">
                        {comiss.dep ? "Sim" : "Nao"}
                     </span>
                  </div>
               </div>

               {/* Metricas */}
               <div className="space-y-4 rounded border border-slate-300 bg-white p-6 shadow-sm">
                  {!comiss.dias_cumprir && (
                     <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
                        <IoMdInformationCircleOutline className="size-4 shrink-0 text-blue-600" />
                        <span>
                           Calculo baseado na menor diaria (
                           {realCurrency(DIARIA_MINIMA)})
                        </span>
                     </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                     <div className="text-center">
                        {!comiss.dias_cumprir ? (
                           <Popover
                              content={
                                 <div className="max-w-xs p-3">
                                    <p className="mb-2 text-sm font-semibold text-gray-900">
                                       Valor Previsto
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-700">
                                       <p>
                                          <span className="font-medium">
                                             Valor:
                                          </span>{" "}
                                          {realCurrency(ajd_ab + ajd_fc)}
                                       </p>
                                       <p>
                                          <span className="font-medium">
                                             Equivalente:
                                          </span>{" "}
                                          ~
                                          {(
                                             (ajd_ab + ajd_fc) /
                                             DIARIA_MINIMA
                                          ).toFixed(1)}{" "}
                                          dias
                                       </p>
                                       <p className="mt-2 text-xs text-gray-500">
                                          (baseado em{" "}
                                          {realCurrency(DIARIA_MINIMA)} por
                                          diaria)
                                       </p>
                                    </div>
                                 </div>
                              }
                              trigger="hover"
                           >
                              <div className="cursor-help font-bold text-gray-900">
                                 {realCurrency(ajd_ab + ajd_fc)}
                                 <div className="text-xs font-normal text-gray-500">
                                    ~
                                    {(
                                       (ajd_ab + ajd_fc) /
                                       DIARIA_MINIMA
                                    ).toFixed(1)}{" "}
                                    dias
                                 </div>
                              </div>
                           </Popover>
                        ) : (
                           <div className="font-bold text-gray-900">
                              <span>
                                 {comiss.dias_cumprir}
                                 <span className="ml-1 text-sm font-normal text-gray-500">
                                    dias
                                 </span>
                              </span>
                           </div>
                        )}
                        <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase">
                           Previsto
                        </div>
                     </div>
                     <div className="text-center">
                        {!comiss.dias_cumprir ? (
                           <Popover
                              content={
                                 <div className="max-w-xs p-3">
                                    <p className="mb-2 text-sm font-semibold text-gray-900">
                                       Valor Computado
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-700">
                                       <p>
                                          <span className="font-medium">
                                             Valor:
                                          </span>{" "}
                                          {realCurrency(comiss.vals_comp)}
                                       </p>
                                       <p>
                                          <span className="font-medium">
                                             Equivalente:
                                          </span>{" "}
                                          ~
                                          {(
                                             comiss.vals_comp / DIARIA_MINIMA
                                          ).toFixed(1)}{" "}
                                          dias
                                       </p>
                                       <p className="mt-2 text-xs text-gray-500">
                                          (baseado em{" "}
                                          {realCurrency(DIARIA_MINIMA)} por
                                          diaria)
                                       </p>
                                    </div>
                                 </div>
                              }
                              trigger="hover"
                           >
                              <div className="cursor-help font-bold text-gray-900">
                                 {realCurrency(comiss.vals_comp)}
                                 <div className="text-xs font-normal text-gray-500">
                                    ~
                                    {(comiss.vals_comp / DIARIA_MINIMA).toFixed(
                                       1
                                    )}{" "}
                                    dias
                                 </div>
                              </div>
                           </Popover>
                        ) : (
                           <div className="font-bold text-gray-900">
                              <span>
                                 {comiss.dias_comp}
                                 <span className="ml-1 text-sm font-normal text-gray-500">
                                    dias
                                 </span>
                              </span>
                           </div>
                        )}
                        <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase">
                           Computado
                        </div>
                     </div>
                     <div className="text-center">
                        {!comiss.dias_cumprir ? (
                           <Popover
                              content={
                                 <div className="max-w-xs p-3">
                                    <p className="mb-2 text-sm font-semibold text-gray-900">
                                       Valor Restante
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-700">
                                       <p>
                                          <span className="font-medium">
                                             Valor:
                                          </span>{" "}
                                          {realCurrency(
                                             ajd_ab + ajd_fc - comiss.vals_comp
                                          )}
                                       </p>
                                       <p>
                                          <span className="font-medium">
                                             Equivalente:
                                          </span>{" "}
                                          ~
                                          {(
                                             (ajd_ab +
                                                ajd_fc -
                                                comiss.vals_comp) /
                                             DIARIA_MINIMA
                                          ).toFixed(1)}{" "}
                                          dias
                                       </p>
                                       <p className="mt-2 text-xs text-gray-500">
                                          (baseado em{" "}
                                          {realCurrency(DIARIA_MINIMA)} por
                                          diaria)
                                       </p>
                                    </div>
                                 </div>
                              }
                              trigger="hover"
                           >
                              <div className="cursor-help font-bold text-gray-900">
                                 {realCurrency(
                                    ajd_ab + ajd_fc - comiss.vals_comp
                                 )}
                                 <div className="text-xs font-normal text-gray-500">
                                    ~
                                    {(
                                       (ajd_ab + ajd_fc - comiss.vals_comp) /
                                       DIARIA_MINIMA
                                    ).toFixed(1)}{" "}
                                    dias
                                 </div>
                              </div>
                           </Popover>
                        ) : (
                           <div className="font-bold text-gray-900">
                              <span>
                                 {comiss.dias_cumprir - comiss.dias_comp}
                                 <span className="ml-1 text-sm font-normal text-gray-500">
                                    dias
                                 </span>
                              </span>
                           </div>
                        )}
                        <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase">
                           Restante
                        </div>
                     </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progresso</span>
                        <span className="font-semibold text-gray-900">
                           {`${comiss.completude}%`}
                        </span>
                     </div>
                     <Progress
                        progress={comiss.completude}
                        size="lg"
                        color={comiss.modulo ? "green" : "red"}
                     />
                  </div>
               </div>

               {/* Missoes */}
               <div className="space-y-3 rounded border border-slate-300 bg-white px-2 py-4 shadow-sm md:px-4">
                  <h4 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                     Missoes Relacionadas
                  </h4>
                  <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                     {comiss.missoes && comiss.missoes.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                           {comiss.missoes.map((m) => (
                              <MissionRow
                                 key={m.id}
                                 mis={m}
                                 diasPrev={comiss?.dias_cumprir}
                                 onShowDetail={() => {
                                    setSelectedMission({
                                       user_mis: {
                                          id: comiss.user.id,
                                          p_g: comiss.user.posto.mid,
                                          sit: "c",
                                          user: comiss.user,
                                       },
                                       missao: m,
                                    } as PagamentoRecord);
                                    setShowMissionModal(true);
                                 }}
                                 onNavigate={() =>
                                    router.push(`/cegep/missoes/${m.id}`)
                                 }
                              />
                           ))}
                        </div>
                     ) : (
                        <div className="p-8 text-center text-sm text-gray-500">
                           Nenhuma missao adicionada
                        </div>
                     )}
                  </div>
               </div>

               {/* Botoes de Acao */}
               <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                  <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                     <Button
                        color="blue"
                        onClick={onEdit}
                        disabled={isDeleting}
                        className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                     >
                        <div className="flex items-center gap-2">
                           <MdOutlineEdit size={18} />
                           <span>Editar</span>
                        </div>
                     </Button>
                     <Button
                        color="red"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                     >
                        <div className="flex items-center gap-2">
                           <MdDeleteOutline size={18} />
                           <span>Excluir</span>
                        </div>
                     </Button>
                  </div>
               </RoleBasedRoute>
            </div>
         </div>

         {/* Modal de Confirmacao de Exclusao */}
         <Modal
            show={showDeleteModal}
            size="2xl"
            onClose={() => {
               if (!isDeleting) {
                  setShowDeleteModal(false);
                  setDeletePreview(null);
               }
            }}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className="px-4 py-2 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                     <MdDeleteOutline className="h-9 w-9 text-red-600" />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                     Excluir Comissionamento
                  </h3>

                  <div className="mb-6 space-y-3">
                     <p className="text-base text-gray-600">
                        Voce está prestes a excluir o comissionamento de:
                     </p>
                     <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="text-lg font-bold text-gray-900 uppercase">
                           {comiss.user.posto.mid} {comiss.user.esp}{" "}
                           {comiss.user.nome_guerra}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 capitalize">
                           {comiss.user.nome_completo}
                        </p>
                     </div>

                     {/* Preview de missoes afetadas */}
                     {deletePreview && (
                        <div className="space-y-2 text-left">
                           <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                              <svg
                                 className="h-5 w-5 shrink-0"
                                 fill="currentColor"
                                 viewBox="0 0 20 20"
                              >
                                 <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                 />
                              </svg>
                              <span>
                                 Este comissionamento possui{" "}
                                 <strong>
                                    {deletePreview.missoes_count} missão(ões)
                                 </strong>{" "}
                                 vinculada(s). O militar será desvinculado e
                                 missões órfãs serão removidas.
                              </span>
                           </div>

                           <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                              {deletePreview.missoes.map((m) => (
                                 <div
                                    key={m.id}
                                    className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-b-0"
                                 >
                                    <span className="font-medium text-nowrap text-gray-900 uppercase">
                                       {m.tipo_doc} {m.n_doc}
                                    </span>
                                    <span className="truncate px-2 text-left text-gray-600 uppercase">
                                       {m.desc}
                                    </span>
                                    <span className="shrink-0 font-mono text-xs text-gray-500">
                                       {new Date(m.afast).toLocaleDateString(
                                          "pt-BR",
                                          {
                                             day: "2-digit",
                                             month: "2-digit",
                                             year: "2-digit",
                                          }
                                       )}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-600">
                        <svg
                           className="h-5 w-5"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                           />
                        </svg>
                        Esta acão não pode ser desfeita
                     </div>
                  </div>

                  <div className="flex justify-center gap-3">
                     <Button
                        color="red"
                        onClick={
                           deletePreview
                              ? handleDeleteConfirm
                              : handleDeleteRequest
                        }
                        disabled={isDeleting}
                        className="px-6"
                     >
                        {isDeleting ? (
                           <div className="flex items-center gap-2">
                              <svg
                                 className="h-4 w-4 animate-spin"
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                              >
                                 <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                 ></circle>
                                 <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                 ></path>
                              </svg>
                              <span>Excluindo...</span>
                           </div>
                        ) : deletePreview ? (
                           `Confirmar exclusao de ${deletePreview.missoes_count} missao(oes)`
                        ) : (
                           "Sim, excluir"
                        )}
                     </Button>
                     <Button
                        color="gray"
                        onClick={() => {
                           setShowDeleteModal(false);
                           setDeletePreview(null);
                        }}
                        disabled={isDeleting}
                        className="px-6"
                     >
                        Cancelar
                     </Button>
                  </div>
               </div>
            </ModalBody>
         </Modal>

         <UserMissionDetailModal
            show={showMissionModal}
            onClose={() => setShowMissionModal(false)}
            record={selectedMission}
         />
      </>
   );
}

interface MissionRowProps {
   mis: Missao;
   diasPrev: number | null;
   onShowDetail: () => void;
   onNavigate: () => void;
}

function MissionRow({
   mis,
   diasPrev,
   onShowDetail,
   onNavigate,
}: MissionRowProps) {
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
      <div className="flex flex-col gap-3 p-4 transition-colors duration-200 hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4">
         {/* Linha 1 (mobile): documento + acoes | Desktop: itens viram colunas da linha */}
         <div className="flex items-center justify-between gap-2 sm:contents">
            <div className="w-20 shrink-0">
               <span className="font-mono text-sm font-semibold text-gray-900 uppercase">
                  {mis.tipo_doc} {mis.n_doc}
               </span>
            </div>
            <div className="flex shrink-0 gap-1 sm:order-last">
               <Button
                  size="sm"
                  color="light"
                  className="rounded transition-colors duration-200 hover:bg-gray-100"
                  onClick={onShowDetail}
               >
                  <IoMdInformationCircleOutline size={18} />
               </Button>
               <PermBased resource={"comiss"} requiredPerm={"create"}>
                  <Button
                     size="sm"
                     color="light"
                     className="rounded transition-colors duration-200 hover:bg-blue-50"
                     onClick={onNavigate}
                     title="Abrir missao"
                  >
                     <HiExternalLink size={18} />
                  </Button>
               </PermBased>
            </div>
         </div>

         <div className="min-w-0 flex-1">
            <span className="block truncate text-sm text-gray-700 uppercase">
               {mis.desc}
            </span>
         </div>

         {/* Linha 2 (mobile): datas + dias/valor | Desktop: itens viram colunas da linha */}
         <div className="flex items-center justify-between gap-2 sm:contents">
            <div className="flex shrink-0 gap-2">
               <span className="rounded border border-current/30 bg-emerald-50 px-2 py-1 font-mono text-sm text-gray-600">
                  {ini}
               </span>
               <span className="rounded border border-current/30 bg-orange-50 px-2 py-1 font-mono text-sm text-gray-600">
                  {fim}
               </span>
            </div>
            <div className="shrink-0 text-right sm:w-24">
               <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-gray-900">
                  {mis.custo_inconsistente && (
                     <span title="Custo possivelmente desatualizado. Reabra e salve a missão para recalcular.">
                        <HiExclamation className="h-4 w-4 text-amber-500" />
                     </span>
                  )}
                  {diasPrev
                     ? `${mis.dias} dia${mis.dias > 1 ? "s" : ""}`
                     : realCurrency(mis.valor_total)}
               </span>
            </div>
         </div>
      </div>
   );
}
