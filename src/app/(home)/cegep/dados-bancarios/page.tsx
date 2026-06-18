"use client";

import { useState } from "react";
import clsx from "clsx";
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
            isFetching={isFetching}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
         />

         {hasActiveFilters && (
            <ActiveFiltersBar
               search={searchUser}
               onClearSearch={() => setSearchUser("")}
            />
         )}

         <OrfaosAlert
            count={orfaos.length}
            onReview={() => setShowCleanup(true)}
         />

         <section
            className={clsx(
               "transition-opacity",
               isFetching && !isLoading && "opacity-50"
            )}
         >
            {isLoading ? (
               <ListDadosBancariosSkeleton />
            ) : dadosBancarios.length === 0 ? (
               <EmptyState search={searchUser} onClear={clearFilters} />
            ) : (
               <ListDadosBancarios dados={dadosBancarios} />
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
