"use client";

import { useRef } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
} from "flowbite-react";
import { HiChevronLeft, HiChevronRight, HiOutlineSearch } from "react-icons/hi";
import type { TripSearchItem } from "services/routes/trips";
import {
   SEARCH_PAGE_SIZE,
   useTripulanteSearch,
} from "../hooks/useTripulanteSearch";
import { TripulanteSearchResults } from "./TripulanteSearchResults";

export function TripulanteSearchModal({
   show,
   onClose,
   onSelect,
   selectedTripId,
}: {
   show: boolean;
   onClose: () => void;
   onSelect: (trip: TripSearchItem) => void;
   selectedTripId?: number | null;
}) {
   const inputRef = useRef<HTMLInputElement>(null);
   const {
      search,
      setSearch,
      term,
      page,
      setPage,
      query,
      hasQuery,
      loading,
      items,
      reset,
   } = useTripulanteSearch(show);

   function close() {
      reset();
      onClose();
   }

   return (
      <Modal
         size="lg"
         show={show}
         onClose={close}
         dismissible
         initialFocus={inputRef}
      >
         <ModalHeader as="h2">Buscar tripulante</ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               <TextInput
                  ref={inputRef}
                  aria-label="Buscar por nome ou trigrama"
                  icon={HiOutlineSearch}
                  placeholder="Nome ou trigrama"
                  value={search}
                  autoComplete="off"
                  maxLength={100}
                  onChange={(event) => setSearch(event.target.value)}
               />
               <TripulanteSearchResults
                  key={`${term}:${page}`}
                  items={items}
                  total={query.data?.total ?? 0}
                  hasQuery={hasQuery}
                  loading={loading}
                  error={query.isError}
                  selectedTripId={selectedTripId}
                  onSelect={(trip) => {
                     onSelect(trip);
                     close();
                  }}
                  onRetry={() => void query.refetch()}
               />
               <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                     {hasQuery &&
                     !query.isError &&
                     query.data &&
                     !loading &&
                     query.data.total
                        ? `${(page - 1) * SEARCH_PAGE_SIZE + 1}–${Math.min(page * SEARCH_PAGE_SIZE, query.data.total)} de ${query.data.total}`
                        : "Ativos e inativos, por antiguidade."}
                  </span>
                  {hasQuery &&
                     !query.isError &&
                     query.data &&
                     query.data.pages > 1 && (
                        <nav
                           className="flex items-center gap-1"
                           aria-label="Paginação da busca"
                        >
                           <Button
                              color="light"
                              size="xs"
                              disabled={page === 1 || loading}
                              onClick={() => setPage(page - 1)}
                           >
                              <HiChevronLeft
                                 aria-hidden
                                 className="mr-1 size-4"
                              />
                              Anterior
                           </Button>
                           <Button
                              color="light"
                              size="xs"
                              disabled={page >= query.data.pages || loading}
                              onClick={() => setPage(page + 1)}
                           >
                              Próxima
                              <HiChevronRight
                                 aria-hidden
                                 className="ml-1 size-4"
                              />
                           </Button>
                        </nav>
                     )}
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
