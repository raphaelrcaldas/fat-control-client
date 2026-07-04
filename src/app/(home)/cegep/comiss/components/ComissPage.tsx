"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "flowbite-react";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { Missao } from "services/routes/cegep/missoes";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { HiDocumentText, HiExclamation } from "react-icons/hi";
import { RiFileExcel2Fill } from "react-icons/ri";
import { RoleBasedRoute } from "@/app/(home)/hooks/useRoleBased";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { ComissDetailHeader } from "./detail/ComissDetailHeader";
import { ComissMilitarCard } from "./detail/ComissMilitarCard";
import { ComissDocumentos } from "./detail/ComissDocumentos";
import { ComissDatasValores } from "./detail/ComissDatasValores";
import { ComissStatusCards } from "./detail/ComissStatusCards";
import { ComissMetricas } from "./detail/ComissMetricas";
import { ComissMissoesList } from "./detail/ComissMissoesList";
import { DeleteComissModal } from "./detail/DeleteComissModal";
import { useComissExport } from "./detail/useComissExport";
import { useComissDelete } from "./detail/useComissDelete";

interface ComissPageProps {
   detail: ComissWithMiss;
   onEdit: () => void;
   onClose: () => void;
}

export function ComissPage({ detail, onEdit, onClose }: ComissPageProps) {
   const comiss = detail;
   const router = useRouter();

   const [showMissionModal, setShowMissionModal] = useState(false);
   const [selectedMission, setSelectedMission] =
      useState<PagamentoRecord | null>(null);

   const { exportSheet, exportDocx, exporting } = useComissExport(comiss);
   const del = useComissDelete(comiss, onClose);

   const semMissoes = !comiss.missoes?.length;

   const handleShowDetail = (m: Missao) => {
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
   };

   return (
      <>
         <div className="flex w-full justify-center">
            <div className="flex w-full max-w-7xl flex-col gap-3">
               {/* Barra de comando superior */}
               <ComissDetailHeader
                  title="Comissionamento"
                  onClose={onClose}
                  actions={
                     <>
                        <PermBased resource={"comiss"} requiredPerm={"create"}>
                           <Button
                              color="light"
                              size="sm"
                              onClick={exportSheet}
                              disabled={
                                 semMissoes ||
                                 del.isDeleting ||
                                 exporting !== null
                              }
                           >
                              {exporting === "sheet" ? (
                                 <Spinner
                                    size="sm"
                                    color="success"
                                    className="sm:mr-2"
                                 />
                              ) : (
                                 <RiFileExcel2Fill className="size-4 text-green-600 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">Planilha</span>
                           </Button>
                           <Button
                              color="light"
                              size="sm"
                              onClick={exportDocx}
                              disabled={
                                 semMissoes ||
                                 del.isDeleting ||
                                 exporting !== null
                              }
                           >
                              {exporting === "docx" ? (
                                 <Spinner
                                    size="sm"
                                    color="info"
                                    className="sm:mr-2"
                                 />
                              ) : (
                                 <HiDocumentText className="size-4 text-blue-600 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">Apostila</span>
                           </Button>
                        </PermBased>
                        <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                           <div className="hidden h-6 w-px bg-slate-200 sm:block" />
                           <Button
                              color="red"
                              size="sm"
                              onClick={onEdit}
                              disabled={del.isDeleting}
                           >
                              <MdOutlineEdit className="size-4 sm:mr-2" />
                              <span className="hidden sm:inline">Editar</span>
                           </Button>
                           <Button
                              color="light"
                              size="sm"
                              onClick={del.open}
                              disabled={del.isDeleting}
                           >
                              <span className="flex items-center gap-2 text-red-600">
                                 <MdDeleteOutline className="size-4" />
                                 <span className="hidden sm:inline">
                                    Excluir
                                 </span>
                              </span>
                           </Button>
                        </RoleBasedRoute>
                     </>
                  }
               />

               {/* Identidade do militar — independente */}
               <ComissMilitarCard comiss={comiss} />

               {/* Integridade dos valores computados (verificada no backend) */}
               {comiss.cache_inconsistente && (
                  <div className="flex items-start gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                     <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-red-500" />
                     <span>
                        Integridade comprometida: os valores computados deste
                        comissionamento podem estar desatualizados. Reabra e
                        salve as missões afetadas para recalcular.
                     </span>
                  </div>
               )}

               <ComissDocumentos
                  docProp={comiss.doc_prop}
                  docAut={comiss.doc_aut}
                  docEnc={comiss.doc_enc}
               />

               <ComissDatasValores comiss={comiss} />

               <ComissStatusCards
                  status={comiss.status}
                  modulo={comiss.modulo}
                  dep={comiss.dep}
               />

               <ComissMetricas comiss={comiss} />

               <ComissMissoesList
                  comiss={comiss}
                  onShowDetail={handleShowDetail}
                  onNavigate={(missaoId) =>
                     router.push(`/cegep/missoes/${missaoId}`)
                  }
               />
            </div>
         </div>

         <DeleteComissModal
            show={del.isOpen}
            comiss={comiss}
            deletePreview={del.deletePreview}
            isDeleting={del.isDeleting}
            onConfirm={del.submit}
            onCancel={del.cancel}
         />

         <UserMissionDetailModal
            show={showMissionModal}
            onClose={() => setShowMissionModal(false)}
            record={selectedMission}
         />
      </>
   );
}
