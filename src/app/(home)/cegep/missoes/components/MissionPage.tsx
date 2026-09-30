"use client";

import { Button } from "flowbite-react";
import { MdDeleteOutline } from "react-icons/md";
import { Missao } from "services/routes/cegep/missoes";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
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
               isDeleting={form.isDeleting}
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
                  isNew={form.isNew}
                  cache_inconsistente={missao?.custo_inconsistente}
                  onBack={onClose}
                  actions={
                     <MissionActionBar
                        editMode={form.editMode}
                        isNew={form.isNew}
                        isChanged={form.isChanged}
                        isLoading={form.isLoading}
                        onEdit={() => form.setEditMode(true)}
                        onCancelEdit={form.handleCancelEdit}
                        onSave={form.handleSave}
                        onClone={onClone ? form.handleClone : undefined}
                     />
                  }
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

               {/* Exclusão fora da barra de comandos, no fim da página e só
                  na visualização de uma missão existente — mesmo padrão do
                  detalhe do comissionamento. */}
               {!form.editMode && !form.isNew && (
                  <PermBased resource="cegep.missoes" requiredPerm="delete">
                     <section className="flex flex-col gap-3 rounded border border-red-200 bg-white px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <div className="min-w-0">
                           <h2 className="text-sm font-semibold text-slate-900">
                              Excluir missão
                           </h2>
                           <p className="text-sm text-slate-600">
                              Não pode ser desfeito. Antes de confirmar, você vê
                              os dados da missão.
                           </p>
                        </div>
                        <Button
                           color="light"
                           size="sm"
                           aria-label="Excluir missão"
                           onClick={() => form.setShowDeleteModal(true)}
                           className="shrink-0"
                        >
                           <span className="flex items-center gap-2 text-red-600">
                              <MdDeleteOutline className="size-4" />
                              Excluir
                           </span>
                        </Button>
                     </section>
                  </PermBased>
               )}
            </div>
         </div>
      </>
   );
}
