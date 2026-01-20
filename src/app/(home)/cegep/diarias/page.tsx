"use client";

import { Spinner, Checkbox, Label } from "flowbite-react";
import { GRUPO_PG_LABELS } from "@/constants/cegep/diarias";
import { useDiarias, useDiariaForm } from "./hooks";
import {
   DiariaHeader,
   DiariaMobileCard,
   DiariaTable,
   DiariaFormModal,
   DeleteConfirmModal,
} from "./components";

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

   const loading = isLoading;
   const errorMessage = error?.message || null;

   return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
         {/* Header */}
         <DiariaHeader
            loading={loading}
            error={errorMessage}
            valoresCount={valores?.length || 0}
            gruposCount={uniqueGruposCidade.length}
            onCreateClick={handleOpenCreateModal}
         />

         {/* Content */}
         <div
            className={`h-full rounded-lg border border-gray-200 bg-white shadow-sm ${
               isFetching && !loading ? "opacity-50" : ""
            }`}
         >
            {loading ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <Spinner size="xl" color="failure" />
                  <p className="mt-4 text-gray-600">Carregando diarias...</p>
               </div>
            ) : (
               <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4">
                  {/* Filtro */}
                  <div className="mb-4 flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
                     <Checkbox
                        id="onlyActive"
                        checked={onlyActive}
                        onChange={(e) => setOnlyActive(e.target.checked)}
                        color="red"
                     />
                     <Label
                        htmlFor="onlyActive"
                        className="cursor-pointer text-sm font-medium text-gray-700"
                     >
                        Somente vigentes
                     </Label>
                  </div>

                  {/* Cards por grupo de P/G */}
                  <div className="space-y-3">
                     {uniqueGruposPg.map((grupoNum) => {
                        const valoresGrupo = (valores || []).filter(
                           (v) => v.grupo_pg === grupoNum
                        );

                        return (
                           <div
                              key={grupoNum}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                           >
                              <div className="mb-3">
                                 <span className="font-medium text-gray-700">
                                    {GRUPO_PG_LABELS[grupoNum] ||
                                       `Grupo ${grupoNum}`}
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
                                                cidadesByGrupo.get(
                                                   valor.grupo_cid
                                                ) || []
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
               </div>
            )}
         </div>

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
