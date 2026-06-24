import clsx from "clsx";
import {
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
   TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { MdLocationCity } from "react-icons/md";
import { CityResultRow } from "./CityResultRow";
import { type CityFetcher, useCitySearch } from "./useCitySearch";

interface Local {
   codigo: number;
   nome: string;
   uf: string;
}

interface SearchLocalProps {
   show: boolean;
   setShow: (show: boolean) => void;
   setLocal: (local: Local) => void;
   /** Fonte de dados; default = busca genérica. Pernoite injeta a ranqueada. */
   fetcher?: CityFetcher;
   queryKey?: (term: string) => readonly unknown[];
   /** Busca já ao abrir, com termo vazio (mostra as mais usadas no topo). */
   allowEmpty?: boolean;
}

export function SearchLocal({
   show,
   setShow,
   setLocal,
   fetcher,
   queryKey,
   allowEmpty = false,
}: SearchLocalProps) {
   const [searchCity, setSearchCity] = useState("");

   const { maisUsadas, demais, total, hasRanking, isFetching, canSearch } =
      useCitySearch(searchCity, {
         fetcher,
         queryKey,
         allowEmpty,
         enabled: show,
      });

   useEffect(() => {
      if (!show) {
         const t = setTimeout(() => setSearchCity(""), 200);
         return () => clearTimeout(t);
      }
   }, [show]);

   function onClose() {
      setShow(false);
   }

   function onSetLocal(local: Local) {
      setLocal(local);
      onClose();
   }

   return (
      <Modal size="xl" show={show} onClose={onClose} dismissible>
         <ModalHeader className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
               <MdLocationCity className="size-6 text-blue-600" />
               <span className="text-xl font-semibold text-gray-800">
                  Buscar Cidade
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <div className="space-y-4">
               <TextInput
                  autoFocus
                  placeholder="Digite o nome da cidade..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  sizing="lg"
                  icon={IoMdSearch}
               />

               <div className="overflow-hidden rounded border border-slate-200 shadow-sm">
                  {total === 0 ? (
                     <EmptyState
                        canSearch={canSearch}
                        isFetching={isFetching}
                     />
                  ) : (
                     <div
                        className={clsx(
                           "max-h-96 divide-y divide-slate-200 overflow-y-auto transition-opacity",
                           isFetching && "opacity-50"
                        )}
                     >
                        {hasRanking && (
                           <GroupHeader tone="amber">Mais usadas</GroupHeader>
                        )}
                        {maisUsadas.map((c) => (
                           <CityResultRow
                              key={c.codigo}
                              cidade={c}
                              onSelect={() => onSetLocal(c)}
                           />
                        ))}
                        {hasRanking && demais.length > 0 && (
                           <GroupHeader tone="slate">
                              Demais cidades
                           </GroupHeader>
                        )}
                        {demais.map((c) => (
                           <CityResultRow
                              key={c.codigo}
                              cidade={c}
                              onSelect={() => onSetLocal(c)}
                           />
                        ))}
                     </div>
                  )}
               </div>

               {total > 0 && (
                  <p className="text-center text-sm text-gray-500">
                     <span className="font-semibold text-blue-600">
                        {total}
                     </span>
                     {total === 1
                        ? " cidade encontrada"
                        : " cidades encontradas"}
                  </p>
               )}
            </div>
         </ModalBody>
      </Modal>
   );
}

function GroupHeader({
   tone,
   children,
}: {
   tone: "amber" | "slate";
   children: React.ReactNode;
}) {
   return (
      <div
         className={clsx(
            "px-4 py-1.5 text-xs font-bold tracking-wide uppercase",
            tone === "amber"
               ? "bg-amber-100/60 text-amber-700"
               : "bg-slate-100 text-slate-500"
         )}
      >
         {children}
      </div>
   );
}

function EmptyState({
   canSearch,
   isFetching,
}: {
   canSearch: boolean;
   isFetching: boolean;
}) {
   return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
         <div className="mb-4 rounded-full bg-slate-100 p-4">
            {isFetching ? (
               <Spinner size="xl" color="failure" />
            ) : (
               <FaMapMarkerAlt className="size-12 text-slate-400" />
            )}
         </div>
         {isFetching ? (
            <p className="font-medium text-slate-600">Procurando cidades...</p>
         ) : canSearch ? (
            <>
               <p className="text-lg font-semibold text-slate-700">
                  Nenhuma cidade encontrada
               </p>
               <p className="mt-2 max-w-xs text-sm text-slate-500">
                  Tente buscar com um nome diferente
               </p>
            </>
         ) : (
            <>
               <p className="text-lg font-semibold text-slate-700">
                  Pronto para buscar
               </p>
               <p className="mt-2 max-w-xs text-sm text-slate-500">
                  Digite o nome de uma cidade
               </p>
            </>
         )}
      </div>
   );
}
