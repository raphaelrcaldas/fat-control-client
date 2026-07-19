"use client";

import { Missao } from "services/routes/cegep/missoes";
import { useMissionForm } from "../hooks/useMissionForm";
import { MissionHeader } from "./MissionHeader";
import { MissionActionBar } from "./MissionActionBar";
import { ValidationModal } from "./ValidationModal";
import { ErrorModal } from "../registros/components/missionDetail/errorModal";
import { DeleteMissionModal } from "../registros/components/missionDetail/deleteMissionModal";
import { EtiquetasSection } from "./sections/EtiquetasSection";
import { DocumentoSection } from "./sections/DocumentoSection";
import { DescricaoSection } from "./sections/DescricaoSection";
import { ClassificacaoSection } from "./sections/ClassificacaoSection";
import { PeriodoSection } from "./sections/PeriodoSection";
import { ObservacoesSection } from "./sections/ObservacoesSection";
import { PernoitesSection } from "./sections/PernoitesSection";
import { MilitaresSection } from "./sections/MilitaresSection";
import { HiExclamation } from "react-icons/hi";

interface MissionPageProps {
   missao?: Missao | null;
   initialEdit: boolean;
   onClose: () => void;
   onClone?: () => void;
}

export function MissionPage({
   missao,
   initialEdit,
   onClose,
   onClone,
}: MissionPageProps) {
   const form = useMissionForm({ missao, initialEdit, onClose, onClone });

   return (
      <>
         {form.showErrorModal && (
            <ErrorModal
               show={form.showErrorModal}
               onClose={() => form.setShowErrorModal(false)}
               errorMessage={form.errorMessage}
               errorTitle="Erro"
            />
         )}
         {form.showDeleteModal && (
            <DeleteMissionModal
               show={form.showDeleteModal}
               onClose={() => form.setShowDeleteModal(false)}
               onConfirm={form.handleDelete}
               missionInfo={{
                  tipoDoc: form.tipoDoc,
                  nDoc: form.nDoc,
                  desc: form.desc,
               }}
            />
         )}
         {form.showValidationModal && (
            <ValidationModal
               show={form.showValidationModal}
               errors={form.validationErrors}
               onClose={() => form.setShowValidationModal(false)}
            />
         )}

         <div className="flex w-full justify-center">
            <div className="flex w-full max-w-7xl flex-col gap-2">
               <MissionHeader
                  tipoDoc={form.tipoDoc}
                  nDoc={form.nDoc}
                  desc={form.desc}
                  isNew={form.isNew}
                  cache_inconsistente={missao?.custo_inconsistente}
                  onBack={onClose}
               />

               <div className="space-y-2">
                  {missao?.custo_inconsistente && (
                     <div className="flex items-start gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                        <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-red-500" />
                        <span>
                           Integridade comprometida: os parâmetros em cache
                           desta missão podem estar desatualizados.
                        </span>
                     </div>
                  )}

                  <EtiquetasSection
                     etiquetasMissao={form.etiquetasMissao}
                     editMode={form.editMode}
                     toggleEtiqueta={form.toggleEtiqueta}
                  />

                  <DocumentoSection
                     tipoDoc={form.tipoDoc}
                     setTipoDoc={form.setTipoDoc}
                     nDoc={form.nDoc}
                     setNDoc={form.setNDoc}
                     editMode={form.editMode}
                  />

                  <DescricaoSection
                     desc={form.desc}
                     setDesc={form.setDesc}
                     editMode={form.editMode}
                  />

                  <ClassificacaoSection
                     tipo={form.tipo}
                     setTipo={form.setTipo}
                     ind={form.ind}
                     setInd={form.setInd}
                     editMode={form.editMode}
                  />

                  <PeriodoSection
                     afast={form.afast}
                     setAfast={form.setAfast}
                     regres={form.regres}
                     setRegres={form.setRegres}
                     acrecDesloc={form.acrecDesloc}
                     setAcrecDesloc={form.setAcrecDesloc}
                     editMode={form.editMode}
                  />

                  <ObservacoesSection
                     obs={form.obs}
                     setObs={form.setObs}
                     editMode={form.editMode}
                  />

                  <PernoitesSection
                     sortedPnts={form.sortedPnts}
                     pnts={form.pnts}
                     setPnts={form.setPnts}
                     afast={form.afast}
                     regres={form.regres}
                     editMode={form.editMode}
                  />

                  <MilitaresSection
                     mils={form.mils}
                     setMils={form.setMils}
                     editMode={form.editMode}
                  />
               </div>

               <MissionActionBar
                  editMode={form.editMode}
                  isNew={form.isNew}
                  isChanged={form.isChanged}
                  isLoading={form.isLoading}
                  onEdit={() => form.setEditMode(true)}
                  onCancelEdit={form.handleCancelEdit}
                  onSave={form.handleSave}
                  onClone={onClone ? form.handleClone : undefined}
                  onDelete={() => form.setShowDeleteModal(true)}
               />
            </div>
         </div>
      </>
   );
}
