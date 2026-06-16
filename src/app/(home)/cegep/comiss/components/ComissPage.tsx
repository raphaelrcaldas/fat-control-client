"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { Missao } from "services/routes/cegep/missoes";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import { RoleBasedRoute } from "@/app/(home)/hooks/useRoleBased";
import { UserMissionDetailModal } from "../../components/UserMissionDetailModal";
import { ComissHeader } from "./detail/ComissHeader";
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

   const { exportSheet, exportDocx } = useComissExport(comiss);
   const del = useComissDelete(comiss, onClose);

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
               <ComissHeader
                  comiss={comiss}
                  isBusy={del.isDeleting}
                  onClose={onClose}
                  onExportSheet={exportSheet}
                  onExportDocx={exportDocx}
               />

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

               {/* Botoes de Acao */}
               <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                  <div className="flex w-full items-center justify-center gap-3 rounded border border-gray-200 bg-white p-4 shadow-sm">
                     <Button
                        color="blue"
                        onClick={onEdit}
                        disabled={del.isDeleting}
                        className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                     >
                        <div className="flex items-center gap-2">
                           <MdOutlineEdit size={18} />
                           <span>Editar</span>
                        </div>
                     </Button>
                     <Button
                        color="red"
                        onClick={del.open}
                        disabled={del.isDeleting}
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
