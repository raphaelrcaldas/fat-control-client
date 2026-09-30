"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useDadosBancarios, useDadosBancariosOrfaos } from "@/hooks/queries";
import { DadosBancariosMasthead } from "./components/DadosBancariosMasthead";
import { DadosBancariosToolbar } from "./components/DadosBancariosToolbar";
import { ActiveFiltersBar } from "./components/ActiveFiltersBar";
import { OrfaosAlert } from "./components/OrfaosAlert";
import { EmptyState } from "./components/EmptyState";
import ListDadosBancarios from "./components/listDadosBancarios";
import ListDadosBancariosSkeleton from "./components/ListDadosBancariosSkeleton";
import DetailDadosBancarios from "./components/detailDadosBancarios";
import CleanupOrfaosModal from "./components/cleanupOrfaosModal";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

export default function DadosBancariosPage() {
   const [searchUser, setSearchUser] = useState("");
   const [showCreate, setShowCreate] = useState(false);
   const [showCleanup, setShowCleanup] = useState(false);

   const debouncedSearch = useDebouncedValue(searchUser, 500);

   const { data: orfaos = [] } = useDadosBancariosOrfaos();

   const {
      data: dadosBancarios = [],
      isLoading,
      isFetching,
      isError,
      refetch,
   } = useDadosBancarios({
      search: debouncedSearch || undefined,
   });

   const hasActiveFilters = !!searchUser;
   const clearFilters = () => setSearchUser("");

   return (
      <div className="flex flex-col gap-3">
         <DadosBancariosMasthead onCreate={() => setShowCreate(true)} />

         <DadosBancariosToolbar
            search={searchUser}
            onSearchChange={setSearchUser}
            total={dadosBancarios.length}
            isLoading={isLoading}
            isError={isError && dadosBancarios.length === 0}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
         />

         {hasActiveFilters && (
            <ActiveFiltersBar
               search={searchUser}
               onClearSearch={() => setSearchUser("")}
            />
         )}

         <PermBased resource="cegep.dados_bancarios" requiredPerm="delete">
            <OrfaosAlert
               count={orfaos.length}
               onReview={() => setShowCleanup(true)}
            />
         </PermBased>

         <section
            className={clsx(
               "transition-opacity",
               isFetching && !isLoading && "opacity-50"
            )}
         >
            {isLoading ? (
               <ListDadosBancariosSkeleton />
            ) : isError && dadosBancarios.length === 0 ? (
               // Erro nunca vira "nenhum registro": sem dado, mostra a falha.
               <div
                  role="alert"
                  className="flex flex-col items-center gap-3 rounded border border-red-200 bg-white p-8 text-center shadow-sm"
               >
                  <p className="text-sm font-medium text-red-800">
                     Não foi possível carregar os dados bancários
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            ) : dadosBancarios.length === 0 ? (
               <EmptyState search={searchUser} onClear={clearFilters} />
            ) : (
               <>
                  {/* Refetch que falha com a lista em tela: mantém o dado e
                      avisa, sem trocar a tela pelo erro. */}
                  {isError && (
                     <p
                        role="status"
                        className="mb-2 flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                     >
                        <HiExclamation
                           aria-hidden
                           className="size-3.5 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                           Não foi possível atualizar a lista
                        </span>
                        <button
                           type="button"
                           onClick={() => refetch()}
                           disabled={isFetching}
                           className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                        >
                           Tentar novamente
                        </button>
                     </p>
                  )}
                  <ListDadosBancarios dados={dadosBancarios} />
               </>
            )}
         </section>

         {showCreate && (
            <DetailDadosBancarios
               show={showCreate}
               onClose={() => setShowCreate(false)}
            />
         )}

         {showCleanup && (
            <CleanupOrfaosModal
               show={showCleanup}
               onClose={() => setShowCleanup(false)}
               orfaos={orfaos}
            />
         )}
      </div>
   );
}
