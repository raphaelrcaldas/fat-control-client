"use client";

import clsx from "clsx";
import { GRUPO_PG_LABELS } from "./labels";
import { useDiarias } from "./hooks/useDiarias";
import { useDiariaForm } from "./hooks/useDiariaForm";
import { DiariaHeader } from "./components/DiariaHeader";
import { DiariaMobileCard } from "./components/DiariaMobileCard";
import { DiariaTable } from "./components/DiariaTable";
import { DiariaFormModal } from "./components/DiariaFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { DiariaSkeleton } from "./components/DiariaSkeleton";

export default function DiariasPage() {
   const {
      valores,
      isLoading,
      isFetching,
      error,
      onlyActive,
      setOnlyActive,
      cidadesByGrupo,
      uniqueGruposCidade,
      uniqueGruposPg,
      descricaoCidade,
      descricaoPg,
   } = useDiarias();

   const {
      showModal,
      showDeleteModal,
      isCreating,
      formData,
      hasChanges,
      isSubmitting,
      isDeleting,
      errors,
      handleOpenModal,
      handleOpenCreateModal,
      handleCloseModal,
      handleOpenDeleteModal,
      handleCloseDeleteModal,
      handleSubmit,
      handleConfirmDelete,
      updateField,
   } = useDiariaForm();

   const errorMessage = error?.message || null;

   return (
      <div className="flex flex-col">
         <DiariaHeader
            onlyActive={onlyActive}
            onOnlyActiveChange={setOnlyActive}
            onCreateClick={handleOpenCreateModal}
         />

         {errorMessage && (
            <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
               {errorMessage}
            </div>
         )}

         {!isLoading && (
            <p className="mb-2 text-xs font-medium text-slate-400">
               {valores?.length || 0} valor(es) · {uniqueGruposCidade.length}{" "}
               grupo(s) de cidade
            </p>
         )}

         {isLoading ? (
            <DiariaSkeleton />
         ) : (
            <div
               className={clsx(
                  "space-y-3 transition-opacity",
                  isFetching && "opacity-50"
               )}
            >
               {uniqueGruposPg.map((grupoNum) => {
                  const valoresGrupo = (valores || []).filter(
                     (v) => v.grupo_pg === grupoNum
                  );

                  return (
                     <div
                        key={grupoNum}
                        className="rounded border border-slate-200 bg-slate-50 p-4"
                     >
                        <div className="mb-3">
                           <span className="font-medium text-gray-700">
                              {GRUPO_PG_LABELS[grupoNum] || `Grupo ${grupoNum}`}
                           </span>
                        </div>

                        {valoresGrupo.length === 0 ? (
                           <p className="text-sm text-gray-500">
                              Nenhum valor cadastrado
                           </p>
                        ) : (
                           <>
                              {/* Mobile: Cards */}
                              <div className="space-y-2 md:hidden">
                                 {valoresGrupo.map((valor) => (
                                    <DiariaMobileCard
                                       key={valor.id}
                                       valor={valor}
                                       cidades={
                                          cidadesByGrupo.get(valor.grupo_cid) ||
                                          []
                                       }
                                       onEdit={handleOpenModal}
                                       onDelete={handleOpenDeleteModal}
                                    />
                                 ))}
                              </div>

                              {/* Desktop: Tabela */}
                              <DiariaTable
                                 valores={valoresGrupo}
                                 cidadesByGrupo={cidadesByGrupo}
                                 onEdit={handleOpenModal}
                                 onDelete={handleOpenDeleteModal}
                              />
                           </>
                        )}
                     </div>
                  );
               })}
            </div>
         )}

         {/* Edit/Create Modal */}
         <DiariaFormModal
            show={showModal}
            isCreating={isCreating}
            formData={formData}
            hasChanges={hasChanges}
            isSubmitting={isSubmitting}
            errors={errors}
            uniqueGruposCidade={uniqueGruposCidade}
            uniqueGruposPg={uniqueGruposPg}
            descricaoCidade={descricaoCidade}
            descricaoPg={descricaoPg}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            onFieldChange={updateField}
         />

         {/* Delete Confirmation Modal */}
         <DeleteConfirmModal
            show={showDeleteModal}
            isDeleting={isDeleting}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
         />
      </div>
   );
}
