"use client";

import clsx from "clsx";
import { Button } from "flowbite-react";
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
      refetch,
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

   // Sem a lista de valores, cada grupo diria "Nenhum valor cadastrado" e o
   // contador "0 valor(es)": mentira depois de uma falha. Já a falha só dos
   // grupos (cidade/posto) deixa os valores legíveis, sem as descrições.
   const semValores = valores === undefined && !isLoading;
   const blockingError = semValores ? error : null;

   return (
      <div className="space-y-2">
         <DiariaHeader
            onlyActive={onlyActive}
            onOnlyActiveChange={setOnlyActive}
            onCreateClick={handleOpenCreateModal}
         />

         {blockingError && (
            <div
               role="alert"
               className="space-y-3 rounded border border-rose-200 bg-rose-50 px-3 py-2"
            >
               <p className="text-sm text-rose-800">{blockingError.message}</p>
               <Button
                  color="light"
                  size="xs"
                  onClick={refetch}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         )}

         {/* Falha que não zera a tela (refetch ou grupos): aviso discreto */}
         {error && !blockingError && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <span className="min-w-0 flex-1 truncate">{error.message}</span>
               <button
                  type="button"
                  onClick={refetch}
                  disabled={isFetching}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}

         {!isLoading && valores && (
            <p className="text-xs font-medium text-slate-400">
               {valores?.length || 0} valor(es) · {uniqueGruposCidade.length}{" "}
               grupo(s) de cidade
            </p>
         )}

         {isLoading ? (
            <DiariaSkeleton />
         ) : semValores ? null : (
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
